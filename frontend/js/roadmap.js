/* Roadmap.js - Controls curriculum roadmaps, checklists, progress percentages, and interviews prep links */
import { checkAuth, injectLayout, showToast } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("roadmap");

  // Handles Stage checklist checkboxes
  const checkBoxes = document.querySelectorAll(".roadmap-checkbox");
  const roadmapBar = document.getElementById("roadmap-progress-bar");
  const roadmapText = document.getElementById("roadmap-progress-text");

  function calculateProgress() {
    const total = checkBoxes.length;
    if (total === 0) return;

    let checkedCount = 0;
    checkBoxes.forEach(cb => {
      if (cb.checked) checkedCount++;
    });

    const percent = Math.round((checkedCount / total) * 100);
    
    if (roadmapBar) roadmapBar.style.width = `${percent}%`;
    if (roadmapText) roadmapText.textContent = `Overall Roadmap Progress: ${percent}% (${checkedCount}/${total} Milestones Checked)`;
    
    // Save checklist state
    let state = [];
    checkBoxes.forEach((cb, i) => {
      state.push({ id: i, checked: cb.checked });
    });
    localStorage.setItem("careerpro_roadmap_checklist", JSON.stringify(state));
  }

  // Load checklist state
  function loadProgress() {
    const saved = localStorage.getItem("careerpro_roadmap_checklist");
    if (saved) {
      try {
        const list = JSON.parse(saved);
        checkBoxes.forEach((cb, i) => {
          if (list[i]) cb.checked = list[i].checked;
        });
      } catch (e) {
        console.error("Failed loading roadmap progress state", e);
      }
    }
    calculateProgress();
  }

  // Bind change events
  checkBoxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      calculateProgress();
      if (e.target.checked) {
        showToast("Milestone completed! Keep moving forward.", "success");
      }
    });
  });

  loadProgress();
});
