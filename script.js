const container = document.getElementById("matches-container");
const standingsContainer = document.getElementById("standings-container");

let allMatches = [];
let currentLeague = "all";
let currentView = "matches";
let standingsCache = {};

const LEAGUE_IDS = {
  "English Premier League": "4328",
  "Spanish La Liga": "4335",
  "Italian Serie A": "4331",
  "German Bundesliga": "4332",
  "French Ligue 1": "4334"
};

const SEASON = "2024-2025";

function formatTime(timeString) {
  if (!timeString) return "لاحقاً";
  const [hours, minutes] = timeString.split(":");
  return `${parseInt(hours)}:${minutes}`;
}

async function loadMatches(dayOffset = 0) {
  container.innerHTML = "جاري تحميل المباريات...";
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const formattedDate = date.toISOString().split("T")[0];
  const url = `https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${formattedDate}&s=Soccer`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    allMatches = data.events || [];
  } catch {
    allMatches = [];
  }
  renderMatches(allMatches, false);
}

function renderMatches(matches, onlyLive = false) {
  container.innerHTML = "";
  let filteredMatches = matches;

  if (currentLeague !== "all") {
    filteredMatches = filteredMatches.filter(m => m.strLeague === currentLeague);
  }

  if (onlyLive) {
    filteredMatches = filteredMatches.filter(m =>
      m.strStatus && (m.strStatus.includes("Live") || m.strStatus.includes("In Progress"))
    );
  }

  if (filteredMatches.length === 0) {
    container.innerHTML = `<div class="no-matches">لا توجد مباريات حالياً</div>`;
    return;
  }

  filteredMatches.forEach(match => {
    const home = match.strHomeTeam || "Home";
    const away = match.strAwayTeam || "Away";
    const homeBadge = match.strHomeTeamBadge || "https://via.placeholder.com/40";
    const awayBadge = match.strAwayTeamBadge || "https://via.placeholder.com/40";
    const scoreHome = match.intHomeScore ?? "-";
    const scoreAway = match.intAwayScore ?? "-";
    const time = match.strTime || "لاحقاً";
    const status = match.strStatus || "";
    const liveBadge = status.includes("Live") || status.includes("In Progress")
      ? `<div class="live-small">LIVE</div>` : "";

    const params = new URLSearchParams({
      home, away, homeBadge, awayBadge,
      scoreHome, scoreAway,
      league: match.strLeague || "",
      stream: match.strVideo || ""
    });

    container.innerHTML += `
      <div class="match-row" onclick="location.href='watch.html?${params.toString()}'">
        <div class="team">
          <img class="team-logo" src="${homeBadge}">
          <span class="team-name">${home}</span>
        </div>
        <div class="score-box">
          <div class="match-time">${formatTime(time)}</div>
          <div class="timezone">UTC+1</div>
          ${liveBadge}
        </div>
        <div class="team right">
          <span class="team-name">${away}</span>
          <img class="team-logo" src="${awayBadge}">
        </div>
      </div>`;
  });
}

