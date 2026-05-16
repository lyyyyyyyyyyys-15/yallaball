const container = document.getElementById("matches-container");
const sidebarContent = document.getElementById("sidebar-standings-content");

let allMatches = [];
let currentLeague = "all";
let standingsCache = {};

const LEAGUE_IDS = {
  "English Premier League": "4328",
  "Spanish La Liga": "4335",
  "German Bundesliga": "4331",
  "Italian Serie A": "4332",
  "French Ligue 1": "4334"
};

async function loadMatches() {
  const date = new Date();
  const d = date.toISOString().split("T")[0];
  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${d}&s=Soccer`);
    const data = await res.json();
    allMatches = data.events || [];
  } catch {
    allMatches = [];
  }
  renderMatches();
}

function renderMatches() {
  let list = allMatches;
  if (currentLeague !== "all") {
    list = list.filter(m => m.strLeague === currentLeague);
  }

  if (list.length === 0) {
    container.innerHTML = `<div class="no-matches">لا توجد مباريات اليوم</div>`;
    return;
  }

  container.innerHTML = list.map(m => {
    const home = m.strHomeTeam || "Home";
    const away = m.strAwayTeam || "Away";
    const hb = m.strHomeTeamBadge || "";
    const ab = m.strAwayTeamBadge || "";
    const sh = m.intHomeScore ?? "-";
    const sa = m.intAwayScore ?? "-";
    const status = m.strStatus || "";
    const live = status.includes("Live") || status.includes("In Progress");

    return `<div class="match-row" onclick="location.href='watch.html?id=${m.idEvent || ''}'">
      <div class="vs-teams">
        <div class="vs-team">
          ${hb ? `<img class="vs-logo" src="${hb}" onerror="this.outerHTML='<div class=\\'vs-avatar\\'>${home[0]||'?'}</div>'">` : `<div class="vs-avatar">${home[0]||'?'}</div>`}
          <span class="vs-name">${home}</span>
        </div>
        <div class="vs-divider">
          ${live ? '<span class="live-dot"></span>' : '<span class="vs-text">VS</span>'}
        </div>
        <div class="vs-team">
          ${ab ? `<img class="vs-logo" src="${ab}" onerror="this.outerHTML='<div class=\\'vs-avatar\\'>${away[0]||'?'}</div>'">` : `<div class="vs-avatar">${away[0]||'?'}</div>`}
          <span class="vs-name">${away}</span>
        </div>
      </div>
      ${live ? '<div class="vs-live">مباشر</div>' : '<div class="vs-watch">شاهد</div>'}
    </div>`;
  }).join("");
}

async function loadStandings(league) {
  const id = LEAGUE_IDS[league];
  if (!id) return;

  if (standingsCache[league]) { renderSidebar(standingsCache[league], league); return; }

  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=${id}`);
    const data = await res.json();
    standingsCache[league] = data.table || [];
    renderSidebar(data.table || [], league);
  } catch {}
}

function renderSidebar(table, league) {
  if (!table || table.length === 0) {
    sidebarContent.innerHTML = `<div class="no-matches" style="padding:15px;font-size:14px;">لا يوجد ترتيب</div>`;
    return;
  }
  const top5 = table.slice(0, 5);
  sidebarContent.innerHTML = top5.map(r => `
    <div class="standing-row">
      <div class="sr-rank">${r.intRank}</div>
      <img class="sr-logo" src="${r.strTeamBadge || ""}" onerror="this.style.display='none'">
      <div class="sr-name">${r.strTeam}</div>
      <div class="sr-pts">${r.intPoints}</div>
    </div>
  `).join("");
}

/* EVENTS */
document.addEventListener("click", e => {
  if (e.target.classList.contains("league-btn")) {
    document.querySelectorAll(".league-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    currentLeague = e.target.dataset.league;
    renderMatches();
    if (currentLeague !== "all") loadStandings(currentLeague);
  }
});

/* THEME */
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("koragoal-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  document.getElementById("theme-toggle").textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
}
if (localStorage.getItem("koragoal-theme") === "dark") {
  document.body.classList.add("dark-mode");
  document.getElementById("theme-toggle").textContent = "☀️";
}

loadMatches();
loadStandings("English Premier League");
