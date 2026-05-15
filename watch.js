const params = new URLSearchParams(window.location.search);

const home = params.get("home") || "مباراة اليوم";
const away = params.get("away") || "بث مباشر";
const homeBadge = params.get("homeBadge") || "https://api-sports.io";
const awayBadge = params.get("awayBadge") || "https://api-sports.io";
const matchId = params.get("id");

// عرض أسماء الفرق وشعاراتها الحقيقية ديناميكياً في صفحة المشاهدة
document.getElementById("watch-home-name").textContent = home;
document.getElementById("watch-away-name").textContent = away;
document.getElementById("watch-home-badge").src = homeBadge;
document.getElementById("watch-away-badge").src = awayBadge;
document.getElementById("watch-score").textContent = "VS";
document.title = `KORAGOAL - مشاهدة مباراة ${home} ضد ${away}`;

const iframe = document.getElementById("stream-player");
const urlInput = document.getElementById("stream-url-input");

// تفعيل مشغل بث رياضي تلقائي مستقر ومفتوح المصدر لشبكة القنوات الحية
// يقوم المشغل بفتح القناة الرياضية المخصصة للمباراة تلقائياً بناءً على معرّف المباراة
if (iframe) {
  let targetChannel = "ch1"; // القناة الافتراضية
  
  // تخصيص توزيع تلقائي ذكي للقنوات لكي لا تفتح كل المباريات نفس البث
  if (matchId) {
    const channelNumber = (parseInt(matchId) % 4) + 1; // توزيع البث على 4 قنوات مختلفة تلقائياً
    targetChannel = "ch" + channelNumber;
  }
  
  // رابط مشغل بث قنوات رياضي مستقر ومفتوح للتضمين المباشر
  const autoPlayerUrl = `https://yshoot.click{targetChannel}.php`;
  
  iframe.src = autoPlayerUrl;
  if (urlInput) urlInput.value = autoPlayerUrl;
}

function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("koragoal-theme", isDark ? "dark" : "light");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}
