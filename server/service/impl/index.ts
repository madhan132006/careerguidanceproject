import { GoogleGenAI, Type } from "@google/genai";
import { 
  IAuthService, IProfileService, IDashboardService, IAssessmentService, 
  IRecommendationService, IResumeService, IRoadmapService, IJobService, 
  INotificationService, IAdminService 
} from "../index";
import { 
  UserRepository, ProfileRepository, AssessmentRepository, 
  QuestionRepository, ResultRepository, ResumeRepository, 
  CareerRecommendationRepository, LearningRoadmapRepository, 
  JobRepository, NotificationRepository 
} from "../../repository";
import { 
  RegisterRequest, LoginRequest, AuthResponse, ForgotPasswordRequest, 
  ResetPasswordRequest, ProfileDto, AssessmentStartResponse, 
  AssessmentSubmitRequest, DashboardStatsResponse 
} from "../../dto";
import { 
  User, Profile, Result, Resume, CareerRecommendation, LearningRoadmap, Job, Notification, RoleName 
} from "../../entity";

// Lazy-initialized Gemini Client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// --- SERVICE IMPLEMENTATIONS ---

export class AuthServiceImpl implements IAuthService {
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const existing = UserRepository.findByEmail(request.email);
    if (existing) {
      throw new Error("Duplicate User: A user with this email already exists.");
    }

    const userId = "u_" + (UserRepository.findAll().length + 1);
    const user: User = {
      id: userId,
      email: request.email,
      passwordHash: "BCRYPT_SIMULATED_" + request.password, // Simulated bcrypt
      fullName: request.fullName,
      phone: request.phone,
      roles: [RoleName.ROLE_USER],
      createdAt: new Date()
    };

    UserRepository.save(user);

    // Bootstrap empty Profile and Resume for the new user
    const profile: Profile = {
      id: "p_" + userId,
      userId: userId,
      fullName: request.fullName,
      email: request.email,
      phone: request.phone,
      college: request.college || "",
      department: request.department || "",
      academicYear: request.year || "",
      cgpa: 0,
      skills: [],
      languages: ["English"],
      certifications: [],
      projects: [],
      careerInterests: [],
      profileCompletion: 40
    };
    ProfileRepository.save(profile);

    const resume: Resume = {
      id: "r_" + userId,
      userId: userId,
      fullName: request.fullName,
      email: request.email,
      phone: request.phone,
      summary: "",
      education: [],
      skills: [],
      projects: [],
      experience: [],
      certifications: [],
      achievements: []
    };
    ResumeRepository.save(resume);

    // Return authenticated response
    return {
      token: "JWT_ACCESS_TOKEN_MOCK_" + userId,
      refreshToken: "JWT_REFRESH_TOKEN_MOCK_" + userId,
      userId: userId,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles
    };
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const user = UserRepository.findByEmail(request.email);
    if (!user) {
      throw new Error("Invalid Credentials: User not found.");
    }

    // Accept "CareerPro2026!" or any mock password for development ease
    return {
      token: "JWT_ACCESS_TOKEN_MOCK_" + user.id,
      refreshToken: "JWT_REFRESH_TOKEN_MOCK_" + user.id,
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles
    };
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    const user = UserRepository.findByEmail(request.email);
    if (!user) {
      throw new Error("Resource Not Found: Email address is not registered.");
    }
    // Generate simulated recovery step
    return { message: "Password reset link and verification code have been sent to your email." };
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    const user = UserRepository.findByEmail(request.email);
    if (!user) {
      throw new Error("Resource Not Found: User not found.");
    }
    if (request.resetCode !== "123456" && request.resetCode !== "CAREERPRO") {
      throw new Error("Validation Errors: Invalid or expired password reset verification code.");
    }
    // Success simulation
    return { message: "Your password has been reset successfully." };
  }
}

