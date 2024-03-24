const startDateInput = document.getElementById("start-date-input");
const endDateInput = document.getElementById("end-date-input");

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

const minDistanceInput = document.getElementById("min-distance-input");
const maxDistanceInput = document.getElementById("max-distance-input");

const awayTeamSelect = document.getElementById("away-team-select");
const homeTeamSelect = document.getElementById("home-team-select");

const searchButton = document.getElementById("home-run-search-button");
searchButton.addEventListener("click", search);

function search() {
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

    let minDistance = parseInt(minDistanceInput).value;
    let maxDistance = parseInt(maxDistanceInput).value;
    if (minDistance > maxDistance) {
        let tempYear = minDistance;
        minDistance = maxDistance;
        maxDistance = tempYear;
    }

    playerId = playerRows[parseInt(playerSelect.value)][10];

    for (let year = startYear; year <= endYear; year++) {
        console.log(year);
        Papa.parse(`./data/${year}.csv`, {
            download: true,
            complete: function (results) {
                data = results.data;

                for(let i = 1; i < data.length; i ++) {
                    if(data[i][6] != playerId && playerId != -1) {
                        continue;
                    }

                    if(parseInt(data[i][52]) < minDistance || parseInt(data[i][52]) > maxDistance) {
                        continue;
                    }

                    if(parseInt(awayTeamSelect.value) != 31 && awayTeamSelect.value != data[i][20]) {
                        continue;
                    }
                    
                    if(parseInt(homeTeamSelect.value) != 31 && homeTeamSelect.value != data[i][19]) {
                        continue;
                    }

                }
            }
        });
    }
}