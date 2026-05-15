async function loadMatches() {

  const today = new Date().toISOString().split("T")[0];

  const url =
    `https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${today}&s=Soccer`;

  const response = await fetch(url);

  const data = await response.json();

  const container = document.getElementById("matches-container");

  container.innerHTML = "";

  if (!data.events) {
    container.innerHTML = "<p>لا توجد مباريات اليوم</p>";
    return;
  }

  data.events.forEach(match => {

    const home = match.strHomeTeam;
    const away = match.strAwayTeam;

    const homeBadge = match.strHomeTeamBadge || "";
    const awayBadge = match.strAwayTeamBadge || "";

    const scoreHome = match.intHomeScore ?? "-";
    const scoreAway = match.intAwayScore ?? "-";

    const time = match.strTime || "لاحقاً";

    container.innerHTML += `

      <div class="match-row">

        <div class="team">
          <img class="team-logo" src="${homeBadge}">
          <span class="team-name">${home}</span>
        </div>

        <div class="score-box">
          <div class="score">${scoreHome} - ${scoreAway}</div>
          <div class="match-status upcoming">${time}</div>
        </div>

        <div class="team right">
          <img class="team-logo" src="${awayBadge}">
          <span class="team-name">${away}</span>
        </div>

      </div>

    `;
  });

}

loadMatches();