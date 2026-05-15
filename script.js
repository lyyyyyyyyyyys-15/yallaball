const container = document.getElementById("matches-container");
const standingsContainer = document.getElementById("standings-container");

let allMatches = [];
let currentLeague = "all";
let currentView = "matches";
let standingsCache = {};

// 🔴 ضع رابط الـ CSV الخاص بجدول بيانات جوجل هنا بعد النشر 🔴
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpMY_ex09J4BvClxW4FgMCMQW1vfY0KdwfcEoxwRgn8a6FzfeAilgUuPWI_7J_8sNReG-oEGRjgISL/pub?output=csv";

const LEAGUE_IDS = {
  "English Premier League": "4328",
  "Spanish La Liga": "4335",
  "Italian Serie A": "4332",
  "German Bundesliga": "4331",
  "French Ligue 1": "4334"
};

function teamBadge(url, name, idTeam) {
  const initial = (name || "?").charAt(0);
  const fallbackUrl = idTeam ? `https://thesportsdb.com{idTeam}.png` : "";
  const src = (url && url !== "https://placeholder.com" && url !== "https://placeholder.com")
    ? url : fallbackUrl;
  if (src) {
    return `<div class="badge-wrapper">
      <img class="standing-logo" src="${src}" onerror="this.style.display='none'">
      <div class="team-avatar">${initial}</div>
    </div>`;
  }
  return `<div class="team-avatar">${initial}</div>`;
}

