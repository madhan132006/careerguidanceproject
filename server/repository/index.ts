import fs from "fs";
import path from "path";
import { 
  User, Profile, Assessment, Question, Result, Resume, 
  CareerRecommendation, LearningRoadmap, Job, Notification, RoleName 
} from "../entity";

const DB_FILE = path.join(process.cwd(), "careerpro_database.json");

interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  assessments: Assessment[];
  questions: Question[];
  results: Result[];
  resumes: Resume[];
  recommendations: CareerRecommendation[];
  roadmaps: LearningRoadmap[];
  jobs: Job[];
  notifications: Notification[];
}

class DatabaseEngine {
  private data!: DatabaseSchema;

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error("Failed to read database file, re-initializing", err);
      }
    }
    this.initializeDefault();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write to database file", err);
    }
  }

  private initializeDefault() {
    this.data = {
      users: [
        {
          id: "u_1",
          email: "madhanmohan01107@gmail.com",
          passwordHash: "$2b$10$T8Z.U7C1C.D8b8X.9C3.Ueu4zX7B8Q7j3s1jC3gM9b9tE.9I4d6Iu", // "CareerPro2026!" bcrypt hash (simulated)
          fullName: "Madhan Mohan",
          phone: "+91 98765 43210",
          roles: [RoleName.ROLE_USER, RoleName.ROLE_ADMIN],
          createdAt: new Date()
        }
      ],
      profiles: [
        {
          id: "p_1",
          userId: "u_1",
          fullName: "Madhan Mohan",
          email: "madhanmohan01107@gmail.com",
          phone: "+91 98765 43210",
          college: "National Institute of Technology",
          department: "Computer Science and Engineering",
          academicYear: "4th Year",
          cgpa: 8.9,
          skills: ["JavaScript", "HTML5", "CSS3", "React", "Python", "SQL"],
          languages: ["English", "Tamil", "Hindi"],
          certifications: [
            { name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "2025" },
            { name: "Responsive Web Design", issuer: "freeCodeCamp", date: "2024" }
          ],
          projects: [
            {
              name: "EcoTrack",
              description: "Carbon footprint calculator with interactive React visualizer dashboard.",
              tech: "React, Chart.js"
            },
            {
              name: "DocuSum AI",
              description: "Serverless PDF summarization system powered by Gemini APIs.",
              tech: "Python, AWS Lambda"
            }
          ],
          careerInterests: ["Full Stack Development", "Cloud Architecture", "Generative AI"],
          profileCompletion: 85
        }
      ],
      assessments: [
        { id: "a_1", title: "Technical & Coding Assessment", category: "Technical Assessment", difficulty: "Intermediate", durationMinutes: 20 },
        { id: "a_2", title: "Aptitude & Verbal Ability", category: "Aptitude", difficulty: "Intermediate", durationMinutes: 15 },
        { id: "a_3", title: "Logical Reasoning IQ Test", category: "Logical Reasoning", difficulty: "Advanced", durationMinutes: 15 },
        { id: "a_4", title: "Psychometric Character Eval", category: "Psychometric Assessment", difficulty: "Beginner", durationMinutes: 10 }
      ],
      questions: [
        // Technical Questions
        {
          id: "q_1_1",
          assessmentId: "a_1",
          questionText: "Which data structure operates on a Last-In-First-Out (LIFO) basis?",
          type: "multiple-choice",
          options: ["Queue", "Stack", "Heap", "Binary Tree"],
          correctOptionIndex: 1
        },
        {
          id: "q_1_2",
          assessmentId: "a_1",
          questionText: "What is the time complexity of searching in a sorted array using Binary Search?",
          type: "multiple-choice",
          options: ["O(N)", "O(N log N)", "O(log N)", "O(1)"],
          correctOptionIndex: 2
        },
        {
          id: "q_1_3",
          assessmentId: "a_1",
          questionText: "Write a function in JavaScript/Java to check if a number is prime. (Coding)",
          type: "coding",
          options: [],
          sampleInput: "isPrime(11)",
          sampleOutput: "true"
        },
        // Aptitude Questions
        {
          id: "q_2_1",
          assessmentId: "a_2",
          questionText: "A car covers a distance of 480 km in 8 hours. What is its average speed in m/s?",
          type: "multiple-choice",
          options: ["60 m/s", "16.67 m/s", "20 m/s", "25 m/s"],
          correctOptionIndex: 1
        },
        {
          id: "q_2_2",
          assessmentId: "a_2",
          questionText: "Choose the synonym for 'INTELLIGENT':",
          type: "multiple-choice",
          options: ["Stupid", "Sagacious", "Silly", "Simple"],
          correctOptionIndex: 1
        },
        // Logical Questions
        {
          id: "q_3_1",
          assessmentId: "a_3",
          questionText: "If A is taller than B, and B is taller than C, which statement MUST be true?",
          type: "multiple-choice",
          options: ["C is taller than A", "A is taller than C", "B is the tallest", "C is taller than B"],
          correctOptionIndex: 1
        },
        // Psychometric
        {
          id: "q_4_1",
          assessmentId: "a_4",
          questionText: "How do you prefer to handle high-stress delivery timelines?",
          type: "multiple-choice",
          options: [
            "Break down tasks and collaborate transparently.",
            "Work extra hours solo to complete it perfectly.",
            "Escalate potential delays immediately to adjust expectations.",
            "Maintain composure and execute steadily."
          ],
          correctOptionIndex: 0
        }
      ],
      results: [
        {
          id: "res_1",
          userId: "u_1",
          assessmentId: "a_2",
          assessmentTitle: "Aptitude & Verbal Ability",
          category: "Aptitude",
          score: 85,
          totalQuestions: 2,
          correctAnswers: 2,
          percentage: 85,
          date: "2026-06-15",
          analysis: "Excellent analytical capacity and verbal fluency. Suitable for strategic roles."
        }
      ],
      resumes: [
        {
          id: "r_1",
          userId: "u_1",
          fullName: "Madhan Mohan",
          email: "madhanmohan01107@gmail.com",
          phone: "+91 98765 43210",
          summary: "Aspiring software engineering graduate with strong analytical skills and academic projects in React, python, and serverless architectures.",
          education: [
            { degree: "B.Tech in Computer Science", school: "National Institute of Technology", year: "2022 - 2026", grade: "8.9 CGPA" }
          ],
          skills: ["JavaScript", "Python", "HTML5", "CSS3", "React", "Git", "SQL"],
          projects: [
            { title: "EcoTrack Mobile App", duration: "Jan 2025", details: "Reduced storage overhead by 25% through offline Sync API." }
          ],
          experience: [
            { role: "Software Developer Intern", company: "DevSphere", duration: "May 2025 - July 2025", desc: "Built interactive chart dashboards and optimized data parsing pipelines." }
          ],
          certifications: ["AWS Cloud Practitioner", "freeCodeCamp Responsive Web Design"],
          achievements: ["Winner of Smart India Hackathon 2025", "Solved 300+ LeetCode problems"]
        }
      ],
      recommendations: [],
      roadmaps: [],
      jobs: [
        {
          id: "j_1",
          title: "Full Stack Developer Intern",
          type: "Internship",
          company: "TechCorp Systems",
          location: "Remote / Bangalore",
          salary: "₹30,000 - ₹45,000 / month",
          requiredSkills: ["React", "Node.js", "Express", "SQL"],
          applicationLink: "https://careers.techcorp.com/jobs/fs-intern"
        },
        {
          id: "j_2",
          title: "Associate Cloud Engineer",
          type: "Fresher Job",
          company: "CloudSphere Global",
          location: "Hyderabad",
          salary: "₹8,00,000 - ₹12,00,000 / annum",
          requiredSkills: ["AWS", "Python", "Docker", "Linux"],
          applicationLink: "https://careers.cloudsphere.com/associate-cloud-engineer"
        },
        {
          id: "j_3",
          title: "Generative AI Developer",
          type: "Fresher Job",
          company: "MindSpark AI",
          location: "Chennai",
          salary: "₹10,00,000 - ₹15,00,000 / annum",
          requiredSkills: ["Python", "Machine Learning", "LLMs", "TensorFlow"],
          applicationLink: "https://careers.mindspark.ai/jobs/genai"
        }
      ],
      notifications: [
        { id: "n_1", userId: "u_1", type: "assessment", title: "Assessment Scheduled", body: "Coding Assessment is scheduled for tomorrow at 10:00 AM.", read: false, time: "2 hours ago" },
        { id: "n_2", userId: "u_1", type: "roadmap", title: "Learning Milestone Completed", body: "You have completed the 'Introduction to Cloud' roadmap stage.", read: false, time: "1 day ago" },
        { id: "n_3", userId: "u_1", type: "resume", title: "Resume Tips", body: "Your resume is 85% complete. Add a professional photo to stand out.", read: true, time: "3 days ago" },
        { id: "n_4", userId: "u_1", type: "job", title: "New Job Match", body: "Front End Engineer position at TechCorp matches your AWS skill.", read: true, time: "5 days ago" }
      ]
    };
    this.save();
  }

  public get schema(): DatabaseSchema {
    return this.data;
  }
}

