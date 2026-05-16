const p = new URLSearchParams(window.location.search);
const matchId = p.get("id") || "";

const iframe = document.getElementById("w-iframe");
const input = document.getElementById("w-input");
const btn = document.getElementById("w-btn");

const DEFAULT = "https://cdn25.yshoot.click/chtv/ch1.php";
function load(u) { if (u) iframe.src = u; }

btn.onclick = () => { const v = input.value.trim(); if (v) load(v); };
input.onkeydown = e => { if (e.key === "Enter") { const v = input.value.trim(); if (v) load(v); } };

/* AUTO-GENERATE STREAM FROM MATCH ID */
if (matchId) {
  const streamUrl = `https://yalla-shoot.world/${matchId}/`;
  input.value = streamUrl;
  load(streamUrl);
} else {
  input.value = DEFAULT;
}

/* FETCH MATCH DETAILS USING THE ID */
if (matchId) {
  (async () => {
    try {
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupevent.php?id=${matchId}`);
      const d = await res.json();
      const e = d.events?.[0];
      if (!e) return;

      document.getElementById("w-home-name").textContent = e.strHomeTeam || "--";
      document.getElementById("w-away-name").textContent = e.strAwayTeam || "--";
      if (e.strHomeTeamBadge) document.getElementById("w-home-badge").src = e.strHomeTeamBadge;
      if (e.strAwayTeamBadge) document.getElementById("w-away-badge").src = e.strAwayTeamBadge;

      const sh = e.intHomeScore ?? "-";
      const sa = e.intAwayScore ?? "-";
      document.getElementById("w-score").textContent = (sh !== "-" && sa !== "-") ? `${sh} - ${sa}` : "VS";

      document.title = `KORAGOAL - ${e.strHomeTeam} vs ${e.strAwayTeam}`;

      let info = "";
      if (e.strLeague) info += `<span>🏆 ${e.strLeague}</span>`;
      if (e.strDate) {
        const dt = new Date(e.strDate + "T" + (e.strTime || "00:00"));
        if (!isNaN(dt.getTime())) {
          info += `<span>📅 ${dt.toLocaleDateString("ar-SA", { weekday:"long", day:"numeric", month:"long" })}</span>`;
          info += `<span>⏰ ${dt.toLocaleTimeString("ar-SA", { hour:"2-digit", minute:"2-digit" })}</span>`;
        }
      }
      document.getElementById("w-info").innerHTML = info;

      try {
        const tv = await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookuptv.php?id=${matchId}`);
        const tvD = await tv.json();
        const ch = tvD.tvtables || [];
        if (ch.length) document.getElementById("w-info").innerHTML += `<span>📺 ${ch.map(c => c.strChannel).filter(Boolean).join("، ")}</span>`;
      } catch {}

      if (e.strVideo) {
        const yt = e.strVideo.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
        if (yt) document.getElementById("w-info").innerHTML += `<span>🎬 <a href="https://www.youtube.com/embed/${yt}" target="_blank">ملخص</a></span>`;
      }
    } catch {}
  })();
}

/* THEME */
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("koragoal-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  document.getElementById("theme-toggle").textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
}
if (localStorage.getItem("koragoal-theme") === "dark") {
  document.body.classList.add("dark-mode");
  document.getElementById("theme-toggle").textContent = "☀️";
}
