import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js'

const searchParameters = document.getElementById("search-parameters");
searchParameters.style.display = "none";
const searchResults = document.getElementById("search-results");
searchResults.style.display = "none";
const loadingMessage = document.getElementById("loading-message");
loadingMessage.style.display = "flex";

const uploadHelp = document.getElementById("upload-help");
uploadHelp.style.display = "none";

/*     DATA */
var data;
var dataCells = [];

const scene = new THREE.Scene();

const background = new THREE.Color(0x9dbef5);
scene.background = (background);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.setZ(30);

var playerId;
var year;
var playerTeam;

const playerTextSearch = document.getElementById("player-text-search");
playerTextSearch.addEventListener("change", updatePlayerSelect);

const playerSelectSearch = document.getElementById("player-select-search");
var playerRows;;

//HDRI
new RGBELoader()
  .load('textures/syferfontein_0d_clear_puresky_4k.hdr', function (texture) {

    texture.mapping = THREE.EquirectangularReflectionMapping;

    //scene.background = texture;
    scene.background = texture;

    setUpStadium();
  });

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1;

renderer.render(scene, camera);


//Orbit Control
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();


const ballGeometry = new THREE.SphereGeometry(0.1, 32, 16, 100);
const material = new THREE.MeshBasicMaterial({ color: 0xFF6347, wireframe: false });
const ball = new THREE.Mesh(ballGeometry, material);

scene.add(ball);

const loader = new GLTFLoader();

var abb = "AZ";

var stadium;

function setUpStadium() {
  loader.load(`models/Stadium_${abb}.glb`, function (model) {
    stadium = model.scene;
    stadium.castShadow = true;
    stadium.receiveShadow = true;
    stadium.name = "stadium-mlb";
    scene.add(stadium);
    renderer.render(scene, camera);
    loadingMessage.style.display = "none";
  });
}

const light = new THREE.AmbientLight(0xffffff, 12);
light.position.y = 10;

scene.add(light);

//1 foot is 19.4 units in 3.js
const SCALE = 19.4 / 90;
const DISTANCE_SCALE = 182 / 128;

//Distance & Height when batted
var initialHeight = 2.23;
var hitDistance = 383 * DISTANCE_SCALE;

const gravity = 32.174 * SCALE;

//Radians ofc =D
var launch_angle = 0.4188790;

//Feet per second
var launch_speed_fts = 100.2 * 5280 / 3600;

var spray;


//Mystery numbers haha
var hc_x = -93.7124460;
var hc_y = 374.30074;

/*var curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0)
]);*/

var stadiumIds = [
  /*Ari*/ "15%7C",
  /*Atl*/ "4705%7C",
  /*Bal*/ "2%7C",
  /*Bos*/ "3%7C",
  /*Chc*/ "17%7C",
  /*Cin*/ "2602%7C",
  /*Cle*/ "5%7C",
  /*Col*/ "19%7C",
  /*Cws*/ "4%7C",
  /*Det*/ "2394%7C",
  /*Hou*/ "2392%7C",
  /*Kc*/ "7%7C",
  /*Laa*/ "1%7C",
  /*Lad*/ "22%7C",
  /*Mia*/ "4169%7C",
  /*Mil*/ "32%7C",
  /*Min*/ "3312%7C",
  /*Nym*/ "3289%7C",
  /*Nyy*/ "3313%7C",
  /*Oak*/ "10%7C",
  /*Phi*/ "2681%7C",
  /*Pit*/ "31%7C",
  /*Sd*/ "2680%7C",
  /*Sea*/ "680%7C",
  /*Sf*/ "2395%7C",
  /*Stl*/ "2889%7C",
  /*Tb*/ "12%7C",
  /*Tex*/ "5325%7C",
  /*Tor*/ "14%7C",
  /*Wsh*/ "3309%7C",
  /*None*/ ""
];

Papa.parse("player-map.csv", {
  download: true,
  complete: function (results) {
    playerRows = results.data;
    for (var i = 1; i < results.data.length; i++) {
      var temp = document.createElement("option");
      temp.value = i;
      temp.innerText = results.data[i][1];
      playerSelectSearch.append(temp);
    }
  }
});

