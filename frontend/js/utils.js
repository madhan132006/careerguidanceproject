/* Utils.js - Shared application state, layout injection, theme control, toast manager, and seed data */

// 1. Core Local Storage Database Seeding
const SEED_DATA = {
  user: {
    fullName: "Madhan Mohan",
    email: "madhanmohan01107@gmail.com",
    phone: "+91 98765 43210",
    college: "National Institute of Technology",
    department: "Computer Science and Engineering",
    year: "4th Year",
    skills: ["JavaScript", "HTML5", "CSS3", "React", "Python", "SQL"],
    languages: ["English", "Tamil", "Hindi"],
    interests: ["Full Stack Development", "Cloud Architecture", "Generative AI"],
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
    profileCompletion: 85
  },
  assessmentHistory: [
    { name: "Technical Aptitude", score: 85, date: "2026-06-15", status: "Completed" },
    { name: "Logical Reasoning", score: 70, date: "2026-06-20", status: "Completed" },
    { name: "Verbal Ability", score: 90, date: "2026-06-25", status: "Completed" }
  ],
  notifications: [
    { id: 1, type: "assessment", title: "Assessment Scheduled", body: "Coding Assessment is scheduled for tomorrow at 10:00 AM.", read: false, time: "2 hours ago" },
    { id: 2, type: "roadmap", title: "Learning Milestone Completed", body: "You have completed the 'Introduction to Cloud' roadmap stage.", read: false, time: "1 day ago" },
    { id: 3, type: "resume", title: "Resume Tips", body: "Your resume is 85% complete. Add a professional photo to stand out.", read: true, time: "3 days ago" },
    { id: 4, type: "job", title: "New Job Match", body: "Front End Engineer position at TechCorp matches your AWS skill.", read: true, time: "5 days ago" }
  ],
  resume: {
    fullName: "Madhan Mohan",
    email: "madhanmohan01107@gmail.com",
    phone: "+91 98765 43210",
    summary: "Aspiring software engineering graduate with strong analytical skills and academic projects in React, python, and serverless architectures.",
    education: [
      { degree: "B.Tech in Computer Science", school: "National Institute of Technology", year: "2022 - 2026", grade: "8.9 CGPA" }
    ],
    experience: [
      { role: "Software Developer Intern", company: "DevSphere", duration: "May 2025 - July 2025", desc: "Built interactive chart dashboards and optimized data parsing pipelines." }
    ],
    skills: ["JavaScript", "Python", "HTML5", "CSS3", "React", "Git", "SQL"],
    projects: [
      { title: "EcoTrack Mobile App", duration: "Jan 2025", details: "Reduced storage overhead by 25% through offline Sync API." }
    ]
  }
};

// Initialize Database on load if empty
export function initDB() {
  if (!localStorage.getItem("careerpro_seeded")) {
    localStorage.setItem("careerpro_user", JSON.stringify(SEED_DATA.user));
    localStorage.setItem("careerpro_history", JSON.stringify(SEED_DATA.assessmentHistory));
    localStorage.setItem("careerpro_notifications", JSON.stringify(SEED_DATA.notifications));
    localStorage.setItem("careerpro_resume", JSON.stringify(SEED_DATA.resume));
    localStorage.setItem("careerpro_seeded", "true");
  }
}

export function getUserData() {
  return JSON.parse(localStorage.getItem("careerpro_user")) || SEED_DATA.user;
}

export function saveUserData(data) {
  localStorage.setItem("careerpro_user", JSON.stringify(data));
}

export function getNotifications() {
  return JSON.parse(localStorage.getItem("careerpro_notifications")) || SEED_DATA.notifications;
}

export function saveNotifications(notifications) {
  localStorage.setItem("careerpro_notifications", JSON.stringify(notifications));
}

export function getResumeData() {
  return JSON.parse(localStorage.getItem("careerpro_resume")) || SEED_DATA.resume;
}

export function saveResumeData(data) {
  localStorage.setItem("careerpro_resume", JSON.stringify(data));
}