const db = new DatabaseEngine();

// --- REPOSITORIES ---

export class UserRepository {
  static findByEmail(email: string): User | undefined {
    return db.schema.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static findById(id: string): User | undefined {
    return db.schema.users.find(u => u.id === id);
  }

  static save(user: User): User {
    const idx = db.schema.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      db.schema.users[idx] = user;
    } else {
      db.schema.users.push(user);
    }
    db.save();
    return user;
  }

  static findAll(): User[] {
    return db.schema.users;
  }
}

export class ProfileRepository {
  static findByUserId(userId: string): Profile | undefined {
    return db.schema.profiles.find(p => p.userId === userId);
  }

  static save(profile: Profile): Profile {
    const idx = db.schema.profiles.findIndex(p => p.userId === profile.userId);
    if (idx >= 0) {
      db.schema.profiles[idx] = profile;
    } else {
      db.schema.profiles.push(profile);
    }
    db.save();
    return profile;
  }
}

export class AssessmentRepository {
  static findAll(): Assessment[] {
    return db.schema.assessments;
  }

  static findById(id: string): Assessment | undefined {
    return db.schema.assessments.find(a => a.id === id);
  }

  static findByCategory(category: string): Assessment[] {
    return db.schema.assessments.filter(a => a.category === category);
  }
}

