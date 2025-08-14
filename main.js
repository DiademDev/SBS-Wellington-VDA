// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Zjk5N2RlYS0zMGY2LTQxNWQtYjAwMy1iYWUyODI4ODY5YTUiLCJpZCI6MTE3OTUzLCJpYXQiOjE2NzA3Mzk4MTl9.k3I9be0G6cm7S9-U3lYsvSaUZ6mKVf0Capzojy3RZAU";
Cesium.GoogleMaps.defaultApiKey =
  "AIzaSyA1au3L6n6ZZvFqojyNMfB27DiGHLAX7h8"; //******* Turn on/off during testing *******//


//*****--------------------------------------------- World Setup --------------------------------------------*****//
 
async function main() {

  // Global variables
  let targetHighlight;
  let distanceRings = [];
  const buildingCoords = Cesium.Cartesian3.fromDegrees(174.775063336066, -41.283500141019324); 
  let currentIndex = 0;

  // Create viewer
  const viewer = new Cesium.Viewer("cesiumContainer", {
    //terrain: Cesium.Terrain.fromWorldTerrain(), //******* Turn on/off during testing *******//
    //imageryProvider: new Cesium.IonImageryProvider({ assetId: 3954 }),
    timeline: false,
    animation: false,
    infoBox: false,
    geocoder: false,
    navigationHelpButton: false,
    baseLayerPicker: false,
    searchButton: false,
    homeButton: false,
    selectionIndicator: false,
    sceneModePicker: false,
    baseLayerPicker: false,
  });

  // Add ambient light
  viewer.scene.globe.enableLighting = true;

  // Cesium globe true or false
  viewer.scene.globe.show = false; //******* Turn on/off during testing *******//
  viewer._cesiumWidget._creditContainer.style.display = "none";

  // Add Photorealistic 3D Tiles - //******* Turn on/off during testing *******//
  try {
    const tileset = await Cesium.createGooglePhotorealistic3DTileset();
    viewer.scene.primitives.add(tileset);
  } catch (error) {
    console.log(`Error loading Photorealistic 3D Tiles tileset.\n${error}`);
  }

  //*****---------------------------------------------- Import data source file --------------------------------------------*****//
  // Import data source file
  const dataSourcePromise = Cesium.CzmlDataSource.load("data.czml");
  viewer.dataSources.add(dataSourcePromise);

  // Function to extract description and update the HTML
  function updateDescription(entity) {
    const descriptionElement = document.getElementById("description");
    if (entity.description && entity.description.getValue()) {
      descriptionElement.textContent = entity.description.getValue();
    } else {
      descriptionElement.textContent = "No description available.";
    }
  }

  // Sort data to get position values of each entity
  dataSourcePromise.then((dataSource) => {
    const entities = dataSource.entities.values;
    const numEntities = entities.length;

  // Watch for entity selection
const panel = document.getElementById("customPanel");

// Reuse a single image element
const img = document.createElement("img");
panel.appendChild(img);

// Watch for entity selection
viewer.selectedEntityChanged.addEventListener(function(entity) {
  if (entity) {
    const id = entity.id;
    const imageFile = `img/${id}.png`;

    // Fade out current image
    img.style.opacity = 0;

    // Wait for fade out, then change image
    setTimeout(() => {
      img.src = imageFile;
      img.alt = id;

      // Show panel if hidden
      panel.style.display = "block";

      // When image has loaded, fade it in
      img.onload = () => {
        img.style.opacity = 1;
      };
    }, 200); // delay slightly less than fade duration
  } else {
    // Hide the panel when nothing is selected
    panel.style.display = "none";
  }
});


  //*****-------------------------------------------------- Button Navigation -------------------------------------------------*****//
   
  // Press Home button actions
  const homeButton = document.getElementById("HomeBut");

  homeButton.addEventListener("click", function () {

    currentIndex = -1;

    /* Zoom camera attributes
    const sliderThumb = document.getElementById("sliderThumb");

    // Reset thumb position visually
    sliderThumb.style.left = "0%";

    // Reset internal value
    previousValue = 0;

    // Optional: update zoom label if you use one
    const zoomLabel = document.getElementById("sliderValue");
    if (zoomLabel) {
      zoomLabel.textContent = "0";
    }
      */

    resetCameraPositionToHome();
  });
  
  // Function to handle the right (next) button click
  function onNextButtonClick() {
    currentIndex++;

    if (currentIndex >= numEntities) {
      currentIndex = 0;
    }

    const entity = entities[currentIndex];
    const positionValue = entity.position.getValue();
    viewer.selectedEntity = entity;

    /* Zoom controller attributes
    const sliderThumb = document.getElementById("sliderThumb");
    sliderThumb.style.left = "0%";
    */

    previousValue = 0;
    updateDescription(entity);
    camFlyTo(positionValue);
  }

  // Function to handle the left (previous) button click
  function onPrevButtonClick() {
    currentIndex--;

    if (currentIndex < 0) {
      currentIndex = numEntities - 1;
    }

    const entity = entities[currentIndex];
    const positionValue = entity.position.getValue();
    viewer.selectedEntity = entity;

    /* Zoom controller attributes
    const sliderThumb = document.getElementById("sliderThumb");
    sliderThumb.style.left = "0%";
    */

    previousValue = 0;
    updateDescription(entity);
    camFlyTo(positionValue);
  }


    const rightButton = document.getElementById("RightBut");
    rightButton.addEventListener("click", onNextButtonClick);

    const leftButton = document.getElementById("LeftBut");
    leftButton.addEventListener("click", onPrevButtonClick);

    const button = document.getElementById("RightBut");
    setTimeout(function () {
      button.style.animation = "none";
    }, 3000);
  });


//*****---------------------------------------------- Site Overlays --------------------------------------------*****//
// Building highlight - (Use Google maps and mouse coords for data)
function buildingHighlight() {

  targetHighlight = new Cesium.Entity({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(
        [
          [174.77534343133797, -41.28368798686419],
          [174.77534859690752, -41.2833433334313],
          [174.7747549662048, -41.28336862904213], 
          [174.77481307532983, -41.283690201232915],
        ].flat(2),
      ),
      material: Cesium.Color.ORANGE.withAlpha(0.6),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
    },
    show: true,
  });
  
  viewer.entities.add(targetHighlight);
}

