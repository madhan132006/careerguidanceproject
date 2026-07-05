/* Settings.js - Handles theme updates, password changes, account variables, and platform database resets */
import { checkAuth, injectLayout, toggleTheme, showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("settings");

  // Toggle Theme Switcher inside Settings
  const settingsThemeToggle = document.getElementById("settings-theme-toggle");
  if (settingsThemeToggle) {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    settingsThemeToggle.checked = isDark;

    settingsThemeToggle.addEventListener("change", () => {
      toggleTheme();
    });
  }

  // Language selector
  const languageSelect = document.getElementById("settings-language");
  languageSelect?.addEventListener("change", (e) => {
    showToast(`Language updated to ${e.target.value === 'en' ? 'English' : 'Hindi'}.`, "success");
  });

  // Change Password Form handler
  const passwordForm = document.getElementById("change-password-form");
  passwordForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const currentPass = document.getElementById("curr-password").value.trim();
    const newPass = document.getElementById("new-password").value.trim();
    const confPass = document.getElementById("conf-new-password").value.trim();

    if (!currentPass || !newPass || !confPass) {
      showToast("Please fill in all password fields.", "danger");
      return;
    }

    if (newPass !== confPass) {
      showToast("New passwords do not match.", "danger");
      return;
    }

    if (newPass.length < 6) {
      showToast("Password must be at least 6 characters.", "danger");
      return;
    }

    showToast("Password updated successfully!", "success");
    passwordForm.reset();
  });

  // System Database Reset
  document.getElementById("btn-reset-platform")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all platform data? This will clear your custom resume, achievements, and test logs.")) {
      localStorage.clear();
      sessionStorage.clear();
      showToast("All data cleared. Redirecting to home...", "info");
      
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1200);
    }
  });
});
