/* Recommendation.js - Computes career suitability weights based on current skills and loads charts */
import { checkAuth, injectLayout, getUserData } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  injectLayout("career");

  const user = getUserData();
  const userSkills = user.skills.map(s => s.toLowerCase());

  // Define static Career profiles
  const CAREERS = [
    {
      title: "Full Stack Engineer",
      baseMatch: 60,
      skillsRequired: ["javascript", "html5", "css3", "react", "sql"],
      salary: "$80,000 - $130,000",
      companies: ["Google", "Microsoft", "Stripe", "Netflix"],
      scope: "Very High - Growing demand with SaaS proliferation.",
      certifications: ["AWS Certified Developer", "Meta Front-End Developer"]
    },
    {
      title: "Cloud Architect",
      baseMatch: 40,
      skillsRequired: ["python", "cloud architecture", "aws", "docker"],
      salary: "$110,000 - $175,000",
      companies: ["Amazon Web Services", "IBM", "Oracle", "Salesforce"],
      scope: "Exponential - Highly critical for enterprise modernizations.",
      certifications: ["AWS Solutions Architect", "Google Cloud Professional"]
    },
    {
      title: "AI Engineer",
      baseMatch: 30,
      skillsRequired: ["python", "generative ai", "tensorflow", "pytorch"],
      salary: "$120,000 - $210,000",
      companies: ["OpenAI", "Google DeepMind", "Anthropic", "Tesla"],
      scope: "Maximum - Leading technology shift across all sectors.",
      certifications: ["TensorFlow Developer", "Google Cloud Professional Machine Learning"]
    }
  ];

  function calculateMatches() {
    const listContainer = document.getElementById("career-match-list");
    if (!listContainer) return;

    listContainer.innerHTML = CAREERS.map((c, index) => {
      // Calculate dynamic match percentage based on matched skills
      let matchedCount = 0;
      c.skillsRequired.forEach(req => {
        if (userSkills.some(us => us.includes(req) || req.includes(us))) {
          matchedCount++;
        }
      });

      const skillFactor = c.skillsRequired.length > 0 ? (matchedCount / c.skillsRequired.length) * 40 : 0;
      const finalMatch = Math.min(Math.round(c.baseMatch + skillFactor), 100);

      // Color coding match scores
      const progressBg = finalMatch >= 80 ? 'bg-success' : finalMatch >= 60 ? 'bg-primary' : 'bg-warning';

      return `
        <div class="card mb-4">
          <div class="card-body p-4">
            <div class="row align-items-center">
              <div class="col-md-8">
                <div class="d-flex align-items-center gap-3 mb-2">
                  <h4 class="text-dark mb-0">${c.title}</h4>
                  <span class="badge bg-light-blue text-primary px-3 py-1 rounded-pill">Best Match</span>
                </div>
                <p class="text-muted small mb-3">Suitability factor is calculated based on your technical achievements, core skills, and academic accomplishments.</p>
                
                <div class="mb-4">
                  <div class="d-flex justify-content-between mb-1 small fw-bold text-dark">
                    <span>Career Match Compatibility</span>
                    <span>${finalMatch}%</span>
                  </div>
                  <div class="progress progress-bar-container" style="height: 10px;">
                    <div class="progress-bar ${progressBg}" style="width: ${finalMatch}%"></div>
                  </div>
                </div>

                <div class="row g-3 mb-4">
                  <div class="col-sm-6">
                    <div class="info-label">Average Salary</div>
                    <div class="info-value text-success">${c.salary}</div>
                  </div>
                  <div class="col-sm-6">
                    <div class="info-label">Future Growth</div>
                    <div class="info-value">${c.scope}</div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="info-label">Required Skills Profile</div>
                  <div class="d-flex flex-wrap gap-2 mt-2">
                    ${c.skillsRequired.map(s => {
                      const possesses = userSkills.some(us => us.includes(s) || s.includes(us));
                      return `
                        <span class="badge ${possesses ? 'bg-success' : 'bg-light text-muted border'} px-3 py-2 rounded-pill">
                          <i class="fa-solid ${possesses ? 'fa-check me-2' : 'fa-circle me-2'}"></i>${s.toUpperCase()}
                        </span>
                      `;
                    }).join("")}
                  </div>
                </div>
              </div>
              
              <div class="col-md-4 border-start ps-md-4 mt-4 mt-md-0">
                <div class="mb-3">
                  <div class="info-label">Recommended Path Certifications</div>
                  <ul class="list-unstyled mt-2 small">
                    ${c.certifications.map(cert => `<li class="mb-2"><i class="fa-solid fa-medal text-warning me-2"></i>${cert}</li>`).join("")}
                  </ul>
                </div>
                
                <div class="mb-4">
                  <div class="info-label">Top Hiring Corporations</div>
                  <div class="d-flex flex-wrap gap-1 mt-2">
                    ${c.companies.map(comp => `<span class="badge bg-light text-dark border px-2 py-1">${comp}</span>`).join("")}
                  </div>
                </div>
                
                <a href="/pages/learning-roadmap.html" class="btn btn-primary w-full"><i class="fa-solid fa-road me-2"></i> Launch Roadmap</a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  calculateMatches();
});
