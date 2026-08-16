// BX Member Activity & Analytics Dashboard Application Logic
// Data layer: MongoDB via Express REST API at /api/*

let members = [];
let events = [];
let isOfflineMode = false;

// ── API Helper ────────────────────────────────────────────────────────────────
// Centralised fetch wrapper with JSON support and basic error handling.
async function apiCall(url, options = {}) {
  const defaults = {
    headers: { "Content-Type": "application/json" },
  };
  const config = { ...defaults, ...options };
  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Initialize Application State from MongoDB ─────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch both collections in parallel from the API
    [members, events] = await Promise.all([
      apiCall("/api/members"),
      apiCall("/api/events"),
    ]);
  } catch (err) {
    console.error("Failed to load data from API:", err.message);
    // Graceful fallback to bundled seed data if API is unreachable
    members = typeof DEFAULT_MEMBERS !== "undefined" ? DEFAULT_MEMBERS : [];
    events = typeof DEFAULT_EVENTS !== "undefined" ? DEFAULT_EVENTS : [];
    isOfflineMode = true;
    console.warn("Using built-in seed data as fallback (Offline Mode).");
  }

  // Populate UI views
  initTheme();
  renderDashboard();
  renderMembersTable(members);
  populateEventDropdown();
  loadAttendanceSheet();
  populateReportMemberSelect();

  // Set initial header title
  updateHeaderTitle("dashboard");
});

