/* Notification.js - Renders system and timeline alerts, clears logs, and marks unreads as completed */
import { checkAuth, injectLayout, getNotifications, saveNotifications, showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("notifications");

  let notifications = getNotifications();

  function renderNotifications() {
    const list = document.getElementById("notifications-log-list");
    if (!list) return;

    if (notifications.length === 0) {
      list.innerHTML = `
        <div class="text-center p-5 bg-white border rounded">
          <i class="fa-solid fa-bell-slash fs-1 text-muted mb-3"></i>
          <h5>No notifications log found.</h5>
          <p class="text-muted small">You are all caught up!</p>
        </div>
      `;
      return;
    }

    list.innerHTML = notifications.map(n => `
      <div class="card mb-3 p-3 ${n.read ? '' : 'border-primary'}" style="opacity: ${n.read ? 0.75 : 1}; background-color: ${n.read ? 'var(--white)' : 'rgba(13, 110, 253, 0.02)'}">
        <div class="d-flex align-items-start gap-3">
          <div class="badge bg-light text-primary p-3 mt-1 rounded">
            <i class="fa-solid ${getIcon(n.type)} fs-5"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h6 class="text-dark fw-bold mb-0">${n.title}</h6>
              <span class="text-muted small">${n.time}</span>
            </div>
            <p class="text-muted mb-2 small">${n.body}</p>
            <div class="d-flex align-items-center gap-3">
              ${n.read 
                ? `<span class="text-muted small"><i class="fa-solid fa-envelope-open me-1"></i> Read</span>`
                : `<button class="btn btn-sm btn-link text-primary p-0 mark-read-btn" data-id="${n.id}"><i class="fa-solid fa-envelope me-1"></i> Mark as Read</button>`
              }
              <button class="btn btn-sm btn-link text-danger p-0 delete-btn" data-id="${n.id}"><i class="fa-solid fa-trash me-1"></i> Delete</button>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    // Bind item click controls
    list.querySelectorAll(".mark-read-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        saveNotifications(notifications);
        renderNotifications();
        injectLayout("notifications"); // Update topbar unread dot count
        showToast("Notification marked as read.", "success");
      });
    });

    list.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        notifications = notifications.filter(n => n.id !== id);
        saveNotifications(notifications);
        renderNotifications();
        injectLayout("notifications"); // Update topbar
        showToast("Notification deleted.", "info");
      });
    });
  }

  function getIcon(type) {
    switch (type) {
      case "assessment": return "fa-circle-check";
      case "roadmap": return "fa-road";
      case "resume": return "fa-file-pdf";
      default: return "fa-briefcase";
    }
  }

  // Mark all as read
  document.getElementById("btn-mark-all-read")?.addEventListener("click", () => {
    notifications = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(notifications);
    renderNotifications();
    injectLayout("notifications");
    showToast("All notifications marked as read.", "success");
  });

  // Clear all
  document.getElementById("btn-clear-notifications")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      notifications = [];
      saveNotifications(notifications);
      renderNotifications();
      injectLayout("notifications");
      showToast("Notification logs cleared.", "info");
    }
  });

  renderNotifications();
});
