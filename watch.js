const params = new URLSearchParams(window.location.search);

const home = params.get("home") || "--";
const away = params.get("away") || "--";
const homeBadge = params.get("homeBadge") || "";
const awayBadge = params.get("awayBadge") || "";
const scoreHome = params.get("scoreHome") || "-";
const scoreAway = params.get("scoreAway") || "-";
const league = params.get("league") || "";
const idEvent = params.get("idEvent") || "";

document.getElementById("watch-home-name").textContent = home;
document.getElementById("watch-away-name").textContent = away;
document.getElementById("watch-home-badge").src = homeBadge;
document.getElementById("watch-away-badge").src = awayBadge;
const matchStarted = scoreHome !== "-" && scoreAway !== "-" && scoreHome !== "" && scoreAway !== "";
document.getElementById("watch-score").textContent = matchStarted ? `${scoreHome} - ${scoreAway}` : "VS";

document.title = `KORAGOAL - ${home} vs ${away}`;

/* VIDEO PLAYER */
const video = document.getElementById("stream-player");
const urlInput = document.getElementById("stream-url-input");
const loadBtn = document.getElementById("load-stream-btn");

let hls = null;

function loadStream(url) {
  if (!url) return;
  if (hls) { hls.destroy(); hls = null; }
  if (url.includes(".m3u8")) {
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(() => {});
    }
  } else {
    video.src = url;
    video.play().catch(() => {});
  }
}

const M3U_URL = "https://iptv-org.github.io/iptv/index.m3u";

async function fetchM3U() {
  try {
    const res = await fetch(M3U_URL);
    const text = await res.text();
    const lines = text.split("\n");
    const sportsUrls = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('group-title="Sports"')) {
        const urlLine = lines[i + 1];
        if (urlLine && urlLine.startsWith("http")) {
          sportsUrls.push(urlLine.trim());
        }
      }
    }
    if (sportsUrls.length > 0) {
      const chosen = sportsUrls[Math.floor(Math.random() * Math.min(sportsUrls.length, 10))];
      urlInput.value = chosen;
      loadStream(chosen);
    }
  } catch {}
}

const initialUrl = params.get("stream") || "";
if (initialUrl) {
  urlInput.value = initialUrl;
  loadStream(initialUrl);
} else {
  fetchM3U();
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
        if (event.strDate) {
          const d = new Date(event.strDate + "T" + event.strTime);
          if (!isNaN(d.getTime())) {
            document.getElementById("info-time").textContent = d.toLocaleTimeString("ar-SA", {
              hour: "2-digit", minute: "2-digit"
            });
          } else {
            const [h, m] = event.strTime.split(":");
            document.getElementById("info-time").textContent = `${parseInt(h)}:${m}`;
          }
        } else {
          const [h, m] = event.strTime.split(":");
          document.getElementById("info-time").textContent = `${parseInt(h)}:${m}`;
        }
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
