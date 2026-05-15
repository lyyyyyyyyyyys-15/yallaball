const params = new URLSearchParams(window.location.search);

const home = params.get("home") || "مباراة اليوم";
const away = params.get("away") || "بث مباشر";
const homeBadge = params.get("homeBadge") || "https://api-sports.io";
const awayBadge = params.get("awayBadge") || "https://api-sports.io";
const matchId = params.get("id");

// ضخ الأيقونات والأسماء والبيانات فوراً في صفحة watch.html للمشاهد
document.getElementById("watch-home-name").textContent = home;
document.getElementById("watch-away-name").textContent = away;
document.getElementById("watch-home-badge").src = homeBadge;
document.getElementById("watch-away-badge").src = awayBadge;
document.getElementById("watch-score").textContent = "VS";
document.title = `KORAGOAL - بث مباشر ${home} ضد ${away}`;

const iframe = document.getElementById("stream-player");
const urlInput = document.getElementById("stream-url-input");

if (matchId && iframe) {
  // الأتمتة اللحظية: إحضار صفحة البث الحي النشطة للمباراة من إنترنت موقع يلا شوت أوتوماتيكياً
  const autoStreamUrl = `https://yalla-shoot.world{matchId}/`;
  
  iframe.src = autoStreamUrl;
  if (urlInput) urlInput.value = autoStreamUrl;
  
  // تفعيل صلاحيات ملء الشاشة والتشغيل التلقائي الآمن للفيديو للمشاهد
  iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
}

function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("koragoal-theme", isDark ? "dark" : "light");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}