function getHit() {
  var hc_x_ = hc_x - 125.42;
  var hc_y_ = 198.27 - hc_y;
  var launch_speed_y = launch_speed_fts * Math.sin(launch_angle) * SCALE;

  spray = Math.atan(hc_x_ / hc_y_) * -180 / Math.PI * 1;

  if (spray > 44.75) {
    spray = 44.75;
  } else if (spray < -44.75) {
    spray = -44.75;
  }

  console.log("Spray Angle: " + spray);
  //Total Hang Time
  var total_time = (launch_speed_y + Math.sqrt(Math.pow(launch_speed_y, 2) + (2 * gravity * initialHeight))) / gravity;

  ball.position.y = initialHeight * SCALE;

  var landingGeometry = new THREE.SphereGeometry(0.25, 32, 16, 100);
  const landing = new THREE.Mesh(landingGeometry, material);

  landing.name = "landing";
  scene.add(landing);

  landing.position.z = Math.cos(convert(spray)) * hitDistance * SCALE * -1;
  landing.position.y = 0;
  landing.position.x = Math.sin(convert(spray)) * hitDistance * SCALE * -1;

  var maxHeight = (-16.085 * Math.pow(total_time, 2)) + (launch_speed_fts * Math.sin(launch_angle) * (total_time / 2)) + (initialHeight * 2);
  console.log("Maximum Height: " + maxHeight);

  for (let i = -0.1; i <= 0.1; i += 0.01) {
    let bezier = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(i, 0, 0),
      new THREE.Vector3(landing.position.x / 2 + i, maxHeight * SCALE * -1 * DISTANCE_SCALE, landing.position.z / 2),
      new THREE.Vector3(landing.position.x + i, landing.position.y, landing.position.z)
    );

    /*curve.points.push(new THREE.Vector3(landing.position.x / 2, 100 * SCALE, landing.position.z / 2));
    curve.points.push(new THREE.Vector3(landing.position.x, landing.position.y, landing.position.z));*/

    let points = bezier.getPoints(50);
    let curveGeometry = new THREE.BufferGeometry().setFromPoints(points);

    let curveMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 100,
      linecap: 'round', //ignored by WebGLRenderer
      linejoin: 'round' //ignored by WebGLRenderer
    });

    let curveObject = new THREE.Line(curveGeometry, curveMaterial);
    curveObject.name = "curve" + i;
    scene.add(curveObject);
  }
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();

function convert(deg) {
  return deg * (Math.PI / 180);
}

//New Stadium
function swapStadium(manual) {
  loadingMessage.style.display = "flex";

  if (manual) {
    abb = document.getElementById("stadium-select").value;
  }

  document.getElementById("stadium-select").value = abb;

  var selectedObject = scene.getObjectByName("stadium-mlb");
  scene.remove(selectedObject);

  loader.load(`models/Stadium_${abb}.glb`, function (model) {
    stadium = model.scene;
    stadium.name = "stadium-mlb"
    scene.add(stadium);
    renderer.render(scene, camera);
    loadingMessage.style.display = "none";
  });
}

//Stadium Select
document.getElementById("stadium-select").addEventListener("change", function () {
  swapStadium(true);
});

//New Hit Button
document.getElementById("new-hit").addEventListener("click", function () {
  searchParameters.style.display = "flex";
});

function statcast_search() {

  //Remove old curve & Landing
  for (let i = -0.1; i <= 0.1; i += 0.01) {
    scene.remove(scene.getObjectByName("curve" + i));
  }
  scene.remove(scene.getObjectByName("landing"));

  searchParameters.style.display = "none";
  console.log("Fetching data...");

  year = parseInt(document.getElementById("year-select-search").value);

  playerId = "";
  if (playerSelectSearch.value != "void") {
    playerId = playerRows[parseInt(playerSelectSearch.value)][10];
  } else {
    alert("Currently you must put a player's name in, will be updated in the future.");
    console.error("It's not recommended to leave player slot blank, it slows search down :(");
  }

  dataCells = [];

  searchResults.innerHTML = "";
  var title = document.createElement("h1");
  title.innerText = "Search Results";
  searchResults.appendChild(title);

  parseCSV(`./data/${year}.csv`);
}

//parseCSV("./data/2023.csv");

