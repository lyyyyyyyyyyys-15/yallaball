const params = new URLSearchParams(window.location.search);
const matchId = parseInt(params.get("id"));

// 🔴 يجب وضع نفس رابط الـ CSV الخاص بجدول بيانات جوجل هنا 🔴
const GOOGLE_SHEET_CSV_URL = "ضع_رابط_جوجل_شيت_بصيغة_CSV_هنا";

/* IFRAME PLAYER ELEMENTS */
const iframe = document.getElementById("stream-player");
const urlInput = document.getElementById("stream-url-input");
const loadBtn = document.getElementById("load-stream-btn");

// جلب تفاصيل البث والمباراة أوتوماتيكياً من سطر جدول جوجل شيت
if (matchId) {
  fetch(GOOGLE_SHEET_CSV_URL)
    .then(response => response.text())
    .then(data => {
      const rows = data.trim().split("\n");
      
      if (rows[matchId]) {
        const matchData = rows[matchId].split(",");
        
        // جلب أسماء الفرق والروابط وتنظيفها وفك التشفير العربي
        const rawHomeText = decodeURIComponent(matchData[0].replace(/"/g, "").trim());
        const rawAwayText = decodeURIComponent(matchData[1].replace(/"/g, "").trim());
        
        let homeName = rawHomeText.split('/').pop().replace(/-/g, ' ') || rawHomeText;
        let awayName = rawAwayText.split('/').pop().replace(/-/g, ' ') || rawAwayText;
        
        // عرض أسماء الفرق في الواجهة
        document.getElementById("watch-home-name").textContent = homeName;
        document.getElementById("watch-away-name").textContent = awayName;
        document.title = `KORAGOAL - بث مباشر ${homeName} ضد ${awayName}`;
        document.getElementById("watch-score").textContent = "VS";

        // استخراج رابط البث من العمود الأخير في جدول جوجل شيت
        let rawUrl = matchData[matchData.length - 1].replace(/"/g, "").trim();

        if (rawUrl.startsWith("http")) {
          // هاتفياً: تحويل صفحة المباراة العادية إلى رابط المشغل المباشر النقي الخاص بياسين تي في
          let embedUrl = rawUrl.replace("/match/", "/embed/");
          
          // تشغيل البث تلقائياً داخل المشغل وعرض الرابط في صندوق التحكم
          iframe.src = embedUrl;
          if (urlInput) urlInput.value = embedUrl;
        } else {
          document.getElementById("watch-home-name").textContent = "البث غير متوفر";
          document.getElementById("watch-away-name").textContent = "حالياً";
        }
      }
    })
    .catch(err => {
      console.error("خطأ في جلب بيانات البث من جوجل شيت:", err);
    });
}

function loadStream(url) {
  if (!url) return;
  iframe.src = url;
}

if (loadBtn) {
  loadBtn.addEventListener("click", () => {
    const val = urlInput.value.trim();
    if (val) loadStream(val);
  });
}

if (urlInput) {
  urlInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const val = urlInput.value.trim();
      if (val) loadStream(val);
    }
  });
}

/* THEME CONTROL */
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("koragoal-theme", isDark ? "dark" : "light");
  document.getElementById("theme-toggle").textContent = isDark ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("koragoal-theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  const themeToggleElement = document.getElementById("theme-toggle");
  if (themeToggleElement) themeToggleElement.textContent = "☀️";
}
