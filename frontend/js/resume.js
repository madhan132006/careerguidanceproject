/* Resume.js - Interactive side-by-side resume editor, live layout preview rendering, and printable PDF formats */
import { checkAuth, injectLayout, getResumeData, saveResumeData, showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("resume");

  let resume = getResumeData();

  function loadFormInputs() {
    setInput("res-name", resume.fullName);
    setInput("res-email", resume.email);
    setInput("res-phone", resume.phone);
    setInput("res-summary", resume.summary);
    
    // Arrays values loaders
    if (resume.education && resume.education[0]) {
      setInput("res-degree", resume.education[0].degree);
      setInput("res-school", resume.education[0].school);
      setInput("res-edu-year", resume.education[0].year);
      setInput("res-grade", resume.education[0].grade);
    }
    
    if (resume.experience && resume.experience[0]) {
      setInput("res-role", resume.experience[0].role);
      setInput("res-company", resume.experience[0].company);
      setInput("res-exp-year", resume.experience[0].duration);
      setInput("res-exp-desc", resume.experience[0].desc);
    }

    if (resume.skills) {
      setInput("res-skills", resume.skills.join(", "));
    }

    if (resume.projects && resume.projects[0]) {
      setInput("res-proj-title", resume.projects[0].title);
      setInput("res-proj-desc", resume.projects[0].details);
    }
  }

  function setInput(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  }

  function renderPreview() {
    // Collect from inputs
    const fullName = getVal("res-name");
    const email = getVal("res-email");
    const phone = getVal("res-phone");
    const summary = getVal("res-summary");
    const degree = getVal("res-degree");
    const school = getVal("res-school");
    const eduYear = getVal("res-edu-year");
    const grade = getVal("res-grade");
    const role = getVal("res-role");
    const company = getVal("res-company");
    const expYear = getVal("res-exp-year");
    const expDesc = getVal("res-exp-desc");
    const skillsText = getVal("res-skills");
    const projTitle = getVal("res-proj-title");
    const projDesc = getVal("res-proj-desc");

    // Re-bind preview values
    setText("preview-name", fullName || "Your Name");
    setText("preview-contact", `${phone || "+91 XXXXX"} | ${email || "email@example.com"}`);
    setText("preview-summary", summary || "A brief outline of your professional and academic aspirations...");

    // Education details
    const eduContainer = document.getElementById("preview-education");
    if (eduContainer) {
      if (degree || school) {
        eduContainer.innerHTML = `
          <div class="mb-2">
            <div class="d-flex justify-content-between">
              <span class="fw-bold text-dark">${degree}</span>
              <span class="text-muted small">${eduYear}</span>
            </div>
            <div class="text-muted small">${school} ${grade ? `| Grade: ${grade}` : ''}</div>
          </div>
        `;
      } else {
        eduContainer.innerHTML = `<p class="text-muted small mb-0">No education entries added yet.</p>`;
      }
    }

    // Professional experience
    const expContainer = document.getElementById("preview-experience");
    if (expContainer) {
      if (role || company) {
        expContainer.innerHTML = `
          <div class="mb-2">
            <div class="d-flex justify-content-between">
              <span class="fw-bold text-dark">${role}</span>
              <span class="text-muted small">${expYear}</span>
            </div>
            <div class="text-muted small mb-1">${company}</div>
            <p class="text-muted small mb-0">${expDesc}</p>
          </div>
        `;
      } else {
        expContainer.innerHTML = `<p class="text-muted small mb-0">No experience listed.</p>`;
      }
    }

    // Projects
    const projContainer = document.getElementById("preview-projects");
    if (projContainer) {
      if (projTitle) {
        projContainer.innerHTML = `
          <div class="mb-2">
            <div class="fw-bold text-dark">${projTitle}</div>
            <p class="text-muted small mb-0">${projDesc}</p>
          </div>
        `;
      } else {
        projContainer.innerHTML = `<p class="text-muted small mb-0">No projects listed.</p>`;
      }
    }

    // Skills
    const skillsContainer = document.getElementById("preview-skills");
    if (skillsContainer) {
      if (skillsText) {
        const list = skillsText.split(",").map(s => s.trim()).filter(Boolean);
        skillsContainer.innerHTML = list.map(s => `<span class="badge bg-light text-dark border me-1 mb-1">${s}</span>`).join("");
      } else {
        skillsContainer.innerHTML = `<p class="text-muted small mb-0">No skills added.</p>`;
      }
    }
  }

  function getVal(id) {
    return document.getElementById(id)?.value.trim() || "";
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // Save changes
  document.getElementById("save-resume-btn")?.addEventListener("click", () => {
    const updated = {
      fullName: getVal("res-name"),
      email: getVal("res-email"),
      phone: getVal("res-phone"),
      summary: getVal("res-summary"),
      education: [
        {
          degree: getVal("res-degree"),
          school: getVal("res-school"),
          year: getVal("res-edu-year"),
          grade: getVal("res-grade")
        }
      ],
      experience: [
        {
          role: getVal("res-role"),
          company: getVal("res-company"),
          duration: getVal("res-exp-year"),
          desc: getVal("res-exp-desc")
        }
      ],
      skills: getVal("res-skills").split(",").map(s => s.trim()).filter(Boolean),
      projects: [
        {
          title: getVal("res-proj-title"),
          details: getVal("res-proj-desc")
        }
      ]
    };

    saveResumeData(updated);
    showToast("Resume details saved successfully!", "success");
  });

  // Print PDF
  document.getElementById("download-pdf-btn")?.addEventListener("click", () => {
    showToast("Preparing document printing...", "info");
    setTimeout(() => {
      const printContents = document.getElementById("resume-preview-card").innerHTML;
      const originalContents = document.body.innerHTML;
      
      // Clean display for print
      document.body.innerHTML = `
        <div style="padding: 40px; font-family: 'Inter', sans-serif;">
          ${printContents}
        </div>
      `;
      window.print();
      
      // Restore page
      document.body.innerHTML = originalContents;
      window.location.reload();
    }, 1000);
  });

  // Bind live preview listeners
  const inputIds = [
    "res-name", "res-email", "res-phone", "res-summary",
    "res-degree", "res-school", "res-edu-year", "res-grade",
    "res-role", "res-company", "res-exp-year", "res-exp-desc",
    "res-skills", "res-proj-title", "res-proj-desc"
  ];

  inputIds.forEach(id => {
    document.getElementById(id)?.addEventListener("input", renderPreview);
  });

  // Load Initial state
  loadFormInputs();
  renderPreview();
});
