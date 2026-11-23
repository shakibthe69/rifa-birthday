/**
 * Main Application Orchestrator for Rifa Jahan's Magical Birthday Surprise
 * Created with love by Shakib Ahmed ❤️
 */

const App = (function () {
  // Romantic Love Messages
  const loveMessages = [
    "Rifa, you are one of the most beautiful chapters of my life.",
    "Your smile has a way of making even ordinary days feel magical.",
    "I may not have the perfect words, but I hope you always know how special you are to me.",
    "May your life always be filled with happiness, peace, success, and endless reasons to smile.",
    "You deserve all the beautiful things this world has to offer.",
    "No matter how many birthdays pass, I hope life keeps giving you new reasons to be happy."
  ];

  // Memory Captions
  const memoryCaptions = [
    "Some people make life more beautiful just by being in it.",
    "Every moment is special when it becomes a memory.",
    "Among millions of moments, some memories become priceless."
  ];

  let currentScene = 0;
  let currentMessageIndex = 0;
  let currentCaptionIndex = 0;
  let captionInterval = null;
  let isGiftOpened = false;

  // DOM Elements
  let scenes = [];
  let navButtons = [];
  let prevArrow, nextArrow;
  let audioElement;
  let playPauseBtn, muteBtn, audioEqualizer;
  let loveMessageText, messageCounterText, messageDotsContainer;
  let giftLetterModal;
  let isAudioPlaying = false;
  let isAudioMuted = false;

  function init() {
    // Collect DOM elements
    scenes = Array.from(document.querySelectorAll('.scene'));
    navButtons = Array.from(document.querySelectorAll('.nav-item-btn'));
    prevArrow = document.getElementById('arrow-prev');
    nextArrow = document.getElementById('arrow-next');
    
    audioElement = document.getElementById('birthday-audio');
    playPauseBtn = document.getElementById('audio-play-pause-btn');
    muteBtn = document.getElementById('audio-mute-btn');
    audioEqualizer = document.getElementById('audio-equalizer');
    
    loveMessageText = document.getElementById('love-message-text');
    messageCounterText = document.getElementById('message-counter-text');
    messageDotsContainer = document.getElementById('message-dots-container');
    giftLetterModal = document.getElementById('gift-letter-modal');

    // 1. Initialize Three.js Engine
    if (window.ThreeWorld) {
      window.ThreeWorld.init('webgl-canvas');
    }

    // 2. Setup Audio Controls
    setupAudio();

    // 3. Setup Navigation & Scene Buttons
    setupSceneNavigation();

    // 4. Setup Love Messages
    setupLoveMessages();

    // 5. Setup Memory Captions Rotation
    setupMemoryCaptions();

    // 6. Setup Gift Modal Interactions
    setupGiftModal();

    // 7. Setup Cursor Sparkle Trail (Desktop)
    setupCursorSparkles();

    // Set initial scene
    showScene(0, false);
  }

  // ==========================================================================
  // Audio Controller
  // ==========================================================================

  function setupAudio() {
    if (!audioElement) return;

    audioElement.volume = 0.85;
    audioElement.loop = true;

    // Play/Pause button
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Mute/Unmute button
    if (muteBtn) {
      muteBtn.addEventListener('click', toggleMute);
    }

    // Attempt to handle ending or pause
    audioElement.addEventListener('play', () => {
      isAudioPlaying = true;
      updateAudioUI();
    });

    audioElement.addEventListener('pause', () => {
      isAudioPlaying = false;
      updateAudioUI();
    });
  }

  function startAudioPlayback() {
    if (!audioElement) return;
    audioElement.play().then(() => {
      isAudioPlaying = true;
      updateAudioUI();
    }).catch(err => {
      console.log('Audio autoplay prevented, awaiting user click:', err);
    });
  }

  function togglePlayPause() {
    if (!audioElement) return;
    if (audioElement.paused) {
      audioElement.play().then(() => {
        isAudioPlaying = true;
        updateAudioUI();
      }).catch(e => console.warn(e));
    } else {
      audioElement.pause();
      isAudioPlaying = false;
      updateAudioUI();
    }
  }

  function toggleMute() {
    if (!audioElement) return;
    audioElement.muted = !audioElement.muted;
    isAudioMuted = audioElement.muted;
    updateAudioUI();
  }

  function updateAudioUI() {
    if (playPauseBtn) {
      playPauseBtn.innerHTML = isAudioPlaying ? '❚❚' : '▶';
      playPauseBtn.setAttribute('title', isAudioPlaying ? 'Pause Music' : 'Play Music');
    }
    if (muteBtn) {
      muteBtn.innerHTML = isAudioMuted ? '🔇' : '🔊';
      muteBtn.setAttribute('title', isAudioMuted ? 'Unmute' : 'Mute');
    }
    if (audioEqualizer) {
      if (isAudioPlaying && !isAudioMuted) {
        audioEqualizer.classList.add('playing');
      } else {
        audioEqualizer.classList.remove('playing');
      }
    }
  }

  // ==========================================================================
  // Scene Navigation
  // ==========================================================================

  function setupSceneNavigation() {
    // Bottom navigation pills
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetIndex = parseInt(btn.getAttribute('data-scene'), 10);
        goTo(targetIndex);
      });
    });

    // Arrow controls
    if (prevArrow) {
      prevArrow.addEventListener('click', () => {
        if (currentScene > 0) goTo(currentScene - 1);
      });
    }

    if (nextArrow) {
      nextArrow.addEventListener('click', () => {
        if (currentScene < scenes.length - 1) goTo(currentScene + 1);
      });
    }

    // Keyboard navigation (Arrow keys)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentScene < scenes.length - 1) goTo(currentScene + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentScene > 0) goTo(currentScene - 1);
      }
    });

    // Enter Surprise Button (Scene 1 -> Scene 2)
    const enterBtn = document.getElementById('enter-surprise-btn');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        startAudioPlayback();
        triggerDoorAndCelebrate();
      });
    }

    // Celebration Next Button (Scene 2 -> Scene 3)
    const celebrationNextBtn = document.getElementById('celebration-next-btn');
    if (celebrationNextBtn) {
      celebrationNextBtn.addEventListener('click', () => goTo(2));
    }

    // Memories Next Button (Scene 3 -> Scene 4)
    const memoriesNextBtn = document.getElementById('memories-next-btn');
    if (memoriesNextBtn) {
      memoriesNextBtn.addEventListener('click', () => goTo(3));
    }

    // Messages Next Button (Scene 4 -> Scene 5)
    const messagesNextBtn = document.getElementById('messages-next-btn');
    if (messagesNextBtn) {
      messagesNextBtn.addEventListener('click', () => goTo(4));
    }

    // Gift Open Button (Scene 5)
    const openGiftBtn = document.getElementById('open-gift-btn');
    if (openGiftBtn) {
      openGiftBtn.addEventListener('click', () => triggerGiftOpening());
    }

    // Final Next Button (inside Gift Modal -> Scene 6)
    const proceedToFinalBtn = document.getElementById('proceed-to-final-btn');
    if (proceedToFinalBtn) {
      proceedToFinalBtn.addEventListener('click', () => {
        closeGiftModal();
        goTo(5);
      });
    }

    // Replay Button (Scene 6 -> Scene 1)
    const replayBtn = document.getElementById('replay-magic-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        goTo(0);
      });
    }
  }

  function triggerDoorAndCelebrate() {
    // 1. Trigger 3D Door Open animation & forward camera zoom
    if (window.ThreeWorld) {
      window.ThreeWorld.openEntranceDoor(() => {
        showScene(1, true);
        fireConfettiBurst();
      });
    } else {
      goTo(1);
    }
  }

  function goTo(index) {
    if (index < 0 || index >= scenes.length) return;
    if (index === currentScene) return;

    showScene(index, true);

    // Three.js camera movement
    if (window.ThreeWorld) {
      window.ThreeWorld.goToScene(index, true);
    }

    // Scene specific initializations
    if (index === 1) {
      fireConfettiBurst();
    } else if (index === 5) {
      fireConfettiBurst();
      if (window.ThreeWorld) {
        window.ThreeWorld.launchFirework();
      }
    }
  }

  function showScene(index, animated = true) {
    scenes.forEach((sc, i) => {
      if (i === index) {
        sc.classList.add('active');
      } else {
        sc.classList.remove('active');
      }
    });

    navButtons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Arrow visibility
    if (prevArrow) {
      if (index === 0) prevArrow.classList.add('hidden');
      else prevArrow.classList.remove('hidden');
    }
    if (nextArrow) {
      if (index === scenes.length - 1) nextArrow.classList.add('hidden');
      else nextArrow.classList.remove('hidden');
    }

    currentScene = index;
  }

  // ==========================================================================
  // Love Messages (Scene 4)
  // ==========================================================================

  function setupLoveMessages() {
    if (!messageDotsContainer) return;

    // Generate dots
    messageDotsContainer.innerHTML = '';
    loveMessages.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = 'message-dot' + (idx === 0 ? ' active' : '');
      messageDotsContainer.appendChild(dot);
    });

    displayLoveMessage(0);

    // Click on message card to also advance message
    const card = document.getElementById('love-message-card');
    if (card) {
      card.addEventListener('click', nextLoveMessage);
    }
  }

  function displayLoveMessage(index) {
    currentMessageIndex = index;
    if (loveMessageText) {
      loveMessageText.style.opacity = '0';
      loveMessageText.style.transform = 'translateY(8px)';

      setTimeout(() => {
        loveMessageText.innerText = loveMessages[currentMessageIndex];
        loveMessageText.style.opacity = '1';
        loveMessageText.style.transform = 'translateY(0)';
      }, 200);
    }

    if (messageCounterText) {
      messageCounterText.innerText = `Message ${currentMessageIndex + 1} of ${loveMessages.length}`;
    }

    // Update dots
    const dots = document.querySelectorAll('.message-dot');
    dots.forEach((dot, idx) => {
      if (idx === currentMessageIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }

  function nextLoveMessage() {
    let nextIdx = (currentMessageIndex + 1) % loveMessages.length;
    displayLoveMessage(nextIdx);

    // Trigger 3D Heart Pulse
    if (window.ThreeWorld) {
      window.ThreeWorld.pulseHeart();
    }
  }

  // Raycast click callback from 3D Heart
  function onHeartClicked() {
    nextLoveMessage();
  }

  // ==========================================================================
  // Memory Captions Carousel (Scene 3)
  // ==========================================================================

  function setupMemoryCaptions() {
    const captionElems = document.querySelectorAll('.memory-caption-item');
    if (captionElems.length === 0) return;

    if (captionInterval) clearInterval(captionInterval);

    captionInterval = setInterval(() => {
      if (currentScene !== 2) return; // Only rotate when on memories scene

      captionElems[currentCaptionIndex].classList.remove('active');
      currentCaptionIndex = (currentCaptionIndex + 1) % captionElems.length;
      captionElems[currentCaptionIndex].classList.add('active');
    }, 4500);
  }

  // ==========================================================================
  // Gift Box & Letter Modal (Scene 5)
  // ==========================================================================

  function setupGiftModal() {
    const closeBtn = document.getElementById('letter-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeGiftModal);
    }

    if (giftLetterModal) {
      giftLetterModal.addEventListener('click', (e) => {
        if (e.target === giftLetterModal) {
          closeGiftModal();
        }
      });
    }
  }

  function triggerGiftOpening() {
    if (isGiftOpened) {
      openGiftModal();
      return;
    }

    isGiftOpened = true;

    // Trigger 3D gift box opening
    if (window.ThreeWorld) {
      window.ThreeWorld.openGiftBox(() => {
        openGiftModal();
        fireConfettiBurst();
      });
    } else {
      openGiftModal();
      fireConfettiBurst();
    }
  }

  function onGiftBoxClicked() {
    triggerGiftOpening();
  }

  function openGiftModal() {
    if (giftLetterModal) {
      giftLetterModal.classList.add('open');
    }
  }

  function closeGiftModal() {
    if (giftLetterModal) {
      giftLetterModal.classList.remove('open');
    }
  }

  // ==========================================================================
  // Confetti Burst Effects
  // ==========================================================================

  function fireConfettiBurst() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d8d', '#fbbf24', '#f472b6', '#a855f7', '#ffffff']
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff4d8d', '#fbbf24', '#ffffff']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a855f7', '#f472b6', '#f59e0b']
        });
      }, 300);
    }
  }

  // ==========================================================================
  // Cursor Sparkle Trails (Desktop)
  // ==========================================================================

  function setupCursorSparkles() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Touch device

    let lastSparkleTime = 0;
    const colors = ['#fde047', '#ff7597', '#ffffff', '#c084fc'];

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSparkleTime < 50) return; // Throttle
      lastSparkleTime = now;

      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle-particle';
      const size = 4 + Math.random() * 6;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.boxShadow = `0 0 ${size * 2}px ${sparkle.style.backgroundColor}`;
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;

      document.body.appendChild(sparkle);
      setTimeout(() => {
        sparkle.remove();
      }, 800);
    });
  }

  // Public Interface
  return {
    init,
    goTo,
    onHeartClicked,
    onGiftBoxClicked
  };
})();

// Initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
