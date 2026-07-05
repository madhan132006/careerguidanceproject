/**
 * Domain Entities for CareerPro Platform.
 * Annotations (e.g., @OneToOne, @ManyToOne) specify the conceptual JPA mappings.
 */

export enum RoleName {
  ROLE_USER = "ROLE_USER",
  ROLE_ADMIN = "ROLE_ADMIN"
}

export interface Role {
  /** @Id @GeneratedValue */
  id: string;
  /** @Column(unique = true) */
  name: RoleName;
}

export interface User {
  /** @Id @GeneratedValue */
  id: string;
  /** @Column(unique = true, nullable = false) */
  email: string;
  /** @Column(nullable = false) */
  passwordHash: string;
  /** @Column */
  fullName: string;
  /** @Column */
  phone: string;
  /** @ManyToMany(fetch = FetchType.EAGER) */
  roles: RoleName[];
  /** @Column */
  createdAt: Date;
}

export interface Profile {
  /** @Id @GeneratedValue */
  id: string;
  /** @OneToOne @JoinColumn(name = "user_id") */
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  academicYear: string;
  cgpa: number;
  /** @ElementCollection */
  skills: string[];
  /** @ElementCollection */
  languages: string[];
  /** @OneToMany(cascade = CascadeType.ALL) */
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  /** @OneToMany(cascade = CascadeType.ALL) */
  projects: {
    name: string;
    description: string;
    tech: string;
  }[];
  /** @ElementCollection */
  careerInterests: string[];
  profileCompletion: number;
  profilePhoto?: string;
}

export interface Assessment {
  /** @Id @GeneratedValue */
  id: string;
  title: string;
  /** Aptitude, Logical Reasoning, Verbal Ability, Technical Assessment, Coding Assessment, Psychometric */
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
}

export interface Question {
  /** @Id @GeneratedValue */
  id: string;
  /** @ManyToOne @JoinColumn(name = "assessment_id") */
  assessmentId: string;
  questionText: string;
  /** multiple-choice, coding, open-ended */
  type: string;
  options: string[]; // Options mapped directly
  correctOptionIndex?: number; // Index of correct option (for auto-score)
  sampleInput?: string; // For coding
  sampleOutput?: string; // For coding
}

export interface Answer {
  questionId: string;
  selectedOptionIndex?: number; // Selected MC index
  codingCode?: string; // Submitted coding solution
}

export interface Result {
  /** @Id @GeneratedValue */
  id: string;
  /** @ManyToOne @JoinColumn(name = "user_id") */
  userId: string;
  /** @ManyToOne @JoinColumn(name = "assessment_id") */
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  date: string;
  analysis: string; // Dynamic narrative feedback
}

export interface Resume {
  /** @Id @GeneratedValue */
  id: string;
  /** @OneToOne @JoinColumn(name = "user_id") */
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  education: {
    degree: string;
    school: string;
    year: string;
    grade: string;
  }[];
  skills: string[];
  projects: {
    title: string;
    duration: string;
    details: string;
  }[];
  experience: {
    role: string;
    company: string;
    duration: string;
    desc: string;
  }[];
  certifications: string[];
  achievements: string[];
}

export interface CareerRecommendation {
  /** @Id @GeneratedValue */
  id: string;
  /** @ManyToOne @JoinColumn(name = "user_id") */
  userId: string;
  careerTitle: string; // e.g. "Java Developer"
  matchPercentage: number;
  requiredSkills: string[];
  learningRoadmap: string[]; // Step-by-step topics
  recommendedCertifications: string[];
  futureScope: string;
}

export interface LearningRoadmap {
  /** @Id @GeneratedValue */
  id: string;
  /** @OneToOne @JoinColumn(name = "user_id") */
  userId: string;
  careerTitle: string;
  monthlyPlan: {
    month: string;
    topics: string[];
    courses: string[];
    projects: string[];
  }[];
  interviewPreparation: string[];
  practicePlatforms: string[];
  certifications: string[];
}

export interface Job {
  /** @Id @GeneratedValue */
  id: string;
  title: string;
  type: "Internship" | "Fresher Job";
  company: string;
  location: string;
  salary: string;
  requiredSkills: string[];
  applicationLink: string;
}

export interface Notification {
  /** @Id @GeneratedValue */
  id: string;
  /** @ManyToOne @JoinColumn(name = "user_id") */
  userId: string;
  type: "assessment" | "learning" | "resume" | "interview" | "roadmap" | "job";
  title: string;
  body: string;
  read: boolean;
  time: string; // e.g. "2 hours ago"
}
