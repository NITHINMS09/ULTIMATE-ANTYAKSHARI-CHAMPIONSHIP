# Ultimate Antyakshari Championship (UAC) v2.0

An offline-first, client-synchronized commercial entertainment platform built to host professional **Antyakshari** (singing/music game) competitions at festivals, universities, corporate events, and TV productions. Fully equipped with AI-powered automatic song validation, cross-tab rendering sync, offline session recovery, and immersive big screen displays.

---

## 🌟 Key Features

### 1. Game & Turn Engine
- **Four Game Modes**: Classic Mode, Speed Round, Elimination, and Team Battle.
- **Dynamic Letter Selection**: Automatically derives the next letter from the last consonant of the previous song.
- **Precision Countdown Timer**: Uses custom animations with warning cues (green/yellow/pulsing red) and background tab stabilization.

### 2. Dual-Layer Song Validation
- **AI Auto-Validation**: Instantly matches submissions against a local database of 300+ popular songs across Hindi, English, Tamil, Telugu, and Punjabi languages.
- **Low-Confidence Routing**: Submissions with low validation confidence (e.g. lack of matching metadata) are escalated to the Host screen for manual approval.
- **Fuzzy Autocomplete**: Pre-population dropdown search to avoid typos.

### 3. Master Control Center
- **Absolute Host Control**: Start, pause, resume, and emergency pause controls with confirmation guards.
- **Overrides**: Adjust scores, force skips, manual letter selection, and manually approve/reject pending submissions.
- **Telemetry Monitor**: Chronological song history feeds and live event tickers.

### 4. Audience Big Screen & Sync Engine
- **Immersive Viewports**: Hidden controls optimized for LED walls and TVs. Supports auto-rotating leaderboards, active turn indicators, and celebration displays.
- **BroadcastChannel Sync**: Connects and shares game state changes in real time across browser tabs without a backend server.
- **Device Pairing Wizard**: Setup tabs as Host, Audience Screen, Team Device, or Admin.

### 5. Analytics, Trophies & Recovery
- **Offline Event Recovery**: Integrates automatic Dexie IndexedDB writes every 2 seconds to recover scores and game state on crashes or page reloads.
- **Trophy System**: Unlocks 6 achievement tiers (Bronze to Legendary) based on accuracy, response speeds, and win rates.
- **Smart Insights**: Aggregates statistics for favorite artists, movie soundtracks, and language distributions.

---

## 🚀 Tech Stack

- **Core**: React 19, Vite 6, Vanilla CSS with rich CSS variables.
- **State Management**: Zustand (persisted state).
- **Offline Storage**: Dexie.js (IndexedDB wrapper).
- **Multi-Tab Syncing**: HTML5 BroadcastChannel API.
- **Animations**: Framer Motion.
- **Icons**: Lucide React.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Spin up the Vite development server:
   ```bash
   npm run dev
   ```

3. Open the browser and visit the local hosting address (typically `http://localhost:5173`).

### Production Build
Compile and bundle the React assets:
```bash
npm run build
```

---

## 📂 Architecture Layout

```
Ultimate Antyakshari Championship/
├── src/
│   ├── assets/           # CSS styles & static graphics
│   ├── components/
│   │   ├── control/      # Host & Score management modules
│   │   ├── layout/       # Navigation bar & Loading screen overlays
│   │   └── ui/           # Global notifications toast container
│   ├── data/
│   │   └── songDatabase.js # Fuzzy searching dictionaries & local songs catalog
│   ├── db/
│   │   └── database.js   # IndexedDB Dexie schemas
│   ├── engine/
│   │   ├── FairPlayEngine.js   # Delay & duplicate entry detection
│   │   ├── GameEngine.js       # Turn management & score calculation
│   │   ├── LetterEngine.js     # Consonant extraction & check algorithms
│   │   ├── RecoveryEngine.js   # IndexedDB state snapshots & recoveries
│   │   ├── SyncEngine.js       # BroadcastChannel heartbeats
│   │   ├── TrophyEngine.js     # Unlock parameters & tiers
│   │   └── ValidationEngine.js # AI starting letter & duplicate checking
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Telemetry controls, dumps & check triggers
│   │   ├── BigScreen.jsx       # Giant screen projection dashboard
│   │   ├── Community.jsx       # Feeds & public rankings
│   │   ├── ControlCenter.jsx   # Professional master control deck
│   │   ├── DeviceSetup.jsx     # Tab pairings & role setters
│   │   ├── GamePlay.jsx        # Main three-column game loop dashboard
│   │   ├── GameResults.jsx     # Podium celebrations & timelines
│   │   ├── GameSetup.jsx       # Multi-step team & rules configuration
│   │   ├── Home.jsx            # Landing page hero CTAs
│   │   ├── Insights.jsx        # Charts for preferred tracks
│   │   ├── MatchHistory.jsx    # Historical match logs
│   │   ├── MatchReplay.jsx     # Scrubbable round replays
│   │   ├── Onboarding.jsx      # Slide tutorials & interactive mini-game demo
│   │   ├── Profile.jsx         # Custom titles, avatar settings & trophy shelf
│   │   └── Trophies.jsx        # Trophy cabinet details modals
│   ├── store/
│   │   ├── analyticsStore.js   # Long-term history records
│   │   ├── appStore.js         # Theme settings & pairing keys
│   │   └── gameStore.js        # Active match configuration and actions
│   ├── App.jsx                 # Lazy-loaded router declarations
│   ├── index.css               # Premium design system tokens
│   └── main.jsx                # React mount entry
├── index.html                  # HTML entry with search crawler tags
├── package.json
└── tsconfig.json
```