export class ProfileServiceImpl implements IProfileService {
  async getProfile(userId: string): Promise<Profile> {
    const profile = ProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error("Resource Not Found: User profile not found.");
    }
    return profile;
  }

  async updateProfile(userId: string, dto: ProfileDto): Promise<Profile> {
    const profile = ProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error("Resource Not Found: Profile not found.");
    }

    // Update fields
    profile.fullName = dto.fullName;
    profile.email = dto.email;
    profile.phone = dto.phone;
    profile.college = dto.college;
    profile.department = dto.department;
    profile.academicYear = dto.academicYear;
    profile.cgpa = dto.cgpa;
    profile.skills = dto.skills;
    profile.languages = dto.languages;
    profile.certifications = dto.certifications;
    profile.projects = dto.projects;
    profile.careerInterests = dto.careerInterests;
    if (dto.profilePhoto !== undefined) {
      profile.profilePhoto = dto.profilePhoto;
    }

    // Recalculate dynamic completion percentage
    let completedCount = 0;
    if (profile.fullName) completedCount++;
    if (profile.email) completedCount++;
    if (profile.phone) completedCount++;
    if (profile.college) completedCount++;
    if (profile.department) completedCount++;
    if (profile.cgpa > 0) completedCount++;
    if (profile.skills.length > 0) completedCount++;
    if (profile.projects.length > 0) completedCount++;

    profile.profileCompletion = Math.min(Math.round((completedCount / 8) * 100), 100);

    return ProfileRepository.save(profile);
  }
}

export class DashboardServiceImpl implements IDashboardService {
  async getStats(userId: string): Promise<DashboardStatsResponse> {
    const profile = ProfileRepository.findByUserId(userId);
    const resume = ResumeRepository.findByUserId(userId);
    const results = ResultRepository.findByUserId(userId);
    const notifications = NotificationRepository.findByUserId(userId);

    const profileComp = profile ? profile.profileCompletion : 50;

    // Calculate resume completion
    let resumeComp = 10;
    if (resume) {
      let fieldsFilled = 0;
      if (resume.summary) fieldsFilled++;
      if (resume.education.length > 0) fieldsFilled++;
      if (resume.skills.length > 0) fieldsFilled++;
      if (resume.projects.length > 0) fieldsFilled++;
      if (resume.experience.length > 0) fieldsFilled++;
      if (resume.certifications.length > 0) fieldsFilled++;
      resumeComp = Math.min(Math.round((fieldsFilled / 6) * 100), 100);
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    const avgScore = results.length > 0 
      ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
      : 0;

    const recentActivities = results.map(r => ({
      id: r.id,
      type: "Assessment",
      title: `Completed ${r.assessmentTitle}`,
      description: `Scored ${r.score}% with category analysis: ${r.analysis.substring(0, 60)}...`,
      time: "Recent"
    }));

    if (recentActivities.length === 0) {
      recentActivities.push({
        id: "act_init",
        type: "System",
        title: "Account Setup",
        description: "Registered your CareerPro profile.",
        time: "1 day ago"
      });
    }

    return {
      profileCompletion: profileComp,
      resumeCompletion: resumeComp,
      assessmentsTaken: results.length,
      averageScore: avgScore,
      unreadNotifications: unreadCount,
      recentActivities: recentActivities,
      learningProgress: [
        { stage: "Core Foundations", percentage: profileComp > 60 ? 100 : 40 },
        { stage: "Domain Specialization", percentage: results.length > 0 ? 60 : 0 },
        { stage: "Placement Ready", percentage: resumeComp > 70 ? 50 : 0 }
      ]
    };
  }
}

export class AssessmentServiceImpl implements IAssessmentService {
  async getCategories(): Promise<string[]> {
    const assessments = AssessmentRepository.findAll();
    return Array.from(new Set(assessments.map(a => a.category)));
  }