// 2. Global UI Layout Injection
export function injectLayout(activePageId) {
  initTheme();
  
  const user = getUserData();
  const sidebarContainer = document.getElementById("sidebar-container");
  const topbarContainer = document.getElementById("topbar-container");
  
  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
      <div class="sidebar">
        <div class="sidebar-header">
          <a href="/pages/dashboard.html" class="sidebar-logo">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>CareerPro</span>
          </a>
        </div>
        <div class="sidebar-user-profile text-center py-3 border-bottom" style="border-color: rgba(255,255,255,0.08) !important;">
          <img src="${user.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}" alt="Sidebar Avatar" class="sidebar-avatar rounded-circle mb-2" style="width: 55px; height: 55px; object-fit: cover; border: 2px solid var(--blue-primary);" referrerPolicy="no-referrer">
          <div class="fw-bold text-white small sidebar-user-name" style="font-size: 0.85rem;">${user.fullName}</div>
          <div class="text-muted" style="font-size: 0.7rem; color: #a8b2d1 !important;">Student Profile</div>
        </div>
        <ul class="sidebar-menu">
          <li class="sidebar-item ${activePageId === 'dashboard' ? 'active' : ''}">
            <a href="/pages/dashboard.html" class="sidebar-link">
              <i class="fa-solid fa-gauge"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="sidebar-item ${activePageId === 'profile' ? 'active' : ''}">
            <a href="/pages/profile.html" class="sidebar-link">
              <i class="fa-solid fa-user-tie"></i>
              <span>Profile</span>
            </a>
          </li>
          <li class="sidebar-item ${activePageId === 'assessment' ? 'active' : ''}">
            <a href="/pages/assessment.html" class="sidebar-link">
              <i class="fa-solid fa-circle-check"></i>
              <span>Assessment</span>
            </a>
          </li>
          <li class="sidebar-item ${activePageId === 'resume' ? 'active' : ''}">
            <a href="/pages/resume-builder.html" class="sidebar-link">
              <i class="fa-solid fa-file-pdf"></i>
              <span>Resume Builder</span>
            </a>
          </li>
          <li class="sidebar-item ${activePageId === 'career' ? 'active' : ''}">
            <a href="/pages/career-recommendation.html" class="sidebar-link">
              <i class="fa-solid fa-compass"></i>
              <span>Recommendations</span>
            </a>
          </li>
          <li class="sidebar-item ${activePageId === 'roadmap' ? 'active' : ''}">
            <a href="/pages/learning-roadmap.html" class="sidebar-link">
              <i class="fa-solid fa-road"></i>
              <span>Learning Roadmap</span>
            </a>
          </li>
          <li class="sidebar-item ${activePageId === 'jobs' ? 'active' : ''}">
            <a href="/pages/jobs.html" class="sidebar-link">
              <i class="fa-solid fa-briefcase"></i>
              <span>Job Matcher</span>
            </a>
          </li>
          <li class="sidebar-item ${activePageId === 'notifications' ? 'active' : ''}">
            <a href="/pages/notifications.html" class="sidebar-link">
              <i class="fa-solid fa-bell"></i>
              <span>Notifications</span>
            </a>
          </li>
          <li class="sidebar-item ${activePageId === 'settings' ? 'active' : ''}">
            <a href="/pages/settings.html" class="sidebar-link">
              <i class="fa-solid fa-gear"></i>
              <span>Settings</span>
            </a>
          </li>
        </ul>
        <div class="sidebar-footer">
          <a href="#" id="sidebar-logout-btn" class="sidebar-link text-danger">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </a>
        </div>
      </div>
    `;
    
    // Bind sidebar logout click action
    document.getElementById("sidebar-logout-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  }
  
  if (topbarContainer) {
    const user = getUserData();
    const notifications = getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    
    topbarContainer.innerHTML = `
      <div class="top-navbar">
        <div class="navbar-left">
          <button class="sidebar-toggle" id="sidebar-menu-toggle">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="search-wrapper">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search assessments, pathways, jobs..." id="global-search-input">
          </div>
        </div>
        <div class="navbar-right">
          <button class="theme-toggle" id="theme-mode-toggle" title="Toggle Theme">
            <i class="fa-solid fa-moon"></i>
          </button>
          
          <!-- Notifications Dropdown -->
          <div class="dropdown">
            <button class="nav-icon-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-bell"></i>
              ${unreadCount > 0 ? `<span class="badge-dot"></span>` : ''}
            </button>
            <ul class="dropdown-menu dropdown-menu-end p-3" style="width: 320px;">
              <li class="dropdown-header d-flex justify-content-between align-items-center mb-2 px-1">
                <span class="fw-bold text-dark">Notifications</span>
                <span class="badge bg-primary">${unreadCount} New</span>
              </li>
              <div id="topbar-notifications-list" style="max-height: 240px; overflow-y: auto;">
                ${notifications.slice(0, 3).map(n => `
                  <li class="notification-dropdown-item py-2 px-1 border-bottom" style="opacity: ${n.read ? 0.6 : 1}">
                    <a href="/pages/notifications.html" class="d-flex align-items-start gap-2 text-decoration-none">
                      <div class="badge bg-light-blue text-primary p-2 mt-1">
                        <i class="fa-solid ${n.type === 'assessment' ? 'fa-circle-check' : n.type === 'roadmap' ? 'fa-road' : n.type === 'resume' ? 'fa-file-pdf' : 'fa-briefcase'}"></i>
                      </div>
                      <div>
                        <div class="text-dark fw-bold small">${n.title}</div>
                        <div class="text-muted text-truncate" style="max-width: 200px; font-size: 0.75rem;">${n.body}</div>
                        <span class="text-muted d-block" style="font-size: 0.75rem;">${n.time}</span>
                      </div>
                    </a>
                  </li>
                `).join('')}
              </div>
              <li class="text-center mt-2 pt-2">
                <a href="/pages/notifications.html" class="small text-primary fw-bold">View All Notifications</a>
              </li>
            </ul>
          </div>

          <!-- User Dropdown Menu -->
          <div class="dropdown">
            <div class="user-profile-menu dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="${user.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}" alt="Avatar" class="user-avatar" referrerPolicy="no-referrer">
              <span class="user-name fw-semibold text-dark">${user.fullName}</span>
            </div>
            <ul class="dropdown-menu dropdown-menu-end p-2" style="min-width: 180px;">
              <li><a class="dropdown-item py-2 rounded" href="/pages/profile.html"><i class="fa-solid fa-user me-2 text-primary"></i> My Profile</a></li>
              <li><a class="dropdown-item py-2 rounded" href="/pages/settings.html"><i class="fa-solid fa-gear me-2 text-primary"></i> Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item py-2 rounded text-danger" href="#" id="topbar-logout-btn"><i class="fa-solid fa-right-from-bracket me-2"></i> Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // Bind Toggle elements
    document.getElementById("sidebar-menu-toggle")?.addEventListener("click", () => {
      document.querySelector(".sidebar")?.classList.toggle("show");
    });

    document.getElementById("theme-mode-toggle")?.addEventListener("click", () => {
      toggleTheme();
    });

    document.getElementById("topbar-logout-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
  }
}

