import { 
  RegisterRequest, LoginRequest, AuthResponse, ForgotPasswordRequest, 
  ResetPasswordRequest, ProfileDto, AssessmentStartResponse, 
  AssessmentSubmitRequest, DashboardStatsResponse 
} from "../dto";
import { 
  Profile, Result, Resume, CareerRecommendation, LearningRoadmap, Job, Notification, User 
} from "../entity";

export interface IAuthService {
  register(request: RegisterRequest): Promise<AuthResponse>;
  login(request: LoginRequest): Promise<AuthResponse>;
  forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }>;
  resetPassword(request: ResetPasswordRequest): Promise<{ message: string }>;
}

export interface IProfileService {
  getProfile(userId: string): Promise<Profile>;
  updateProfile(userId: string, profileDto: ProfileDto): Promise<Profile>;
}

export interface IDashboardService {
  getStats(userId: string): Promise<DashboardStatsResponse>;
}

export interface IAssessmentService {
  getCategories(): Promise<string[]>;
  getQuestions(assessmentId: string): Promise<AssessmentStartResponse>;
  submitAssessment(userId: string, request: AssessmentSubmitRequest): Promise<Result>;
  getResult(resultId: string): Promise<Result>;
}

export interface IRecommendationService {
  getRecommendations(userId: string): Promise<CareerRecommendation[]>;
}

export interface IResumeService {
  saveResume(userId: string, resumeData: Resume): Promise<Resume>;
  getResume(userId: string): Promise<Resume>;
}

export interface IRoadmapService {
  getRoadmap(userId: string): Promise<LearningRoadmap>;
}

export interface IJobService {
  getJobs(): Promise<Job[]>;
}

export interface INotificationService {
  getNotifications(userId: string): Promise<Notification[]>;
  markAsRead(userId: string, notificationId: string): Promise<Notification>;
}

export interface IAdminService {
  getUsers(): Promise<User[]>;
  getResults(): Promise<Result[]>;
}
