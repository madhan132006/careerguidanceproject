import { Response, NextFunction, Router } from "express";
import { 
  AuthServiceImpl, ProfileServiceImpl, DashboardServiceImpl, 
  AssessmentServiceImpl, RecommendationServiceImpl, ResumeServiceImpl, 
  RoadmapServiceImpl, JobServiceImpl, NotificationServiceImpl, AdminServiceImpl 
} from "../service/impl";
import { jwtAuthenticationFilter, authorizeRoles, AuthenticatedRequest } from "../security";
import { RoleName } from "../entity";
import { ProfileRepository } from "../repository";
import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: any, file, cb) => {
    const userId = req.user?.userId || "unknown";
    const timestamp = Math.floor(Date.now() / 1000);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: (req: any, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Validation Errors: Rejecting file format. Only JPG, JPEG, PNG, and WEBP are allowed."));
    }
    cb(null, true);
  }
});

const router = Router();

// Instantiate Services (Dependency Injection simulation)
const authService = new AuthServiceImpl();
const profileService = new ProfileServiceImpl();
const dashboardService = new DashboardServiceImpl();
const assessmentService = new AssessmentServiceImpl();
const recommendationService = new RecommendationServiceImpl();
const resumeService = new ResumeServiceImpl();
const roadmapService = new RoadmapServiceImpl();
const jobService = new JobServiceImpl();
const notificationService = new NotificationServiceImpl();
const adminService = new AdminServiceImpl();

// --- 1. AUTHENTICATION ENDPOINTS ---

router.post("/auth/register", async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body;
    if (!email || !password || !fullName || !phone) {
      throw new Error("Validation Errors: email, password, fullName, and phone are mandatory registration parameters.");
    }
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      throw new Error("Validation Errors: email is a required login parameter.");
    }
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    res.status(200).json({ message: "Logout successful. Session revoked." });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new Error("Validation Errors: email is a required parameter.");
    }
    const result = await authService.forgotPassword(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/auth/reset-password", async (req, res, next) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode) {
      throw new Error("Validation Errors: email and resetCode are mandatory parameters.");
    }
    const result = await authService.resetPassword(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// --- 2. PROFILE ENDPOINTS ---

router.get("/profile", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.getProfile(userId);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

router.put("/profile", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const profile = await profileService.updateProfile(userId, req.body);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

router.post("/profile/upload-photo", jwtAuthenticationFilter, (req: AuthenticatedRequest, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new Error("Validation Errors: File size exceeds the maximum limit of 5 MB."));
      }
      return next(new Error(`Validation Errors: ${err.message}`));
    }
    
    try {
      if (!req.file) {
        throw new Error("Validation Errors: No photo file uploaded.");
      }
      
      const userId = req.user!.userId;
      const profile = ProfileRepository.findByUserId(userId);
      if (!profile) {
        throw new Error("Resource Not Found: User profile not found.");
      }
      
      const relativePath = `/uploads/profile-images/${req.file.filename}`;
      profile.profilePhoto = relativePath;
      ProfileRepository.save(profile);
      
      res.status(200).json({
        message: "Profile photo uploaded successfully.",
        profilePhoto: relativePath,
        profile
      });
    } catch (error) {
      next(error);
    }
  });
});

router.get("/profile/photo/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const profile = ProfileRepository.findByUserId(userId);
    res.status(200).json({
      userId,
      profilePhoto: profile?.profilePhoto || ""
    });
  } catch (err) {
    next(err);
  }
});

router.put("/profile/update-photo", jwtAuthenticationFilter, (req: AuthenticatedRequest, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new Error("Validation Errors: File size exceeds the maximum limit of 5 MB."));
      }
      return next(new Error(`Validation Errors: ${err.message}`));
    }
    
    try {
      if (!req.file) {
        throw new Error("Validation Errors: No photo file provided to update.");
      }
      
      const userId = req.user!.userId;
      const profile = ProfileRepository.findByUserId(userId);
      if (!profile) {
        throw new Error("Resource Not Found: User profile not found.");
      }
      
      // Delete old photo if it exists and is local
      if (profile.profilePhoto && profile.profilePhoto.startsWith("/uploads/profile-images/")) {
        const oldPath = path.join(process.cwd(), profile.profilePhoto);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (deleteErr) {
            console.error("Failed to delete old photo file:", deleteErr);
          }
        }
      }
      
      const relativePath = `/uploads/profile-images/${req.file.filename}`;
      profile.profilePhoto = relativePath;
      ProfileRepository.save(profile);
      
      res.status(200).json({
        message: "Profile photo updated successfully.",
        profilePhoto: relativePath,
        profile
      });
    } catch (error) {
      next(error);
    }
  });
});

