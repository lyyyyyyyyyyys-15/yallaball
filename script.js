const container = document.getElementById("matches-container");
const standingsContainer = document.getElementById("standings-container");

let allMatches = [];
let currentLeague = "all";
let currentView = "matches";
let standingsCache = {};

// 🔴 ضع هنا رابط الـ CSV المباشر الخاص بجدول بيانات جوجل بعد تعديله 🔴
const GOOGLE_SHEET_CSV_URL = "ضع_رابط_جوجل_شيت_بصيغة_CSV_هنا";

async function loadMatches(dayOffset = 0) {
  if (container) {
    container.innerHTML = `<div class="no-matches" style="padding:20px; font-size:16px;">جاري تحميل مباريات اليوم تلقائياً...</div>`;
  }
  
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    const csvText = await response.text();
    const rows = csvText.trim().split("\n");
    
    allMatches = [];

    // البدء من السطر الثاني لتخطي العناوين
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i]) continue;
      
      const matchData = rows[i].split(",");
      if (matchData.length < 3) continue;

      // قراءة البيانات المباشرة بدون أي عمليات معالجة نصية مسببة للأخطاء
      let homeTeam = matchData[0].replace(/"/g, "").trim();
      let awayTeam = matchData[1].replace(/"/g, "").trim();
      let streamUrl = matchData[2].replace(/"/g, "").trim();

      if (homeTeam && awayTeam && streamUrl.startsWith("http")) {
        allMatches.push({
          idEvent: i, 
          strHomeTeam: homeTeam,
          strAwayTeam: awayTeam,
          strHomeTeamBadge: "https://placeholder.com", 
          strAwayTeamBadge: "https://placeholder.com",
          intHomeScore: "-",
          intAwayScore: "-",
          strStatus: "Live",
          strLeague: "all"
        });
      }
    }
  } catch (error) {
    console.error("خطأ أثناء جلب البيانات:", error);
    allMatches = [];
  }
  
  renderMatches(allMatches);
}

function renderMatches(matches) {
  if (!container) return;
  container.innerHTML = "";

  if (matches.length === 0) {
    container.innerHTML = `<div class="no-matches">لا توجد مباريات جارية حالياً اليوم</div>`;
    return;
  }

  matches.forEach(match => {
    container.innerHTML += `
      <div class="match-row" onclick="location.href='watch.html?id=${match.idEvent}'">
        <div class="team">
          <img class="team-logo" src="${match.strHomeTeamBadge}">
          <span class="team-name">${match.strHomeTeam}</span>
        </div>
        <div class="score-box">
          <div class="match-time">مباشر</div>
          <div class="live-small">LIVE</div>
        </div>
        <div class="team right">
          <span class="team-name">${match.strAwayTeam}</span>
          <img class="team-logo" src="${match.strAwayTeamBadge}">
        </div>
      </div>`;
  });
}

/* تفعيل التبديل والتحكم الكامل بالمظهر بدون أخطاء متداخلة */
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("koragoal-theme", isDark ? "dark" : "light");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("koragoal-theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  const themeBtn = document.getElementById("theme-toggle");
  if(themeBtn) themeBtn.textContent = "☀️";
}

// استدعاء التشغيل الفوري للمباريات
loadMatches(0);
