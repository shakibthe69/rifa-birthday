/**
 * Three.js 3D Engine for Rifa Jahan's Magical Birthday Surprise
 * Created with love by Shakib Ahmed ❤️
 */

const ThreeWorld = (function () {
  let container, canvas;
  let scene, camera, renderer;
  let ambientLight, mainLight, pinkPointLight, goldPointLight;
  let starField, starGeometry;
  let floatingHeartsSystem;
  let fireworks = [];
  let burstHeartParticles = [];
  
  // Scene-specific groups
  let entranceGroup;
  let celebrationGroup;
  let memoriesGroup;
  let heartGroup;
  let giftGroup;
  let finalGroup;
  
  // Interactive 3D Objects
  let doorLeft, doorRight, doorLight, doorSparks;
  let isDoorOpened = false;
  let balloons = [];
  let cakeGroup, candleFlameLight, candleFlames = [];
  let portraitMesh, bgPhotoMesh, mainFrameGroup, secFrameGroup;
  let pulsingHeartMesh, heartHaloLight;
  let giftBoxLid, giftBoxRibbon, giftInteriorLight, giftBurstParticles;
  let isGiftOpened = false;
  let finalPortrait1, finalPortrait2;

  let currentSceneIndex = 0;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let clock = new THREE.Clock();
  let textureLoader = new THREE.TextureLoader();
  let raycaster = new THREE.Raycaster();
  let mouseCoords = new THREE.Vector2();

  // Texture caches
  let rifaPortraitTexture = null;
  let bgPhotoTexture = null;

  function init(canvasId, onProgress, onLoaded) {
    canvas = document.getElementById(canvasId);
    container = canvas.parentElement;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080514, 0.024);

    const isMobile = width < 768;
    camera = new THREE.PerspectiveCamera(isMobile ? 58 : 48, width / height, 0.1, 1000);
    camera.position.set(0, 0, isMobile ? 21 : 18);

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 3. Load Textures
    loadAssets(onProgress, onLoaded);

    // 4. Lighting
    setupLighting();

    // 5. Ambient Environment & Starfield
    createStarfield();
    createFloatingHearts();

    // 6. Build 3D Scenes
    buildEntranceScene();
    buildCelebrationScene();
    buildMemoriesScene();
    buildHeartScene();
    buildGiftScene();
    buildFinalScene();

    // 7. Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('click', onCanvasClick);

    // Initial scene focus
    goToScene(0, false);

    // Start loop
    animate();
  }

  function loadAssets(onProgress, onLoaded) {
    let loadedCount = 0;
    const totalAssets = 2;

    function checkDone() {
      loadedCount++;
      if (onProgress) onProgress(Math.floor((loadedCount / totalAssets) * 100));
      if (loadedCount >= totalAssets && onLoaded) {
        onLoaded();
      }
    }

    textureLoader.load(
      'assets/images/rifa-portrait.jpg',
      function (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        rifaPortraitTexture = tex;
        updatePhotoTextures();
        checkDone();
      },
      undefined,
      function (err) {
        console.warn('Portrait texture load fallback:', err);
        checkDone();
      }
    );

    textureLoader.load(
      'assets/images/background.jpg',
      function (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        bgPhotoTexture = tex;
        updatePhotoTextures();
        checkDone();
      },
      undefined,
      function (err) {
        console.warn('Background texture load fallback:', err);
        checkDone();
      }
    );
  }

  function updatePhotoTextures() {
    if (rifaPortraitTexture && portraitMesh) {
      portraitMesh.material.map = rifaPortraitTexture;
      portraitMesh.material.needsUpdate = true;
    }
    if (bgPhotoTexture && bgPhotoMesh) {
      bgPhotoMesh.material.map = bgPhotoTexture;
      bgPhotoMesh.material.needsUpdate = true;
    }
    if (rifaPortraitTexture && finalPortrait2) {
      finalPortrait2.material.map = rifaPortraitTexture;
      finalPortrait2.material.needsUpdate = true;
    }
    if (bgPhotoTexture && finalPortrait1) {
      finalPortrait1.material.map = bgPhotoTexture;
      finalPortrait1.material.needsUpdate = true;
    }
  }

  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0x231745, 1.4);
    scene.add(ambientLight);

    mainLight = new THREE.DirectionalLight(0xfffaed, 1.9);
    mainLight.position.set(5, 10, 8);
    scene.add(mainLight);

    pinkPointLight = new THREE.PointLight(0xff4d8d, 2.6, 35);
    pinkPointLight.position.set(-6, 3, 5);
    scene.add(pinkPointLight);

    goldPointLight = new THREE.PointLight(0xfbbf24, 2.4, 35);
    goldPointLight.position.set(6, -2, 6);
    scene.add(goldPointLight);
  }

  // ==========================================================================
  // Ambient Starfield & Floating Hearts
  // ==========================================================================

  function createStarfield() {
    const starCount = 1400;
    starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xfef08a),
      new THREE.Color(0xf472b6),
      new THREE.Color(0xc084fc)
    ];

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 130;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 90 - 15;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvasPoint = document.createElement('canvas');
    canvasPoint.width = 32;
    canvasPoint.height = 32;
    const ctx = canvasPoint.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,240,200,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const starTexture = new THREE.CanvasTexture(canvasPoint);

    const starMaterial = new THREE.PointsMaterial({
      size: 1.25,
      map: starTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
  }

  function createFloatingHearts() {
    const heartCount = 50;
    const heartShape = getHeartShape2D();
    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.scale(0.12, 0.12, 0.12);

    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff3b7b,
      roughness: 0.25,
      metalness: 0.65,
      emissive: 0x550a22,
      transparent: true,
      opacity: 0.8
    });

    floatingHeartsSystem = new THREE.Group();

    for (let i = 0; i < heartCount; i++) {
      const mesh = new THREE.Mesh(heartGeo, heartMat.clone());
      mesh.position.set(
        (Math.random() - 0.5) * 38,
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 22 - 6
      );
      mesh.rotation.z = Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.userData = {
        speedY: 0.015 + Math.random() * 0.025,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        swaySpeed: 1 + Math.random() * 2,
        swayOffset: Math.random() * Math.PI * 2,
        baseX: mesh.position.x
      };
      floatingHeartsSystem.add(mesh);
    }

    scene.add(floatingHeartsSystem);
  }

  function getHeartShape2D() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
    return shape;
  }

  // ==========================================================================
  // Scene 1: The Magical Entrance Room & Glowing Flowers
  // ==========================================================================

  function buildEntranceScene() {
    entranceGroup = new THREE.Group();
    entranceGroup.position.set(0, 0, 0);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
      emissive: 0x452300
    });

    const doorFrameW = 5.2;
    const doorFrameH = 7.6;
    const frameThickness = 0.35;

    // Top Arch
    const archGeo = new THREE.TorusGeometry(doorFrameW / 2, frameThickness / 2, 16, 64, Math.PI);
    const archMesh = new THREE.Mesh(archGeo, goldMat);
    archMesh.position.set(0, doorFrameH / 2 - 0.2, 0);
    entranceGroup.add(archMesh);

    // Left & Right Pillars
    const pillarGeo = new THREE.CylinderGeometry(frameThickness / 2, frameThickness / 2, doorFrameH, 24);
    const leftPillar = new THREE.Mesh(pillarGeo, goldMat);
    leftPillar.position.set(-doorFrameW / 2, 0, 0);
    entranceGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, goldMat);
    rightPillar.position.set(doorFrameW / 2, 0, 0);
    entranceGroup.add(rightPillar);

    // Base Threshold
    const baseGeo = new THREE.BoxGeometry(doorFrameW + 0.8, 0.4, 0.8);
    const baseMesh = new THREE.Mesh(baseGeo, goldMat);
    baseMesh.position.set(0, -doorFrameH / 2, 0);
    entranceGroup.add(baseMesh);

    // Left & Right Swinging Doors
    const doorWidth = (doorFrameW - frameThickness) / 2;
    const doorHeight = doorFrameH - 0.1;
    const doorThickness = 0.18;

    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1f1138,
      roughness: 0.35,
      metalness: 0.5,
      emissive: 0x0f0720
    });

    // Left Door Pivot Group
    doorLeft = new THREE.Group();
    doorLeft.position.set(-doorWidth, 0, 0);
    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness), doorMat);
    leftPanel.position.set(doorWidth / 2, 0, 0);
    leftPanel.userData = { isDoor: true };
    
    const trimGeo = new THREE.BoxGeometry(doorWidth * 0.75, doorHeight * 0.8, 0.05);
    const trimMeshL = new THREE.Mesh(trimGeo, goldMat);
    trimMeshL.position.set(doorWidth / 2, 0, doorThickness / 2 + 0.03);
    trimMeshL.userData = { isDoor: true };
    doorLeft.add(leftPanel);
    doorLeft.add(trimMeshL);

    const handleL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMat);
    handleL.position.set(doorWidth * 0.85, 0, doorThickness / 2 + 0.15);
    handleL.userData = { isDoor: true };
    doorLeft.add(handleL);

    entranceGroup.add(doorLeft);

    // Right Door Pivot Group
    doorRight = new THREE.Group();
    doorRight.position.set(doorWidth, 0, 0);
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness), doorMat);
    rightPanel.position.set(-doorWidth / 2, 0, 0);
    rightPanel.userData = { isDoor: true };

    const trimMeshR = new THREE.Mesh(trimGeo, goldMat);
    trimMeshR.position.set(-doorWidth / 2, 0, doorThickness / 2 + 0.03);
    trimMeshR.userData = { isDoor: true };
    doorRight.add(rightPanel);
    doorRight.add(trimMeshR);

    const handleR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMat);
    handleR.position.set(-doorWidth * 0.85, 0, doorThickness / 2 + 0.15);
    handleR.userData = { isDoor: true };
    doorRight.add(handleR);

    entranceGroup.add(doorRight);

    // Beautiful Glowing Flowers along the pillars
    addGlowingFlowers(entranceGroup, -doorFrameW / 2, doorFrameH);
    addGlowingFlowers(entranceGroup, doorFrameW / 2, doorFrameH);

    // Light glowing from inside the door doorway
    doorLight = new THREE.PointLight(0xffdf80, 0, 25);
    doorLight.position.set(0, 0, -2);
    entranceGroup.add(doorLight);

    // Golden sparks around entrance
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(250 * 3);
    for (let i = 0; i < 250; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 8;
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 4 + 1;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      size: 0.6,
      color: 0xffe066,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    doorSparks = new THREE.Points(sparkGeo, sparkMat);
    entranceGroup.add(doorSparks);

    scene.add(entranceGroup);
  }

  function addGlowingFlowers(parentGroup, posX, height) {
    const flowerGroup = new THREE.Group();
    const flowerColors = [0xff4d8d, 0xfbbf24, 0xf472b6, 0xa855f7];
    const flowerCount = 6;

    for (let i = 0; i < flowerCount; i++) {
      const fMesh = new THREE.Group();
      const col = flowerColors[i % flowerColors.length];
      const petalMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.6,
        roughness: 0.3
      });

      // 5 petals
      for (let p = 0; p < 5; p++) {
        const petalGeo = new THREE.SphereGeometry(0.12, 12, 12);
        petalGeo.scale(1, 1.8, 0.4);
        const petal = new THREE.Mesh(petalGeo, petalMat);
        const ang = (p / 5) * Math.PI * 2;
        petal.position.set(Math.cos(ang) * 0.16, Math.sin(ang) * 0.16, 0);
        petal.rotation.z = ang;
        fMesh.add(petal);
      }

      // Center pistil
      const centerGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const centerMat = new THREE.MeshBasicMaterial({ color: 0xfff08a });
      const center = new THREE.Mesh(centerGeo, centerMat);
      fMesh.add(center);

      const yOffset = -height / 2 + 0.8 + i * 1.1;
      const xOffset = posX + (posX > 0 ? 0.35 : -0.35);
      fMesh.position.set(xOffset, yOffset, 0.2);
      fMesh.rotation.z = Math.random() * Math.PI;
      flowerGroup.add(fMesh);
    }

    parentGroup.add(flowerGroup);
  }

  // ==========================================================================
  // Scene 2: Infinite Birthday Balloon Celebration & Animated 3D Cake
  // ==========================================================================

  function buildCelebrationScene() {
    celebrationGroup = new THREE.Group();
    celebrationGroup.position.set(0, 0, -40);

    // 1. Hundreds of 3D Balloons
    const balloonCount = 150;
    const balloonColors = [
      0xff3377, 0xf472b6, 0xa855f7, 0xf59e0b, 0xef4444, 0xffffff, 0xfb7185
    ];

    const sphereGeo = new THREE.SphereGeometry(0.85, 24, 24);
    sphereGeo.scale(1, 1.25, 1);
    const knotGeo = new THREE.ConeGeometry(0.16, 0.22, 12);
    knotGeo.rotateX(Math.PI);

    for (let i = 0; i < balloonCount; i++) {
      const bGroup = new THREE.Group();
      const col = balloonColors[Math.floor(Math.random() * balloonColors.length)];
      
      const bMat = new THREE.MeshPhysicalMaterial({
        color: col,
        roughness: 0.18,
        metalness: 0.45,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        reflectivity: 0.9
      });

      const bSphere = new THREE.Mesh(sphereGeo, bMat);
      bGroup.add(bSphere);

      const bKnot = new THREE.Mesh(knotGeo, bMat);
      bKnot.position.set(0, -1.15, 0);
      bGroup.add(bKnot);

      const stringCurve = new THREE.LineCurve3(
        new THREE.Vector3(0, -1.25, 0),
        new THREE.Vector3(0.1, -3.2, 0)
      );
      const stringGeo = new THREE.BufferGeometry().setFromPoints(stringCurve.getPoints(8));
      const stringMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
      const bString = new THREE.Line(stringGeo, stringMat);
      bGroup.add(bString);

      const scale = 0.65 + Math.random() * 0.75;
      bGroup.scale.set(scale, scale, scale);

      bGroup.position.set(
        (Math.random() - 0.5) * 34,
        -18 + Math.random() * 36,
        (Math.random() - 0.5) * 22
      );

      bGroup.userData = {
        speedY: 0.04 + Math.random() * 0.07,
        swaySpeed: 1 + Math.random() * 2,
        swayAmp: 0.02 + Math.random() * 0.03,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        offset: Math.random() * Math.PI * 2,
        baseX: bGroup.position.x
      };

      balloons.push(bGroup);
      celebrationGroup.add(bGroup);
    }

    // 2. Animated 3D Cake
    cakeGroup = new THREE.Group();
    cakeGroup.position.set(0, -3.8, 2);
    cakeGroup.scale.set(1.1, 1.1, 1.1);

    const standMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.35, 32), standMat);
    standBase.position.y = -0.18;
    standBase.userData = { isCake: true };
    cakeGroup.add(standBase);

    // Cake Tier 1
    const cakeMat1 = new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.4, metalness: 0.1 });
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.2, 36), cakeMat1);
    tier1.position.y = 0.6;
    tier1.userData = { isCake: true };
    cakeGroup.add(tier1);

    const trimMat = new THREE.MeshStandardMaterial({ color: 0xff4d8d, roughness: 0.3, metalness: 0.3 });
    const trim1 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.12, 16, 40), trimMat);
    trim1.rotation.x = Math.PI / 2;
    trim1.position.y = 1.2;
    cakeGroup.add(trim1);

    // Cake Tier 2
    const cakeMat2 = new THREE.MeshStandardMaterial({ color: 0xfce7f3, roughness: 0.4, metalness: 0.1 });
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 1.0, 36), cakeMat2);
    tier2.position.y = 1.7;
    tier2.userData = { isCake: true };
    cakeGroup.add(tier2);

    const trim2 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.1, 16, 40), standMat);
    trim2.rotation.x = Math.PI / 2;
    trim2.position.y = 2.2;
    cakeGroup.add(trim2);

    // Cake Tier 3
    const cakeMat3 = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
    const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.8, 32), cakeMat3);
    tier3.position.y = 2.6;
    tier3.userData = { isCake: true };
    cakeGroup.add(tier3);

    // Birthday Candles
    const candleCount = 5;
    const candleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const flameGeo = new THREE.ConeGeometry(0.08, 0.22, 16);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });

    for (let i = 0; i < candleCount; i++) {
      const angle = (i / candleCount) * Math.PI * 2;
      const radius = 0.55;
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.set(Math.cos(angle) * radius, 3.35, Math.sin(angle) * radius);
      cakeGroup.add(candle);

      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(Math.cos(angle) * radius, 3.8, Math.sin(angle) * radius);
      cakeGroup.add(flame);
      candleFlames.push(flame);
    }

    candleFlameLight = new THREE.PointLight(0xffa500, 2.8, 8);
    candleFlameLight.position.set(0, 4.2, 0);
    cakeGroup.add(candleFlameLight);

    celebrationGroup.add(cakeGroup);
    scene.add(celebrationGroup);
  }

  // ==========================================================================
  // Scene 3: Our Special Memories
  // ==========================================================================

  function buildMemoriesScene() {
    memoriesGroup = new THREE.Group();
    memoriesGroup.position.set(0, 0, -80);

    const frameW = 3.6;
    const frameH = 7.0;
    const borderThickness = 0.28;

    const goldFrameMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.22,
      emissive: 0x3d2000
    });

    mainFrameGroup = new THREE.Group();

    const topBorder = new THREE.Mesh(new THREE.BoxGeometry(frameW + borderThickness * 2, borderThickness, 0.3), goldFrameMat);
    topBorder.position.y = frameH / 2 + borderThickness / 2;
    mainFrameGroup.add(topBorder);

    const bottomBorder = new THREE.Mesh(new THREE.BoxGeometry(frameW + borderThickness * 2, borderThickness, 0.3), goldFrameMat);
    bottomBorder.position.y = -frameH / 2 - borderThickness / 2;
    mainFrameGroup.add(bottomBorder);

    const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, frameH, 0.3), goldFrameMat);
    leftBorder.position.x = -frameW / 2 - borderThickness / 2;
    mainFrameGroup.add(leftBorder);

    const rightBorder = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, frameH, 0.3), goldFrameMat);
    rightBorder.position.x = frameW / 2 + borderThickness / 2;
    mainFrameGroup.add(rightBorder);

    const portraitGeo = new THREE.PlaneGeometry(frameW, frameH);
    const portraitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    portraitMesh.userData = { isPortraitPhoto: true };
    mainFrameGroup.add(portraitMesh);

    const backGeo = new THREE.PlaneGeometry(frameW + borderThickness * 2, frameH + borderThickness * 2);
    const backMat = new THREE.MeshStandardMaterial({ color: 0x140a25, roughness: 0.5 });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -0.16;
    mainFrameGroup.add(backMesh);

    const frameGlow = new THREE.PointLight(0xff7597, 2.5, 12);
    frameGlow.position.set(0, 0, -1);
    mainFrameGroup.add(frameGlow);

    mainFrameGroup.position.set(2.8, 0.2, 2);
    mainFrameGroup.rotation.y = -0.18;
    memoriesGroup.add(mainFrameGroup);

    // Secondary Photo (Photograph 1: background.jpg)
    const secW = 3.2;
    const secH = 5.5;
    const bgPhotoGeo = new THREE.PlaneGeometry(secW, secH);
    const bgPhotoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, side: THREE.DoubleSide });
    bgPhotoMesh = new THREE.Mesh(bgPhotoGeo, bgPhotoMat);
    bgPhotoMesh.userData = { isBackgroundPhoto: true };

    secFrameGroup = new THREE.Group();
    secFrameGroup.add(bgPhotoMesh);

    const roseTrimMat = new THREE.MeshStandardMaterial({ color: 0xff6699, metalness: 0.7, roughness: 0.3 });
    const secTrimTop = new THREE.Mesh(new THREE.BoxGeometry(secW + 0.2, 0.15, 0.15), roseTrimMat);
    secTrimTop.position.y = secH / 2 + 0.07;
    secFrameGroup.add(secTrimTop);

    const secTrimBottom = secTrimTop.clone();
    secTrimBottom.position.y = -secH / 2 - 0.07;
    secFrameGroup.add(secTrimBottom);

    secFrameGroup.position.set(-3.2, -0.4, 0);
    secFrameGroup.rotation.y = 0.22;
    secFrameGroup.rotation.z = -0.04;
    memoriesGroup.add(secFrameGroup);

    scene.add(memoriesGroup);
  }

  function focusPhoto(type) {
    if (typeof gsap === 'undefined') return;

    if (type === 'portrait') {
      gsap.to(mainFrameGroup.position, { x: 0, y: 0.3, z: 4, duration: 1.2, ease: 'power2.out' });
      gsap.to(mainFrameGroup.rotation, { y: 0, duration: 1.2, ease: 'power2.out' });
      gsap.to(secFrameGroup.position, { x: -4.5, y: -0.6, z: -2, duration: 1.2, ease: 'power2.out' });
      gsap.to(secFrameGroup.rotation, { y: 0.35, duration: 1.2, ease: 'power2.out' });
    } else {
      gsap.to(secFrameGroup.position, { x: 0, y: 0.2, z: 4, duration: 1.2, ease: 'power2.out' });
      gsap.to(secFrameGroup.rotation, { y: 0, z: 0, duration: 1.2, ease: 'power2.out' });
      gsap.to(mainFrameGroup.position, { x: 4.5, y: -0.4, z: -2, duration: 1.2, ease: 'power2.out' });
      gsap.to(mainFrameGroup.rotation, { y: -0.35, duration: 1.2, ease: 'power2.out' });
    }
  }

  // ==========================================================================
  // Scene 4: Romantic Love Messages (Interactive 3D Pulsing Heart)
  // ==========================================================================

  function buildHeartScene() {
    heartGroup = new THREE.Group();
    heartGroup.position.set(0, 0, -120);

    const heartShape = getHeartShape2D();
    const extrudeSettings = {
      depth: 1.2,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.5,
      bevelThickness: 0.5
    };

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xff1464,
      emissive: 0x88052e,
      roughness: 0.22,
      metalness: 0.55,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15
    });

    pulsingHeartMesh = new THREE.Mesh(heartGeo, heartMat);
    pulsingHeartMesh.scale.set(0.48, 0.48, 0.48);
    pulsingHeartMesh.rotation.z = Math.PI;
    pulsingHeartMesh.position.set(0, 1.4, 0);
    pulsingHeartMesh.userData = { isHeartButton: true };
    heartGroup.add(pulsingHeartMesh);

    heartHaloLight = new THREE.PointLight(0xff2b75, 4.0, 16);
    heartHaloLight.position.set(0, 1.4, 1.5);
    heartGroup.add(heartHaloLight);

    const ringGeo = new THREE.BufferGeometry();
    const ringCount = 180;
    const ringPos = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const r = 3.2 + (Math.random() - 0.5) * 0.8;
      ringPos[i * 3] = Math.cos(angle) * r;
      ringPos[i * 3 + 1] = 1.4 + (Math.random() - 0.5) * 0.9;
      ringPos[i * 3 + 2] = Math.sin(angle) * r;
    }
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
    const ringMat = new THREE.PointsMaterial({
      size: 0.45,
      color: 0xfed7aa,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85
    });
    const fairyRing = new THREE.Points(ringGeo, ringMat);
    heartGroup.add(fairyRing);

    scene.add(heartGroup);
  }

  // ==========================================================================
  // Scene 5: The Special Gift (Interactive 3D Gift Box)
  // ==========================================================================

  function buildGiftScene() {
    giftGroup = new THREE.Group();
    giftGroup.position.set(0, 0, -160);

    const boxW = 3.8, boxH = 3.0, boxD = 3.8;

    const goldBoxMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.25,
      emissive: 0x331e00
    });

    const pinkRibbonMat = new THREE.MeshStandardMaterial({
      color: 0xff3b7b,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x44081c
    });

    const boxBase = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, boxD), goldBoxMat);
    boxBase.position.y = -0.5;
    boxBase.userData = { isGiftBox: true };
    giftGroup.add(boxBase);

    const ribW = 0.65;
    const rib1 = new THREE.Mesh(new THREE.BoxGeometry(ribW, boxH + 0.05, boxD + 0.05), pinkRibbonMat);
    rib1.position.y = -0.5;
    rib1.userData = { isGiftBox: true };
    giftGroup.add(rib1);

    const rib2 = new THREE.Mesh(new THREE.BoxGeometry(boxW + 0.05, boxH + 0.05, ribW), pinkRibbonMat);
    rib2.position.y = -0.5;
    rib2.userData = { isGiftBox: true };
    giftGroup.add(rib2);

    giftBoxLid = new THREE.Group();
    giftBoxLid.position.set(0, boxH / 2 - 0.5, -boxD / 2);

    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(boxW + 0.3, 0.7, boxD + 0.3), goldBoxMat);
    lidMesh.position.set(0, 0.35, boxD / 2);
    lidMesh.userData = { isGiftBox: true };
    giftBoxLid.add(lidMesh);

    const lidRib1 = new THREE.Mesh(new THREE.BoxGeometry(ribW, 0.75, boxD + 0.35), pinkRibbonMat);
    lidRib1.position.set(0, 0.35, boxD / 2);
    lidRib1.userData = { isGiftBox: true };
    giftBoxLid.add(lidRib1);

    const lidRib2 = new THREE.Mesh(new THREE.BoxGeometry(boxW + 0.35, 0.75, ribW), pinkRibbonMat);
    lidRib2.position.set(0, 0.35, boxD / 2);
    lidRib2.userData = { isGiftBox: true };
    giftBoxLid.add(lidRib2);

    giftBoxRibbon = new THREE.Group();
    giftBoxRibbon.position.set(0, 0.7, boxD / 2);

    const loopGeo = new THREE.TorusGeometry(0.55, 0.15, 16, 32);
    const bowL = new THREE.Mesh(loopGeo, pinkRibbonMat);
    bowL.rotation.y = Math.PI / 4;
    bowL.rotation.z = Math.PI / 4;
    bowL.userData = { isGiftBox: true };
    giftBoxRibbon.add(bowL);

    const bowR = new THREE.Mesh(loopGeo, pinkRibbonMat);
    bowR.rotation.y = -Math.PI / 4;
    bowR.rotation.z = -Math.PI / 4;
    bowR.userData = { isGiftBox: true };
    giftBoxRibbon.add(bowR);

    const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), pinkRibbonMat);
    bowKnot.userData = { isGiftBox: true };
    giftBoxRibbon.add(bowKnot);

    giftBoxLid.add(giftBoxRibbon);
    giftGroup.add(giftBoxLid);

    giftInteriorLight = new THREE.PointLight(0xfff08a, 0, 20);
    giftInteriorLight.position.set(0, 0, 0);
    giftGroup.add(giftInteriorLight);

    const burstCount = 200;
    const burstGeo = new THREE.BufferGeometry();
    const burstPositions = new Float32Array(burstCount * 3);
    for (let i = 0; i < burstCount; i++) {
      burstPositions[i * 3] = (Math.random() - 0.5) * 1.5;
      burstPositions[i * 3 + 1] = Math.random() * 0.5;
      burstPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    const burstMat = new THREE.PointsMaterial({
      size: 0.5,
      color: 0xfde047,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    giftBurstParticles = new THREE.Points(burstGeo, burstMat);
    giftBurstParticles.position.set(0, 0, 0);
    giftGroup.add(giftBurstParticles);

    giftGroup.position.set(0, -0.6, -160);
    scene.add(giftGroup);
  }

  // ==========================================================================
  // Scene 6: Final Birthday Wish
  // ==========================================================================

  function buildFinalScene() {
    finalGroup = new THREE.Group();
    finalGroup.position.set(0, 0, -200);

    const goldBorderMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.22,
      emissive: 0x452300
    });

    const f1Group = new THREE.Group();
    const geo1 = new THREE.PlaneGeometry(2.8, 4.8);
    finalPortrait1 = new THREE.Mesh(geo1, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    f1Group.add(finalPortrait1);

    const f1Trim = new THREE.Mesh(new THREE.BoxGeometry(3.1, 5.1, 0.15), goldBorderMat);
    f1Trim.position.z = -0.1;
    f1Group.add(f1Trim);

    f1Group.position.set(-3.5, 0.5, 0);
    f1Group.rotation.y = 0.25;
    finalGroup.add(f1Group);

    const f2Group = new THREE.Group();
    const geo2 = new THREE.PlaneGeometry(2.6, 5.0);
    finalPortrait2 = new THREE.Mesh(geo2, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    f2Group.add(finalPortrait2);

    const f2Trim = new THREE.Mesh(new THREE.BoxGeometry(2.9, 5.3, 0.15), goldBorderMat);
    f2Trim.position.z = -0.1;
    f2Group.add(f2Trim);

    f2Group.position.set(3.5, 0.5, 0);
    f2Group.rotation.y = -0.25;
    finalGroup.add(f2Group);

    const finalLight = new THREE.PointLight(0xffa500, 2.5, 25);
    finalLight.position.set(0, 2, 4);
    finalGroup.add(finalLight);

    scene.add(finalGroup);
  }

  // ==========================================================================
  // Fireworks System
  // ==========================================================================

  function launchFirework() {
    const particleCount = 70;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    const origin = new THREE.Vector3(
      (Math.random() - 0.5) * 28,
      camera.position.y + 4 + Math.random() * 8,
      camera.position.z - 15 - Math.random() * 10
    );

    const colors = [0xff4d8d, 0xfbbf24, 0x60a5fa, 0x34d399, 0xf472b6];
    const col = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;

      const speed = 0.12 + Math.random() * 0.22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      velocities.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.65,
      color: col,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const fireworkMesh = new THREE.Points(geo, mat);
    scene.add(fireworkMesh);

    fireworks.push({
      mesh: fireworkMesh,
      velocities: velocities,
      age: 0,
      lifespan: 60 + Math.random() * 30
    });
  }

  function updateFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      fw.age++;

      const positions = fw.mesh.geometry.attributes.position.array;
      for (let j = 0; j < fw.velocities.length; j++) {
        positions[j * 3] += fw.velocities[j].x;
        positions[j * 3 + 1] += fw.velocities[j].y;
        positions[j * 3 + 2] += fw.velocities[j].z;

        fw.velocities[j].y -= 0.003;
        fw.velocities[j].multiplyScalar(0.97);
      }
      fw.mesh.geometry.attributes.position.needsUpdate = true;

      fw.mesh.material.opacity = 1 - fw.age / fw.lifespan;

      if (fw.age >= fw.lifespan) {
        scene.remove(fw.mesh);
        fw.mesh.geometry.dispose();
        fw.mesh.material.dispose();
        fireworks.splice(i, 1);
      }
    }
  }

  // ==========================================================================
  // Scene Navigation & 3D Interactive Triggers
  // ==========================================================================

  const sceneCameraTargets = [
    { pos: new THREE.Vector3(0, 0, 11), lookAt: new THREE.Vector3(0, 0, 0) },      // 0: Entrance
    { pos: new THREE.Vector3(0, -0.5, -29), lookAt: new THREE.Vector3(0, 0, -40) }, // 1: Celebration
    { pos: new THREE.Vector3(0, 0, -68), lookAt: new THREE.Vector3(0, 0, -80) },    // 2: Memories
    { pos: new THREE.Vector3(0, 0.8, -108), lookAt: new THREE.Vector3(0, 1, -120) }, // 3: Heart Messages
    { pos: new THREE.Vector3(0, 0, -148), lookAt: new THREE.Vector3(0, -0.5, -160) }, // 4: Gift Box
    { pos: new THREE.Vector3(0, 0.5, -188), lookAt: new THREE.Vector3(0, 0.5, -200) } // 5: Final Wish
  ];

  function goToScene(index, animate = true) {
    if (index < 0 || index >= sceneCameraTargets.length) return;
    currentSceneIndex = index;
    const target = sceneCameraTargets[index];

    const isMobile = window.innerWidth < 768;
    const targetZ = isMobile ? target.pos.z + 3 : target.pos.z;

    if (!animate || typeof gsap === 'undefined') {
      camera.position.set(target.pos.x, target.pos.y, targetZ);
      camera.lookAt(target.lookAt);
      return;
    }

    gsap.to(camera.position, {
      x: target.pos.x,
      y: target.pos.y,
      z: targetZ,
      duration: 1.8,
      ease: 'power3.inOut'
    });
  }

  function openEntranceDoor(onComplete) {
    if (isDoorOpened) {
      goToScene(1, true);
      if (onComplete) onComplete();
      return;
    }

    isDoorOpened = true;

    if (typeof gsap === 'undefined') {
      if (onComplete) onComplete();
      return;
    }

    gsap.to(doorLeft.rotation, { y: -Math.PI * 0.55, duration: 2.0, ease: 'power2.inOut' });
    gsap.to(doorRight.rotation, { y: Math.PI * 0.55, duration: 2.0, ease: 'power2.inOut' });
    gsap.to(doorLight, { intensity: 6.0, duration: 1.2, yoyo: true, repeat: 1 });

    gsap.to(camera.position, {
      z: 0,
      duration: 2.2,
      ease: 'power2.in',
      onComplete: function () {
        goToScene(1, true);
        if (onComplete) onComplete();
      }
    });
  }

  function openGiftBox(onComplete) {
    if (isGiftOpened) {
      if (onComplete) onComplete();
      return;
    }

    isGiftOpened = true;

    if (typeof gsap === 'undefined') {
      if (onComplete) onComplete();
      return;
    }

    gsap.to(giftBoxRibbon.position, {
      y: 6,
      duration: 1.2,
      ease: 'power2.out'
    });
    gsap.to(giftBoxRibbon.scale, {
      x: 0.1, y: 0.1, z: 0.1,
      duration: 1.2,
      ease: 'power2.in'
    });

    gsap.to(giftBoxLid.rotation, {
      x: -Math.PI * 0.45,
      duration: 1.6,
      delay: 0.2,
      ease: 'back.out(1.5)'
    });
    gsap.to(giftBoxLid.position, {
      y: 3.2,
      z: -giftGroup.position.z - 1.5,
      duration: 1.6,
      delay: 0.2,
      ease: 'power2.out'
    });

    gsap.to(giftInteriorLight, {
      intensity: 8.0,
      duration: 1.0,
      delay: 0.3
    });

    gsap.to(giftBurstParticles.material, {
      opacity: 1,
      duration: 0.5,
      delay: 0.3,
      onComplete: function () {
        if (onComplete) onComplete();
      }
    });
  }

  function pulseHeart() {
    if (!pulsingHeartMesh || typeof gsap === 'undefined') return;

    gsap.killTweensOf(pulsingHeartMesh.scale);
    gsap.timeline()
      .to(pulsingHeartMesh.scale, { x: 0.64, y: 0.64, z: 0.64, duration: 0.15, ease: 'power2.out' })
      .to(pulsingHeartMesh.scale, { x: 0.44, y: 0.44, z: 0.44, duration: 0.12, ease: 'power2.in' })
      .to(pulsingHeartMesh.scale, { x: 0.56, y: 0.56, z: 0.56, duration: 0.12, ease: 'power2.out' })
      .to(pulsingHeartMesh.scale, { x: 0.48, y: 0.48, z: 0.48, duration: 0.2, ease: 'elastic.out(1.2, 0.3)' });

    gsap.to(heartHaloLight, { intensity: 7.5, duration: 0.25, yoyo: true, repeat: 1 });
  }

  function onCanvasClick(e) {
    mouseCoords.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseCoords.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseCoords, camera);

    if (currentSceneIndex === 0 && entranceGroup) {
      const intersects = raycaster.intersectObjects(entranceGroup.children, true);
      if (intersects.length > 0) {
        for (let hit of intersects) {
          if (hit.object.userData && hit.object.userData.isDoor) {
            if (window.App && window.App.onDoorClicked) {
              window.App.onDoorClicked();
              break;
            }
          }
        }
      }
    } else if (currentSceneIndex === 3 && pulsingHeartMesh) {
      const intersects = raycaster.intersectObject(pulsingHeartMesh, true);
      if (intersects.length > 0) {
        pulseHeart();
        if (window.App && window.App.onHeartClicked) {
          window.App.onHeartClicked();
        }
      }
    } else if (currentSceneIndex === 4 && giftGroup) {
      const intersects = raycaster.intersectObjects(giftGroup.children, true);
      if (intersects.length > 0) {
        if (window.App && window.App.onGiftBoxClicked) {
          window.App.onGiftBoxClicked();
        }
      }
    } else if (currentSceneIndex === 1 && cakeGroup) {
      const intersects = raycaster.intersectObjects(cakeGroup.children, true);
      if (intersects.length > 0) {
        launchFirework();
        if (typeof confetti === 'function') {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        }
      }
    }
  }

  function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  }

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const isMobile = width < 768;
    camera.fov = isMobile ? 58 : 48;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x += (mouse.x * 0.8 - camera.position.x + sceneCameraTargets[currentSceneIndex].pos.x) * 0.04;
    camera.position.y += (-mouse.y * 0.6 - camera.position.y + sceneCameraTargets[currentSceneIndex].pos.y) * 0.04;

    if (starField) {
      starField.rotation.y = elapsedTime * 0.015;
      starField.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;
    }

    if (floatingHeartsSystem) {
      floatingHeartsSystem.children.forEach(mesh => {
        mesh.position.y += mesh.userData.speedY;
        mesh.position.x = mesh.userData.baseX + Math.sin(elapsedTime * mesh.userData.swaySpeed + mesh.userData.swayOffset) * 0.8;
        mesh.rotation.y += mesh.userData.rotSpeed;

        if (mesh.position.y > 20) {
          mesh.position.y = -20;
        }
      });
    }

    pinkPointLight.position.x = Math.sin(elapsedTime * 0.8) * 8;
    pinkPointLight.position.y = Math.cos(elapsedTime * 0.6) * 4;
    goldPointLight.position.x = -Math.sin(elapsedTime * 0.7) * 8;
    goldPointLight.position.y = -Math.cos(elapsedTime * 0.5) * 4;

    balloons.forEach(b => {
      b.position.y += b.userData.speedY;
      b.position.x = b.userData.baseX + Math.sin(elapsedTime * b.userData.swaySpeed + b.userData.offset) * 0.6;
      b.rotation.y += b.userData.rotSpeed;

      if (b.position.y > 20) {
        b.position.y = -18;
      }
    });

    if (candleFlameLight) {
      candleFlameLight.intensity = 2.4 + Math.sin(elapsedTime * 20) * 0.4 + Math.cos(elapsedTime * 35) * 0.3;
      candleFlames.forEach((flame, idx) => {
        const flicker = 1 + Math.sin(elapsedTime * 15 + idx) * 0.15;
        flame.scale.set(flicker, flicker, flicker);
      });
    }

    if (pulsingHeartMesh && currentSceneIndex === 3) {
      const beat = (Math.sin(elapsedTime * 3.5) + 1) * 0.5;
      const subtleScale = 0.48 + Math.pow(beat, 4) * 0.04;
      pulsingHeartMesh.scale.set(subtleScale, subtleScale, subtleScale);
      pulsingHeartMesh.rotation.y = Math.sin(elapsedTime * 0.8) * 0.2;
    }

    if (portraitMesh && portraitMesh.parent) {
      portraitMesh.parent.rotation.y = -0.18 + Math.sin(elapsedTime * 0.6) * 0.08 + mouse.x * 0.15;
      portraitMesh.parent.position.y = 0.2 + Math.sin(elapsedTime * 1.2) * 0.15;
    }
    if (bgPhotoMesh && bgPhotoMesh.parent) {
      bgPhotoMesh.parent.rotation.y = 0.22 - Math.sin(elapsedTime * 0.5) * 0.06;
      bgPhotoMesh.parent.position.y = -0.4 + Math.cos(elapsedTime * 1.1) * 0.12;
    }

    updateFireworks();

    if ((currentSceneIndex === 1 || currentSceneIndex === 5) && Math.random() < 0.035) {
      launchFirework();
    }

    renderer.render(scene, camera);
  }

  return {
    init,
    goToScene,
    openEntranceDoor,
    openGiftBox,
    pulseHeart,
    launchFirework,
    focusPhoto
  };
})();
