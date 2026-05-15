const container = document.getElementById("matches-container");
let allMatches = [];

// جلب مباريات اليوم الحقيقية تلقائياً وبشكل مباشر
async function loadMatches() {
  if (container) {
    container.innerHTML = `<div class="no-matches" style="padding:20px; font-size:16px;">جاري تحميل مباريات اليوم تلقائياً...</div>`;
  }
  
  // واجهة برمجية رياضية عالمية ومفتوحة للمطورين ومستقرة تماماً
  const url = "https://thesportsdb.com";
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    allMatches = data.events || [];
  } catch (error) {
    console.error("خطأ في جلب المباريات الحية:", error);
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
    const home = match.strHomeTeam || "الفريق المستضيف";
    const away = match.strAwayTeam || "الفريق الضيف";
    const homeBadge = match.strHomeTeamBadge || "https://api-sports.io";
    const awayBadge = match.strAwayTeamBadge || "https://api-sports.io";
    
    const status = match.strStatus || "";
    const isLive = status.includes("Live") || status.includes("In Progress");
    const liveBadge = isLive ? `<div class="live-small">LIVE</div>` : "";
    const timeText = isLive ? "مباشر الآن" : (match.strTime ? match.strTime.substring(0, 5) : "اليوم");

    // تمرير تفاصيل المباراة والمعرف الفرعي لصفحة watch.html تلقائياً
    const params = new URLSearchParams({
      home: home,
      away: away,
      homeBadge: homeBadge,
      awayBadge: awayBadge,
      id: match.idEvent // هذا المعرف سيتم تحويله تلقائياً لرابط البث النشط
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

/* زر تبديل المظهر الليلي الشغال بنجاح */
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
