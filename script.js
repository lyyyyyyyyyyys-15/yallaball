const container = document.getElementById("matches-container");

let allMatches = [];
let currentLeague = "all";

// 1. جلب المباريات الحقيقية وشعارات الفرق من الإنترنت تلقائياً
async function loadMatches() {
  if (container) {
    container.innerHTML = `<div class="no-matches" style="padding:20px; font-size:16px;">جاري تحميل مباريات اليوم تلقائياً...</div>`;
  }
  
  const url = "https://thesportsdb.com";
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    allMatches = data.events || [];
  } catch (error) {
    console.error("خطأ في جلب بيانات المباريات:", error);
    allMatches = [];
  }
  
  renderMatches(allMatches);
}

// 2. صناعة بطاقات المباريات وتصفيتها حسب الدوري المضغوط تلقائياً
function renderMatches(matches) {
  if (!container) return;
  container.innerHTML = "";

  // فلترة المباريات بناءً على الدوري المختار من القائمة العلوية لموقعك
  let filteredMatches = matches;
  if (currentLeague !== "all") {
    filteredMatches = matches.filter(m => m.strLeague === currentLeague);
  }

  if (filteredMatches.length === 0) {
    container.innerHTML = `<div class="no-matches">لا توجد مباريات جارية حالياً في هذا القسم</div>`;
    return;
  }

  filteredMatches.forEach(match => {
    const home = match.strHomeTeam || "الفريق المستضيف";
    const away = match.strAwayTeam || "الفريق الضيف";
    const homeBadge = match.strHomeTeamBadge || "https://api-sports.io";
    const awayBadge = match.strAwayTeamBadge || "https://api-sports.io";
    
    const status = match.strStatus || "";
    const isLive = status.includes("Live") || status.includes("In Progress");
    const liveBadge = isLive ? `<div class="live-small">LIVE</div>` : "";
    const timeText = isLive ? "مباشر الآن" : (match.strTime ? match.strTime.substring(0, 5) : "اليوم");

    // تجهيز تفاصيل الواجهة لـ الممرر التلقائي لصفحة المشاهدة
    const params = new URLSearchParams({
      home: home,
      away: away,
      homeBadge: homeBadge,
      awayBadge: awayBadge,
      id: match.idEvent
    });

    container.innerHTML += `
      <div class="match-row" onclick="location.href='watch.html?${params.toString()}'">
        <div class="team">
          <img class="team-logo" src="${homeBadge}">
          <span class="team-name">${home}</span>
        </div>
        <div class="score-box">
          <div class="match-time">${timeText}</div>
          ${liveBadge}
        </div>
        <div class="team right">
          <span class="team-name">${away}</span>
          <img class="team-logo" src="${awayBadge}">
        </div>
      </div>`;
  });
}

/* ربط أزرار الدوريات الكبرى المتواجدة في ملف index.html الخاص بك */
document.addEventListener("click", e => {
  if (e.target.classList.contains("league-btn")) {
    document.querySelectorAll(".league-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    
    // قراءة اسم الدوري الممرر عبر خاصية (data-league) في تصميم موقعك
    currentLeague = e.target.dataset.league;
    renderMatches(allMatches);
  }
});

/* زر تبديل المظهر الشغال والمحفوظ بأمان */
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

loadMatches();