buildingHighlight();

// Viewing corridors - (Use Google maps and mouse coords for data)
function viewingCorridors() {

  corridorOverlay = new Cesium.Entity({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(
        [
          [174.82563171315928, -41.28129911760191], 
          [174.80328235915087, -41.2822772149776],
          [174.78012669033467, -41.28309221843801], 
          [174.77965908444736, -41.28297478137698], 
          [174.91408572941958, -41.256356562739974],
          [174.84804495506583, -41.127116871691626],
          [174.57968928816302, -41.20082889813626],
          [174.63855286895, -41.394258633746425],
          [174.91918912666313, -41.35863144541714],
          [174.77643276122768, -41.284103987397636], 
          [174.77555196692487, -41.28382593894997], 
          [174.7754696838526, -41.28444398370786], 
          [174.77570812610375, -41.28512374068272], 
          [174.77627001817552, -41.28653365445833], 
          [174.7756301741228, -41.285331214990265], 
          [174.7748654441672, -41.283656688926975], 
          [174.77532477038486, -41.28368143556823], 
          [174.77481085107402, -41.28363259515589], 
          [174.77435867138607, -41.28380803113742], 
          [174.77441993509618, -41.28355835769209], 
          [174.77275375538196, -41.28336463516013], 
          [174.7727437388046, -41.28325192668385], 
          [174.77445638342903, -41.283503602895685], 
          [174.77466963048792, -41.282919967392495], 
          [174.77482178318812, -41.283199874080566], 
          [174.7752909529377, -41.28337835106258], 
          [174.7754154287868, -41.283002428762096], 
          [174.7762597295253, -41.28113897458532], 
          [174.7761889905571, -41.28145005592835], 
          [174.77653610433399, -41.28193132358224], 
          [174.77595430304126, -41.28257910400037], 
          [174.77570321609895, -41.28304825139078], 
          [174.77556107442638, -41.283705425496706], 
          [174.78137236988314, -41.284984148261515], 
          [174.78118349015145, -41.283672311042906],
        ].flat(2),
      ),
      material: Cesium.Color.BLACK.withAlpha(0.8),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
    },
    show: false,
  });
  
  viewer.entities.add(corridorOverlay);
}

viewingCorridors();

