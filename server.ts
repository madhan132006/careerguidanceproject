import express from "express";
import path from "path";
import dotenv from "dotenv";
import { AppRestController } from "./server/controller";
import { globalExceptionHandler } from "./server/exception";
import { corsConfiguration } from "./server/security";
import { OPENAPI_SPECIFICATION } from "./server/config/swagger";

// Initialize environment secrets
dotenv.config();

const app = express();
const PORT = 3000;

// Enforce standard middleware config
app.use(express.json());
app.use(corsConfiguration);

// Serve OpenAPI Specification JSON
app.get("/api-docs", (req, res) => {
  res.status(200).json(OPENAPI_SPECIFICATION);
});

// Mount modular MVC Rest Controller Router
app.use("/api", AppRestController);

// Serve static assets, CSS, and JS from the frontend folder
app.use(express.static(path.join(process.cwd(), "frontend")));

// Serve profile images uploaded by users
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve index.html as the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "frontend", "index.html"));
});

// Explicit routes for individual HTML pages if requested without .html extension
const pages = [
  "login", "register", "dashboard", "profile", "assessment", 
  "assessment-result", "career-recommendation", "resume-builder", 
  "learning-roadmap", "jobs", "notifications", "settings", 
  "forgot-password", "reset-password"
];

pages.forEach(page => {
  app.get(`/pages/${page}`, (req, res) => {
    res.sendFile(path.join(process.cwd(), "frontend", "pages", `${page}.html`));
  });
});

// Register Global Exception Advising Middleware (at the end of chain)
app.use(globalExceptionHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CareerPro Server running on http://0.0.0.0:${PORT}`);
});
