const container = document.getElementById("matches-container");

let allMatches = [];

// دالة جلب المباريات مباشرة من واجهة برمجية مفتوحة ومستقرة بدون أي وسيط
async function loadMatches() {
  if (container) {
    container.innerHTML = `<div class="no-matches" style="padding:20px; font-size:16px;">جاري تحميل مباريات اليوم تلقائياً...</div>`;
  }
  
  // استخدام واجهة رياضية مجانية ومفتوحة للمطورين تجلب مباريات اليوم حياً ومباشراً
  const url = "https://thesportsdb.com";
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    allMatches = data.events || [];
  } catch (error) {
    console.error("خطأ في جلب المباريات:", error);
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
    
    // جلب الشعارات الرسمية للفرق تلقائياً، وفي حال عدم توفرها نضع شعار افتراضي أنيق
    const homeBadge = match.strHomeTeamBadge || "https://api-sports.io";
    const awayBadge = match.strAwayTeamBadge || "https://api-sports.io";
    
    const status = match.strStatus || "";
    const isLive = status.includes("Live") || status.includes("In Progress");
    const liveBadge = isLive ? `<div class="live-small">LIVE</div>` : "";
    const timeText = isLive ? "مباشر الآن" : (match.strTime ? match.strTime.substring(0, 5) : "اليوم");

    // تمرير تفاصيل المباراة مباشرة في الرابط لتقرأها صفحة watch.html تلقائياً وبأمان
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

/* تفعيل التبديل التلقائي للمظهر */
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

// تشغيل جلب البيانات فور فتح الصفحة
loadMatches();
