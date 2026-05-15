const params = new URLSearchParams(window.location.search);

const home = params.get("home") || "مباراة اليوم";
const away = params.get("away") || "بث مباشر";
const homeBadge = params.get("homeBadge") || "https://api-sports.io";
const awayBadge = params.get("awayBadge") || "https://api-sports.io";
const matchId = params.get("id");

// عرض تفاصيل الواجهة وشعارات الفرق الأصلية لموقعك
document.getElementById("watch-home-name").textContent = home;
document.getElementById("watch-away-name").textContent = away;
document.getElementById("watch-home-badge").src = homeBadge;
document.getElementById("watch-away-badge").src = awayBadge;
document.getElementById("watch-score").textContent = "VS";
document.title = `KORAGOAL - مشاهدة مباراة ${home} ضد ${away}`;

const iframe = document.getElementById("stream-player");
const urlInput = document.getElementById("stream-url-input");

if (matchId && iframe) {
  // الأتمتة الكاملة: دمج معرف المباراة المباشر مع رابط صفحة التضمين الكامل للموقع المصدر
  // هذا الرابط يتحدث تلقائياً من خادمهم ويعرض البث المباشر للمباراة الجارية فوراً
  const autoStreamUrl = `https://yalla-shoot.world{matchId}/`;
  
  iframe.src = autoStreamUrl;
  if (urlInput) urlInput.value = autoStreamUrl;
  
  // منح الإطار الصلاحيات الكاملة لتشغيل الفيديو بملء الشاشة تلقائياً
  iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
}

function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("koragoal-theme", isDark ? "dark" : "light");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}