function parseCSV(url) {
  console.log(url);

  uploadHelp.style.display = "none";
  Papa.parse(url, {
    download: true,
    complete: function (results) {
      let outcomeValue = document.getElementById("outcome-select-search").value;
      let selectedStadium = "";
      if (document.getElementById("stadium-select-search").value != "void") {
        selectedStadium = stadiumIds[parseInt(document.getElementById("stadium-select-search").value)];
      }

      data = results;

      //console.log(data.data[1]);
      searchResults.style.display = "flex";
      let dataCount = 0;

      for (var i = 1; i < data.data.length; i++) {
        if ((outcomeValue != "field_out" && data.data[i][8] == "field_out") || (outcomeValue == "field_out" && data.data[i][8] != "field_out")) {
          continue;
        }

        if (data.data[i][19] != document.getElementById("stadium-select-search").value && document.getElementById("stadium-select-search").value != "void") {
          continue;
        }

        var temp = document.createElement("div");
        temp.className = "result-cell";
        var hitResult = "Out";
        switch (data.data[i][8]) {
          case "home_run":
            hitResult = "HR";
            break;
          case "single":
            hitResult = "1B";
            break;
          case "double":
            hitResult = "2B";
            break;
          case "triple":
            hitResult = "3B";
            break;
          default:
            break;
        }
        temp.innerText = data.data[i][1] + " | " + hitResult + " | " + data.data[i][15] + " | " + results.data[i][20] + " at " + results.data[i][19] + " | " + results.data[i][52] + "ft";
        temp.id = i;
        temp.onclick = function () {
          searchResults.style.display = "none";
          selectIndex(data, this.id);
        }

        // Filter
        if (data.data[i][6] == playerId || playerId == -1) {
          console.log("Yes")
          dataCount++;
          searchResults.appendChild(temp);
        }
      }
      if (dataCount < 1) {
        alert("No data Found");
        searchResults.style.display = "none";
      }
      loadingMessage.style.display = "none";
    }
  });
}

function selectIndex(results, index) {
  console.log(results.data[index]);
  abb = results.data[index][19];
  swapStadium(false);
  initialHeight = results.data[index][30] * DISTANCE_SCALE * 3;
  hitDistance = results.data[index][52] * DISTANCE_SCALE;
  hc_x = results.data[index][37];
  hc_y = results.data[index][38];
  launch_speed_fts = results.data[index][53] * 5280 / 3600;
  launch_angle = results.data[index][54] * Math.PI / 180;
  console.log("Launch Angle: " + launch_angle);
  getHit();
}

document.getElementById("search-button").addEventListener("click", function () {
  statcast_search();
});

document.getElementById("cancel-button").addEventListener("click", function () {
  cancelSearch();
});

window.addEventListener('resize', () => {

  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function updatePlayerSelect() {
  playerSelectSearch.replaceChildren();

  let tempAny = document.createElement("option");
  tempAny.value = "void";
  tempAny.innerText = "Any";
  playerSelectSearch.append(tempAny);

  for (var i = 1; i < playerRows.length; i++) {
    if (playerRows[i][1].toLowerCase().includes(playerTextSearch.value.toLowerCase())) {
      let temp = document.createElement("option");
      temp.value = i;
      temp.innerText = playerRows[i][1];
      playerSelectSearch.append(temp);
    }
  }
}

function cancelSearch() {
  searchParameters.style.display = "none";
}

//https://baseballsavant.mlb.com/statcast_search/csv?all=true&hfPT=&hfAB=single%7Cdouble%7Ctriple%7Chome%5C.%5C.run%7Cfield%5C.%5C.out%7C&hfGT=R%7C&hfPR=&hfZ=&hfStadium=&hfBBL=&hfNewZones=&hfPull=&hfC=&hfSea=2023%7C&hfSit=&player_type=batter&hfOuts=&hfOpponent=&pitcher_throws=&batter_stands=&hfSA=&game_date_gt=&game_date_lt=&hfMo=&hfTeam=&home_road=&hfRO=&position=&hfInfield=&hfOutfield=&hfInn=&hfBBT=fly%5C.%5C.ball%7Cline%5C.%5C.drive%7C&hfFlag=&metric_1=&group_by=name-date&min_pitches=0&min_results=0&min_pas=0&sort_col=pitches&metric_1=api_h_distance_projected&metric_1_gt=300&metric_1_lt=&player_event_sort=api_p_release_speed&sort_order=desc&min_abs=0&type=detals#results