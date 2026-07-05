import { RoleName } from "../entity";

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  college?: string;
  department?: string;
  year?: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  roles: RoleName[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetCode: string;
  newPassword?: string;
}

export interface ProfileDto {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  academicYear: string;
  cgpa: number;
  skills: string[];
  languages: string[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  projects: {
    name: string;
    description: string;
    tech: string;
  }[];
  careerInterests: string[];
  profileCompletion: number;
  profilePhoto?: string;
}

export interface AssessmentStartResponse {
  assessmentId: string;
  title: string;
  category: string;
  durationMinutes: number;
  questions: {
    id: string;
    questionText: string;
    type: string;
    options: string[];
  }[];
}

export interface AssessmentSubmitRequest {
  assessmentId: string;
  answers: {
    questionId: string;
    selectedOptionIndex?: number;
    codingCode?: string;
  }[];
}

export interface DashboardStatsResponse {
  profileCompletion: number;
  resumeCompletion: number;
  assessmentsTaken: number;
  averageScore: number;
  unreadNotifications: number;
  recentActivities: {
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
  }[];
  learningProgress: {
    stage: string;
    percentage: number;
  }[];
}
