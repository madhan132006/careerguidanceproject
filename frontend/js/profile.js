/* Profile.js - Loads profile data, edits details dynamically, and manages skill badge creation/removals */
import { checkAuth, injectLayout, getUserData, saveUserData, showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("profile");

  let user = getUserData();

  function renderProfile() {
    // 1. Text elements
    setText("profile-name", user.fullName);
    setText("profile-email", user.email);
    setText("profile-phone", user.phone);
    setText("profile-college", user.college);
    setText("profile-dept", user.department);
    setText("profile-year", user.year);

    // Profile photo rendering
    const avatarImg = document.getElementById("profile-avatar-img");
    const defaultAvatar = document.getElementById("profile-avatar-default");
    const uploadBtn = document.getElementById("btn-upload-photo-trigger");
    const changeBtn = document.getElementById("btn-change-photo-trigger");
    const removeBtn = document.getElementById("btn-remove-photo");

    if (user.profilePhoto) {
      if (avatarImg) {
        avatarImg.src = user.profilePhoto;
        avatarImg.classList.remove("d-none");
      }
      if (defaultAvatar) {
        defaultAvatar.classList.add("d-none");
      }
      if (uploadBtn) uploadBtn.classList.add("d-none");
      if (changeBtn) changeBtn.classList.remove("d-none");
      if (removeBtn) removeBtn.classList.remove("d-none");
    } else {
      if (avatarImg) {
        avatarImg.classList.add("d-none");
      }
      if (defaultAvatar) {
        defaultAvatar.classList.remove("d-none");
      }
      if (uploadBtn) uploadBtn.classList.remove("d-none");
      if (changeBtn) changeBtn.classList.add("d-none");
      if (removeBtn) removeBtn.classList.add("d-none");
    }

    // Cover page info
    setText("profile-banner-name", user.fullName);
    setText("profile-banner-dept", `${user.department} | ${user.college}`);

    // Completion percentage
    const pct = user.profileCompletion || 75;
    setText("profile-completion-value", `${pct}%`);
    const progressEl = document.getElementById("profile-completion-progress");
    if (progressEl) progressEl.style.width = `${pct}%`;

    // 2. Skill tags
    const skillsList = document.getElementById("profile-skills-list");
    if (skillsList) {
      skillsList.innerHTML = user.skills.map(skill => `
        <span class="profile-tag">
          ${skill}
          <i class="fa-solid fa-xmark remove-btn" data-skill="${skill}"></i>
        </span>
      `).join("");

      // Bind Skill Removals
      skillsList.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const s = btn.getAttribute("data-skill");
          user.skills = user.skills.filter(x => x !== s);
          updateCompletion();
          saveUserData(user);
          renderProfile();
          showToast(`Skill '${s}' removed.`, "info");
        });
      });
    }

    // 3. Languages tags
    const langList = document.getElementById("profile-languages-list");
    if (langList) {
      langList.innerHTML = user.languages.map(lang => `<span class="badge bg-secondary px-3 py-2 rounded-pill me-2 mb-2">${lang}</span>`).join("");
    }

    // 4. Interests
    const interestList = document.getElementById("profile-interests-list");
    if (interestList) {
      interestList.innerHTML = user.interests.map(intr => `<span class="badge bg-light text-dark border px-3 py-2 rounded-pill me-2 mb-2"><i class="fa-solid fa-star text-warning me-2"></i>${intr}</span>`).join("");
    }

    // 5. Certifications
    const certTimeline = document.getElementById("profile-certifications-list");
    if (certTimeline) {
      certTimeline.innerHTML = user.certifications.length > 0 
        ? user.certifications.map(c => `
          <div class="col-md-6 mb-3">
            <div class="p-3 border rounded">
              <div class="fw-bold text-dark"><i class="fa-solid fa-certificate text-primary me-2"></i>${c.name}</div>
              <div class="text-muted small">${c.issuer} (${c.date})</div>
            </div>
          </div>
        `).join("")
        : `<p class="text-muted small px-3">No certifications added yet.</p>`;
    }

    // 6. Projects
    const projectsTimeline = document.getElementById("profile-projects-list");
    if (projectsTimeline) {
      projectsTimeline.innerHTML = user.projects.length > 0
        ? user.projects.map(p => `
          <div class="timeline-item mb-4">
            <h6 class="text-dark mb-1">${p.name}</h6>
            <p class="text-muted small mb-2">${p.description}</p>
            <span class="badge bg-light text-primary border">${p.tech}</span>
          </div>
        `).join("")
        : `<p class="text-muted small">No projects listed yet. Complete assessments or add projects.</p>`;
    }
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val || "-";
  }

  function updateCompletion() {
    let filled = 0;
    const fields = ["fullName", "email", "phone", "college", "department", "year"];
    fields.forEach(f => {
      if (user[f]) filled++;
    });

    if (user.skills.length > 0) filled++;
    if (user.languages.length > 0) filled++;
    if (user.projects.length > 0) filled++;
    if (user.certifications.length > 0) filled++;

    user.profileCompletion = Math.min(Math.round((filled / 10) * 100), 100);
  }

  // Edit Profile Modal Form submit binding
  const editForm = document.getElementById("edit-profile-form");
  editForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    // Retrieve input values
    user.fullName = document.getElementById("edit-name").value.trim();
    user.email = document.getElementById("edit-email").value.trim();
    user.phone = document.getElementById("edit-phone").value.trim();
    user.college = document.getElementById("edit-college").value.trim();
    user.department = document.getElementById("edit-dept").value.trim();
    user.year = document.getElementById("edit-year").value;

    updateCompletion();
    saveUserData(user);
    renderProfile();
    showToast("Profile updated successfully!", "success");

    // Dismiss Bootstrap modal
    const modalEl = document.getElementById("editProfileModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  });

  // Open Edit modal setup values
  document.getElementById("btn-edit-profile-modal")?.addEventListener("click", () => {
    document.getElementById("edit-name").value = user.fullName || "";
    document.getElementById("edit-email").value = user.email || "";
    document.getElementById("edit-phone").value = user.phone || "";
    document.getElementById("edit-college").value = user.college || "";
    document.getElementById("edit-dept").value = user.department || "";
    document.getElementById("edit-year").value = user.year || "4th Year";
  });

  // Add Skill event binding
  const addSkillBtn = document.getElementById("add-skill-btn");
  const skillInput = document.getElementById("skill-input");

  addSkillBtn?.addEventListener("click", () => {
    const skill = skillInput.value.trim();
    if (skill && !user.skills.includes(skill)) {
      user.skills.push(skill);
      skillInput.value = "";
      updateCompletion();
      saveUserData(user);
      renderProfile();
      showToast(`Skill '${skill}' added successfully!`, "success");
    }
  });

  skillInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addSkillBtn.click();
    }
  });

  // --- Photo Upload & Management Logic ---
  const fileInput = document.getElementById("profile-file-input");
  const uploadTrigger = document.getElementById("btn-upload-photo-trigger");
  const changeTrigger = document.getElementById("btn-change-photo-trigger");
  const removeTrigger = document.getElementById("btn-remove-photo");
  const loadingOverlay = document.getElementById("avatar-loading");

  // Clicking triggers should open file selection
  uploadTrigger?.addEventListener("click", () => fileInput?.click());
  changeTrigger?.addEventListener("click", () => fileInput?.click());

  // Handle file selection
  fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Validation Errors: Rejecting file format. Only JPG, JPEG, PNG, and WEBP are allowed.", "danger");
      fileInput.value = "";
      return;
    }

    // Validate size (5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("Validation Errors: File size exceeds the maximum limit of 5 MB.", "danger");
      fileInput.value = "";
      return;
    }

    // Show preview instantly
    const reader = new FileReader();
    reader.onload = (event) => {
      const avatarImg = document.getElementById("profile-avatar-img");
      const defaultAvatar = document.getElementById("profile-avatar-default");
      if (avatarImg) {
        avatarImg.src = event.target.result;
        avatarImg.classList.remove("d-none");
      }
      if (defaultAvatar) {
        defaultAvatar.classList.add("d-none");
      }
    };
    reader.readAsDataURL(file);

    // Show loading spinner
    if (loadingOverlay) loadingOverlay.classList.remove("d-none");

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const token = "JWT_ACCESS_TOKEN_MOCK_u_1";
      const response = await fetch("/api/profile/upload-photo", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload photo.");
      }

      const result = await response.json();
      
      // Update local storage user profile
      user.profilePhoto = result.profilePhoto;
      saveUserData(user);
      
      showToast("Profile photo uploaded successfully!", "success");
      
      // Refresh sidebar/navbar instantly
      injectLayout("profile");

    } catch (err) {
      console.error(err);
      showToast(err.message || "An error occurred during upload.", "danger");
      // Re-render to clear preview if failed
      renderProfile();
    } finally {
      if (loadingOverlay) loadingOverlay.classList.add("d-none");
      fileInput.value = "";
      renderProfile();
    }
  });

  // Handle Photo Removal
  removeTrigger?.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;

    if (loadingOverlay) loadingOverlay.classList.remove("d-none");

    try {
      const token = "JWT_ACCESS_TOKEN_MOCK_u_1";
      const response = await fetch("/api/profile/delete-photo", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete photo.");
      }

      // Update local storage user profile
      user.profilePhoto = "";
      saveUserData(user);
      
      showToast("Profile photo removed successfully.", "success");
      
      // Refresh layout instantly
      injectLayout("profile");

    } catch (err) {
      console.error(err);
      showToast(err.message || "An error occurred during deletion.", "danger");
    } finally {
      if (loadingOverlay) loadingOverlay.classList.add("d-none");
      renderProfile();
    }
  });

  // Execute
  renderProfile();
});
