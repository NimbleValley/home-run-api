const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require("path");
const bodyParser = require('body-parser');
const clipboardy = require("clipboardy");
var robot = require("robotjs");

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



// Upload images for gifs
app.post("/upload", function (req, res) {
    var base64Data = req.body.data.replace(/^data:image\/png;base64,/, "");

    console.log(req.body.stadium);
    var filePath = __dirname + `/images/${String(req.body.num) + String(req.body.stadium)}.png`;

    if (req.body.stadium == "NYY") {
        // Last stadium, so now can generate the gif
        generateGIF(req.body.num, req.body.numBallparks, req.body.des)
    }

    fs.writeFile(filePath, base64Data, 'base64', function (err) {
        res.end(JSON.stringify({ "recieved": req.body.stadium }))
    });
});



// Server feedback
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// Gif settings
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');
const width = 1000;
const height = 1000;



// Create the gif
function generateGIF(num, hr, des) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream(`./output/result(${String(hr)})${des}.gif`));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(1250);
    encoder.setQuality(10);

    const imgList = fs.readdirSync('./images/');
    imgList.forEach(async (f, i) => {
        const image = await loadImage(`./images/${f}`);
        if (f.includes(String(num))) {
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            encoder.addFrame(ctx);
        }
        if (i === imgList.length - 1) {
            encoder.finish();
            automateUpload(hr, des)
        }
    });
}



// Test upload
app.get("/test_mouse", function (req, res) {
    automateUpload("19", "Joey Meneses flies out to left fielder Bryan De La Cruz.");
    res.end(JSON.stringify({ "recieved": "All good" }))
});



// Automate mouse movement for upload
async function automateUpload(hr, des) {
    console.log("AUTO")
    clipboardy.writeSync("Home run at " + hr + " stadiums: " + des);

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
    for (var i = 0; i < 7; i++) {
        robot.keyTap("tab");
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    robot.keyTap("enter");
}



// Erases previous images & gifs
app.get("/erase", function (req, res) {
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