// دالة الأتمتة الكاملة لقراءة جدول جوجل وعرض المباريات والبثوث الحية تلقائياً
async function loadMatches(dayOffset = 0) {
  container.innerHTML = `<div class="no-matches" style="padding:20px; font-size:16px;">جاري تحميل البث وث والمباريات أوتوماتيكياً...</div>`;
  
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    const csvText = await response.text();
    const rows = csvText.trim().split("\n");
    
    allMatches = [];

    for (let i = 0; i < rows.length; i++) {
      let rawUrl = rows[i].replace(/"/g, "").trim();
      if (!rawUrl || !rawUrl.startsWith("http")) continue;

      try {
        let urlParts = rawUrl.split("/match/");
        if (urlParts.length < 2) continue;
        
        let matchSlug = urlParts[1].split("/")[0]; 
        let cleanText = decodeURIComponent(matchSlug); 

        cleanText = cleanText.replace(/-yacine-tv/g, "")
                             .replace(/-\d{4}-\d{2}-\d{2}/g, "") 
                             .replace(/-/g, " "); 

        let teams = cleanText.split(" ضد ");
        let homeTeam = teams[0] ? teams[0].trim() : "بث مباشر";
        let awayTeam = teams[1] ? teams[1].trim() : "مباراة اليوم";

        allMatches.push({
          idEvent: i + 1, 
          strHomeTeam: homeTeam,
          strAwayTeam: awayTeam,
          strHomeTeamBadge: "https://api-sports.io", 
          strAwayTeamBadge: "https://api-sports.io",
          intHomeScore: "-",
          intAwayScore: "-",
          strStatus: "Live",
          strLeague: "all"
        });
      } catch (e) {
        console.error("خطأ في معالجة سطر البث:", e);
      }
    }
  } catch (error) {
    console.error("حدث خطأ أثناء جلب جدول جوجل:", error);
    allMatches = [];
  }
  
  renderMatches(allMatches, false);
}


    // تخطي السطر الأول (العناوين) وبناء بطاقات المباريات من الأسطر التالية
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i]) continue;
      
      const matchData = rows[i].split(",");
      if (matchData.length < 2) continue;

      // سحب نصوص الأعمدة وفك تشفير الكلمات العربية التلقائي لمنع ظهور الرموز المشفّرة
      const rawHomeText = decodeURIComponent(matchData[0].replace(/"/g, "").trim());
      const rawAwayText = decodeURIComponent(matchData[1].replace(/"/g, "").trim());
      
      // تنظيف النصوص من الأجزاء الزائدة من الروابط لتظهر أسماء الفرق فقط نقية للمشاهد
      let homeTeam = rawHomeText.split('/').pop().replace(/-/g, ' ') || rawHomeText;
      let awayTeam = rawAwayText.split('/').pop().replace(/-/g, ' ') || rawAwayText;

      allMatches.push({
        idEvent: i, // استخدام رقم السطر كمعرف ممرر لصفحة تشغيل البث
        strHomeTeam: homeTeam.trim(),
        strAwayTeam: awayTeam.trim(),
        strHomeTeamBadge: "https://placeholder.com", 
        strAwayTeamBadge: "https://placeholder.com",
        intHomeScore: "-",
        intAwayScore: "-",
        strStatus: "Live", // تعيين الحالة كمباشر لظهورها بجدول اليوم النشط
        strLeague: "all"
      });
    }
  } catch (error) {
    console.error("حدث خطأ أثناء جلب جدول جوجل:", error);
    allMatches = [];
  }
  
  renderMatches(allMatches, false);
}

function renderMatches(matches, onlyLive = false) {
  container.innerHTML = "";
  let filteredMatches = matches;

  if (filteredMatches.length === 0) {
    container.innerHTML = `<div class="no-matches">لا توجد مباريات جارية حالياً</div>`;
    return;
  }

  filteredMatches.forEach(match => {
    const home = match.strHomeTeam || "Home";
    const away = match.strAwayTeam || "Away";
    const homeBadge = match.strHomeTeamBadge;
    const awayBadge = match.strAwayTeamBadge;
    const liveBadge = `<div class="live-small">LIVE</div>`;
    const localTimeHtml = `<div class="match-time">مباشر</div>`;

    container.innerHTML += `
      <div class="match-row" onclick="location.href='watch.html?id=${match.idEvent}'">
        <div class="team">
          <img class="team-logo" src="${homeBadge}">
          <span class="team-name">${home}</span>
        </div>
        <div class="score-box">
          ${localTimeHtml}
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
  const url = `https://thesportsdb.com{leagueId}`;
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
            <th>نقاط</th>
          </tr>
        </thead>
        <tbody>`;

  table.forEach(row => {
    const rank = row.intRank || "-";
    const name = row.strTeam || "فريق";
    const badgeHtml = teamBadge(row.strTeamBadge, name, row.idTeam);
    const played = row.intPlayed || "0";
    const win = row.intWin || "0";
    const draw = row.intDraw || "0";
    const loss = row.intLoss || "0";
    const pts = row.intPoints || "0";

    html += `
      <tr>
        <td class="rank-cell">${rank}</td>
        <td class="team-cell">
          ${badgeHtml}
          <span class="standing-name">${name}</span>
        </td>
        <td>${played}</td>
        <td>${win}</td>
        <td>${draw}</td>
        <td>${loss}</td>
        <td class="pts-cell">${pts}</td>
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
  let html = `<div class="table-header" style="display: flex; justify-content: space-between; padding: 5px 10px; font-weight: bold; border-bottom: 1px solid #333;">
    <div>#</div><div>الفريق</div><div>ن</div>
  </div>`;

  top5.forEach(row => {
    const badgeHtml = teamBadge(row.strTeamBadge, row.strTeam, row.idTeam);
    html += `<div class="standing-row" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-bottom: 1px solid #222;">
      <div>${row.intRank}</div>
      <div style="display: flex; align-items: center; gap: 5px; flex: 1; margin-right: 10px;">
        ${badgeHtml}
        <div class="standing-name">${row.strTeam}</div>
      </div>
      <div class="standing-points" style="font-weight: bold;">${row.intPoints}</div>
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

/* THEME */
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("koragoal-theme", isDark ? "dark" : "light");
  document.getElementById("theme-toggle").textContent = isDark ? "☀️" : "🌙";
}

// استعادة المظهر المفضل للمستخدم عند التشغيل
const savedTheme = localStorage.getItem("koragoal-theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  const themeBtn = document.getElementById("theme-toggle");
  if(themeBtn) themeBtn.textContent = "☀️";
}

// الاستدعاء المبدئي عند تحميل المستند للعمل فوراً
loadMatches(0);
if (currentLeague !== "all") {
    loadStandings(currentLeague);
} else {
    loadStandings("English Premier League");
}
