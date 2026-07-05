/* Login.js - Core Javascript logic for the premium CareerPro Login portal */
import { initDB, showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize local DB
  initDB();

  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email") || document.getElementById("cyber-email");
  const passwordInput = document.getElementById("password") || document.getElementById("cyber-password");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const rememberCheckbox = document.getElementById("remember");
  const demoCredsCard = document.getElementById("demo-creds-card");
  const submitBtn = document.getElementById("login-submit-btn");

  // Show/Hide Password Toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      
      const icon = togglePasswordBtn.querySelector("i");
      if (icon) {
        if (type === "text") {
          icon.className = "fa-solid fa-eye-slash text-slate-500";
        } else {
          icon.className = "fa-solid fa-eye text-slate-500";
        }
      }
    });
  }

  // Auto-fill Demo Credentials
  if (demoCredsCard && emailInput && passwordInput) {
    demoCredsCard.addEventListener("click", () => {
      emailInput.value = "madhanmohan01107@gmail.com";
      passwordInput.value = "CareerPro2026!";
      
      // Visual feedback
      showToast("Demo credentials loaded successfully!", "info");
      
      // Focus effect
      emailInput.focus();
    });
  }

  // Handle Login Submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!emailInput || !passwordInput) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        showToast("Please enter both email and password.", "danger");
        return;
      }

      // Visual loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin me-2"></i> Verifying Credentials...`;
      }

      // Check credentials against our seeded database user
      const savedUserStr = localStorage.getItem("careerpro_user");
      let isValidUser = false;

      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (email.toLowerCase() === savedUser.email.toLowerCase() && password === "CareerPro2026!") {
          isValidUser = true;
        }
      } else if (email.toLowerCase() === "madhanmohan01107@gmail.com" && password === "CareerPro2026!") {
        isValidUser = true;
      }

      setTimeout(() => {
        if (isValidUser) {
          // Success sequence
          sessionStorage.setItem("careerpro_logged_in", "true");
          showToast("Access Granted! Loading your CareerPro Dashboard...", "success");

          // Optional remember-me
          if (rememberCheckbox && rememberCheckbox.checked) {
            localStorage.setItem("careerpro_remember_email", email);
          } else {
            localStorage.removeItem("careerpro_remember_email");
          }

          setTimeout(() => {
            window.location.href = "/pages/dashboard.html";
          }, 1000);

        } else {
          // Failure sequence
          showToast("Access Denied! Invalid credentials.", "danger");
          
          // Reset button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Sign In <i class="fa-solid fa-arrow-right ms-2"></i>`;
          }

          // Visual shake animation
          const card = document.getElementById("auth-card");
          if (card) {
            card.classList.add("shake-element");
            setTimeout(() => {
              card.classList.remove("shake-element");
            }, 500);
          }
        }
      }, 1200);
    });
  }

  // Auto populate remember-me email if exists
  if (emailInput) {
    const rememberedEmail = localStorage.getItem("careerpro_remember_email");
    if (rememberedEmail) {
      emailInput.value = rememberedEmail;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  }
});
