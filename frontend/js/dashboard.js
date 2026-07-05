/* Dashboard.js - Controls welcome panels, core stats counters, activities logs, and interactive controls */
import { checkAuth, injectLayout, getUserData, getNotifications, getResumeData } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("dashboard");

  const user = getUserData();
  const resume = getResumeData();
  const notifications = getNotifications();

  // Populate Welcome Header
  const welcomeTitle = document.getElementById("dashboard-welcome-title");
  if (welcomeTitle) {
    welcomeTitle.textContent = `Welcome back, ${user.fullName || 'Student'}! 👋`;
  }

  // Populate User Profile Percentages
  const profilePercentText = document.getElementById("profile-completion-pct");
  const profilePercentBar = document.getElementById("profile-completion-bar");
  if (profilePercentText && profilePercentBar) {
    const pct = user.profileCompletion || 75;
    profilePercentText.textContent = `${pct}%`;
    profilePercentBar.style.width = `${pct}%`;
  }

  // Resume builder completions
  const resumePercentText = document.getElementById("resume-completion-pct");
  const resumePercentBar = document.getElementById("resume-completion-bar");
  if (resumePercentText && resumePercentBar) {
    const resumeFilledCount = Object.values(resume).filter(v => !!v && (Array.isArray(v) ? v.length > 0 : true)).length;
    const resumePct = Math.min(Math.round((resumeFilledCount / 6) * 100), 100);
    resumePercentText.textContent = `${resumePct}%`;
    resumePercentBar.style.width = `${resumePct}%`;
  }

  // Populate notifications count and preview
  const unreadAlertsElement = document.getElementById("unread-alerts-count");
  if (unreadAlertsElement) {
    const count = notifications.filter(n => !n.read).length;
    unreadAlertsElement.textContent = count;
  }

  // Add event listener to Global Search bar
  const searchInput = document.getElementById("global-search-input");
  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const term = searchInput.value.toLowerCase().trim();
      if (term) {
        window.location.href = `/pages/jobs.html?search=${encodeURIComponent(term)}`;
      }
    }
  });
});