async function loadStandings(leagueName) {
  const leagueId = LEAGUE_IDS[leagueName];
  if (!leagueId) return;

  if (standingsCache[leagueName]) {
    renderStandings(standingsCache[leagueName]);
    return;
  }

  standingsContainer.innerHTML = "جاري تحميل الترتيب...";
  const url = `https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=${leagueId}&s=${SEASON}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const table = data.table || [];
    standingsCache[leagueName] = table;
    renderStandings(table);
  } catch {
    standingsContainer.innerHTML = `<div class="no-matches">تعذر تحميل الترتيب</div>`;
  }
}

function renderStandings(table) {
  if (!table || table.length === 0) {
    standingsContainer.innerHTML = `<div class="no-matches">لا يوجد ترتيب متاح</div>`;
    return;
  }

  let html = `
    <div class="standings-table-wrapper">
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th class="th-team">الفريق</th>
            <th>لعب</th>
            <th>فوز</th>
            <th>تعادل</th>
            <th>خسارة</th>
            <th>له</th>
            <th>عليه</th>
            <th>±</th>
            <th>نقاط</th>
            <th>آخر 5</th>
          </tr>
        </thead>
        <tbody>`;

  table.forEach(row => {
    const rank = row.intRank || "-";
    const badge = row.strTeamBadge || "https://via.placeholder.com/24";
    const name = row.strTeam || "فريق";
    const played = row.intPlayed || "0";
    const win = row.intWin || "0";
    const draw = row.intDraw || "0";
    const loss = row.intLoss || "0";
    const gf = row.intGoalsFor || "0";
    const ga = row.intGoalsAgainst || "0";
    const gd = row.intGoalDifference || "0";
    const pts = row.intPoints || "0";
    const form = row.strForm || "";

    const formHtml = form ? form.split("").map(c => {
      const cls = c === "W" ? "form-w" : c === "D" ? "form-d" : c === "L" ? "form-l" : "";
      const label = c === "W" ? "ف" : c === "D" ? "ت" : c === "L" ? "خ" : c;
      return `<span class="form-badge ${cls}">${label}</span>`;
    }).join("") : `<span class="form-na">-</span>`;

    const gdClass = parseInt(gd) > 0 ? "gd-pos" : parseInt(gd) < 0 ? "gd-neg" : "";
    const topThree = parseInt(rank) <= 3 ? "top-three" : "";

    html += `
      <tr class="${topThree}">
        <td class="rank-cell">${rank}</td>
        <td class="team-cell">
          <img class="standing-logo" src="${badge}">
          <span class="standing-name">${name}</span>
        </td>
        <td>${played}</td>
        <td>${win}</td>
        <td>${draw}</td>
        <td>${loss}</td>
        <td>${gf}</td>
        <td>${ga}</td>
        <td class="${gdClass}">${gd}</td>
        <td class="pts-cell">${pts}</td>
        <td class="form-cell">${formHtml}</td>
      </tr>`;
  });

  html += `</tbody></table></div>`;
  standingsContainer.innerHTML = html;

  renderSidebarStandings(table);
}

function renderSidebarStandings(table) {
  const sidebarContent = document.getElementById("sidebar-standings-content");
  const sidebarTitle = document.querySelector("#sidebar-standings .sidebar-title");
  if (!table || table.length === 0) {
    sidebarContent.innerHTML = `<div class="no-matches" style="padding:15px;font-size:14px;">لا يوجد ترتيب</div>`;
    return;
  }

  if (sidebarTitle) {
    const leagueLabels = {
      "English Premier League": "الدوري الإنجليزي",
      "Spanish La Liga": "الدوري الإسباني",
      "Italian Serie A": "الدوري الإيطالي",
      "German Bundesliga": "الدوري الألماني",
      "French Ligue 1": "الدوري الفرنسي"
    };
    sidebarTitle.textContent = `ترتيب ${leagueLabels[currentLeague] || currentLeague}`;
  }

  const top5 = table.slice(0, 5);
  let html = `<div class="table-header">
    <div>#</div><div></div><div>الفريق</div><div>ن</div>
  </div>`;

  top5.forEach(row => {
    html += `<div class="standing-row">
      <div>${row.intRank}</div>
      <img class="standing-logo" src="${row.strTeamBadge || "https://via.placeholder.com/24"}">
      <div class="standing-name">${row.strTeam}</div>
      <div class="standing-points">${row.intPoints}</div>
    </div>`;
  });

  sidebarContent.innerHTML = html;
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.view-btn[data-view="${view}"]`).classList.add("active");

  if (view === "matches") {
    document.querySelector(".filters").style.display = "flex";
    document.getElementById("matches-container").style.display = "flex";
    document.getElementById("standings-container").style.display = "none";
    renderMatches(allMatches, false);
  } else {
    document.querySelector(".filters").style.display = "none";
    document.getElementById("matches-container").style.display = "none";
    document.getElementById("standings-container").style.display = "block";
    if (currentLeague !== "all") {
      loadStandings(currentLeague);
    }
  }
}

/* EVENTS */
document.addEventListener("click", e => {
  if (e.target.classList.contains("filter-btn")) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    const text = e.target.textContent.trim();
    if (text === "الكل" || text === "اليوم") loadMatches(0);
    if (text === "مباشر") renderMatches(allMatches, true);
    if (text === "غداً") loadMatches(1);
  }
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("league-btn")) {
    document.querySelectorAll(".league-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    currentLeague = e.target.dataset.league;

    if (currentView === "matches") {
      renderMatches(allMatches);
    }

    if (currentLeague !== "all") {
      loadStandings(currentLeague);
    } else {
      loadStandings("English Premier League");
    }
  }
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("view-btn")) {
    switchView(e.target.dataset.view);
  }
});

loadMatches(0);
if (currentLeague !== "all") loadStandings(currentLeague);
