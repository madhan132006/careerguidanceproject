/* Register.js - Controls registration validation, password complexity rules, and user updates */
import { initDB, saveUserData, showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  initDB();

  const registerForm = document.getElementById("register-form");
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const college = document.getElementById("college");
  const department = document.getElementById("department");
  const year = document.getElementById("year");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  
  const strengthMeter = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");

  // Real-time password complexity checker
  password?.addEventListener("input", () => {
    const val = password.value;
    let strength = 0;
    
    if (val.length >= 6) strength++;
    if (val.match(/[a-z]/) && val.match(/[A-Z]/)) strength++;
    if (val.match(/\d/)) strength++;
    if (val.match(/[^a-zA-Z\d]/)) strength++;
    
    const strengthConfig = [
      { width: "0%", color: "bg-danger", text: "Too Short" },
      { width: "25%", color: "bg-danger", text: "Weak" },
      { width: "50%", color: "bg-warning", text: "Fair" },
      { width: "75%", color: "bg-info", text: "Good" },
      { width: "100%", color: "bg-success", text: "Strong" }
    ];
    
    const level = Math.min(strength, 4);
    const config = strengthConfig[level];
    
    if (strengthMeter) {
      strengthMeter.className = `progress-bar ${config.color}`;
      strengthMeter.style.width = config.width;
    }
    if (strengthText) {
      strengthText.textContent = `Strength: ${config.text}`;
    }
  });

  registerForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Check fields
    if (!fullName.value || !email.value || !phone.value || !password.value) {
      showToast("Please fill in all mandatory fields.", "danger");
      return;
    }

    if (password.value !== confirmPassword.value) {
      showToast("Passwords do not match.", "danger");
      confirmPassword.classList.add("is-invalid");
      return;
    } else {
      confirmPassword.classList.remove("is-invalid");
    }

    // Capture registration data into local database
    const newUser = {
      fullName: fullName.value,
      email: email.value,
      phone: phone.value,
      college: college.value || "NIT Trichy",
      department: department.value || "Computer Science",
      year: year.value || "4th Year",
      skills: ["JavaScript", "HTML5", "CSS3"],
      languages: ["English"],
      interests: ["Engineering", "Web Development"],
      certifications: [],
      projects: [],
      profileCompletion: 60
    };

    const submitBtn = document.getElementById("register-submit-btn");
    if (submitBtn) submitBtn.disabled = true;

    saveUserData(newUser);
    sessionStorage.setItem("careerpro_logged_in", "true");
    showToast("Registration Successful! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "/pages/dashboard.html";
    }, 1200);
  });
});
