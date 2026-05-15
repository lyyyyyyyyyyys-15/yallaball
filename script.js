const container = document.getElementById("matches-container");

let allMatches = [];

let currentLeague = "all";

function formatTime(timeString){

  if(!timeString) return "لاحقاً";

  const [hours, minutes] = timeString.split(":");

  const hour = parseInt(hours);

  return `${hour}:${minutes}`;

}

  async function loadMatches(dayOffset = 0)
  
{
  container.innerHTML = "جاري تحميل المباريات...";

  const date = new Date();

  date.setDate(date.getDate() + dayOffset);

  const formattedDate = date.toISOString().split("T")[0];

  const url =
  `https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${formattedDate}&s=Soccer`;

  const response = await fetch(url);

  const data = await response.json();

  allMatches = data.events || [];

  renderMatches(allMatches, false);

}

function renderMatches(matches, onlyLive = false) {

  container.innerHTML = "";

  let filteredMatches = matches;

  if(currentLeague !== "all"){

  filteredMatches = filteredMatches.filter(match => {

    return (
      match.strLeague === currentLeague
    );

  });

}

  if (onlyLive) {

    filteredMatches = filteredMatches.filter(match => {

      return (
        match.strStatus &&
        (
          match.strStatus.includes("Live") ||
          match.strStatus.includes("In Progress")
        )
      );

    });

  }

  if (filteredMatches.length === 0) {

    container.innerHTML = `
    
      <div class="no-matches">
        لا توجد مباريات حالياً
      </div>
    
    `;

    return;
  }

  filteredMatches.forEach(match => {

    const home = match.strHomeTeam || "Home";
    const away = match.strAwayTeam || "Away";

    const homeBadge =
      match.strHomeTeamBadge ||
      "https://via.placeholder.com/40";

    const awayBadge =
      match.strAwayTeamBadge ||
      "https://via.placeholder.com/40";

    const scoreHome =
      match.intHomeScore ?? "-";

    const scoreAway =
      match.intAwayScore ?? "-";

    const time =
      match.strTime || "لاحقاً";

    const status =
      match.strStatus || "";

    const liveBadge =
      status.includes("Live") ||
      status.includes("In Progress")
      ? `<div class="live-small">LIVE</div>`
      : "";

    const streamUrl = match.strVideo || "";

    const params = new URLSearchParams({
      home, away,
      homeBadge, awayBadge,
      scoreHome, scoreAway,
      league: match.strLeague || "",
      stream: streamUrl
    });

    container.innerHTML += `

      <div class="match-row" onclick="location.href='watch.html?${params.toString()}'">

        <div class="team">
          <img class="team-logo" src="${homeBadge}">
          <span class="team-name">${home}</span>
        </div>

        <div class="score-box">

        <div class="match-time">
            ${formatTime(time)}
        </div>

        <div class="timezone">
            UTC+1
        </div>

          ${liveBadge}

        </div>

        <div class="team right">
          <span class="team-name">${away}</span>
          <img class="team-logo" src="${awayBadge}">
        </div>

      </div>

    `;
  });

}

/* BUTTONS */

document.addEventListener("click", e => {

  if (e.target.classList.contains("filter-btn")) {

    document
      .querySelectorAll(".filter-btn")
      .forEach(btn => btn.classList.remove("active"));

    e.target.classList.add("active");

    const text = e.target.textContent.trim();

    if (text === "الكل") {
      loadMatches(0);
    }

    if (text === "مباشر") {
      renderMatches(allMatches, true);
    }

    if (text === "اليوم") {
      loadMatches(0);
    }

    if (text === "غداً") {
      loadMatches(1);
    }

  }

});

document.addEventListener("click", e => {

  if(e.target.classList.contains("league-btn")){

    document
      .querySelectorAll(".league-btn")
      .forEach(btn => btn.classList.remove("active"));

    e.target.classList.add("active");

    const league =
      e.target.dataset.league;

    currentLeague = league;

renderMatches(allMatches);

  }

});
loadMatches(0);
