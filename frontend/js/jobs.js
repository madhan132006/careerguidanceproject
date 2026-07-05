/* Jobs.js - Controls job matcher tables, keyword filters, remote toggles, and mock application modals */
import { checkAuth, injectLayout, showToast } from "./utils.js";

const JOBS_DB = [
  {
    id: 1,
    title: "Junior Frontend Engineer",
    company: "TechCorp Labs",
    location: "Bangalore (Hybrid)",
    salary: "₹8,00,000 - ₹12,00,000 /yr",
    type: "Full-Time",
    skills: ["JavaScript", "React", "HTML5"],
    description: "Responsible for creating elegant components and high-performance layouts.",
    logo: "fa-laptop-code text-primary"
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "DevSphere International",
    location: "Remote",
    salary: "₹12,00,000 - ₹18,00,000 /yr",
    type: "Full-Time",
    skills: ["JavaScript", "React", "Node.js", "SQL"],
    description: "Manage end-to-end features, server integrations, and SQL database query engines.",
    logo: "fa-server text-success"
  },
  {
    id: 3,
    title: "AWS DevOps Intern",
    company: "CloudVantage",
    location: "Pune (On-site)",
    salary: "₹35,000 /month",
    type: "Internship",
    skills: ["Python", "AWS", "Docker"],
    description: "Learn and deploy server infrastructures, load balances, and automated scripts.",
    logo: "fa-cloud text-info"
  },
  {
    id: 4,
    title: "Software Engineer - AI Systems",
    company: "BrainAI Technologies",
    location: "Remote",
    salary: "₹18,00,000 - ₹25,00,000 /yr",
    type: "Full-Time",
    skills: ["Python", "Generative AI", "SQL"],
    description: "Optimize neural prompt structures, model interfaces, and caching services.",
    logo: "fa-brain text-warning"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("jobs");

  let currentFilters = { search: "", type: "all", location: "all" };

  // Parse query params for search redirection
  const params = new URLSearchParams(window.location.search);
  if (params.has("search")) {
    currentFilters.search = params.get("search").toLowerCase();
    const searchEl = document.getElementById("job-search-input");
    if (searchEl) searchEl.value = params.get("search");
  }

  function renderJobs() {
    const list = document.getElementById("jobs-listings-list");
    if (!list) return;

    const filtered = JOBS_DB.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(currentFilters.search) || 
                          job.company.toLowerCase().includes(currentFilters.search) ||
                          job.skills.some(s => s.toLowerCase().includes(currentFilters.search));
      
      const matchType = currentFilters.type === "all" || job.type === currentFilters.type;
      
      const matchLoc = currentFilters.location === "all" || 
                       (currentFilters.location === "remote" && job.location.toLowerCase().includes("remote")) ||
                       (currentFilters.location === "onsite" && !job.location.toLowerCase().includes("remote"));

      return matchSearch && matchType && matchLoc;
    });

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="text-center p-5 bg-white border rounded">
          <i class="fa-solid fa-briefcase fs-1 text-muted mb-3"></i>
          <h5>No jobs matching your filters.</h5>
          <p class="text-muted small">Try refining your keyword queries or clearing type constraints.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(j => `
      <div class="card mb-3 p-4">
        <div class="row align-items-center">
          <div class="col-md-9">
            <div class="d-flex align-items-center gap-3 mb-2">
              <div class="badge bg-light text-primary fs-4 p-3 rounded">
                <i class="fa-solid ${j.logo}"></i>
              </div>
              <div>
                <h5 class="text-dark mb-0">${j.title}</h5>
                <div class="text-muted fw-bold small">${j.company} &bull; ${j.location}</div>
              </div>
            </div>
            <p class="text-muted small mb-3">${j.description}</p>
            <div class="d-flex flex-wrap gap-2 mb-2">
              ${j.skills.map(s => `<span class="badge bg-light text-dark border px-3 py-1 rounded-pill">${s}</span>`).join("")}
            </div>
          </div>
          <div class="col-md-3 text-md-end mt-3 mt-md-0">
            <div class="text-success fw-bold mb-2">${j.salary}</div>
            <div class="badge bg-primary-subtle text-primary px-3 py-2 mb-3 rounded-pill d-inline-block">${j.type}</div>
            <button class="btn btn-primary w-100 apply-btn" data-id="${j.id}" data-title="${j.title}" data-company="${j.company}">
              Apply Now
            </button>
          </div>
        </div>
      </div>
    `).join("");

    // Bind Apply Now click actions
    list.querySelectorAll(".apply-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const title = btn.getAttribute("data-title");
        const company = btn.getAttribute("data-company");

        // Trigger Apply Modal
        openApplyModal(id, title, company);
      });
    });
  }

  function openApplyModal(id, title, company) {
    const modalTitle = document.getElementById("applyModalTitle");
    if (modalTitle) modalTitle.textContent = `Apply for ${title}`;
    
    const modalSubtitle = document.getElementById("applyModalSubtitle");
    if (modalSubtitle) modalSubtitle.textContent = `at ${company}`;

    const modalEl = document.getElementById("applyJobModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // Bind Submit Apply handler once
    const form = document.getElementById("apply-job-form");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById("apply-submit-btn");
        if (submitBtn) submitBtn.disabled = true;

        showToast("Submitting your application with generated resume...", "info");

        setTimeout(() => {
          modal.hide();
          showToast(`Application submitted successfully to ${company}!`, "success");
          if (submitBtn) submitBtn.disabled = false;
        }, 1500);
      };
    }
  }

  // Bind Input Filters
  document.getElementById("job-search-input")?.addEventListener("input", (e) => {
    currentFilters.search = e.target.value.toLowerCase().trim();
    renderJobs();
  });

  document.getElementById("job-type-filter")?.addEventListener("change", (e) => {
    currentFilters.type = e.target.value;
    renderJobs();
  });

  document.getElementById("job-loc-filter")?.addEventListener("change", (e) => {
    currentFilters.location = e.target.value;
    renderJobs();
  });

  renderJobs();
});
