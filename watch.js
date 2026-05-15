const params = new URLSearchParams(window.location.search);
const matchId = parseInt(params.get("id"));

// 🔴 يجب وضع نفس رابط الـ CSV الخاص بجدول بيانات جوجل هنا 🔴
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpMY_ex09J4BvClxW4FgMCMQW1vfY0KdwfcEoxwRgn8a6FzfeAilgUuPWI_7J_8sNReG-oEGRjgISL/pub?output=csv";

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
      
      let rawUrl = rows[matchId - 1] ? rows[matchId - 1].replace(/"/g, "").trim() : "";
      
      if (rawUrl && rawUrl.startsWith("http")) {
        try {
          let urlParts = rawUrl.split("/match/");
          let matchSlug = urlParts[1].split("/")[0];
          let cleanText = decodeURIComponent(matchSlug).replace(/-yacine-tv/g, "").replace(/-\d{4}-\d{2}-\d{2}/g, "").replace(/-/g, " ");
          let teams = cleanText.split(" ضد ");
          
          let homeName = teams[0] ? teams[0].trim() : "بث مباشر";
          let awayName = teams[1] ? teams[1].trim() : "مباراة اليوم";

          document.getElementById("watch-home-name").textContent = homeName;
          document.getElementById("watch-away-name").textContent = awayName;
          document.title = `KORAGOAL - بث مباشر ${homeName} ضد ${awayName}`;
          document.getElementById("watch-score").textContent = "VS";

          let embedUrl = rawUrl.replace("/match/", "/embed/");
          iframe.src = embedUrl;
          if (urlInput) urlInput.value = embedUrl;
         } catch(e) {
          console.error(e);
         }
         } else {
        document.getElementById("watch-home-name").textContent = "البث غير متوفر حالياً";
        }
        })
       .catch(err => console.error(err));
       }
       else {
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
