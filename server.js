const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require("path");
const bodyParser = require('body-parser');
var robot = require("robotjs");
var clipboardy = import("clipboardy");

// Port of server
const PORT = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.json({
    limit: '500mb'
}));

app.use(bodyParser.urlencoded({
    limit: '500mb',
    parameterLimit: 100000,
    extended: true
}));

app.use(fileUpload());

const { exec } = require('child_process');


const teamAbbreviations = ["ARI", "ATL", "BAL", "BOS", "CHC", "CWS", "CIN", "CLE", "COL", "DET", "HOU", "KC", "LAA", "LAD", "MIA", "MIL", "MIN", "NYM", "NYY", "OAK", "PHI", "PIT", "SD", "SF", "SEA", "STL", "TB", "TEX", "TOR", "WSH"];
const teamHashtags = ["#Dbacks", "#BravesCountry #Braves", "#Birdland #Orioles", "#DirtyWater #RedSox", "#YouHaveToSeeIt #Cubs", "#WhiteSox", "#ATOBTTR #Reds", "#ForTheLand #Guardians", "#Rockies", "#RepDetroit #Tigers", "#Relentless #Astros", "#HEYHEYHEYHEY #Royals", "#RepTheHalo #Angels", "#Dodgers", "#HomeOfBeisbol #Marlins", "#ThisIsMyCrew #Brewers", "#MNTwins", "#LGM #Mets", "#RepBX #Yankees", "#A's", "#RingTheBell #Phillies", "#LetsGoBucs #Pirates", "#Padres #LetsGoPadres", "#SFGiants", "#TridentsUp #Mariners", "#ForTheLou #STLCards #Cardinals", "#RaysUp #Rays", "#StraightUpTX #Rangers", "#TOTHECORE #BlueJays", "#NATITUDE #Nationals"];
console.log(`Abb length: ${teamAbbreviations.length}, Hash length: ${teamHashtags.length}`);

// Upload images for gifs
app.post("/upload", function (req, res) {
    var base64Data = req.body.data.replace(/^data:image\/png;base64,/, "");

    //console.log(req.body.stadium + ", " + String(base64Data).substring(0,100));
    var filePath = __dirname + `/images/${String(req.body.num) + String(req.body.stadium)}.png`;
    
    fs.writeFile(filePath, base64Data, 'base64', function (err) {
        res.end(JSON.stringify({ "recieved": req.body.stadium }))
    });
    
    if (req.body.stadium == "LOL") {
        // Last stadium, so now can generate the gif
        generateGIF(req.body.num, req.body.numBallparks, req.body.des, req.body.teamBatting, req.body.distance, req.body.playId);
    }
});



// Server feedback
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// Gif settings
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');
const width = 1000;
const height = 1000;



// Create the gif
function generateGIF(num, hr, des, hitTeam, distance, id) {
    console.log(hitTeam);

    let hashtag = "#MLB ";
    if(teamAbbreviations.includes(hitTeam)) {
        hashtag += teamHashtags[teamAbbreviations.indexOf(hitTeam)];
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream(`./output/result(${String(hr)})${des}.gif`));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(1250);
    encoder.setQuality(50);

    const imgList = fs.readdirSync('./images/');
    let counter = 0;
    imgList.forEach(async (f, i) => {
        if (f.includes(String(num)) && !f.includes("LOL")) {
            let image = await loadImage(`./images/${f}`);
            let icon = await loadImage(`./team_icons/${f.substring(3, 6)}.svg`);
            //await new Promise(resolve => setTimeout(resolve, 250));
            console.log("Adding frame " + f + ", " + i);
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            //ctx.drawImage(icon, 5, canvas.height - (canvas.height / 8) - 5, canvas.width/8, canvas.height/8);

            let iconAspect = icon.width / icon.height;
            //10/50 = 0.2
            ctx.drawImage(icon, canvas.width - ((canvas.width/7) * iconAspect) - 15, canvas.height - (canvas.height / 7) - 15, (canvas.width/7) * iconAspect, canvas.height/7);
            encoder.addFrame(ctx);
            counter ++;
        }
        if(counter >= 30) {
            console.log(i + ", " + counter);
            encoder.finish();
            console.log("Finishing gif...");
            hashtag += " . ";
            automateUpload(hr, des, hashtag, distance, id);
        }
    });
}



app.get("/test_gif", function (req, res) {
    generateGIF(1000, 17, "Test");
    res.end(JSON.stringify({ "recieved": "All good" }))
});



// Test upload
app.get("/test_mouse", function (req, res) {
    automateUpload("19", "Joey Meneses flies out to left fielder Bryan De La Cruz.");
    res.end(JSON.stringify({ "recieved": "All good" }))
});



// Automate mouse movement for upload
async function automateUpload(hr, des, hashtag, distance, id) {
    console.log("AUTO");
    (await clipboardy).default.writeSync(distance + "'. Home run at " + hr + " stadiums: " + des + " " + hashtag + "Watch a video here: " + "https://baseballsavant.mlb.com/sporty-videos?playId=" + id);

    await new Promise(resolve => setTimeout(resolve, 2000));
    var mouse = robot.getMousePos();
    robot.mouseClick();
    // New Tweet
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (var i = 0; i < 2; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    robot.keyTap("enter");
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Enter file explorer
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (var i = 0; i < 9; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 2200));
    }
    // Add File
    robot.keyTap("down");
    robot.keyTap("up");
    robot.keyTap("enter");
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Type
    for (var i = 0; i < 8; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 750));
    }

    robot.keyToggle("control", "down", []);
    await new Promise(resolve => setTimeout(resolve, 100));
    robot.keyTap("v");
    await new Promise(resolve => setTimeout(resolve, 100));
    robot.keyToggle("control", "up", []);

    await new Promise(resolve => setTimeout(resolve, 3000));
    for (var i = 0; i < 9; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    robot.keyTap("enter");

    await (500);
    gitPush();
}



// Erases previous images & gifs
app.get("/erase", async function (req, res) {
    const imageFolder = './images';
    const outputFolder = './output';

    try {
        fsExtra.emptyDirSync(imageFolder);
    } catch (e) {
        console.error("Error emptying image folder", e);
    }

    try {
        fsExtra.emptyDirSync(outputFolder);
    } catch (e) {
        console.error("Error emptying output folder", e);
    }

    res.end(JSON.stringify({ "recieved": "All good" }));
});



// Force git commit
app.get("/commit", function (req, res) {
    gitPush();

    res.end(JSON.stringify({ "recieved": "All good" }));
});

const deiredValues = ["batter_name", "batter", "des", "events", "game_pk", "hc_x", "hc_y", "hit_distance", "hit_angle", "hit_speed", "inning", "outs", "play_id", "pitcher_name", "pitcher", "team_batting", "team_fielding"];

// Upload statcast data
app.post("/upload-statcast", function (req, res) {
    let data = req.body.data;

    let text = "";

    for (let [key, value] of Object.entries(data)) {
        //console.log(`${key}: ${value}`);
        if (deiredValues.includes(key)) {
            text += `${value}, `;
        }
    }
    text += new Date();

    //console.log(text)

    fs.appendFile("./site/data/2024.csv", text + "\n", function (err) {
        if (err) {
            //console.error("Error writing " + data);
            res.end(JSON.stringify({ "recieved": "Error writing statcast data" }));
        } else {
            //console.log("Wrote " + data);
            res.end(JSON.stringify({ "recieved": "All good" }));
        }
    });
});



function gitPush() {
    var gitScript = exec('gitpush.sh',
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
}




const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}