const startDateInput = document.getElementById("start-date-input");
const endDateInput = document.getElementById("end-date-input");

startDateInput.parentElement.style.display = "none";
endDateInput.parentElement.style.display = "none";

startDateInput.valueAsDate = new Date(2018, 0, 7);
endDateInput.valueAsDate = new Date();

const playerSelect = document.getElementById("player-select");

var playerRows = [];
Papa.parse("player-map.csv", {
    download: true,
    complete: function (results) {
        playerSelect.replaceChildren();

        let tempAny = document.createElement("option");
        tempAny.value = "void";
        tempAny.innerText = "Any";
        playerSelect.append(tempAny);

        playerRows = results.data;
        for (var i = 1; i < results.data.length; i++) {
            var temp = document.createElement("option");
            temp.value = i;
            temp.innerText = results.data[i][1];
            playerSelect.append(temp);
        }
    }
});

const playerSearchTextInput = document.getElementById("player-name-text-input");
playerSearchTextInput.addEventListener("change", function () {
    playerSelect.replaceChildren();

    let tempAny = document.createElement("option");
    tempAny.value = "void";
    tempAny.innerText = "Any";
    playerSelect.append(tempAny);

    for (var i = 1; i < playerRows.length; i++) {
        if (playerRows[i][1].toLowerCase().includes(playerSearchTextInput.value.toLowerCase())) {
            let temp = document.createElement("option");
            temp.value = i;
            temp.innerText = playerRows[i][1];
            playerSelect.append(temp);
        }
    }
});

const yearSelect = document.getElementById("year-select");
yearSelect.addEventListener("click", function () {
    let selectedYear = parseInt(yearSelect.value);
    if (selectedYear == 1) {
        startDateInput.parentElement.style.display = "flex";
        endDateInput.parentElement.style.display = "flex";
        return;
    } else {
        startDateInput.parentElement.style.display = "none";
        endDateInput.parentElement.style.display = "none";
    }

    if (selectedYear == 0) {
        startDateInput.valueAsDate = new Date(2018, 0, 7);
        endDateInput.valueAsDate = new Date();
        return;
    }

    startDateInput.valueAsDate = new Date(selectedYear, 0, 7);
    endDateInput.valueAsDate = new Date(selectedYear, 11, 7);
});

const minDistanceInput = document.getElementById("min-distance-input");
const maxDistanceInput = document.getElementById("max-distance-input");

const awayTeamSelect = document.getElementById("away-team-select");
const homeTeamSelect = document.getElementById("home-team-select");

const outputContainer = document.getElementById("home-run-finder-output-container");

const searchButton = document.getElementById("home-run-search-button");
searchButton.addEventListener("click", search);

async function search() {
    outputContainer.replaceChildren();

    let startYear = parseInt(startDateInput.valueAsDate.getFullYear());
    let endYear = parseInt(endDateInput.valueAsDate.getFullYear());

    if (startYear > endYear) {
        let tempYear = startYear;
        startYear = endYear;
        endYear = tempYear;
    }

    if (startYear < 2018) {
        startYear = 2018;
    }

    if (endYear > 2024) {
        endYear = 2024
    }

    let minDistance = parseInt(minDistanceInput.value);
    let maxDistance = parseInt(maxDistanceInput.value);
    if (minDistance > maxDistance) {
        let tempYear = minDistance;
        minDistance = maxDistance;
        maxDistance = tempYear;
    }

    if (isNaN(parseInt(playerSelect.value))) {
        playerId = -1;
    } else {
        playerId = playerRows[parseInt(playerSelect.value)][10];
    }

    for (let year = startYear; year <= endYear; year++) {
        console.log(year);
        await Papa.parse(`./data/${year}.csv`, {
            download: true,
            complete: function (results) {
                data = results.data;

                for (let i = 1; i < data.length; i++) {
                    if (year != 2024) {
                        if (data[i][8] != "home_run") {
                            continue;
                        }

                        if (data[i][6] != playerId && playerId != -1) {
                            continue;
                        }

                        if (parseInt(data[i][52]) < minDistance || parseInt(data[i][52]) > maxDistance) {
                            continue;
                        }

                        if (parseInt(awayTeamSelect.value) != 31 && awayTeamSelect.value != data[i][20]) {
                            continue;
                        }

                        if (parseInt(homeTeamSelect.value) != 31 && homeTeamSelect.value != data[i][19]) {
                            continue;
                        }
                    } else {
                        console.log(data[i][18])
                        if (data[i][3] != " Home Run") {
                            continue;
                        }

                        if (data[i][0] != playerId && playerId != -1) {
                            continue;
                        }

                        if (parseInt(data[i][8]) < minDistance || parseInt(data[i][8]) > maxDistance) {
                            continue;
                        }

                        if (parseInt(awayTeamSelect.value) != 31 && awayTeamSelect.value != data[i][16]) {
                            continue;
                        }

                        if (parseInt(homeTeamSelect.value) != 31 && homeTeamSelect.value != data[i][15]) {
                            continue;
                        }
                    }

                    let tempContainer = document.createElement("div");
                    tempContainer.className = "home-run-result-container";
                    tempContainer.innerText = `${data[i][1]} - ${Math.round(parseFloat(data[i][8]))}' - ${data[i][16]} vs ${data[i][15]}: ${data[i][2]}`;

                    outputContainer.appendChild(tempContainer);
                }
            }
        });
    }
}