// Distance rings overlay
function addRings() {

  distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Red ellipse on surface",
    ellipse: {
      semiMinorAxis: 500.0,
      semiMajorAxis: 500.0,
      material: Cesium.Color.RED.withAlpha(0.3),
    },
    show: false,
  }));

  distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Blue ellipse on surface",
    ellipse: {
      semiMinorAxis: 1000.0,
      semiMajorAxis: 1000.0,
      material: Cesium.Color.CYAN.withAlpha(0.2),
    },
    show: false,
  }));

  distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Blue ellipse on surface",
    ellipse: {
      semiMinorAxis: 1500.0,
      semiMajorAxis: 1500.0,
      material: Cesium.Color.BLUE.withAlpha(0.2),
    },
    show: false,
  }));

  distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Yellow ellipse on surface",
    ellipse: {
      semiMinorAxis: 2000.0,
      semiMajorAxis: 2000.0,
      material: Cesium.Color.YELLOW.withAlpha(0.2),
    },
    show: false,
  }));

  // Keylines
    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "White ellipse on surface",
    ellipsoid: {
      radii: new Cesium.Cartesian3(250, 250, 250),
      innerRadii: new Cesium.Cartesian3(245, 245, 245),
      minimumCone: Cesium.Math.toRadians(50),
      maximumCone: Cesium.Math.toRadians(50.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "White ring",
    ellipsoid: {
      radii: new Cesium.Cartesian3(500, 500, 500),
      innerRadii: new Cesium.Cartesian3(495, 495, 495),
      minimumCone: Cesium.Math.toRadians(71),
      maximumCone: Cesium.Math.toRadians(71.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "White ring",
    ellipsoid: {
      radii: new Cesium.Cartesian3(1000, 1000, 1000),
      innerRadii: new Cesium.Cartesian3(995, 995, 995),
      minimumCone: Cesium.Math.toRadians(80),
      maximumCone: Cesium.Math.toRadians(80.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "Orange ring",
    ellipsoid: {
      radii: new Cesium.Cartesian3(1500, 1500, 1500),
      innerRadii: new Cesium.Cartesian3(1495, 1495, 1495),
      minimumCone: Cesium.Math.toRadians(83),
      maximumCone: Cesium.Math.toRadians(83.5),
      material: Cesium.Color.ORANGE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: buildingCoords,
    name: "White ring",
    ellipsoid: {
      radii: new Cesium.Cartesian3(2000, 2000, 2000),
      innerRadii: new Cesium.Cartesian3(1995, 1995, 1995),
      minimumCone: Cesium.Math.toRadians(85),
      maximumCone: Cesium.Math.toRadians(85.5),
      material: Cesium.Color.WHITE.withAlpha(1.0),
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.77370295558623, -41.28548731902956, 200),
    label: {
      text: "250m",
      font: "24px Helvetica",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.7725329813511, -41.28765450154714, 200),
    label: {
      text: "500m",
      font: "24px Helvetica",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

      distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.7703332149817, -41.29184763322165, 200),
    label: {
      text: "1km",
      font: "24px Helvetica",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.7681469479569, -41.296104013193684, 200),
    label: {
      text: "1.5km",
      font: "24px Helvetica",
      fillColor: Cesium.Color.ORANGE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

    distanceRings.push(viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(174.7659872330026, -41.30016817626843, 200),
    label: {
      text: "2km",
      font: "24px Helvetica",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
    show: false,
  }));

}

addRings();
 
  //*****-------------------------------------------------- Camera -------------------------------------------------*****//
  // Camera home position
  function resetCameraPositionToHome() {
    currentIndex = -1; 

    viewer.scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        174.78752041239,
        -41.28602915198643,
        800
      ),
      orientation: {
        heading: 5.001378734299446,
        pitch: -0.6411280124865057,
        roll: 6.283178528334798,
      },
    });
  }

  // // Initial scene camera position
  // viewer.scene.camera.flyTo({
    
  //   destination: Cesium.Cartesian3.fromDegrees(
  //     174.78752041239,
  //     -41.28602915198643,
  //     800
  //   ),
  //   orientation: {
  //     heading: 5.001378734299446,
  //     pitch: -0.6411280124865057,
  //     roll: 6.283178528334798,
  //   },
  // });

  // Camera look-at target
  const targetSphere = viewer.entities.add({
    name: "Target sphere",
    position: Cesium.Cartesian3.fromDegrees(174.775063336066, -41.283500141019324, 70),
    ellipsoid: {
      radii: new Cesium.Cartesian3(10.0, 10.0, 10.0),
      material: Cesium.Color.GREEN.withAlpha(0.0),
    },
  });

  // Fly camera to entity position and look at target location
  function camFlyTo(positionValue) {
    var viewPosition = positionValue;

    var newPosition = Cesium.Cartesian3.add(
      viewPosition,
      new Cesium.Cartesian3(0, 0, 0),
      new Cesium.Cartesian3()
    );
    var direction = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(
        targetSphere.position.getValue(Cesium.JulianDate.now()),
        newPosition,
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );
    var right = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(
        direction,
        viewer.camera.position,
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );
    var up = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );

    viewer.camera.flyTo({
      destination: newPosition,
      orientation: {
        direction: direction,
        up: up,
      },
      duration: 3,
    });
  }

  //*****--------------------------------------------- Zoom Controller --------------------------------------------*****// 
  /*const sliderTrack = document.getElementById("sliderTrack");
  const sliderThumb = document.getElementById("sliderThumb");

  let isDragging = false;
  let sliderValue = 0; // 0–100 range
  let previousValue = 0;

  const zoomMultiplier = 50.0;
  const maxZoomFactor = 10;
  const minZoomFactor = 0.1;

  // Convert slider value (0–100) to a float (0–1)
  function normalize(value) {
    return value / 100;
  }

  sliderThumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const rect = sliderTrack.getBoundingClientRect();
    const offsetX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const percent = (offsetX / rect.width) * 100;

    // Snap thumb to mouse
    sliderThumb.style.left = `${percent}%`;

    const currentValue = normalize(percent);
    let zoomFactor;

    if (currentValue > previousValue) {
      zoomFactor = Math.pow(maxZoomFactor, (currentValue - previousValue) * zoomMultiplier);
      viewer.camera.zoomIn(zoomFactor);
    } else if (currentValue < previousValue) {
      zoomFactor = Math.pow(minZoomFactor, (previousValue - currentValue) * zoomMultiplier);
      zoomFactor *= 50;
      viewer.camera.zoomOut(zoomFactor);
    }

    console.log(previousValue);

    previousValue = currentValue;
  });
  */

  //*****--------------------------------------------- Toggles Controller --------------------------------------------*****// 
  const buildingObverlayToggle = document.getElementById('buildingOverlay');
  buildingObverlayToggle.addEventListener('change', function () {
    if (targetHighlight) {
      targetHighlight.show = buildingObverlayToggle.checked;
      console.log(buildingObverlayToggle.checked ? 'Overlay ON' : 'Overlay OFF');
    }
  });

  const viewingCorridorsToggle = document.getElementById('viewingCorridors');
  viewingCorridorsToggle.addEventListener('change', function () {
    if (corridorOverlay) {
      corridorOverlay.show = viewingCorridorsToggle.checked;
      console.log(viewingCorridorsToggle.checked ? 'Overlay ON' : 'Overlay OFF');
    }
  });

  const ringsToggle = document.getElementById('distanceRings');
  ringsToggle.addEventListener('change', function () {
    const visible = ringsToggle.checked;
    distanceRings.forEach(entity => {
      entity.show = visible;
    });
    console.log(`Distance Rings ${visible ? 'ON' : 'OFF'}`);
  });

//*****--------------------------------------------- Compass --------------------------------------------*****// 
const compassNeedle = document.getElementById('compassNeedle');

let lastRotation = 0;

viewer.scene.postRender.addEventListener(() => {
  // Get current heading in degrees and convert to a compass rotation
  const heading = Cesium.Math.toDegrees(viewer.camera.heading);
  const targetRotation = -heading; // Negative to rotate compass in opposite direction

  // Normalize angles to range (-180, 180] to find shortest path
  let delta = targetRotation - lastRotation;
  delta = ((delta + 180) % 360) - 180;

  // Interpolate rotation (adjust 0.2 for smoothing)
  lastRotation += delta * 0.2;

  // Apply rotation to compass
  compassNeedle.style.transform = `rotate(${lastRotation}deg)`;
});


resetCameraPositionToHome();

//*****--------------------------------------------- Camera location data --------------------------------------------*****// 

//   // Console log out cameras coordinates as well as HeadingPitchRoll in radians
//   viewer.scene.postUpdate.addEventListener(function() {
//   var camera = viewer.scene.camera;
//   var headingPitchRoll = new Cesium.HeadingPitchRoll(camera.heading, camera.pitch, camera.roll);

//   var ellipsoid = viewer.scene.globe.ellipsoid;

//   var cartesian = camera.positionWC;
//   var cartographic = ellipsoid.cartesianToCartographic(cartesian);
  
//   var longitude = Cesium.Math.toDegrees(cartographic.longitude);
//   var latitude = Cesium.Math.toDegrees(cartographic.latitude);

//   console.log("Longitude: " + longitude + ", Latitude: " + latitude);
//   console.log(headingPitchRoll);
// });

//*****--------------------------------------------- Load Models here --------------------------------------------*****// 






//*****--------------------------------------------***** END *****------------------------------------------*****// 


}

main();

//*****--------------------------------------------***** END *****------------------------------------------*****// 