// 3. Theme Controls
export function initTheme() {
  const savedTheme = localStorage.getItem("careerpro_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("careerpro_theme", newTheme);
  updateThemeIcon(newTheme);
  showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, "info");
}

function updateThemeIcon(theme) {
  const icon = document.querySelector("#theme-mode-toggle i");
  if (icon) {
    if (theme === "dark") {
      icon.className = "fa-solid fa-sun";
      icon.style.color = "#ffc107";
    } else {
      icon.className = "fa-solid fa-moon";
      icon.style.color = "var(--navy-dark)";
    }
  }
}

// 4. Session Operations
export function checkAuth() {
  const session = sessionStorage.getItem("careerpro_logged_in");
  const path = window.location.pathname;
  
  // Exclude login, register, landing page (index.html) and password recovery
  const publicPages = ["/index.html", "/", "/pages/login.html", "/pages/register.html", "/pages/forgot-password.html", "/pages/reset-password.html"];
  const isPublic = publicPages.some(p => path.endsWith(p)) || (path === "" || path === "/");
  
  if (!session && !isPublic) {
    window.location.href = "/pages/login.html";
  }
}

export function logoutUser() {
  sessionStorage.removeItem("careerpro_logged_in");
  showToast("Logged out successfully", "info");
  setTimeout(() => {
    window.location.href = "/pages/login.html";
  }, 1000);
}

// 5. Toast Notifications Manager
export function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  
  const toastId = "toast_" + Math.random().toString(36).substring(2, 9);
  const typeIcons = {
    success: "fa-circle-check text-success",
    danger: "fa-triangle-exclamation text-danger",
    warning: "fa-circle-exclamation text-warning",
    info: "fa-circle-info text-info"
  };
  
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center show fade-in" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex p-3">
        <i class="fa-solid ${typeIcons[type] || typeIcons.success} fs-5 me-3 mt-1"></i>
        <div class="toast-body p-0 text-dark fw-medium">
          ${message}
        </div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML("beforeend", toastHtml);
  
  const toastEl = document.getElementById(toastId);
  
  // Close handler
  toastEl.querySelector(".btn-close").addEventListener("click", () => {
    toastEl.classList.remove("show");
    setTimeout(() => toastEl.remove(), 300);
  });
  
  // Auto dismiss after 4 seconds
  setTimeout(() => {
    if (document.getElementById(toastId)) {
      toastEl.classList.remove("show");
      setTimeout(() => toastEl.remove(), 300);
    }
  }, 4000);
}
