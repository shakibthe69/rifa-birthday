# Happy Birthday, Rifa Jahan! ❤️

> "To the girl who makes ordinary moments feel extraordinary."  
> — *With all my love, Shakib Ahmed ❤️*

A magical, immersive, interactive 3D birthday surprise website dedicated to **Rifa Jahan**, crafted with love, romantic cinematic visuals, and Three.js 3D animations.

---

## ✨ Features

- **Scene 1: The Magical Entrance Room**  
  A deep midnight-blue romantic sanctum with floating stars, glowing particle dust, and a large golden 3D archway door. Clicking **"ENTER YOUR SURPRISE ✨"** swings open the 3D doors, triggers golden particle bursts, glides the camera into the celebration, and begins the birthday music.

- **Scene 2: Infinite Birthday Balloon Celebration**  
  Over 140 individual floating 3D balloons in pink, purple, gold, ruby red, and pearl white continuously rising with gentle swaying. Features an animated 3D birthday cake with glowing flickering candles, giant glowing typography, fireworks, and confetti explosions.

- **Scene 3: Our Special Memories**  
  An interactive 3D gallery featuring the supplied portrait of Rifa (`rifa-portrait.jpg`) in an ornate golden 3D frame that responds smoothly to mouse and touch tilt, along with a romantic background overlay (`background.jpg`) and a carousel of romantic memory captions.

- **Scene 4: Romantic Love Messages**  
  A glowing, pulsing 3D heart modeled in Three.js with realistic heartbeat pulsation and fairy sparkles. Tapping the heart reveals 6 romantic birthday messages dedicated to Rifa.

- **Scene 5: The Special Gift**  
  A 3D golden gift box tied with pink silk ribbon. Clicking **"OPEN YOUR GIFT 🎁"** animates the ribbon flying away, lifts and tilts the box lid, unleashes an upward beam of golden light, and unfolds a personal birthday letter from Shakib Ahmed.

- **Scene 6: Final Birthday Wish**  
  A celestial starry night sky with fireworks, both floating memory frames, romantic blessings for Rifa's year ahead, and a **"REPLAY OUR LITTLE MAGIC ✨"** button to revisit the magic anytime.

- **Floating Ambient Music Player**  
  Displays the supplied birthday music with play/pause, mute/unmute, and animated equalizer bars. Fully compliant with browser autoplay restrictions.

- **100% Responsive & Self-Contained**  
  Optimized for mobile smartphones (iOS/Android), tablets, and desktop displays. All libraries (`Three.js`, `GSAP`, `canvas-confetti`) are bundled locally for offline reliability and GitHub Pages hosting.

---

## 📂 Project Directory Structure

```text
├── index.html                   # Main single-page application
├── README.md                    # Project documentation & deployment guide
├── .gitignore                   # Standard git ignore rules
└── assets/
    ├── css/
    │   └── style.css            # Romantic glassmorphism styles & animations
    ├── js/
    │   ├── three.min.js         # Three.js (r128) 3D graphics library
    │   ├── gsap.min.js          # GSAP animation library
    │   ├── confetti.browser.min.js # Confetti physics engine
    │   ├── three-world.js       # 3D scene engine, lighting, camera & models
    │   └── main.js              # Application logic, audio & scene management
    ├── images/
    │   ├── background.jpg       # Photograph 1 (Background visual)
    │   └── rifa-portrait.jpg    # Photograph 2 (Main 3D portrait)
    └── music/
        ├── birthday-song.mpeg   # Original birthday soundtrack
        └── birthday-song.mp3    # Cross-browser audio fallback
```

---

## 🚀 Running Locally

You can run this project locally with any simple static file server:

### Option 1: Using Node.js (npx)
```bash
npx serve .
# or
npx http-server . -p 8080
```

### Option 2: Using Python
```bash
# Python 3
python -m http.server 8080
```

Open `http://localhost:8080` in your web browser.

---

## 🌐 Deploying to GitHub Pages

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "A Magical 3D Birthday Surprise for Rifa Jahan ❤️"
   ```

2. **Create a GitHub Repository**:
   Create a new public or private repository on GitHub named `rifa-birthday-surprise`.

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/<your-username>/rifa-birthday-surprise.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click on **Settings** > **Pages** (under Code and automation).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Choose `main` branch and `/ (root)` folder.
   - Click **Save**.
   - Your website will be live in ~1-2 minutes at:  
     `https://<your-username>.github.io/rifa-birthday-surprise/`

---

*Made with all my heart for Rifa Jahan by Shakib Ahmed ❤️*
