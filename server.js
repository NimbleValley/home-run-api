const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require("path");
const bodyParser = require('body-parser');
const videoshow = require('videoshow');
var robot = require("robotjs");
var clipboardy = import("clipboardy");

var uploadingGif = false;

var videoOptions = {
    fps: 25,
    loop: 1.15, // seconds
    transition: false,
    transitionDuration: 0, // seconds
    videoBitrate: 128,
    videoCodec: 'libx264',
    size: '420x?',
    audioBitrate: '64k',
    audioChannels: 0,
    format: 'mp4',
    pixelFormat: 'yuv420p'
}

// Port of server
const PORT = process.env.PORT || 8080;
const app = express();

var uploadedFiles = [];
var imageID = 999;

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


const teamAbbreviations = ["AZ", "ATL", "BAL", "BOS", "CHC", "CWS", "CIN", "CLE", "COL", "DET", "HOU", "KC", "LAA", "LAD", "MIA", "MIL", "MIN", "NYM", "NYY", "OAK", "PHI", "PIT", "SD", "SF", "SEA", "STL", "TB", "TEX", "TOR", "WSH"];
const teamHashtags = ["#Dbacks", "#BravesCountry #Braves", "#Birdland #Orioles", "#DirtyWater #RedSox", "#YouHaveToSeeIt #Cubs", "#WhiteSox", "#ATOBTTR #Reds", "#ForTheLand #Guardians", "#Rockies", "#RepDetroit #Tigers", "#Relentless #Astros", "#Royals", "#RepTheHalo #Angels", "#Dodgers", "#HomeOfBeisbol #Marlins", "#ThisIsMyCrew #Brewers", "#MNTwins", "#LGM #Mets", "#RepBX #Yankees", "#A's", "#RingTheBell #Phillies", "#LetsGoBucs #Pirates", "#Padres #LetsGoPadres", "#SFGiants", "#TridentsUp #Mariners", "#ForTheLou #STLCards #Cardinals", "#RaysUp #Rays", "#StraightUpTX #Rangers", "#TOTHECORE #BlueJays", "#NATITUDE #Nationals"];
console.log(`Abb length: ${teamAbbreviations.length}, Hash length: ${teamHashtags.length}`);

// Upload images for gifs
app.post("/upload", function (req, res) {
    var base64Data = req.body.data.replace(/^data:image\/png;base64,/, "");

    //console.log(req.body.stadium + ", " + String(base64Data).substring(0,100));
    console.log(req.body.stadium + ", ");
    let filePath;
    if (parseInt(req.body.num) % 2 == 0) {
        filePath = __dirname + `/images2/${String(req.body.num) + String(req.body.stadium)}.png`;
    } else {
        filePath = __dirname + `/images1/${String(req.body.num) + String(req.body.stadium)}.png`;
    }

    fs.writeFile(filePath, base64Data, 'base64', function (err) {
        res.end(JSON.stringify({ "recieved": req.body.stadium }))
    });

    if (req.body.stadium == "LOL") {
        // Last stadium, so now can generate the gif
        generateGIF(req);
    }
});



// Server feedback
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// Gif settings
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');
const width = 1100;
const height = 1000;
const canvasHeight = 1100;