  async getQuestions(assessmentId: string): Promise<AssessmentStartResponse> {
    const assessment = AssessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new Error("Resource Not Found: Assessment not found.");
    }
    const questions = QuestionRepository.findByAssessmentId(assessmentId);
    return {
      assessmentId: assessment.id,
      title: assessment.title,
      category: assessment.category,
      durationMinutes: assessment.durationMinutes,
      questions: questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        type: q.type,
        options: q.options
      }))
    };
  }

  async submitAssessment(userId: string, request: AssessmentSubmitRequest): Promise<Result> {
    const assessment = AssessmentRepository.findById(request.assessmentId);
    if (!assessment) {
      throw new Error("Resource Not Found: Assessment not found.");
    }

    const questions = QuestionRepository.findByAssessmentId(request.assessmentId);
    let correctCount = 0;
    let totalQuestions = questions.length;

    request.answers.forEach(ans => {
      const question = questions.find(q => q.id === ans.questionId);
      if (question) {
        if (question.type === "multiple-choice") {
          if (question.correctOptionIndex === ans.selectedOptionIndex) {
            correctCount++;
          }
        } else if (question.type === "coding") {
          // Coding logic: check if they submitted non-empty code
          if (ans.codingCode && ans.codingCode.trim().length > 10) {
            correctCount++;
          }
        }
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Generate smart procedural analysis summary
    let analysis = "";
    if (percentage >= 85) {
      analysis = `Stellar performance! Demonstrates absolute mastery in ${assessment.category}. High problem solving skills.`;
    } else if (percentage >= 70) {
      analysis = `Strong competency shown in ${assessment.category}. Proficient with standard scenarios, can refine edge-case analysis.`;
    } else {
      analysis = `Foundational competency verified. Recommended to complete additional courses on core subjects inside the Learning Roadmap.`;
    }

    const resultId = "res_" + Math.random().toString(36).substring(2, 9);
    const result: Result = {
      id: resultId,
      userId: userId,
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      category: assessment.category,
      score: percentage,
      totalQuestions: totalQuestions,
      correctAnswers: correctCount,
      percentage: percentage,
      date: new Date().toISOString().split('T')[0],
      analysis: analysis
    };

    ResultRepository.save(result);

    // Push automatic notification reminder
    const notification: Notification = {
      id: "n_" + Math.random().toString(36).substring(2, 9),
      userId: userId,
      type: "assessment",
      title: "Assessment Scored",
      body: `You scored ${percentage}% on ${assessment.title}! Dynamic career recommendations are now ready.`,
      read: false,
      time: "Just now"
    };
    NotificationRepository.save(notification);

    return result;
  }

  async getResult(resultId: string): Promise<Result> {
    const result = ResultRepository.findById(resultId);
    if (!result) {
      throw new Error("Resource Not Found: Result not found.");
    }
    return result;
  }
}

export class RecommendationServiceImpl implements IRecommendationService {
  async getRecommendations(userId: string): Promise<CareerRecommendation[]> {
    const profile = ProfileRepository.findByUserId(userId);
    const results = ResultRepository.findByUserId(userId);
    const skills = profile ? profile.skills : [];
    const cgpa = profile ? profile.cgpa : 7.5;
    const department = profile ? profile.department : "Engineering";

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `
          As a Senior AI Career Advisor, generate exactly 3 career recommendations for this student:
          - CGPA: ${cgpa}
          - Department: ${department}
          - Skills: ${skills.join(", ")}
          - Assessment History Scores: ${results.map(r => r.assessmentTitle + ": " + r.score + "%").join(", ")}
          
          Respond ONLY with a valid JSON array matching this exact schema:
          [
            {
              "careerTitle": "string",
              "matchPercentage": number,
              "requiredSkills": ["string"],
              "learningRoadmap": ["string"],
              "recommendedCertifications": ["string"],
              "futureScope": "string"
            }
          ]
          Provide recommendations from these choices: Java Developer, Full Stack Developer, AI Engineer, Cloud Engineer, Data Analyst, DevOps Engineer.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  careerTitle: { type: Type.STRING },
                  matchPercentage: { type: Type.NUMBER },
                  requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  learningRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedCertifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  futureScope: { type: Type.STRING }
                },
                required: ["careerTitle", "matchPercentage", "requiredSkills", "learningRoadmap", "recommendedCertifications", "futureScope"]
              }
            }
          }
        });

        if (response.text) {
          const arr = JSON.parse(response.text.trim()) as CareerRecommendation[];
          arr.forEach((rec, idx) => {
            rec.id = `rec_${userId}_${idx}`;
            rec.userId = userId;
            CareerRecommendationRepository.save(rec);
          });
          return arr;
        }
      } catch (err) {
        console.error("Gemini API Recommendation failed, falling back to static logic", err);
      }
    }

    // Procedural Fallback Engine
    const isTech = department.toLowerCase().includes("computer") || department.toLowerCase().includes("information") || department.toLowerCase().includes("software");
    
    const fallbackRecs: CareerRecommendation[] = [
      {
        id: `rec_${userId}_0`,
        userId: userId,
        careerTitle: isTech ? "Full Stack Developer" : "Java Developer",
        matchPercentage: skills.includes("React") || skills.includes("JavaScript") ? 88 : 72,
        requiredSkills: ["Java", "Spring Boot", "React", "MySQL", "REST APIs"],
        learningRoadmap: ["Month 1: Advanced Java & OOPs", "Month 2: Spring Boot MVC Core", "Month 3: Frontend Integration with React"],
        recommendedCertifications: ["Oracle Certified Professional Java SE", "AWS Certified Developer"],
        futureScope: "High: Enterprise web platforms and financial backend services are consistently written in Java and React."
      },
      {
        id: `rec_${userId}_1`,
        userId: userId,
        careerTitle: "AI Engineer",
        matchPercentage: skills.includes("Python") ? 80 : 55,
        requiredSkills: ["Python", "TensorFlow", "Generative AI", "Data Structures"],
        learningRoadmap: ["Month 1: Python Data Science stack", "Month 2: Neural Networks & ML APIs", "Month 3: Large Language Models Prompt Engineering"],
        recommendedCertifications: ["TensorFlow Developer Certificate", "Google Cloud ML Engineer"],
        futureScope: "Maximum: Driving massive automation transitions globally across tech, medical, and banking industries."
      },
      {
        id: `rec_${userId}_2`,
        userId: userId,
        careerTitle: "Cloud Engineer",
        matchPercentage: skills.includes("Cloud") || cgpa > 8 ? 85 : 65,
        requiredSkills: ["AWS", "Linux Shell", "Docker", "DevOps Core"],
        learningRoadmap: ["Month 1: AWS VPC & EC2 Core Networking", "Month 2: Docker Containers", "Month 3: CI/CD Pipeline Integration"],
        recommendedCertifications: ["AWS Certified Solutions Architect", "Certified Kubernetes Administrator"],
        futureScope: "Very High: Crucial infrastructure modernization is moving 100% cloudwards."
      }
    ];

    fallbackRecs.forEach(rec => CareerRecommendationRepository.save(rec));
    return fallbackRecs;
  }
}

export class ResumeServiceImpl implements IResumeService {
  async saveResume(userId: string, resumeData: Resume): Promise<Resume> {
    resumeData.userId = userId;
    return ResumeRepository.save(resumeData);
  }

  async getResume(userId: string): Promise<Resume> {
    const resume = ResumeRepository.findByUserId(userId);
    if (!resume) {
      throw new Error("Resource Not Found: Resume details not found.");
    }
    return resume;
  }
}

export class RoadmapServiceImpl implements IRoadmapService {
  async getRoadmap(userId: string): Promise<LearningRoadmap> {
    const profile = ProfileRepository.findByUserId(userId);
    const title = profile?.careerInterests?.[0] || "Full Stack Developer";

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `
          Generate a detailed technical Learning Roadmap for a student aiming to be a ${title}.
          
          Respond ONLY with a valid JSON object matching this exact schema:
          {
            "careerTitle": "string",
            "monthlyPlan": [
              {
                "month": "string",
                "topics": ["string"],
                "courses": ["string"],
                "projects": ["string"]
              }
            ],
            "interviewPreparation": ["string"],
            "practicePlatforms": ["string"],
            "certifications": ["string"]
          }
          Provide a 3-month plan. Keep courses realistic (e.g. Coursera, Udemy, freeCodeCamp).
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                careerTitle: { type: Type.STRING },
                monthlyPlan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      month: { type: Type.STRING },
                      topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                      courses: { type: Type.ARRAY, items: { type: Type.STRING } },
                      projects: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["month", "topics", "courses", "projects"]
                  }
                },
                interviewPreparation: { type: Type.ARRAY, items: { type: Type.STRING } },
                practicePlatforms: { type: Type.ARRAY, items: { type: Type.STRING } },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["careerTitle", "monthlyPlan", "interviewPreparation", "practicePlatforms", "certifications"]
            }
          }
        });

        if (response.text) {
          const roadmap = JSON.parse(response.text.trim()) as LearningRoadmap;
          roadmap.id = `roadmap_${userId}`;
          roadmap.userId = userId;
          LearningRoadmapRepository.save(roadmap);
          return roadmap;
        }
      } catch (err) {
        console.error("Gemini API Roadmap failed, falling back to static roadmap", err);
      }
    }

    // Procedural Fallback Engine
    const roadmap: LearningRoadmap = {
      id: `roadmap_${userId}`,
      userId: userId,
      careerTitle: title,
      monthlyPlan: [
        {
          month: "Month 1: Core Technologies",
          topics: ["Core language semantics and concurrency", "Database normalization and indexing", "Basic data structures"],
          courses: ["Udemy - Modern Developer Bootcamp", "freeCodeCamp - Backend Certification"],
          projects: ["Dynamic library storage catalog app", "Personal profile card with clean style"]
        },
        {
          month: "Month 2: MVC Framework Integration",
          topics: ["RESTful controllers and annotations", "Security filters and JWT tokens", "ORM entity structures"],
          courses: ["Coursera - Full Stack Web Architectures", "Spring Academy - Spring Core"],
          projects: ["Real-time messaging microservice", "Secure profile assessment engine API"]
        },
        {
          month: "Month 3: Production Deployment",
          topics: ["Docker container networking", "CI/CD automated tests", "Production logs tracking"],
          courses: ["AWS Academy - Cloud Architecture Essentials", "KubeAcademy - Containers Core"],
          projects: ["Full CareerPro application deployment"]
        }
      ],
      interviewPreparation: [
        "Revise system design fundamentals: Load Balancers, Cache strategies, DB Sharding",
        "Mock interview on Core Language concepts & OOP design patterns",
        "Solve daily Coding Challenges on LeetCode / GeeksForGeeks"
      ],
      practicePlatforms: ["LeetCode", "HackerRank", "GeeksForGeeks"],
      certifications: ["AWS Certified Developer Associate", "Oracle Certified Java Professional"]
    };

    LearningRoadmapRepository.save(roadmap);
    return roadmap;
  }
}

export class JobServiceImpl implements IJobService {
  async getJobs(): Promise<Job[]> {
    return JobRepository.findAll();
  }
}

export class NotificationServiceImpl implements INotificationService {
  async getNotifications(userId: string): Promise<Notification[]> {
    return NotificationRepository.findByUserId(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notifications = NotificationRepository.findByUserId(userId);
    const item = notifications.find(n => n.id === notificationId);
    if (!item) {
      throw new Error("Resource Not Found: Notification item not found.");
    }
    item.read = true;
    NotificationRepository.save(item);
    return item;
  }
}

export class AdminServiceImpl implements IAdminService {
  async getUsers(): Promise<User[]> {
    return UserRepository.findAll();
  }

  async getResults(): Promise<Result[]> {
    return ResultRepository.findAll();
  }
}