router.delete("/profile/delete-photo", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const profile = ProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error("Resource Not Found: User profile not found.");
    }
    
    if (profile.profilePhoto) {
      if (profile.profilePhoto.startsWith("/uploads/profile-images/")) {
        const filePath = path.join(process.cwd(), profile.profilePhoto);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (deleteErr) {
            console.error("Failed to delete photo file:", deleteErr);
          }
        }
      }
      profile.profilePhoto = "";
      ProfileRepository.save(profile);
    }
    
    res.status(200).json({
      message: "Profile photo deleted successfully.",
      profilePhoto: "",
      profile
    });
  } catch (err) {
    next(err);
  }
});

// --- 3. DASHBOARD STATS ---

router.get("/dashboard/stats", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const stats = await dashboardService.getStats(userId);
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
});

// --- 4. ASSESSMENT ENDPOINTS ---

router.get("/assessment/categories", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    const categories = await assessmentService.getCategories();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
});

router.get("/assessment/questions", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    const assessmentId = req.query.assessmentId as string || "a_1";
    const questions = await assessmentService.getQuestions(assessmentId);
    res.status(200).json(questions);
  } catch (err) {
    next(err);
  }
});

// Extra start endpoint
router.post("/assessment/start", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    const { assessmentId } = req.body;
    if (!assessmentId) {
      throw new Error("Validation Errors: assessmentId is required.");
    }
    const questions = await assessmentService.getQuestions(assessmentId);
    res.status(200).json(questions);
  } catch (err) {
    next(err);
  }
});

router.post("/assessment/save", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    res.status(200).json({ status: "success", message: "Answer state saved securely." });
  } catch (err) {
    next(err);
  }
});

router.post("/assessment/submit", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { assessmentId, answers } = req.body;
    if (!assessmentId || !answers) {
      throw new Error("Validation Errors: assessmentId and answers array are mandatory parameters.");
    }
    const result = await assessmentService.submitAssessment(userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/assessment/result/:id", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    const result = await assessmentService.getResult(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// --- 5. AI RECOMMENDATION ENDPOINTS ---

router.get("/recommendation/:userId", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    const recommendations = await recommendationService.getRecommendations(req.params.userId);
    res.status(200).json(recommendations);
  } catch (err) {
    next(err);
  }
});

// --- 6. RESUME ENDPOINTS ---

router.post("/resume", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const result = await resumeService.saveResume(userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/resume", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const result = await resumeService.saveResume(userId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/resume/:userId", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    const result = await resumeService.getResume(req.params.userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// --- 7. ROADMAP ENDPOINTS ---

router.get("/roadmap/:userId", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    const result = await roadmapService.getRoadmap(req.params.userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// --- 8. JOB RECOMMENDATION ENDPOINTS ---

router.get("/jobs", jwtAuthenticationFilter, async (req, res, next) => {
  try {
    const result = await jobService.getJobs();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// --- 9. NOTIFICATIONS ENDPOINTS ---

router.get("/notifications", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const result = await notificationService.getNotifications(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/notifications/:id/read", jwtAuthenticationFilter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const result = await notificationService.markAsRead(userId, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// --- 10. ADMIN ENDPOINTS ---

router.get("/admin/users", jwtAuthenticationFilter, authorizeRoles(RoleName.ROLE_ADMIN), async (req, res, next) => {
  try {
    const result = await adminService.getUsers();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/admin/results", jwtAuthenticationFilter, authorizeRoles(RoleName.ROLE_ADMIN), async (req, res, next) => {
  try {
    const result = await adminService.getResults();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export { router as AppRestController };