export class QuestionRepository {
  static findByAssessmentId(assessmentId: string): Question[] {
    return db.schema.questions.filter(q => q.assessmentId === assessmentId);
  }

  static findById(id: string): Question | undefined {
    return db.schema.questions.find(q => q.id === id);
  }

  static save(question: Question): Question {
    const idx = db.schema.questions.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      db.schema.questions[idx] = question;
    } else {
      db.schema.questions.push(question);
    }
    db.save();
    return question;
  }
}

export class ResultRepository {
  static findByUserId(userId: string): Result[] {
    return db.schema.results.filter(r => r.userId === userId);
  }

  static findById(id: string): Result | undefined {
    return db.schema.results.find(r => r.id === id);
  }

  static save(result: Result): Result {
    const idx = db.schema.results.findIndex(r => r.id === result.id);
    if (idx >= 0) {
      db.schema.results[idx] = result;
    } else {
      db.schema.results.push(result);
    }
    db.save();
    return result;
  }

  static findAll(): Result[] {
    return db.schema.results;
  }
}

export class ResumeRepository {
  static findByUserId(userId: string): Resume | undefined {
    return db.schema.resumes.find(r => r.userId === userId);
  }

  static save(resume: Resume): Resume {
    const idx = db.schema.resumes.findIndex(r => r.userId === resume.userId);
    if (idx >= 0) {
      db.schema.resumes[idx] = resume;
    } else {
      db.schema.resumes.push(resume);
    }
    db.save();
    return resume;
  }
}

export class CareerRecommendationRepository {
  static findByUserId(userId: string): CareerRecommendation[] {
    return db.schema.recommendations.filter(r => r.userId === userId);
  }

  static save(recommendation: CareerRecommendation): CareerRecommendation {
    const idx = db.schema.recommendations.findIndex(r => r.id === recommendation.id);
    if (idx >= 0) {
      db.schema.recommendations[idx] = recommendation;
    } else {
      db.schema.recommendations.push(recommendation);
    }
    db.save();
    return recommendation;
  }
}

export class LearningRoadmapRepository {
  static findByUserId(userId: string): LearningRoadmap | undefined {
    return db.schema.roadmaps.find(r => r.userId === userId);
  }

  static save(roadmap: LearningRoadmap): LearningRoadmap {
    const idx = db.schema.roadmaps.findIndex(r => r.userId === roadmap.userId);
    if (idx >= 0) {
      db.schema.roadmaps[idx] = roadmap;
    } else {
      db.schema.roadmaps.push(roadmap);
    }
    db.save();
    return roadmap;
  }
}

export class NotificationRepository {
  static findByUserId(userId: string): Notification[] {
    return db.schema.notifications.filter(n => n.userId === userId);
  }

  static save(notification: Notification): Notification {
    const idx = db.schema.notifications.findIndex(n => n.id === notification.id);
    if (idx >= 0) {
      db.schema.notifications[idx] = notification;
    } else {
      db.schema.notifications.push(notification);
    }
    db.save();
    return notification;
  }

  static findAll(): Notification[] {
    return db.schema.notifications;
  }
}

export class JobRepository {
  static findAll(): Job[] {
    return db.schema.jobs;
  }

  static save(job: Job): Job {
    const idx = db.schema.jobs.findIndex(j => j.id === job.id);
    if (idx >= 0) {
      db.schema.jobs[idx] = job;
    } else {
      db.schema.jobs.push(job);
    }
    db.save();
    return job;
  }
}
