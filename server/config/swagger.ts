export const OPENAPI_SPECIFICATION = {
  openapi: "3.0.3",
  info: {
    title: "CareerPro AI Guidance Platform API",
    description: "API specifications for CareerPro, an AI-powered Career Guidance and Talent Assessment Platform.",
    version: "1.0.0",
    contact: {
      name: "CareerPro Architects",
      email: "architects@careerpro.io"
    }
  },
  servers: [
    {
      url: "/api",
      description: "Local API Gate"
    }
  ],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register new user account",
        description: "Registers a user and provisions an empty career profile and resume.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        responses: {
          201: {
            description: "Registered & Authenticated Successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          409: {
            description: "Email already exists"
          }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Sign In user session",
        description: "Authenticates with email and provides JWT access/refresh tokens.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Access Granted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          401: {
            description: "Invalid credentials"
          }
        }
      }
    },
    "/auth/forgot-password": {
      post: {
        summary: "Request Password Recovery",
        description: "Initiates forgot password flow.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "student@college.edu" }
                },
                required: ["email"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Email sent"
          }
        }
      }
    },
    "/auth/reset-password": {
      post: {
        summary: "Verify Code & Save New Password",
        description: "Resets the user's password with a reset code.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "student@college.edu" },
                  resetCode: { type: "string", example: "CAREERPRO" },
                  newPassword: { type: "string", example: "NewPass123!" }
                },
                required: ["email", "resetCode"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Password reset successful"
          }
        }
      }
    },
    "/profile": {
      get: {
        summary: "Retrieve user profile Details",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Profile"
                }
              }
            }
          }
        }
      },
      put: {
        summary: "Update user profile Details",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Profile"
              }
            }
          }
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Profile"
                }
              }
            }
          }
        }
      }
    },
    "/dashboard/stats": {
      get: {
        summary: "Get aggregate stats for user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DashboardStats"
                }
              }
            }
          }
        }
      }
    },
    "/assessment/categories": {
      get: {
        summary: "List all assessment Categories",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    "/assessment/questions": {
      get: {
        summary: "Get questions for an assessment",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "assessmentId",
            in: "query",
            required: false,
            schema: { type: "string" },
            example: "a_1"
          }
        ],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AssessmentStartResponse"
                }
              }
            }
          }
        }
      }
    },
    "/assessment/submit": {
      post: {
        summary: "Submit finished assessment",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AssessmentSubmitRequest"
              }
            }
          }
        },
        responses: {
          201: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Result"
                }
              }
            }
          }
        }
      }
    },
    "/assessment/result/{id}": {
      get: {
        summary: "Retrieve direct result metrics",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Result"
                }
              }
            }
          }
        }
      }
    },
    "/recommendation/{userId}": {
      get: {
        summary: "Retrieve AI career recommendations",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CareerRecommendation" }
                }
              }
            }
          }
        }
      }
    },
    "/resume/{userId}": {
      get: {
        summary: "Retrieve resume builder details",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Resume"
                }
              }
            }
          }
        }
      }
    },
    "/resume": {
      post: {
        summary: "Create or Save resume data",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Resume"
              }
            }
          }
        },
        responses: {
          201: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Resume"
                }
              }
            }
          }
        }
      }
    },
    "/roadmap/{userId}": {
      get: {
        summary: "Retrieve month-by-month learning roadmaps",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LearningRoadmap"
                }
              }
            }
          }
        }
      }
    },
    "/jobs": {
      get: {
        summary: "List matched internship & fresher openings",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Job" }
                }
              }
            }
          }
        }
      }
    },
    "/notifications": {
      get: {
        summary: "Retrieve live system alerts & updates",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Notification" }
                }
              }
            }
          }
        }
      }
    },
    "/admin/users": {
      get: {
        summary: "List all users (Admin view)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      email: { type: "string" },
                      fullName: { type: "string" },
                      roles: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "Madhan Mohan" },
          email: { type: "string", example: "student@college.edu" },
          phone: { type: "string", example: "+91 98765 43210" },
          password: { type: "string", example: "CareerPro2026!" }
        },
        required: ["fullName", "email", "phone", "password"]
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", example: "student@college.edu" },
          password: { type: "string", example: "CareerPro2026!" }
        },
        required: ["email", "password"]
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          refreshToken: { type: "string" },
          userId: { type: "string" },
          email: { type: "string" },
          fullName: { type: "string" },
          roles: { type: "array", items: { type: "string" } }
        }
      },
      Profile: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          fullName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          college: { type: "string" },
          department: { type: "string" },
          academicYear: { type: "string" },
          cgpa: { type: "number" },
          skills: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } }
        }
      },
      DashboardStats: {
        type: "object",
        properties: {
          profileCompletion: { type: "integer" },
          resumeCompletion: { type: "integer" },
          assessmentsTaken: { type: "integer" },
          averageScore: { type: "number" },
          unreadNotifications: { type: "integer" }
        }
      },
      AssessmentStartResponse: {
        type: "object",
        properties: {
          assessmentId: { type: "string" },
          title: { type: "string" },
          category: { type: "string" },
          durationMinutes: { type: "integer" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                questionText: { type: "string" },
                type: { type: "string" },
                options: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      },
      AssessmentSubmitRequest: {
        type: "object",
        properties: {
          assessmentId: { type: "string", example: "a_1" },
          answers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                questionId: { type: "string", example: "q_1_1" },
                selectedOptionIndex: { type: "integer", example: 1 },
                codingCode: { type: "string" }
              }
            }
          }
        },
        required: ["assessmentId", "answers"]
      },
      Result: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          assessmentId: { type: "string" },
          assessmentTitle: { type: "string" },
          score: { type: "integer" },
          percentage: { type: "integer" },
          date: { type: "string" },
          analysis: { type: "string" }
        }
      },
      CareerRecommendation: {
        type: "object",
        properties: {
          careerTitle: { type: "string" },
          matchPercentage: { type: "integer" },
          requiredSkills: { type: "array", items: { type: "string" } },
          learningRoadmap: { type: "array", items: { type: "string" } },
          recommendedCertifications: { type: "array", items: { type: "string" } },
          futureScope: { type: "string" }
        }
      },
      Resume: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          summary: { type: "string" },
          education: { type: "array", items: { type: "object" } },
          skills: { type: "array", items: { type: "string" } }
        }
      },
      LearningRoadmap: {
        type: "object",
        properties: {
          careerTitle: { type: "string" },
          monthlyPlan: { type: "array", items: { type: "object" } },
          interviewPreparation: { type: "array", items: { type: "string" } },
          practicePlatforms: { type: "array", items: { type: "string" } }
        }
      },
      Job: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          type: { type: "string" },
          company: { type: "string" },
          location: { type: "string" },
          salary: { type: "string" },
          requiredSkills: { type: "array", items: { type: "string" } }
        }
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          read: { type: "boolean" },
          time: { type: "string" }
        }
      }
    }
  }
};
