const params = new URLSearchParams(window.location.search);

const home = params.get("home") || "--";
const away = params.get("away") || "--";
const homeBadge = params.get("homeBadge") || "";
const awayBadge = params.get("awayBadge") || "";
const scoreHome = params.get("scoreHome") || "-";
const scoreAway = params.get("scoreAway") || "-";
const stream = params.get("stream") || "";
const league = params.get("league") || "";

document.getElementById("watch-home-name").textContent = home;
document.getElementById("watch-away-name").textContent = away;
document.getElementById("watch-home-badge").src = homeBadge;
document.getElementById("watch-away-badge").src = awayBadge;
document.getElementById("watch-score").textContent = `${scoreHome} - ${scoreAway}`;

document.title = `KORAGOAL - ${home} vs ${away}`;

const player = document.getElementById("stream-player");
const urlInput = document.getElementById("stream-url-input");
const loadBtn = document.getElementById("load-stream-btn");

function loadStream(url) {
  if (!url) return;
  player.src = url;
}

if (stream) {
  urlInput.value = stream;
  loadStream(stream);
}

loadBtn.addEventListener("click", () => {
  const val = urlInput.value.trim();
  if (val) loadStream(val);
});

urlInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const val = urlInput.value.trim();
    if (val) loadStream(val);
  }
});

/* AD POPUP */
const popupOverlay = document.getElementById("ad-popup-overlay");
const popupClose = document.getElementById("ad-popup-close");
const popupTimer = document.getElementById("ad-popup-timer");
let popupCountdown = 5;

setTimeout(() => {
  popupOverlay.style.display = "flex";
  const interval = setInterval(() => {
    popupCountdown--;
    popupTimer.textContent = `سيتم التخطي بعد ${popupCountdown} ثوانٍ`;
    if (popupCountdown <= 0) {
      clearInterval(interval);
      popupTimer.textContent = "يمكنك التخطي الآن";
      popupClose.style.opacity = "1";
    }
  }, 1000);
}, 3000);

popupClose.addEventListener("click", () => {
  popupOverlay.style.display = "none";
});

popupOverlay.addEventListener("click", e => {
  if (e.target === popupOverlay) popupOverlay.style.display = "none";
});
