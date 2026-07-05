/* Assessment.js - Handles online exams, interactive question navigations, bookmark indicators, active timers, and scoring */
import { checkAuth, injectLayout, showToast } from "./utils.js";

const QUESTIONS = [
  {
    id: 1,
    category: "Technical",
    question: "Which of the following data structures has first-in-first-out (FIFO) behavior?",
    options: ["Stack", "Queue", "Tree", "Heap"],
    correct: 1
  },
  {
    id: 2,
    category: "Aptitude",
    question: "If a car travels at 60 km/h, how much distance will it cover in 45 minutes?",
    options: ["30 km", "40 km", "45 km", "50 km"],
    correct: 2
  },
  {
    id: 3,
    category: "Logical Reasoning",
    question: "Identify the next number in the sequence: 2, 6, 12, 20, 30, ...?",
    options: ["36", "40", "42", "44"],
    correct: 2
  },
  {
    id: 4,
    category: "Coding",
    question: "What is the worst-case time complexity of searching in a balanced Binary Search Tree (BST)?",
    options: ["O(1)", "O(N)", "O(log N)", "O(N log N)"],
    correct: 2
  },
  {
    id: 5,
    category: "Verbal",
    question: "Select the antonym for the word 'Spurious'.",
    options: ["Genuine", "False", "Synthetic", "Erroneous"],
    correct: 0
  },
  {
    id: 6,
    category: "Technical",
    question: "In relational databases, which SQL keyword is used to eliminate duplicate rows from a query result?",
    options: ["UNIQUE", "DISTINCT", "GROUP BY", "FILTER"],
    correct: 1
  },
  {
    id: 7,
    category: "Psychometric",
    question: "When facing a critical block in coding, your initial response is to:",
    options: [
      "Ask a senior engineer immediately",
      "Research documentation and open-source forums",
      "Attempt to rewrite the section from scratch",
      "Isolate the module and perform unit debugging"
    ],
    correct: 3
  },
  {
    id: 8,
    category: "Soft Skills",
    question: "An angry team member complains about a design pattern choice. What is the most constructive response?",
    options: [
      "Defend your choice and explain their lack of understanding",
      "Arrange a joint whiteboard session to review tradeoffs together",
      "Submit a complaint to the project manager",
      "Ignore the comments and proceed with implementation"
    ],
    correct: 1
  }
];

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("assessment");

  let currentIndex = 0;
  let userAnswers = {}; // { questionId: selectedOptionIndex }
  let bookmarks = {}; // { questionId: boolean }
  let secondsLeft = 600; // 10 minutes total
  let timerInterval;

  // Initialize Timer
  function startTimer() {
    const display = document.getElementById("timer-display");
    if (!display) return;

    timerInterval = setInterval(() => {
      secondsLeft--;
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      
      display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      if (secondsLeft <= 120) {
        display.classList.add("timer-danger");
      }
      
      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        showToast("Time expired! Automatically submitting your responses.", "warning");
        submitAssessment();
      }
    }, 1000);
  }

  // Render question card
  function renderQuestion() {
    const q = QUESTIONS[currentIndex];
    
    // Set category headers
    const categoryEl = document.getElementById("question-category");
    if (categoryEl) {
      categoryEl.textContent = `${q.category} Section (Q${currentIndex + 1}/${QUESTIONS.length})`;
    }

    // Set question text
    const textEl = document.getElementById("question-text");
    if (textEl) {
      textEl.textContent = q.question;
    }

    // Render options list
    const optionsList = document.getElementById("options-list");
    if (optionsList) {
      optionsList.innerHTML = q.options.map((opt, i) => `
        <div class="option-item ${userAnswers[q.id] === i ? 'selected' : ''}" data-index="${i}">
          <input type="radio" name="assessment-opt" id="opt_${i}" value="${i}" ${userAnswers[q.id] === i ? 'checked' : ''}>
          <label class="option-label mb-0" for="opt_${i}">${opt}</label>
        </div>
      `).join("");

      // Option item select binding
      document.querySelectorAll(".option-item").forEach(item => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-index"));
          userAnswers[q.id] = idx;
          
          // Re-style selection
          document.querySelectorAll(".option-item").forEach(o => o.classList.remove("selected"));
          item.classList.add("selected");
          const radio = item.querySelector("input[type='radio']");
          if (radio) radio.checked = true;

          updateProgressBar();
          renderPalette();
        });
      });
    }

    // Update bookmark button state
    const bookmarkBtn = document.getElementById("bookmark-btn");
    if (bookmarkBtn) {
      const isBookmarked = bookmarks[q.id] || false;
      bookmarkBtn.innerHTML = `<i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark me-2"></i> ${isBookmarked ? 'Flagged' : 'Flag Question'}`;
      bookmarkBtn.className = `btn ${isBookmarked ? 'btn-warning' : 'btn-outline-secondary'}`;
    }

    // Previous/Next limits
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-exam-btn");

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    
    if (currentIndex === QUESTIONS.length - 1) {
      if (nextBtn) nextBtn.classList.add("d-none");
      if (submitBtn) submitBtn.classList.remove("d-none");
    } else {
      if (nextBtn) nextBtn.classList.remove("d-none");
      if (submitBtn) submitBtn.classList.add("d-none");
    }

    updateProgressBar();
    renderPalette();
  }

  // Progress Bar percentage
  function updateProgressBar() {
    const answeredCount = Object.keys(userAnswers).length;
    const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);
    const progressEl = document.getElementById("exam-progress-bar");
    const progressTextEl = document.getElementById("exam-progress-text");

    if (progressEl) progressEl.style.width = `${progressPct}%`;
    if (progressTextEl) progressTextEl.textContent = `Completed: ${progressPct}% (${answeredCount}/${QUESTIONS.length} Questions)`;
  }

  // Draw Question palette buttons
  function renderPalette() {
    const paletteGrid = document.getElementById("palette-grid");
    if (!paletteGrid) return;

    paletteGrid.innerHTML = QUESTIONS.map((q, idx) => {
      let statusClass = "unvisited";
      if (idx === currentIndex) {
        statusClass = "current";
      } else if (userAnswers[q.id] !== undefined) {
        statusClass = "answered";
      } else if (bookmarks[q.id]) {
        statusClass = "flagged";
      }

      return `
        <button class="palette-btn ${statusClass}" data-index="${idx}">
          ${idx + 1}
        </button>
      `;
    }).join("");

    // Bind palette click navigation
    document.querySelectorAll(".palette-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentIndex = parseInt(btn.getAttribute("data-index"));
        renderQuestion();
      });
    });
  }

  // Bookmark Toggle
  const bookmarkBtn = document.getElementById("bookmark-btn");
  bookmarkBtn?.addEventListener("click", () => {
    const q = QUESTIONS[currentIndex];
    bookmarks[q.id] = !bookmarks[q.id];
    renderQuestion();
  });

  // Next / Prev buttons
  document.getElementById("prev-btn")?.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });

  document.getElementById("next-btn")?.addEventListener("click", () => {
    if (currentIndex < QUESTIONS.length - 1) {
      currentIndex++;
      renderQuestion();
    }
  });

  // Clear assessment options
  document.getElementById("clear-btn")?.addEventListener("click", () => {
    const q = QUESTIONS[currentIndex];
    delete userAnswers[q.id];
    renderQuestion();
  });

  // Submit operations
  function submitAssessment() {
    clearInterval(timerInterval);

    // Calculate scores
    let correctCount = 0;
    let sectionScores = { Technical: 0, Aptitude: 0, Logical: 0, Coding: 0, Verbal: 0, Psychometric: 0, SoftSkills: 0 };
    let sectionTotals = { Technical: 0, Aptitude: 0, Logical: 0, Coding: 0, Verbal: 0, Psychometric: 0, SoftSkills: 0 };

    QUESTIONS.forEach(q => {
      const sectionKey = q.category === "Logical Reasoning" ? "Logical" : q.category === "Soft Skills" ? "SoftSkills" : q.category;
      sectionTotals[sectionKey]++;
      
      if (userAnswers[q.id] === q.correct) {
        correctCount++;
        sectionScores[sectionKey]++;
      }
    });

    const totalQuestions = QUESTIONS.length;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);

    // Save exam result to local database
    const examResult = {
      score: correctCount * 10,
      totalScore: totalQuestions * 10,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      accuracy: accuracy,
      sectionScores: sectionScores,
      sectionTotals: sectionTotals,
      performanceLevel: accuracy >= 80 ? "Excellent" : accuracy >= 60 ? "Good" : "Needs Practice",
      date: new Date().toLocaleDateString()
    };

    localStorage.setItem("careerpro_latest_result", JSON.stringify(examResult));
    showToast("Assessment submitted successfully!", "success");

    setTimeout(() => {
      window.location.href = "/pages/assessment-result.html";
    }, 1200);
  }

  // Bind Submit click triggers
  document.getElementById("submit-exam-btn")?.addEventListener("click", () => {
    const unanswered = QUESTIONS.length - Object.keys(userAnswers).length;
    let confirmMsg = "Are you sure you want to submit your assessment?";
    if (unanswered > 0) {
      confirmMsg += ` You have ${unanswered} unanswered question(s).`;
    }

    if (confirm(confirmMsg)) {
      submitAssessment();
    }
  });

  // Execute
  startTimer();
  renderQuestion();
});