// Create the gif
function generateGIF(req) {


    console.log(req.body.home_team);
    var number = imageID;

    let hashtag = "#MLB ";
    if (teamAbbreviations.includes(req.body.teamBatting)) {
        hashtag += teamHashtags[teamAbbreviations.indexOf(req.body.teamBatting)];
    }

    const canvas = createCanvas(width, canvasHeight);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(width, canvasHeight);
    encoder.createReadStream().pipe(fs.createWriteStream(`./output/result(${String(req.body.numBallparks)})${req.body.des}.gif`));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(1050);
    encoder.setQuality(8);

    uploadedFiles.push(`result(${String(req.body.numBallparks)})${req.body.des}.gif`);
    if (uploadedFiles.length > 10) {
        try {
            fs.unlinkSync(`./output/${uploadedFiles[0]}`);
            uploadedFiles.splice(0, 1)
            //file removed
        } catch (err) {
            console.error(err)
        }
    }

    var imgDir;
    if (number % 2 == 0) {
        imgDir = "./images2/";
    } else {
        imgDir = "./images1/";
    }
    const imgList = fs.readdirSync(imgDir);
    console.error(imgDir);
    console.error(number);
    let counter = 0;
    let addedToGif = [];

    imgList.forEach(async (f, i) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (f.includes(String(number)) && !f.includes("LOL")) {
            if (req.body.home_team.localeCompare(f.substring(3, 6)) != 1) {
                let image = await loadImage(`${imgDir}${f}`);
                let icon = await loadImage(`./team_icons/${f.substring(3, 6)}.svg`);
                //await new Promise(resolve => setTimeout(resolve, 250));
                console.log("Adding frame " + f + ", " + addedToGif.length);
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, height);

                if (req.body.home_team == f.substring(3, 6)) {
                    ctx.font = "72px Arial";
                    ctx.fillStyle = "red";
                    ctx.fillText("Hit here.", 15, height - 15);
                }

                ctx.font = "65px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(`📐 ${req.body.hit_angle}° | 💨 ${req.body.hit_speed} MPH | 📏 ${req.body.distance}'`, 15, canvas.height - 25);
                //ctx.drawImage(icon, 5, canvas.height - (canvas.height / 8) - 5, canvas.width/8, canvas.height/8);

                let iconAspect = icon.width / icon.height;
                //10/50 = 0.2
                ctx.drawImage(icon, canvas.width - ((canvas.width / 7) * iconAspect) - 15, height - (height / 7) - 15, (canvas.width / 7) * iconAspect, height / 7);
                encoder.addFrame(ctx);
                addedToGif.push(f.substring(3, 6));
            }

            counter++;
        }
        if (counter >= 32) {
            imgList.forEach(async (f, i) => {
                if (f.includes(String(number)) && !f.includes("LOL") && addedToGif.indexOf(f.substring(3, 6)) == -1) {
                    let image = await loadImage(`${imgDir}${f}`);
                    let icon = await loadImage(`./team_icons/${f.substring(3, 6)}.svg`);
                    //await new Promise(resolve => setTimeout(resolve, 250));
                    console.log("Adding frame " + f + ", " + addedToGif.length);
                    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, height);
                    //ctx.drawImage(icon, 5, canvas.height - (canvas.height / 8) - 5, canvas.width/8, canvas.height/8);

                    ctx.font = "65px Arial";
                    ctx.fillStyle = "white";
                    ctx.fillText(`📐 ${req.body.hit_angle}° | 💨 ${req.body.hit_speed} MPH | 📏 ${req.body.distance}'`, 15, canvas.height - 25);

                    let iconAspect = icon.width / icon.height;
                    //10/50 = 0.2
                    ctx.drawImage(icon, canvas.width - ((canvas.width / 7) * iconAspect) - 15, height - (height / 7) - 15, (canvas.width / 7) * iconAspect, height / 7);
                    encoder.addFrame(ctx);

                    addedToGif.push(f.substring(3, 6));
                }
                if (addedToGif.length >= 32 && !uploadingGif) {
                    console.log(i + ", " + counter);
                    encoder.finish();
                    console.log("Finishing gif...");
                    hashtag += " . ";
                    automateUpload(req, hashtag);
                }
            });
        }
    });
}

function generateVideo(num, hr, des, hitTeam, distance, id) {
    var number = imageID;

    let hashtag = "#MLB ";
    if (teamAbbreviations.includes(hitTeam)) {
        hashtag += teamHashtags[teamAbbreviations.indexOf(hitTeam)];
    };

    uploadedFiles.push(`result(${String(hr)})${des}.gif`);
    if (uploadedFiles.length > 10) {
        try {
            fs.unlinkSync(`./output/${uploadedFiles[0]}`);
            uploadedFiles.splice(0, 1)
            //file removed
        } catch (err) {
            console.error(err)
        }
    }

    let imgDir;
    if (number % 2 == 0) {
        imgDir = "./images2/";
    } else {
        imgDir = "./images1/";
    }
    const imgList = fs.readdirSync(imgDir);
    console.log(imgList);
    let imagesToUse = [];
    imgList.forEach(async (f, i) => {
        if (f.includes(String(number)) && !f.includes("LOL")) {
            //console.log(`${imgDir}${f}`);
            //let image = await loadImage(`${imgDir}${f}`);
            imagesToUse.push(`${imgDir}${f}`);
        }
    });


    while (imagesToUse.length < 30) {
        //console.log(imagesToUse);
        console.log("Wait");
        // Waiting haha
    }

    console.log("Proceeding...");

    videoshow(imagesToUse, videoOptions)
        .save(`./output/result(${String(hr)})${des}.mp4`)
        .on('start', function (command) {
            console.log('ffmpeg process started:', command);
        })
        .on('error', function (err, stdout, stderr) {
            console.error('Error:', err);
            console.error('ffmpeg stderr:', stderr);
        })
        .on('end', function (output) {
            console.error('Video created in:', output);
            hashtag += " . ";
            automateUpload(hr, des, hashtag, distance, id);
        });
}



app.get("/test_gif", function (req, res) {
    generateGIF(1000, 17, "Test");
    res.end(JSON.stringify({ "recieved": "All good" }))
});


app.get("/test_video", function (req, res) {
    imageID = 999;
    generateVideo(999, 17, "Test video", "Mil", 1000, 999);
    res.end(JSON.stringify({ "recieved": "All good" }))
});