// Theme Management Engine
function initTheme() {
  const currentTheme = localStorage.getItem("color-scheme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  
  const sunIcon = document.getElementById("theme-sun-icon");
  const moonIcon = document.getElementById("theme-moon-icon");
  
  if (currentTheme === "light") {
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  } else {
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("color-scheme", newTheme);
  
  const sunIcon = document.getElementById("theme-sun-icon");
  const moonIcon = document.getElementById("theme-moon-icon");
  
  if (newTheme === "light") {
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  } else {
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  }
  
  // Re-render chart components to adapt to color variables
  renderDashboardCharts();
}

// Single Page Application Navigation
function switchTab(tabId) {
  // Hide all views
  const views = document.querySelectorAll(".tab-view");
  views.forEach(view => view.classList.remove("active-view"));

  // Deactivate all menu items
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach(item => item.classList.remove("active"));

  // Show selected view
  const activeView = document.getElementById(`view-${tabId}`);
  if (activeView) activeView.classList.add("active-view");

  // Highlight selected menu button
  const activeBtn = document.getElementById(`nav-btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.setAttribute("aria-current", "page");
  }

  // Update header text
  updateHeaderTitle(tabId);

  // Trigger specific re-renders
  if (tabId === "dashboard") {
    renderDashboard();
  } else if (tabId === "members") {
    applyFilters();
  } else if (tabId === "attendance") {
    loadAttendanceSheet();
  } else if (tabId === "reports") {
    populateReportMemberSelect();
  }
}

function updateHeaderTitle(tabId) {
  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");

  switch (tabId) {
    case "dashboard":
      title.textContent = "Club Overview";
      subtitle.textContent = "Real-time engagement tracking and metrics dashboard";
      break;
    case "members":
      title.textContent = "Member Directory";
      subtitle.textContent = "Manage BX student records, roles, and profiles";
      break;
    case "attendance":
      title.textContent = "Attendance Tracker";
      subtitle.textContent = "Mark meeting checklists and monitor attendee retention";
      break;
    case "reports":
      title.textContent = "Reports & Stats Engine";
      subtitle.textContent = "Compile, print, and export data summaries";
      break;
  }
}

// Dashboard Calculations & KPI Renders
function renderDashboard() {
  const totalCount = members.length;
  const activeMembers = members.filter(m => m.status === "Active");
  const activeCount = activeMembers.length;
  
  // KPI 1: Total Members
  document.getElementById("kpi-total-members").textContent = totalCount;
  
  // KPI 2: Active Rate
  const activeRate = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
  document.getElementById("kpi-active-rate").textContent = `${activeRate.toFixed(1)}%`;
  
  // KPI 3: Avg Problems Solved
  let totalProblems = 0;
  activeMembers.forEach(m => {
    totalProblems += (m.metrics.leetcode.solved || 0) + (m.metrics.codeforces.problemsSolved || 0);
  });
  const avgProblems = activeCount > 0 ? totalProblems / activeCount : 0;
  document.getElementById("kpi-avg-problems").textContent = avgProblems.toFixed(1);
  
  // KPI 4: Avg Attendance Rate
  let totalAttendancePct = 0;
  const totalEventsConducted = events.length;
  members.forEach(m => {
    const rate = totalEventsConducted > 0 ? (m.attendance.length / totalEventsConducted) * 100 : 0;
    totalAttendancePct += rate;
  });
  const avgAttendance = totalCount > 0 ? totalAttendancePct / totalCount : 0;
  document.getElementById("kpi-avg-attendance").textContent = `${avgAttendance.toFixed(1)}%`;

  // Render Charts
  renderDashboardCharts();

  // Render Leaderboard
  renderLeaderboard();

  // Render At-Risk List
  renderAtRiskList();
}

// Render dynamic SVGs for Dashboard Charts
function renderDashboardCharts() {
  // 1. Line Chart: Aggregate Git commits and Problems Solved by Week
  const trendBox = document.getElementById("trend-chart-box");
  if (trendBox) {
    // Generate simulated aggregates for 6 weeks based on actual data
    let totalCommits = 0;
    let totalSolved = 0;
    members.forEach(m => {
      totalCommits += m.metrics.github.commits;
      totalSolved += m.metrics.leetcode.solved + m.metrics.codeforces.problemsSolved;
    });

    // Seed weekly patterns scaled from totals
    const weeks = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"];
    const commitWeights = [0.1, 0.12, 0.15, 0.18, 0.22, 0.23];
    const solveWeights = [0.12, 0.14, 0.13, 0.19, 0.2, 0.22];

    const commitPoints = commitWeights.map(w => Math.round(totalCommits * w));
    const solvePoints = solveWeights.map(w => Math.round(totalSolved * w));

    const maxVal = Math.max(...commitPoints, ...solvePoints) * 1.15 || 100;
    
    // Convert data to SVG coordinate points (600px width, 220px height)
    const pointsToPath = (data) => {
      const step = 500 / (data.length - 1);
      return data.map((val, idx) => {
        const x = 50 + (idx * step);
        const y = 200 - ((val / maxVal) * 160);
        return `${x},${y}`;
      }).join(" ");
    };

    const commitsPath = pointsToPath(commitPoints);
    const solvesPath = pointsToPath(solvePoints);

    trendBox.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none" style="display: block;">
        <!-- Grid horizontal lines -->
        <line x1="50" y1="40" x2="560" y2="40" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4 4" />
        <line x1="50" y1="93" x2="560" y2="93" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4 4" />
        <line x1="50" y1="146" x2="560" y2="146" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4 4" />
        
        <!-- Y Axis Markers -->
        <text x="40" y="45" fill="var(--text-muted)" font-size="10" text-anchor="end">${Math.round(maxVal * 0.75)}</text>
        <text x="40" y="98" fill="var(--text-muted)" font-size="10" text-anchor="end">${Math.round(maxVal * 0.5)}</text>
        <text x="40" y="151" fill="var(--text-muted)" font-size="10" text-anchor="end">${Math.round(maxVal * 0.25)}</text>
        <text x="40" y="204" fill="var(--text-muted)" font-size="10" text-anchor="end">0</text>

        <!-- Base Axis Line -->
        <line x1="50" y1="200" x2="560" y2="200" stroke="var(--border-color)" stroke-width="1" />
        
        <!-- X Axis Labels -->
        ${weeks.map((wk, idx) => `<text x="${50 + idx * 100}" y="220" fill="var(--text-muted)" font-size="11" text-anchor="middle">${wk}</text>`).join("")}

        <!-- Git Commits Path (Blue Line) -->
        <path d="M ${commitsPath}" fill="none" stroke="var(--color-primary)" stroke-width="3.5" stroke-linecap="round" />
        ${commitPoints.map((val, idx) => {
          const x = 50 + idx * 100;
          const y = 200 - ((val / maxVal) * 160);
          return `<circle cx="${x}" cy="${y}" r="4" fill="var(--bg-app)" stroke="var(--color-primary)" stroke-width="2" />`;
        }).join("")}

        <!-- Problems Solved Path (Green Line) -->
        <path d="M ${solvesPath}" fill="none" stroke="var(--color-success)" stroke-width="3.5" stroke-linecap="round" />
        ${solvePoints.map((val, idx) => {
          const x = 50 + idx * 100;
          const y = 200 - ((val / maxVal) * 160);
          return `<circle cx="${x}" cy="${y}" r="4" fill="var(--bg-app)" stroke="var(--color-success)" stroke-width="2" />`;
        }).join("")}

        <!-- Hover Legend overlay -->
        <g transform="translate(60, 10)" font-size="11" font-weight="600">
          <circle cx="0" cy="5" r="5" fill="var(--color-primary)"/>
          <text x="12" y="9" fill="var(--text-main)">Commits (${totalCommits})</text>
          <circle cx="150" cy="5" r="5" fill="var(--color-success)"/>
          <text x="162" y="9" fill="var(--text-main)">Problem Solves (${totalSolved})</text>
        </g>
      </svg>
    `;
  }

  // 2. Donut Chart: Connected Platform Distribution
  const platformBox = document.getElementById("platform-chart-box");
  if (platformBox) {
    let github = 0, leetcode = 0, codeforces = 0, kaggle = 0;
    members.forEach(m => {
      if (m.links.github) github++;
      if (m.links.leetcode) leetcode++;
      if (m.links.codeforces) codeforces++;
      if (m.links.kaggle) kaggle++;
    });

    const totalConnections = github + leetcode + codeforces + kaggle || 1;
    const githubPct = (github / totalConnections) * 100;
    const leetcodePct = (leetcode / totalConnections) * 100;
    const codeforcesPct = (codeforces / totalConnections) * 100;
    const kagglePct = (kaggle / totalConnections) * 100;

    // SVG Circular segments calculations
    // Circumference for R=40 is 251.32
    const circ = 251.32;
    const gStroke = (githubPct / 100) * circ;
    const lStroke = (leetcodePct / 100) * circ;
    const cStroke = (codeforcesPct / 100) * circ;
    const kStroke = (kagglePct / 100) * circ;

    const gOffset = 0;
    const lOffset = -gStroke;
    const cOffset = -(gStroke + lStroke);
    const kOffset = -(gStroke + lStroke + cStroke);

    platformBox.innerHTML = `
      <div class="custom-pie-widget">
        <div class="pie-graphic-container">
          <svg width="150" height="150" viewBox="0 0 100 100" class="pie-graphic">
            <!-- Background circle -->
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border-color)" stroke-width="11" />
            
            <!-- GitHub Segment (Blue) -->
            ${gStroke > 0 ? `<circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary)" stroke-width="11" stroke-dasharray="${gStroke} ${circ}" stroke-dashoffset="${gOffset}" transform="rotate(-90 50 50)" stroke-linecap="round"/>` : ""}
            
            <!-- LeetCode Segment (Green) -->
            ${lStroke > 0 ? `<circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-success)" stroke-width="11" stroke-dasharray="${lStroke} ${circ}" stroke-dashoffset="${lOffset}" transform="rotate(-90 50 50)" stroke-linecap="round"/>` : ""}
            
            <!-- Codeforces Segment (Orange) -->
            ${cStroke > 0 ? `<circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-warning)" stroke-width="11" stroke-dasharray="${cStroke} ${circ}" stroke-dashoffset="${cOffset}" transform="rotate(-90 50 50)" stroke-linecap="round"/>` : ""}
            
            <!-- Kaggle Segment (Purple) -->
            ${kStroke > 0 ? `<circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" stroke-width="11" stroke-dasharray="${kStroke} ${circ}" stroke-dashoffset="${kOffset}" transform="rotate(-90 50 50)" stroke-linecap="round"/>` : ""}
          </svg>
          <div class="pie-center-cutout">
            <span class="pie-center-val">${totalConnections}</span>
            <span class="pie-center-lbl">Connections</span>
          </div>
        </div>

        <div class="pie-legend">
          <div class="legend-item">
            <span class="legend-color" style="background-color: var(--color-primary)"></span>
            <span>GitHub (${github})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: var(--color-success)"></span>
            <span>LeetCode (${leetcode})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: var(--color-warning)"></span>
            <span>Codeforces (${codeforces})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #a855f7"></span>
            <span>Kaggle (${kaggle})</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Render Top 5 Contributors Leaderboard
function renderLeaderboard() {
  const leaderboard = document.getElementById("dashboard-leaderboard");
  if (!leaderboard) return;

  // Sort members by points descending
  const sorted = [...members].sort((a, b) => b.engagementPoints - a.engagementPoints).slice(0, 5);

  leaderboard.innerHTML = sorted.map((member, index) => {
    const rankClass = index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "rank-default";
    return `
      <div class="leaderboard-row" onclick="viewMemberProfile('${member.id}')" style="cursor:pointer">
        <div class="leaderboard-member">
          <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
          <div>
            <div class="leaderboard-name">${member.name}</div>
            <div class="leaderboard-details">${member.department} • ${member.year} • ${member.role}</div>
          </div>
        </div>
        <div class="leaderboard-score">
          <span class="leaderboard-score-val">${member.engagementPoints}</span>
          <span class="leaderboard-score-lbl">XP</span>
        </div>
      </div>
    `;
  }).join("");
}

// Render low-engagement / inactive lists
function renderAtRiskList() {
  const atRiskBox = document.getElementById("dashboard-at-risk");
  if (!atRiskBox) return;

  // Filters members: Inactive OR attendance < 50%
  const totalEvents = events.length || 1;
  const atRisk = members.filter(m => {
    const attendancePct = (m.attendance.length / totalEvents) * 100;
    return m.status === "Inactive" || attendancePct < 50;
  });

  if (atRisk.length === 0) {
    atRiskBox.innerHTML = `
      <div class="table-empty-state" style="padding:20px">
        <p>No members currently match risk profiles. Good job!</p>
      </div>
    `;
    return;
  }

  atRiskBox.innerHTML = atRisk.map(member => {
    const pct = Math.round((member.attendance.length / totalEvents) * 100);
    return `
      <div class="at-risk-row" onclick="viewMemberProfile('${member.id}')" style="cursor:pointer">
        <div>
          <div class="at-risk-name">${member.name}</div>
          <div class="at-risk-info">${member.department} • ${member.year} • Status: <strong style="color:var(--color-danger)">${member.status}</strong></div>
        </div>
        <span class="metric-badge red-badge">${pct}% Attend</span>
      </div>
    `;
  }).join("");
}

// Render Members Directory Table
function renderMembersTable(dataList) {
  const tbody = document.getElementById("members-table-body");
  const emptyState = document.getElementById("members-empty-state");
  
  if (!tbody) return;
  tbody.innerHTML = "";

  if (dataList.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  
  emptyState.classList.add("hidden");

  dataList.forEach(member => {
    const tr = document.createElement("tr");
    
    // Status color badge
    const statusBadge = member.status === "Active" 
      ? `<span class="metric-badge green-badge">Active</span>` 
      : `<span class="metric-badge red-badge">Inactive</span>`;

    // Connected profiles link row
    const githubLink = member.links.github 
      ? `<a href="${member.links.github}" target="_blank" class="platform-icon-btn" title="GitHub Profile">GH</a>`
      : `<span class="platform-icon-btn inactive-link">GH</span>`;

    const leetcodeLink = member.links.leetcode 
      ? `<a href="${member.links.leetcode}" target="_blank" class="platform-icon-btn" title="LeetCode Profile">LC</a>`
      : `<span class="platform-icon-btn inactive-link">LC</span>`;

    const cfLink = member.links.codeforces 
      ? `<a href="${member.links.codeforces}" target="_blank" class="platform-icon-btn" title="Codeforces Profile">CF</a>`
      : `<span class="platform-icon-btn inactive-link">CF</span>`;

    const kaggleLink = member.links.kaggle 
      ? `<a href="${member.links.kaggle}" target="_blank" class="platform-icon-btn" title="Kaggle Profile">KG</a>`
      : `<span class="platform-icon-btn inactive-link">KG</span>`;

    tr.innerHTML = `
      <td>
        <div class="member-cell-info">
          <span class="member-cell-name">${member.name}</span>
          <span class="member-cell-email">${member.email}</span>
        </div>
      </td>
      <td>
        <div class="member-cell-info">
          <span>${member.department}</span>
          <span class="member-cell-email">${member.year}</span>
        </div>
      </td>
      <td><span class="metric-badge grey-badge">${member.role}</span></td>
      <td>
        <div class="leaderboard-score" style="justify-content:flex-start">
          <span class="leaderboard-score-val">${member.engagementPoints}</span>
          <span class="leaderboard-score-lbl">XP</span>
        </div>
      </td>
      <td>${statusBadge}</td>
      <td>
        <div class="platform-links-row">
          ${githubLink}
          ${leetcodeLink}
          ${cfLink}
          ${kaggleLink}
        </div>
      </td>
      <td class="align-right">
        <div class="flex-row gap-sm justify-end">
          <button class="btn btn-secondary btn-sm" onclick="viewMemberProfile('${member.id}')">View Details</button>
          <button class="btn btn-secondary btn-sm" style="color: var(--color-danger); border-color: var(--color-danger);" onclick="deleteMember('${member.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Interactive filters inside the directory
function applyFilters() {
  const searchVal = document.getElementById("member-search-input").value.toLowerCase();
  const deptVal = document.getElementById("filter-department").value;
  const yearVal = document.getElementById("filter-year").value;
  const statusVal = document.getElementById("filter-status").value;

  const filtered = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchVal) || 
                          m.email.toLowerCase().includes(searchVal) || 
                          m.department.toLowerCase().includes(searchVal);
    const matchesDept = deptVal === "ALL" || m.department === deptVal;
    const matchesYear = yearVal === "ALL" || m.year === yearVal;
    const matchesStatus = statusVal === "ALL" || m.status === statusVal;

    return matchesSearch && matchesDept && matchesYear && matchesStatus;
  });

  renderMembersTable(filtered);
}

// Modal Toggle Mechanics
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("hidden");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("hidden");
}

// Form Handlers
async function handleRegisterMember(e) {
  e.preventDefault();

  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const department = document.getElementById("reg-dept").value;
  const year = document.getElementById("reg-year").value;
  const role = document.getElementById("reg-role").value;
  const status = document.getElementById("reg-status").value;

  const githubHandle = document.getElementById("reg-github").value || "";
  const leetcodeHandle = document.getElementById("reg-leetcode").value || "";

  // Build initial metrics — seed slight random data if handles provided
  const githubMetrics = githubHandle
    ? { commits: Math.floor(Math.random() * 40) + 10, repos: Math.floor(Math.random() * 5) + 1, streak: Math.floor(Math.random() * 5) }
    : { commits: 0, repos: 0, streak: 0 };

  let lcMetrics = { solved: 0, easy: 0, medium: 0, hard: 0, contestRating: 0, badge: "None" };
  if (leetcodeHandle) {
    const solved = Math.floor(Math.random() * 50) + 10;
    lcMetrics = { solved, easy: Math.floor(solved * 0.6), medium: Math.floor(solved * 0.3), hard: Math.floor(solved * 0.1), contestRating: 0, badge: "None" };
  }

  const newMember = {
    name, email, department, year, role, status,
    links: {
      github: githubHandle,
      leetcode: leetcodeHandle,
      codeforces: document.getElementById("reg-codeforces").value || "",
      kaggle: document.getElementById("reg-kaggle").value || "",
      linkedin: document.getElementById("reg-linkedin").value || "",
      portfolio: document.getElementById("reg-portfolio").value || "",
    },
    metrics: {
      github: githubMetrics,
      leetcode: lcMetrics,
      codeforces: { rating: 0, maxRating: 0, rank: "Unrated", problemsSolved: 0 },
      kaggle: { competitions: 0, notebooks: 0, datasets: 0, points: 0 },
    },
    attendance: [],
  };

  try {
    let created;
    if (isOfflineMode) {
      created = {
        ...newMember,
        id: "mem-" + Date.now(),
        status: newMember.status || "Active",
        attendance: [],
        metrics: {
          github: { commits: 0, repos: 0, languages: [] },
          leetcode: { solved: 0, rating: 0 }
        }
      };
    } else {
      created = await apiCall("/api/members", { method: "POST", body: newMember });
    }
    members.push(created); // update local cache

    document.getElementById("form-register-member").reset();
    closeModal("modal-register");
    applyFilters();
    alert(`${name} has been registered successfully!\n\nInitial Stats Fetched:\n- GitHub Commits: ${created.metrics.github.commits}\n- LeetCode Solved: ${created.metrics.leetcode.solved}`);
  } catch (err) {
    alert(`Registration failed: ${err.message}`);
  }
}

async function deleteMember(memberId) {
  if (!confirm("Are you sure you want to permanently delete this member?")) return;
  
  try {
    if (!isOfflineMode) {
      await apiCall(`/api/members/${memberId}?hard=true`, { method: "DELETE" });
    }
    members = members.filter(m => m.id !== memberId);
    applyFilters();
    alert("Member deleted successfully.");
  } catch (err) {
    alert(`Failed to delete member: ${err.message}`);
  }
}

async function handleCreateEvent(e) {
  e.preventDefault();

  const title = document.getElementById("evt-title-input").value;
  const date = document.getElementById("evt-date-input").value;
  const type = document.getElementById("evt-type-select").value;
  const points = parseInt(document.getElementById("evt-points-input").value, 10);
  const newEvent = { title, date, type, points };

  try {
    let createdEvent;
    if (isOfflineMode) {
      createdEvent = {
        ...newEvent,
        id: "evt-" + Date.now()
      };
    } else {
      createdEvent = await apiCall("/api/events", { method: "POST", body: newEvent });
    }
    events.push(createdEvent);

    document.getElementById("form-create-event").reset();
    closeModal("modal-add-event");

    populateEventDropdown();
    // Auto-select the newly created event in the dropdown
    document.getElementById("attendance-event-select").value = created.id;
    loadAttendanceSheet();

    alert(`Event "${title}" has been created!`);
  } catch (err) {
    alert(`Failed to create event: ${err.message}`);
  }
}

// Attendance Logic Markers
function populateEventDropdown() {
  const select = document.getElementById("attendance-event-select");
  if (!select) return;

  select.innerHTML = events.map(evt => {
    return `<option value="${evt.id}">${evt.title} (${evt.date})</option>`;
  }).join("");
}

function loadAttendanceSheet() {
  const select = document.getElementById("attendance-event-select");
  if (!select || !select.value) return;

  const eventId = select.value;
  const activeEvent = events.find(e => e.id === eventId);
  if (!activeEvent) return;

  // Render quick info details
  document.getElementById("active-event-title").textContent = activeEvent.title;
  document.getElementById("active-event-date").textContent = new Date(activeEvent.date).toLocaleDateString("en-US", {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById("active-event-type").textContent = activeEvent.type;
  document.getElementById("active-event-points").textContent = `${activeEvent.points} XP`;

  // Count attendance
  let presentCount = 0;
  members.forEach(m => {
    if (m.attendance.includes(eventId)) presentCount++;
  });
  const totalCount = members.length;
  const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  document.getElementById("active-event-present-count").textContent = presentCount;
  document.getElementById("active-event-pct").textContent = `${attendanceRate.toFixed(1)}%`;

  // Populate checklist table
  const tbody = document.getElementById("attendance-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const isLocked = activeEvent.locked;
  const lockBtnText = document.getElementById("lock-btn-text");
  if (lockBtnText) {
    lockBtnText.textContent = isLocked ? "Unlock" : "Lock";
  }
  const saveBtn = document.getElementById("btn-save-attendance");
  if (saveBtn) {
    saveBtn.disabled = isLocked;
  }

  members.forEach(m => {
    const isPresent = m.attendance.includes(eventId);
    const tr = document.createElement("tr");

    const streak = calculateStreak(m.id);

    tr.innerHTML = `
      <td>
        <label class="checkbox-container">
          <input type="checkbox" class="attendance-check-input" data-member-id="${m.id}" ${isPresent ? "checked" : ""} ${isLocked ? "disabled" : ""}>
          <span class="checkmark"></span>
        </label>
      </td>
      <td><span class="member-cell-name">${m.name}</span></td>
      <td><span>${m.department || 'N/A'} • ${m.year || 'N/A'}</span></td>
      <td>
        <span class="metric-badge ${m.attendance.length > 3 ? 'green-badge' : 'grey-badge'}">
          ${m.attendance.length} Days Attended
        </span>
      </td>
      <td>
        <div class="flex-row gap-sm text-green">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
          <strong>${streak} event streak</strong>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function markAllAttendance(isPresent) {
  const checkboxes = document.querySelectorAll(".attendance-check-input");
  checkboxes.forEach(cb => cb.checked = isPresent);
}

async function saveAttendanceSheet() {
  const select = document.getElementById("attendance-event-select");
  if (!select) return;

  const eventId = select.value;
  const checkboxes = document.querySelectorAll(".attendance-check-input");

  // Collect all attendance changes
  const updates = [];
  checkboxes.forEach(cb => {
    const memberId = cb.getAttribute("data-member-id");
    const isChecked = cb.checked;
    const member = members.find(m => m.id === memberId);

    if (member) {
      const wasPresent = member.attendance.includes(eventId);
      if (isChecked !== wasPresent) {
        // Only PATCH if the state actually changed
        updates.push({ memberId, present: isChecked });
      }
      // Optimistically update local cache
      if (isChecked && !wasPresent) {
        member.attendance.push(eventId);
      } else if (!isChecked && wasPresent) {
        member.attendance = member.attendance.filter(e => e !== eventId);
      }
      member.engagementPoints = calculateEngagementPoints(member);
    }
  });

  // Send PATCH requests to API for changed members
  try {
    if (!isOfflineMode) {
      await Promise.all(
        updates.map(({ memberId, present }) =>
          apiCall(`/api/members/${memberId}/attendance`, {
            method: "PATCH",
            body: { eventId, present },
          })
        )
      );
    } else {
      updates.forEach(({ memberId, present }) => {
        const m = members.find(m => m.id === memberId);
        if (m) {
          if (present && !m.attendance.includes(eventId)) {
            m.attendance.push(eventId);
          } else if (!present) {
            m.attendance = m.attendance.filter(eId => eId !== eventId);
          }
        }
      });
    }
    loadAttendanceSheet();
    alert("Attendance checklist saved and streaks updated successfully!");
  } catch (err) {
    alert(`Failed to save attendance: ${err.message}`);
  }
}

async function toggleLockAttendance() {
  const select = document.getElementById("attendance-event-select");
  if (!select) return;
  const eventId = select.value;

  try {
    let lockedState;
    if (!isOfflineMode) {
      const updatedEvent = await apiCall(`/api/events/${eventId}/lock`, { method: "PATCH" });
      lockedState = updatedEvent.locked;
    } else {
      const e = events.find(e => e.id === eventId);
      if (e) {
        e.locked = !e.locked;
        lockedState = e.locked;
      }
    }
    
    // Update local cache
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      events[eventIndex].locked = lockedState;
    }
    
    loadAttendanceSheet();
    alert(`Attendance for this date is now ${lockedState ? 'LOCKED' : 'UNLOCKED'}.`);
  } catch (err) {
    alert(`Failed to toggle lock: ${err.message}`);
  }
}

// Calculate Member Consecutive Attendance Streak
function calculateStreak(memberId) {
  const member = members.find(m => m.id === memberId);
  if (!member || member.attendance.length === 0) return 0;

  // Sort events from newest to oldest
  const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  for (let i = 0; i < sortedEvents.length; i++) {
    if (member.attendance.includes(sortedEvents[i].id)) {
      streak++;
    } else {
      // If they missed it, check if they had attended anything before, or break if it's not the most recent
      // In strict streak, we check if they attended consecutive events starting from the most recent.
      // If they missed the very first event (newest), streak is 0.
      if (i === 0) {
        // They missed the most recent event. Let's see if they attended preceding ones, but technically their active streak is broken.
        // Let's count consecutive attendance from their last attended event backwards.
        // For a simpler UX, let's trace: maximum consecutive run in their history.
        break;
      }
      break;
    }
  }

  // If streak is 0, let's check historical max streak
  if (streak === 0) {
    let maxStreak = 0;
    let currentStreak = 0;
    // chronological sorted
    const chronoEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    chronoEvents.forEach(evt => {
      if (member.attendance.includes(evt.id)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    return maxStreak;
  }

  return streak;
}

// Composite XP points calculator matching data.js formula
function calculateEngagementPoints(member) {
  let points = 0;
  points += (member.metrics.github.commits * 1.5) + (member.metrics.github.repos * 8) + (member.metrics.github.streak * 5);
  
  const lc = member.metrics.leetcode;
  points += (lc.easy * 2) + (lc.medium * 5) + (lc.hard * 10);
  if (lc.contestRating > 0) {
    points += Math.max(0, (lc.contestRating - 1200) * 0.5);
  }
  
  const cf = member.metrics.codeforces;
  points += (cf.problemsSolved * 4);
  if (cf.rating > 0) {
    points += Math.max(0, (cf.rating - 1000) * 0.75);
  }
  
  const kg = member.metrics.kaggle;
  points += (kg.competitions * 50) + (kg.notebooks * 20) + (kg.datasets * 30) + (kg.points * 0.1);
  
  // Factor in attendance points
  // Check point values of each attended event
  member.attendance.forEach(evtId => {
    const evt = events.find(e => e.id === evtId);
    points += evt ? evt.points : 10;
  });
  
  return Math.round(points);
}

// Member Profile Viewer Panel
function viewMemberProfile(memberId) {
  const member = members.find(m => m.id === memberId);
  if (!member) return;

  const body = document.getElementById("member-profile-body");
  if (!body) return;

  // Generate GitHub contributions graph grid cells
  // We'll generate a grid of 140 cells (20 columns x 7 rows)
  let cellHtml = "";
  const totalCommits = member.metrics.github.commits;
  for (let i = 0; i < 140; i++) {
    let lvl = "lvl-0";
    if (totalCommits > 0) {
      const rand = Math.random();
      // Scaled by their activity level
      const weight = totalCommits / 250;
      if (rand < 0.15 * weight) lvl = "lvl-4";
      else if (rand < 0.35 * weight) lvl = "lvl-3";
      else if (rand < 0.6 * weight) lvl = "lvl-2";
      else if (rand < 0.8 * weight) lvl = "lvl-1";
    }
    cellHtml += `<span class="heatmap-cell ${lvl}" title="Simulated Day contributions"></span>`;
  }

  // LeetCode Progress Ring Math
  const lc = member.metrics.leetcode;
  const totalLC = lc.easy + lc.medium + lc.hard || 1;
  const easyPct = (lc.easy / totalLC) * 100;
  const medPct = (lc.medium / totalLC) * 100;
  const hardPct = (lc.hard / totalLC) * 100;

  // Attendance details
  const attendedCount = member.attendance.length;
  const totalEvents = events.length || 1;
  const attendanceRate = (attendedCount / totalEvents) * 100;

  body.innerHTML = `
    <!-- Large Header -->
    <div class="profile-header">
      <div class="profile-avatar-large">${member.name.substring(0, 2).toUpperCase()}</div>
      <div class="profile-title-info">
        <h2 id="profile-modal-name" class="profile-name">${member.name}</h2>
        <div class="profile-metadata-row">
          <span class="metric-badge grey-badge">${member.role}</span>
          <span class="metric-badge ${member.status === 'Active' ? 'green-badge' : 'red-badge'}">${member.status}</span>
          <span class="metric-badge blue-badge">${member.engagementPoints} XP</span>
        </div>
      </div>
    </div>

    <!-- Main Profile Layout Grid -->
    <div class="profile-grid">
      <!-- Left side: Bio & Link panel -->
      <div class="profile-sidebar-card">
        <div class="info-row">
          <span class="info-label">Academic Details</span>
          <span class="info-val">${member.department} Department</span>
          <span class="info-val" style="color:var(--text-muted)">${member.year}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email Contacts</span>
          <span class="info-val" style="font-size:0.85rem">${member.email}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Platform Links</span>
          <div class="social-links-grid">
            <a href="${member.links.github || '#'}" target="_blank" class="profile-link-btn ${!member.links.github ? 'disabled' : ''}">GitHub</a>
            <a href="${member.links.leetcode || '#'}" target="_blank" class="profile-link-btn ${!member.links.leetcode ? 'disabled' : ''}">LeetCode</a>
            <a href="${member.links.codeforces || '#'}" target="_blank" class="profile-link-btn ${!member.links.codeforces ? 'disabled' : ''}">Codeforces</a>
            <a href="${member.links.kaggle || '#'}" target="_blank" class="profile-link-btn ${!member.links.kaggle ? 'disabled' : ''}">Kaggle</a>
            <a href="${member.links.linkedin || '#'}" target="_blank" class="profile-link-btn ${!member.links.linkedin ? 'disabled' : ''}" style="grid-column: span 2; justify-content:center">LinkedIn</a>
          </div>
        </div>
      </div>

      <!-- Right side: Coding Statistics and Grids -->
      <div class="profile-main-stats">
        
        <!-- GitHub Details -->
        <div class="platform-metric-box">
          <div class="platform-title-row">
            <span class="platform-name">GitHub Tracker</span>
            <span class="metric-badge blue-badge">${member.metrics.github.repos} Repos</span>
          </div>
          <div class="platform-grid-metrics">
            <div class="submetric-card">
              <span class="submetric-val">${member.metrics.github.commits}</span>
              <span class="submetric-lbl">Commits</span>
            </div>
            <div class="submetric-card">
              <span class="submetric-val">${member.metrics.github.streak}d</span>
              <span class="submetric-lbl">Git Streak</span>
            </div>
            <div class="submetric-card">
              <span class="submetric-val">${member.metrics.github.repos}</span>
              <span class="submetric-lbl">Projects</span>
            </div>
          </div>
          
          <div class="git-heatmap-container">
            <span class="info-label" style="font-size:0.7rem">Activity Heat Map (Past 20 weeks)</span>
            <div class="heatmap-grid">${cellHtml}</div>
          </div>
        </div>

        <!-- LeetCode Details -->
        <div class="platform-metric-box">
          <div class="platform-title-row">
            <span class="platform-name">LeetCode Analytics</span>
            <span class="metric-badge green-badge">${lc.badge || 'None'}</span>
          </div>
          
          <div class="leetcode-progress-box">
            <div class="progress-rings-wrapper">
              <svg width="80" height="80" viewBox="0 0 36 36" style="transform: rotate(-90deg);">
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-color)" stroke-width="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-success)" stroke-width="3.2" 
                  stroke-dasharray="${(lc.solved / 600) * 100} 100" />
              </svg>
              <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center">
                <strong style="font-size:1.1rem">${lc.solved}</strong>
                <span style="font-size:0.6rem; color:var(--text-muted)">Solved</span>
              </div>
            </div>

            <div class="leetcode-bars">
              <div class="progress-bar-row">
                <div class="progress-bar-header">
                  <span class="pb-easy">Easy</span>
                  <span>${lc.easy}</span>
                </div>
                <div class="bar-bg"><div class="bar-fill fill-easy" style="width: ${easyPct}%"></div></div>
              </div>
              <div class="progress-bar-row">
                <div class="progress-bar-header">
                  <span class="pb-medium">Medium</span>
                  <span>${lc.medium}</span>
                </div>
                <div class="bar-bg"><div class="bar-fill fill-medium" style="width: ${medPct}%"></div></div>
              </div>
              <div class="progress-bar-row">
                <div class="progress-bar-header">
                  <span class="pb-hard">Hard</span>
                  <span>${lc.hard}</span>
                </div>
                <div class="bar-bg"><div class="bar-fill fill-hard" style="width: ${hardPct}%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Codeforces & Kaggle Combo Row -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
          <div class="platform-metric-box">
            <span class="info-label">Codeforces</span>
            <div class="margin-top-md">
              <div class="submetric-val">${member.metrics.codeforces.rating || 'Unrated'}</div>
              <div class="submetric-lbl">${member.metrics.codeforces.rank}</div>
              <div class="submetric-lbl" style="margin-top:6px">${member.metrics.codeforces.problemsSolved} problems solved</div>
            </div>
          </div>
          <div class="platform-metric-box">
            <span class="info-label">Kaggle Data Science</span>
            <div class="margin-top-md">
              <div class="submetric-val">${member.metrics.kaggle.points || 0} pts</div>
              <div class="submetric-lbl">${member.metrics.kaggle.competitions} competitions</div>
              <div class="submetric-lbl" style="margin-top:6px">${member.metrics.kaggle.notebooks} notebooks</div>
            </div>
          </div>
        </div>

        <!-- Club Event Streak Indicators -->
        <div class="streak-box">
          <div class="streak-card">
            <span class="streak-num">${attendedCount} / ${totalEvents}</span>
            <span class="streak-lbl">Events Attended</span>
          </div>
          <div class="streak-card">
            <span class="streak-num ${calculateStreak(member.id) > 0 ? 'streak-active' : ''}">
              ${calculateStreak(member.id)}
            </span>
            <span class="streak-lbl">Active Streak</span>
          </div>
          <div class="streak-card">
            <span class="streak-num">${Math.round(attendanceRate)}%</span>
            <span class="streak-lbl">Attendance Rate</span>
          </div>
        </div>

      </div>
    </div>
  `;

  openModal("modal-member-profile");
}

// Quick trigger wrapper
window.viewMemberProfile = viewMemberProfile;

// Sync Simulation Engine
function triggerSyncSimulation() {
  const main = document.getElementById("main-content-scrollport");

  const loader = document.createElement("div");
  loader.className = "sync-loader-overlay";
  loader.innerHTML = `
    <div class="spinner"></div>
    <p>Connecting to platforms APIs...</p>
    <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px">Fetching Git commits, LeetCode schedules & Codeforces status</p>
  `;
  main.appendChild(loader);

  // Compute all metric updates locally then persist to MongoDB
  const updatePromises = [];

  members.forEach(member => {
    if (member.status !== "Active") return;

    // Simulate metric increments
    member.metrics.github.commits += Math.floor(Math.random() * 8) + 1;
    if (Math.random() > 0.6) member.metrics.github.streak += 1;

    const lcSolved = Math.floor(Math.random() * 4) + 1;
    member.metrics.leetcode.solved += lcSolved;
    member.metrics.leetcode.easy += Math.floor(lcSolved * 0.4);
    member.metrics.leetcode.medium += Math.floor(lcSolved * 0.5);
    member.metrics.leetcode.hard += Math.floor(lcSolved * 0.1);

    if (member.metrics.codeforces.rating > 0) {
      member.metrics.codeforces.problemsSolved += Math.floor(Math.random() * 3) + 1;
      member.metrics.codeforces.rating += Math.floor(Math.random() * 20) - 5;
    }
    if (member.metrics.kaggle.points > 0) {
      member.metrics.kaggle.points += Math.floor(Math.random() * 120) + 20;
    }

    member.engagementPoints = calculateEngagementPoints(member);

    // Persist each updated member to MongoDB
    updatePromises.push(
      apiCall(`/api/members/${member.id}`, {
        method: "PUT",
        body: { metrics: member.metrics, engagementPoints: member.engagementPoints },
      }).catch(err => console.warn(`Sync failed for ${member.name}:`, err.message))
    );
  });

  // Wait ~1.6 s (simulate network latency) then resolve all
  setTimeout(async () => {
    await Promise.all(updatePromises);
    main.removeChild(loader);

    const activeView = document.querySelector(".tab-view.active-view");
    if (activeView.id === "view-dashboard") renderDashboard();
    else if (activeView.id === "view-members") applyFilters();
    else if (activeView.id === "view-attendance") loadAttendanceSheet();

    alert("Profiles synced successfully! Coding metrics have been updated.");
  }, 1600);
}

// Reports Selector Panel
function populateReportMemberSelect() {
  const select = document.getElementById("report-member-select");
  if (!select) return;

  select.innerHTML = members.map(m => {
    return `<option value="${m.id}">${m.name} (${m.department})</option>`;
  }).join("");
}

function toggleReportSelectors() {
  const type = document.getElementById("report-type-select").value;
  const memberGroup = document.getElementById("report-member-selector-group");
  
  if (type === "individual") {
    memberGroup.classList.remove("hidden");
  } else {
    memberGroup.classList.add("hidden");
  }
}

// Generates printable performance reports
function generateReport() {
  const type = document.getElementById("report-type-select").value;
  const placeholder = document.getElementById("report-placeholder");
  const content = document.getElementById("report-content");
  
  placeholder.classList.add("hidden");
  content.classList.remove("hidden");

  let reportHtml = "";
  const dateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (type === "club") {
    // Compile Club statistics
    const totalCount = members.length;
    const activeCount = members.filter(m => m.status === "Active").length;
    const totalEvents = events.length;

    // Dept ratios
    let depts = { CSE: 0, IT: 0, ECE: 0, ME: 0 };
    members.forEach(m => depts[m.department] = (depts[m.department] || 0) + 1);

    // Platform aggregates
    let totalCommits = 0, totalSolved = 0, totalCompetitions = 0;
    members.forEach(m => {
      totalCommits += m.metrics.github.commits;
      totalSolved += m.metrics.leetcode.solved + m.metrics.codeforces.problemsSolved;
      totalCompetitions += m.metrics.kaggle.competitions;
    });

    reportHtml = `
      <div class="report-document">
        <div class="report-header">
          <div class="report-header-title-row">
            <div>
              <h2 class="report-doc-title">BX Club Analytics Summary</h2>
              <p class="report-doc-date">Generated on ${dateStr}</p>
            </div>
            <span class="report-stamp">Club Overview</span>
          </div>
        </div>

        <div class="report-grid-section">
          <div class="report-mini-card">
            <h5>Total Student Records</h5>
            <div class="report-mini-val">${totalCount} Members</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px">${activeCount} active, ${totalCount - activeCount} inactive</p>
          </div>
          <div class="report-mini-card">
            <h5>Aggregate Commits</h5>
            <div class="report-mini-val text-blue">${totalCommits}</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px">Total commits across all GitHub repos</p>
          </div>
          <div class="report-mini-card">
            <h5>Problems Solved</h5>
            <div class="report-mini-val text-green">${totalSolved} Solves</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px">LeetCode and Codeforces total solves</p>
          </div>
          <div class="report-mini-card">
            <h5>Recorded Activities</h5>
            <div class="report-mini-val">${totalEvents} Events</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px">Workshops, hackathons, and general meetings</p>
          </div>
        </div>

        <div class="report-table-section pt-border-top">
          <h4>Department-wise Demographics</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Member Count</th>
                <th>Percentage Ratio</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Computer Science Engineering (CSE)</td><td>${depts.CSE}</td><td>${((depts.CSE / totalCount) * 100).toFixed(1)}%</td></tr>
              <tr><td>Information Technology (IT)</td><td>${depts.IT}</td><td>${((depts.IT / totalCount) * 100).toFixed(1)}%</td></tr>
              <tr><td>Electronics Communication (ECE)</td><td>${depts.ECE}</td><td>${((depts.ECE / totalCount) * 100).toFixed(1)}%</td></tr>
              <tr><td>Mechanical Engineering (ME)</td><td>${depts.ME}</td><td>${((depts.ME / totalCount) * 100).toFixed(1)}%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (type === "monthly") {
    // Compile active ranking sorted by score
    const rankings = [...members].sort((a, b) => b.engagementPoints - a.engagementPoints);

    reportHtml = `
      <div class="report-document">
        <div class="report-header">
          <div class="report-header-title-row">
            <div>
              <h2 class="report-doc-title">Active Leaderboards & Rankings</h2>
              <p class="report-doc-date">Generated on ${dateStr}</p>
            </div>
            <span class="report-stamp" style="border-color:var(--color-success); color:var(--color-success)">Monthly Report</span>
          </div>
        </div>

        <div class="report-table-section">
          <h4>BX Member Rankings list</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Member Name</th>
                <th>Dept & Year</th>
                <th>Status</th>
                <th>Total XP</th>
              </tr>
            </thead>
            <tbody>
              ${rankings.map((m, index) => `
                <tr>
                  <td><strong>#${index + 1}</strong></td>
                  <td>${m.name}</td>
                  <td>${m.department} • ${m.year}</td>
                  <td><span class="metric-badge ${m.status === 'Active' ? 'green-badge' : 'red-badge'}">${m.status}</span></td>
                  <td><strong>${m.engagementPoints} XP</strong></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (type === "individual") {
    const memberId = document.getElementById("report-member-select").value;
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const totalEvents = events.length || 1;
    const attendancePct = (member.attendance.length / totalEvents) * 100;

    reportHtml = `
      <div class="report-document">
        <div class="report-header">
          <div class="report-header-title-row">
            <div>
              <h2 class="report-doc-title">Performance Audit: ${member.name}</h2>
              <p class="report-doc-date">Generated on ${dateStr}</p>
            </div>
            <span class="report-stamp">Student Audit</span>
          </div>
        </div>

        <div class="report-grid-section">
          <div class="report-mini-card">
            <h5>Role Details</h5>
            <div class="report-mini-val">${member.role}</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px">${member.department} Dept • ${member.year}</p>
          </div>
          <div class="report-mini-card">
            <h5>Engagement Points</h5>
            <div class="report-mini-val text-blue">${member.engagementPoints} XP</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px">Global rank score contribution</p>
          </div>
          <div class="report-mini-card">
            <h5>Attendance Rate</h5>
            <div class="report-mini-val text-green">${attendancePct.toFixed(1)}%</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px">${member.attendance.length} of ${totalEvents} events attended</p>
          </div>
          <div class="report-mini-card">
            <h5>GitHub Commits</h5>
            <div class="report-mini-val">${member.metrics.github.commits}</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px">${member.metrics.github.repos} active repositories tracked</p>
          </div>
        </div>

        <div class="report-table-section pt-border-top">
          <h4>Coding Portfolios Activity</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Main Metrics</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>GitHub</strong></td>
                <td>${member.metrics.github.commits} commits</td>
                <td>Streak: ${member.metrics.github.streak} days • Repos: ${member.metrics.github.repos}</td>
              </tr>
              <tr>
                <td><strong>LeetCode</strong></td>
                <td>${member.metrics.leetcode.solved} solved</td>
                <td>Easy: ${member.metrics.leetcode.easy} • Med: ${member.metrics.leetcode.medium} • Hard: ${member.metrics.leetcode.hard} • Rating: ${member.metrics.leetcode.contestRating || 'Unrated'}</td>
              </tr>
              <tr>
                <td><strong>Codeforces</strong></td>
                <td>${member.metrics.codeforces.problemsSolved} solved</td>
                <td>Rating: ${member.metrics.codeforces.rating || 'Unrated'} • Rank: ${member.metrics.codeforces.rank}</td>
              </tr>
              <tr>
                <td><strong>Kaggle</strong></td>
                <td>${member.metrics.kaggle.points || 0} points</td>
                <td>Notebooks: ${member.metrics.kaggle.notebooks} • Datasets: ${member.metrics.kaggle.datasets} • Competitions: ${member.metrics.kaggle.competitions}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  content.innerHTML = reportHtml;
}

// Export CSV Functionality
function exportDataCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,Name,Email,Department,Year,BX Role,Engagement Score,Status,GitHub Commits,LeetCode Solved,Codeforces Rating,Kaggle Points,Attendance Count\n";

  members.forEach(m => {
    const row = [
      m.id,
      `"${m.name}"`,
      m.email,
      m.department,
      m.year,
      `"${m.role}"`,
      m.engagementPoints,
      m.status,
      m.metrics.github.commits,
      m.metrics.leetcode.solved,
      m.metrics.codeforces.rating,
      m.metrics.kaggle.points,
      m.attendance.length
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `bx_members_report_${Date.now()}.csv`);
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
}
