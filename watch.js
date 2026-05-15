const params = new URLSearchParams(window.location.search);

const home = params.get("home") || "--";
const away = params.get("away") || "--";
const homeBadge = params.get("homeBadge") || "";
const awayBadge = params.get("awayBadge") || "";
const scoreHome = params.get("scoreHome") || "-";
const scoreAway = params.get("scoreAway") || "-";
const stream = params.get("stream") || "";
const league = params.get("league") || "";
const idEvent = params.get("idEvent") || "";

document.getElementById("watch-home-name").textContent = home;
document.getElementById("watch-away-name").textContent = away;
document.getElementById("watch-home-badge").src = homeBadge;
document.getElementById("watch-away-badge").src = awayBadge;
const matchStarted = scoreHome !== "-" && scoreAway !== "-" && scoreHome !== "" && scoreAway !== "";
document.getElementById("watch-score").textContent = matchStarted ? `${scoreHome} - ${scoreAway}` : "VS";

if (!matchStarted) {
  document.getElementById("watch-player-wrapper").style.display = "none";
  document.getElementById("watch-controls").style.display = "none";
}

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

/* THEME */
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("koragoal-theme", isDark ? "dark" : "light");
  document.getElementById("theme-toggle").textContent = isDark ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("koragoal-theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  document.getElementById("theme-toggle").textContent = "☀️";
}

/* MATCH INFO + HIGHLIGHTS */
if (idEvent) {
  fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupevent.php?id=${idEvent}`)
    .then(r => r.json())
    .then(data => {
      const event = data.events?.[0];
      if (!event) return;

      if (event.strLeague) document.getElementById("info-league").textContent = event.strLeague;
      if (event.strDate) {
        const d = new Date(event.strDate + "T" + (event.strTime || "00:00"));
        document.getElementById("info-date").textContent = d.toLocaleDateString("ar-SA", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
      }
      if (event.strTime) {
        const [h, m] = event.strTime.split(":");
        document.getElementById("info-time").textContent = `${parseInt(h)}:${m}`;
      }

      if (event.strVideo) {
        const youtubeId = event.strVideo.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
        if (youtubeId) {
          document.getElementById("watch-highlights").style.display = "block";
          document.getElementById("highlights-frame").src = `https://www.youtube.com/embed/${youtubeId}`;
        }
      }
    })
    .catch(() => {});

  fetch(`https://www.thesportsdb.com/api/v1/json/123/lookuptv.php?id=${idEvent}`)
    .then(r => r.json())
    .then(data => {
      const channels = data.tvtables || [];
      if (channels.length > 0) {
        const list = channels.map(c => c.strChannel).filter(Boolean).join("، ");
        document.getElementById("info-channels").textContent = list;
      }
    })
    .catch(() => {});
}