// Test upload
app.get("/test_auto", function (req, res) {
    automateUpload("19", "Joey Meneses flies out to left fielder Bryan De La Cruz.");
    res.end(JSON.stringify({ "recieved": "All good" }))
});



// Automate mouse movement for upload
async function automateUpload(req, hashtag) {
    uploadingGif = true;

    robot.keyTap("escape");
    robot.keyTap("escape");
    imageID--;
    console.log("AUTO");
    let outputText = "";

    if (req.body.homerun == "false" || !JSON.parse(req.body.homerun)) {
        if (req.body.numBallparks == 29) {
            outputText = "🚨🚨UNICORN OUT🚨🚨" + "\n" + req.body.distance + "'. Hit at " + req.body.home_team + ". Home run at " + req.body.numBallparks + " stadium: " + req.body.des + " " + hashtag + "Watch a video here: " + "https://baseballsavant.mlb.com/sporty-videos?playId=" + req.body.playId;
        } else {
            outputText = req.body.distance + "'. Hit at " + req.body.home_team + ".  Home run at " + req.body.numBallparks + " stadiums: " + req.body.des + " " + hashtag + "Watch a video here: " + "https://baseballsavant.mlb.com/sporty-videos?playId=" + req.body.playId;
        }
    } else {
        if (req.body.numBallparks == 1) {
            outputText = "🚨🚨UNICORN HOME RUN🚨🚨" + "\n" + req.body.distance + "'. Hit at " + req.body.home_team + ".  Home run at " + req.body.numBallparks + " stadium: " + req.body.des + " " + hashtag + "Watch a video here: " + "https://baseballsavant.mlb.com/sporty-videos?playId=" + req.body.playId;
        } else if (req.body.numBallparks == 30) {
            outputText = req.body.distance + "'. Hit at " + req.body.home_team + ".  No doubter, home run at all 30 stadiums: " + req.body.des + " " + hashtag + "Watch a video here: " + "https://baseballsavant.mlb.com/sporty-videos?playId=" + req.body.playId;
        } else {
            outputText = req.body.distance + "'. Hit at " + req.body.home_team + ".  Home run at " + req.body.numBallparks + " stadiums: " + req.body.des + " " + hashtag + "Watch a video here: " + "https://baseballsavant.mlb.com/sporty-videos?playId=" + req.body.playId;
        }

        if (req.body.team_fielding == "NYM") {
            outputText = "@NjTank99 " + outputText;
        }
    }

    outputText = outputText.substring(0, 279);
    outputText = outputText.replace("José Ramírez", "Barry Bonds");

    (await clipboardy).default.writeSync(outputText);

    await new Promise(resolve => setTimeout(resolve, 2000));
    var mouse = robot.getMousePos();
    robot.mouseClick();
    // New Tweet
    await new Promise(resolve => setTimeout(resolve, 2000));
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
    for (let i = 0; i < 10; i++)
        robot.keyTap("up");
    robot.keyTap("enter");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // TODO only for videos
    for (var i = 0; i < 9; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 2200));
    }
    robot.keyTap("down");
    for (let i = 0; i < 10; i++)
        robot.keyTap("up");
    robot.keyTap("enter");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Type
    for (var i = 0; i < 9; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 750));
    }

    robot.keyToggle("control", "down", []);
    await new Promise(resolve => setTimeout(resolve, 100));
    robot.keyTap("v");
    await new Promise(resolve => setTimeout(resolve, 100));
    robot.keyToggle("control", "up", []);

    // 9 for gif, 16 for video (+2 for drafts)
    await new Promise(resolve => setTimeout(resolve, 3000));
    for (var i = 0; i < 9; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    robot.keyTap("enter");

    // Drafts time
    /*await new Promise(resolve => setTimeout(resolve, 3000));
    for (var i = 0; i < 4; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    robot.keyTap("enter");

    await new Promise(resolve => setTimeout(resolve, 5500));
    for (var i = 0; i < 16; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    robot.keyTap("enter");*/

    await (500);

    uploadingGif = false;
    //gitPush();
}



// Erases previous images & gifs
app.get("/erase", async function (req, res) {
    const imageFolder1 = './images1';
    const imageFolder2 = './images2';
    const outputFolder = './output';

    try {
        fsExtra.emptyDirSync(imageFolder1);
        fsExtra.emptyDirSync(imageFolder2);
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

const imageFolder1 = './images1';
const imageFolder2 = './images2';
const outputFolder = './output';

try {
    fsExtra.emptyDirSync(imageFolder1);
    fsExtra.emptyDirSync(imageFolder2);
} catch (e) {
    console.error("Error emptying image folder", e);
}

try {
    fsExtra.emptyDirSync(outputFolder);
} catch (e) {
    console.error("Error emptying output folder", e);
}