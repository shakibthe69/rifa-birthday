/**
 * Three.js 3D Engine for Rifa Jahan's Magical Birthday Surprise
 * Created with love by Shakib Ahmed ❤️
 */

const ThreeWorld = (function () {
  let container, canvas;
  let scene, camera, renderer;
  let ambientLight, mainLight, pinkPointLight, goldPointLight;
  let starField, starGeometry, starColors;
  let floatingHeartsSystem;
  let fireworks = [];
  
  // Scene-specific groups
  let entranceGroup;
  let celebrationGroup;
  let memoriesGroup;
  let heartGroup;
  let giftGroup;
  let finalGroup;
  
  // Interactive 3D Objects
  let doorLeft, doorRight, doorLight, doorSparks;
  let balloons = [];
  let cakeGroup, candleFlameLight, candleFlames = [];
  let portraitMesh, bgPhotoMesh;
  let pulsingHeartMesh, heartHaloLight;
  let giftBoxLid, giftBoxRibbon, giftInteriorLight, giftBurstParticles;
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

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    container = canvas.parentElement;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080514, 0.025);

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

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
    renderer.toneMappingExposure = 1.2;

    // 3. Load Textures
    loadAssets();

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

  function loadAssets() {
    textureLoader.load(
      'assets/images/rifa-portrait.jpg',
      function (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        rifaPortraitTexture = tex;
        updatePhotoTextures();
      },
      undefined,
      function (err) {
        console.warn('Portrait texture load fallback:', err);
      }
    );

    textureLoader.load(
      'assets/images/background.jpg',
      function (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        bgPhotoTexture = tex;
        updatePhotoTextures();
      },
      undefined,
      function (err) {
        console.warn('Background texture load fallback:', err);
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

    mainLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    mainLight.position.set(5, 10, 8);
    scene.add(mainLight);

    pinkPointLight = new THREE.PointLight(0xff4d8d, 2.5, 30);
    pinkPointLight.position.set(-6, 3, 5);
    scene.add(pinkPointLight);

    goldPointLight = new THREE.PointLight(0xfbbf24, 2.2, 30);
    goldPointLight.position.set(6, -2, 6);
    scene.add(goldPointLight);
  }

  // ==========================================================================
  // Ambient Starfield & Floating Hearts
  // ==========================================================================

  function createStarfield() {
    const starCount = 1200;
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
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture (soft circular glow)
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
      size: 1.2,
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
    const heartCount = 45;
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
      opacity: 0.75
    });

    floatingHeartsSystem = new THREE.Group();

    for (let i = 0; i < heartCount; i++) {
      const mesh = new THREE.Mesh(heartGeo, heartMat.clone());
      mesh.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20 - 5
      );
      mesh.rotation.z = Math.PI; // Heart orientation
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
  // Scene 1: The Magical Entrance Room
  // ==========================================================================

  function buildEntranceScene() {
    entranceGroup = new THREE.Group();
    entranceGroup.position.set(0, 0, 0);

    // Ornate Golden Archway Frame
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
    doorLeft.position.set(-doorWidth, 0, 0); // Hinge position
    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness), doorMat);
    leftPanel.position.set(doorWidth / 2, 0, 0); // offset center from hinge
    
    // Left Door Gold Trim
    const trimGeo = new THREE.BoxGeometry(doorWidth * 0.75, doorHeight * 0.8, 0.05);
    const trimMeshL = new THREE.Mesh(trimGeo, goldMat);
    trimMeshL.position.set(doorWidth / 2, 0, doorThickness / 2 + 0.03);
    doorLeft.add(leftPanel);
    doorLeft.add(trimMeshL);

    // Left Handle
    const handleL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMat);
    handleL.position.set(doorWidth * 0.85, 0, doorThickness / 2 + 0.15);
    doorLeft.add(handleL);

    entranceGroup.add(doorLeft);

    // Right Door Pivot Group
    doorRight = new THREE.Group();
    doorRight.position.set(doorWidth, 0, 0); // Hinge position
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness), doorMat);
    rightPanel.position.set(-doorWidth / 2, 0, 0); // offset center from hinge

    // Right Door Gold Trim
    const trimMeshR = new THREE.Mesh(trimGeo, goldMat);
    trimMeshR.position.set(-doorWidth / 2, 0, doorThickness / 2 + 0.03);
    doorRight.add(rightPanel);
    doorRight.add(trimMeshR);

    // Right Handle
    const handleR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMat);
    handleR.position.set(-doorWidth * 0.85, 0, doorThickness / 2 + 0.15);
    doorRight.add(handleR);

    entranceGroup.add(doorRight);

    // Light glowing from inside the door doorway
    doorLight = new THREE.PointLight(0xffdf80, 0, 25);
    doorLight.position.set(0, 0, -2);
    entranceGroup.add(doorLight);

    // Golden sparks / fairy dust around entrance
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

  // ==========================================================================
  // Scene 2: Infinite Birthday Balloon Celebration & Animated 3D Cake
  // ==========================================================================

  function buildCelebrationScene() {
    celebrationGroup = new THREE.Group();
    celebrationGroup.position.set(0, 0, -40); // Initial scene offset

    // 1. Hundreds of 3D Balloons
    const balloonCount = 140;
    const balloonColors = [
      0xff3377, // Vibrant Pink
      0xf472b6, // Soft Rose
      0xa855f7, // Lavender Purple
      0xf59e0b, // Radiant Gold
      0xef4444, // Ruby Red
      0xffffff, // Pearl White
      0xfb7185  // Peach Pink
    ];

    const sphereGeo = new THREE.SphereGeometry(0.85, 24, 24);
    sphereGeo.scale(1, 1.25, 1); // Balloon oval shape
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

      // Balloon string
      const stringCurve = new THREE.LineCurve3(
        new THREE.Vector3(0, -1.25, 0),
        new THREE.Vector3(0.1, -3.2, 0)
      );
      const stringGeo = new THREE.BufferGeometry().setFromPoints(stringCurve.getPoints(8));
      const stringMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
      const bString = new THREE.Line(stringGeo, stringMat);
      bGroup.add(bString);

      // Random scale and positioning
      const scale = 0.65 + Math.random() * 0.75;
      bGroup.scale.set(scale, scale, scale);

      bGroup.position.set(
        (Math.random() - 0.5) * 32,
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

    // 2. Beautiful Animated 3D Cake
    cakeGroup = new THREE.Group();
    cakeGroup.position.set(0, -3.8, 2);
    cakeGroup.scale.set(1.1, 1.1, 1.1);

    // Cake Stand
    const standMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.35, 32), standMat);
    standBase.position.y = -0.18;
    cakeGroup.add(standBase);

    // Cake Tier 1 (Bottom)
    const cakeMat1 = new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.4, metalness: 0.1 });
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.2, 36), cakeMat1);
    tier1.position.y = 0.6;
    cakeGroup.add(tier1);

    // Tier 1 Frosting Trim
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xff4d8d, roughness: 0.3, metalness: 0.3 });
    const trim1 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.12, 16, 40), trimMat);
    trim1.rotation.x = Math.PI / 2;
    trim1.position.y = 1.2;
    cakeGroup.add(trim1);

    // Cake Tier 2 (Middle)
    const cakeMat2 = new THREE.MeshStandardMaterial({ color: 0xfce7f3, roughness: 0.4, metalness: 0.1 });
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 1.0, 36), cakeMat2);
    tier2.position.y = 1.7;
    cakeGroup.add(tier2);

    const trim2 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.1, 16, 40), standMat);
    trim2.rotation.x = Math.PI / 2;
    trim2.position.y = 2.2;
    cakeGroup.add(trim2);

    // Cake Tier 3 (Top)
    const cakeMat3 = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
    const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.8, 32), cakeMat3);
    tier3.position.y = 2.6;
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

    // Candle Flicker Light
    candleFlameLight = new THREE.PointLight(0xffa500, 2.8, 8);
    candleFlameLight.position.set(0, 4.2, 0);
    cakeGroup.add(candleFlameLight);

    celebrationGroup.add(cakeGroup);
    scene.add(celebrationGroup);
  }

  // ==========================================================================
  // Scene 3: Our Special Memories (3D Floating Photo Frames)
  // ==========================================================================

  function buildMemoriesScene() {
    memoriesGroup = new THREE.Group();
    memoriesGroup.position.set(0, 0, -80);

    // Main 3D Photo Frame for Rifa Portrait (Photograph 2: 389x755)
    const frameW = 3.6;
    const frameH = 7.0; // matched to aspect ratio ~ 1 : 1.94
    const borderThickness = 0.28;

    const goldFrameMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.22,
      emissive: 0x3d2000
    });

    const mainFrameGroup = new THREE.Group();

    // Outer Frame Borders
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

    // Photo Plane
    const portraitGeo = new THREE.PlaneGeometry(frameW, frameH);
    const portraitMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    mainFrameGroup.add(portraitMesh);

    // Frame Backing
    const backGeo = new THREE.PlaneGeometry(frameW + borderThickness * 2, frameH + borderThickness * 2);
    const backMat = new THREE.MeshStandardMaterial({ color: 0x140a25, roughness: 0.5 });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -0.16;
    mainFrameGroup.add(backMesh);

    // Soft warm backlight halo
    const frameGlow = new THREE.PointLight(0xff7597, 2.5, 12);
    frameGlow.position.set(0, 0, -1);
    mainFrameGroup.add(frameGlow);

    mainFrameGroup.position.set(2.8, 0.2, 2);
    mainFrameGroup.rotation.y = -0.18;
    memoriesGroup.add(mainFrameGroup);

    // Secondary Photo (Photograph 1: background.jpg, 933x1600)
    const secW = 3.2;
    const secH = 5.5;
    const bgPhotoGeo = new THREE.PlaneGeometry(secW, secH);
    const bgPhotoMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });
    bgPhotoMesh = new THREE.Mesh(bgPhotoGeo, bgPhotoMat);

    const secFrameGroup = new THREE.Group();
    secFrameGroup.add(bgPhotoMesh);

    // Delicate rose-gold trim around secondary photo
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
    pulsingHeartMesh.rotation.z = Math.PI; // Correct orientation
    pulsingHeartMesh.position.set(0, 1.4, 0);
    pulsingHeartMesh.userData = { isHeartButton: true };
    heartGroup.add(pulsingHeartMesh);

    // Light glowing from the heart
    heartHaloLight = new THREE.PointLight(0xff2b75, 4.0, 16);
    heartHaloLight.position.set(0, 1.4, 1.5);
    heartGroup.add(heartHaloLight);

    // Orbiting Fairy Sparkles ring
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

    // Box Base
    const boxBase = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, boxD), goldBoxMat);
    boxBase.position.y = -0.5;
    boxBase.userData = { isGiftBox: true };
    giftGroup.add(boxBase);

    // Base Ribbons
    const ribW = 0.65;
    const rib1 = new THREE.Mesh(new THREE.BoxGeometry(ribW, boxH + 0.05, boxD + 0.05), pinkRibbonMat);
    rib1.position.y = -0.5;
    giftGroup.add(rib1);

    const rib2 = new THREE.Mesh(new THREE.BoxGeometry(boxW + 0.05, boxH + 0.05, ribW), pinkRibbonMat);
    rib2.position.y = -0.5;
    giftGroup.add(rib2);

    // Box Lid (Pivoted group for opening)
    giftBoxLid = new THREE.Group();
    giftBoxLid.position.set(0, boxH / 2 - 0.5, -boxD / 2); // Pivot on back edge

    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(boxW + 0.3, 0.7, boxD + 0.3), goldBoxMat);
    lidMesh.position.set(0, 0.35, boxD / 2); // offset from pivot
    lidMesh.userData = { isGiftBox: true };
    giftBoxLid.add(lidMesh);

    // Lid Ribbons
    const lidRib1 = new THREE.Mesh(new THREE.BoxGeometry(ribW, 0.75, boxD + 0.35), pinkRibbonMat);
    lidRib1.position.set(0, 0.35, boxD / 2);
    giftBoxLid.add(lidRib1);

    const lidRib2 = new THREE.Mesh(new THREE.BoxGeometry(boxW + 0.35, 0.75, ribW), pinkRibbonMat);
    lidRib2.position.set(0, 0.35, boxD / 2);
    giftBoxLid.add(lidRib2);

    // Ribbon Bow on top
    giftBoxRibbon = new THREE.Group();
    giftBoxRibbon.position.set(0, 0.7, boxD / 2);

    const loopGeo = new THREE.TorusGeometry(0.55, 0.15, 16, 32);
    const bowL = new THREE.Mesh(loopGeo, pinkRibbonMat);
    bowL.rotation.y = Math.PI / 4;
    bowL.rotation.z = Math.PI / 4;
    giftBoxRibbon.add(bowL);

    const bowR = new THREE.Mesh(loopGeo, pinkRibbonMat);
    bowR.rotation.y = -Math.PI / 4;
    bowR.rotation.z = -Math.PI / 4;
    giftBoxRibbon.add(bowR);

    const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), pinkRibbonMat);
    giftBoxRibbon.add(bowKnot);

    giftBoxLid.add(giftBoxRibbon);
    giftGroup.add(giftBoxLid);

    // Glowing beam from inside the gift
    giftInteriorLight = new THREE.PointLight(0xfff08a, 0, 20);
    giftInteriorLight.position.set(0, 0, 0);
    giftGroup.add(giftInteriorLight);

    // Fountain particles that burst out when gift opens
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
  // Scene 6: Final Birthday Wish (Starry Night Sky with Both Photos)
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

    // Frame 1: Photograph 1 (background.jpg)
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

    // Frame 2: Photograph 2 (rifa-portrait.jpg)
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

    // Warm celebratory center lights
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
      size: 0.6,
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

        // gravity
        fw.velocities[j].y -= 0.003;
        // drag
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

    if (!animate || typeof gsap === 'undefined') {
      camera.position.copy(target.pos);
      camera.lookAt(target.lookAt);
      return;
    }

    gsap.to(camera.position, {
      x: target.pos.x,
      y: target.pos.y,
      z: target.pos.z,
      duration: 1.8,
      ease: 'power3.inOut'
    });
  }

  // Entrance door opening sequence
  function openEntranceDoor(onComplete) {
    if (typeof gsap === 'undefined') {
      if (onComplete) onComplete();
      return;
    }

    // Door panels swing open
    gsap.to(doorLeft.rotation, { y: -Math.PI * 0.55, duration: 2.0, ease: 'power2.inOut' });
    gsap.to(doorRight.rotation, { y: Math.PI * 0.55, duration: 2.0, ease: 'power2.inOut' });

    // Interior glow bursts
    gsap.to(doorLight, { intensity: 6.0, duration: 1.2, yoyo: true, repeat: 1 });

    // Camera zooms forward through doorway into Celebration scene
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

  // Gift Box opening sequence
  function openGiftBox(onComplete) {
    if (typeof gsap === 'undefined') {
      if (onComplete) onComplete();
      return;
    }

    // Ribbon bow flies off
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

    // Lid lifts and tilts open
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

    // Light beam shoots up
    gsap.to(giftInteriorLight, {
      intensity: 8.0,
      duration: 1.0,
      delay: 0.3
    });

    // Particles burst
    gsap.to(giftBurstParticles.material, {
      opacity: 1,
      duration: 0.5,
      delay: 0.3,
      onComplete: function () {
        if (onComplete) onComplete();
      }
    });
  }

  // Trigger heart pulse burst
  function pulseHeart() {
    if (!pulsingHeartMesh || typeof gsap === 'undefined') return;

    gsap.killTweensOf(pulsingHeartMesh.scale);
    gsap.timeline()
      .to(pulsingHeartMesh.scale, { x: 0.62, y: 0.62, z: 0.62, duration: 0.15, ease: 'power2.out' })
      .to(pulsingHeartMesh.scale, { x: 0.44, y: 0.44, z: 0.44, duration: 0.12, ease: 'power2.in' })
      .to(pulsingHeartMesh.scale, { x: 0.54, y: 0.54, z: 0.54, duration: 0.12, ease: 'power2.out' })
      .to(pulsingHeartMesh.scale, { x: 0.48, y: 0.48, z: 0.48, duration: 0.2, ease: 'elastic.out(1.2, 0.3)' });

    gsap.to(heartHaloLight, { intensity: 7.0, duration: 0.25, yoyo: true, repeat: 1 });
  }

  // Canvas Click Raycasting
  function onCanvasClick(e) {
    mouseCoords.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseCoords.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseCoords, camera);

    if (currentSceneIndex === 3 && pulsingHeartMesh) {
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
    }
  }

  // ==========================================================================
  // Mouse & Resize Handlers
  // ==========================================================================

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

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // ==========================================================================
  // Main Animation Loop
  // ==========================================================================

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Mouse parallax lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x += (mouse.x * 0.8 - camera.position.x + sceneCameraTargets[currentSceneIndex].pos.x) * 0.04;
    camera.position.y += (-mouse.y * 0.6 - camera.position.y + sceneCameraTargets[currentSceneIndex].pos.y) * 0.04;

    // Starfield gentle rotation
    if (starField) {
      starField.rotation.y = elapsedTime * 0.015;
      starField.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;
    }

    // Floating background hearts
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

    // Moving dynamic lights
    pinkPointLight.position.x = Math.sin(elapsedTime * 0.8) * 8;
    pinkPointLight.position.y = Math.cos(elapsedTime * 0.6) * 4;
    goldPointLight.position.x = -Math.sin(elapsedTime * 0.7) * 8;
    goldPointLight.position.y = -Math.cos(elapsedTime * 0.5) * 4;

    // Balloons rising animation
    balloons.forEach(b => {
      b.position.y += b.userData.speedY;
      b.position.x = b.userData.baseX + Math.sin(elapsedTime * b.userData.swaySpeed + b.userData.offset) * 0.6;
      b.rotation.y += b.userData.rotSpeed;

      if (b.position.y > 20) {
        b.position.y = -18;
      }
    });

    // Cake candle flame flicker
    if (candleFlameLight) {
      candleFlameLight.intensity = 2.4 + Math.sin(elapsedTime * 20) * 0.4 + Math.cos(elapsedTime * 35) * 0.3;
      candleFlames.forEach((flame, idx) => {
        const flicker = 1 + Math.sin(elapsedTime * 15 + idx) * 0.15;
        flame.scale.set(flicker, flicker, flicker);
      });
    }

    // Heart heartbeat rhythmic pulsation
    if (pulsingHeartMesh && currentSceneIndex === 3) {
      const beat = (Math.sin(elapsedTime * 3.5) + 1) * 0.5;
      const subtleScale = 0.48 + Math.pow(beat, 4) * 0.04;
      pulsingHeartMesh.scale.set(subtleScale, subtleScale, subtleScale);
      pulsingHeartMesh.rotation.y = Math.sin(elapsedTime * 0.8) * 0.2;
    }

    // Photo frame gentle floating
    if (portraitMesh && portraitMesh.parent) {
      portraitMesh.parent.rotation.y = -0.18 + Math.sin(elapsedTime * 0.6) * 0.08 + mouse.x * 0.15;
      portraitMesh.parent.position.y = 0.2 + Math.sin(elapsedTime * 1.2) * 0.15;
    }
    if (bgPhotoMesh && bgPhotoMesh.parent) {
      bgPhotoMesh.parent.rotation.y = 0.22 - Math.sin(elapsedTime * 0.5) * 0.06;
      bgPhotoMesh.parent.position.y = -0.4 + Math.cos(elapsedTime * 1.1) * 0.12;
    }

    // Fireworks update
    updateFireworks();

    // Occasional fireworks in celebration (Scene 1) and final wish (Scene 5)
    if ((currentSceneIndex === 1 || currentSceneIndex === 5) && Math.random() < 0.035) {
      launchFirework();
    }

    renderer.render(scene, camera);
  }

  // Public API
  return {
    init,
    goToScene,
    openEntranceDoor,
    openGiftBox,
    pulseHeart,
    launchFirework
  };
})();
