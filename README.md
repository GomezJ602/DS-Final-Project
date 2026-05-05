# IronCore Fitness App — Setup Guide

Welcome! This guide will walk you through everything you need to do to get
this app running on your computer — even if you have never coded before.
Just follow the steps in order and you will be up and running.

---

## What is this app?

IronCore Fitness is a workout tracking app with an AI-powered plan generator,
nutrition tracking, a barcode scanner, class booking, and more. It has two
parts that run at the same time:

- A **backend** (the engine running in the background on your computer)
- A **frontend** (the app you see in your browser)

When you click the green **Run All** button in IntelliJ, both parts start
together automatically.

---

## Step 1 — Install Java

Java runs the backend engine of the app. Think of it like the app's motor.

1. Go to: **https://adoptium.net/temurin/releases/**
2. At the top of the page, make sure the filters are set to:
   - Version: **21**
   - Operating System: **Windows**
   - Architecture: **x64**
   - Package Type: **JDK**
3. Click the **`.msi`** download button (the one that says "msi" on the right).
4. Open the downloaded file and run the installer.
5. Click **Next** on every screen — the defaults are correct.
   - On the "Custom Setup" screen, make sure all options have a checkmark
     (they should by default).
6. Click **Finish** when done.

**How to check it worked:**
- Press the **Windows key**, type `cmd`, and press **Enter** to open a black
  Command Prompt window.
- Type `java -version` and press **Enter**.
- You should see something like `openjdk version "21.x.x"`. If you do, Java
  is installed correctly.

---

## Step 2 — Install Node.js

Node.js runs the frontend (the part you see in the browser). It also comes
with **npm**, which downloads the app's code packages automatically.

1. Go to: **https://nodejs.org/en/download**
2. Click the big green **"LTS"** button on the left side of the page.
3. Download the **Windows Installer (.msi)** option.
4. Open the downloaded file and run the installer.
5. Click **Next** on every screen — the defaults are correct.
6. Click **Finish** when done.

**How to check it worked:**
- Open a new Command Prompt window (close and reopen if you had one open).
- Type `node -v` and press **Enter**. You should see a version number like
  `v20.x.x`.
- Type `npm -v` and press **Enter**. You should see a version number like
  `10.x.x`.

---

## Step 3 — Install IntelliJ IDEA

IntelliJ IDEA is the program you use to open and run this project. It has the
green **Run All** button that starts everything with one click.

1. Go to: **https://www.jetbrains.com/idea/download/**
2. Scroll down past the "Ultimate" option until you see **"Community Edition"**.
3. Click the **Download** button under Community Edition (it is free).
4. Open the downloaded file and run the installer.
5. Click **Next** on every screen — the defaults are correct.
   - On the "Installation Options" screen, check the box that says
     **"Add 'Open Folder as Project'"** if it is not already checked.
6. Click **Install**, then **Finish** when done.
7. When IntelliJ opens for the first time, click **"Don't send"** or
   **"Skip"** on the data-sharing prompt, then click **"Start using
   IntelliJ IDEA"**.

---

## Step 4 — Open the Project in IntelliJ

1. Open **IntelliJ IDEA**.
2. On the welcome screen, click **"Open"**.
3. Navigate to the folder where you downloaded or cloned this project
   (for example: `C:\Users\YourName\Downloads\DS-Final-Project`).
4. Click on the folder name once to select it, then click **"OK"**.
5. A popup may ask **"Trust and Open Project?"** — click **"Trust Project"**.
6. Wait about 30 seconds for IntelliJ to finish loading. You will see a
   progress bar at the bottom of the screen.

---

## Step 5 — Tell IntelliJ Where Java Is

1. In IntelliJ, go to the menu at the top: **File → Project Structure**
   (or press `Ctrl + Alt + Shift + S` on your keyboard).
2. On the left panel, click **"Project"**.
3. Look for the **"SDK"** dropdown. If it already shows something like
   **"21 (Eclipse Temurin)"** or similar, you are done — click **OK**.
4. If the dropdown is empty or says **"No SDK"**:
   - Click the dropdown and select **"Add SDK → JDK…"**
   - IntelliJ will try to find Java automatically. If it shows a path like
     `C:\Program Files\Eclipse Adoptium\jdk-21...`, select it and click **OK**.
   - If it does not find it, navigate to `C:\Program Files\Eclipse Adoptium\`
     and select the `jdk-21...` folder.
5. Click **OK** to close the Project Structure window.

---

## Step 6 — Install the App's Code Packages

The frontend needs some code packages downloaded before it can run. This only
needs to be done once.

1. In IntelliJ, look at the bottom of the screen and click **"Terminal"**
   (or go to **View → Tool Windows → Terminal**).
2. A black panel will open at the bottom. Click inside it.
3. Type the following and press **Enter**:

   ```
   npm install
   ```

4. You will see a lot of text scroll by. Wait until it finishes and you see
   your cursor again (this can take 1–2 minutes the first time).

---

## Step 7 — Add Your Groq API Key

The AI workout plan generator requires a free API key from Groq. Without it,
everything in the app works except the "Generate My Plan" button on the
Workouts page.

### Get a free key:

1. Go to: **https://console.groq.com**
2. Click **"Sign Up"** and create a free account (you can use Google or
   GitHub to sign up instantly).
3. After logging in, click **"API Keys"** in the left sidebar.
4. Click **"Create API Key"**, type any name (like `fitness-app`), and click
   **"Submit"**.
5. A key will appear on screen starting with `gsk_`. **Copy it now** — you
   cannot view it again after you close this window.

### Add the key to the app:

1. In IntelliJ, look at the top-right area of the screen. You will see a
   dropdown with configuration names. Click it and select **"Backend"**.
2. Click the **pencil icon** next to it (or go to **Run → Edit
   Configurations…** from the top menu).
3. In the window that opens, make sure **"Backend"** is selected on the left.
4. Find the field labeled **"Environment variables"**. It looks like a text
   box with a small icon on the right side. Click the icon on the right to
   open the editor.
5. You will see a row with `GROQ_API_KEY` on the left side. Click the value
   on the right side and replace whatever is there with your key
   (the one starting with `gsk_`).
6. Click **OK**, then **OK** again to close.

---

## Step 8 — Run the App

You are ready to go!

1. In IntelliJ, click the **configuration dropdown** at the top right of the
   screen.
2. Select **"Run All (Backend + Frontend)"** from the list.
3. Click the **green triangle (▶) Run button** next to it.

IntelliJ will now:
- Compile and start the Java backend (you will see logs appear in a panel
  at the bottom)
- Start the frontend and automatically open your browser to
  **http://localhost:5173**

**The app is ready when your browser opens and you see the IronCore Fitness
dashboard.**

> The first time you run it, it may take 20–30 seconds. After that it starts
> much faster.

---

## What Works vs. What Needs Your Own Setup

| Feature | Works on fresh clone? | Notes |
| :--- | :--- | :--- |
| Dashboard, navigation, dark mode | Yes | Fully local |
| Exercise library, workout tracking, circuit builder | Yes | Java backend |
| Classes, Instructors, Profile | Yes | Fully local |
| Barcode scanner (camera + UPC lookup) | Yes | Java backend |
| AI workout plan generator | Only after Step 7 | Needs your own free Groq key |
| Points / Rewards display | May show 0 | Connects to the original developer's cloud account |
| Nutrition food log | Mostly works | Some cloud-saved foods may not appear |

---

## Something Not Working?

| Problem | Fix |
| :--- | :--- |
| `java` is not recognized in Command Prompt | Close and reopen Command Prompt after installing Java, then try again. If it still fails, restart your computer. |
| `npm` is not recognized in Command Prompt | Close and reopen Command Prompt after installing Node.js. If it still fails, restart your computer. |
| IntelliJ says "No SDK configured" | Go to File → Project Structure → Project → SDK and pick your JDK 21 (see Step 5). |
| Browser shows a blank page or error | Make sure both the Backend and Frontend started without errors in the bottom panel. Look for any red text and check the fix below. |
| AI workout plan does not work | Your `GROQ_API_KEY` may be missing or incorrect. Re-follow Step 7 to double check it. |
| Points or rewards show 0 | This feature connects to a cloud account — it is expected to show 0 on a fresh install. |
| Port 8080 or 5173 already in use | Restart your computer to clear any processes using those ports, then run again. |

---

## Important Folders and Files

Here is what each folder does, in plain terms:

```
DS-Final-Project/
│
├── .run/                    ← IntelliJ's run buttons live here. Do not delete.
│   ├── Backend.run.xml      ← Settings for starting the Java engine (your Groq key goes here)
│   ├── Frontend.run.xml     ← Settings for starting the browser app
│   └── Run_All.run.xml      ← The "Run All" button that starts both at once
│
├── src/
│   ├── main/java/           ← The Java engine code (backend)
│   └── app/                 ← The browser app code (frontend)
│
├── out/                     ← Created automatically when you run the app. Do not touch.
├── node_modules/            ← Created automatically by "npm install". Do not touch.
│
├── package.json             ← List of frontend code packages needed
├── run-app.bat              ← Windows alternative: double-click to start (no IntelliJ needed)
├── upc_products.json        ← Created automatically when you scan barcodes
└── daily_images.json        ← Created automatically when the app first starts
```

> `out/` and `node_modules/` are not uploaded to GitHub on purpose — they
> are too large and get re-created automatically every time you set up the
> project on a new computer.

---

## For Developers — Technical Details

<details>
<summary>Click to expand</summary>

### Architecture

```
┌────────────────────────────┐    fetch()     ┌────────────────────────────┐
│ React + TypeScript (Vite)  │ ─────────────► │ Java HttpServer (port 8080)│
│ src/app/**                 │ ◄───────────── │ com.fitnesspro.api.BackendServer
│  Dashboard, Workouts, etc. │   JSON over    │  + logic/* data structures │
└────────────────────────────┘     HTTP       └────────────────┬───────────┘
                                                              │ JSON files
                                                              ▼
                                                    upc_products.json
                                                    daily_images.json
```

### Core Data Structures

| Feature | Java class | Structure | Big-O | Endpoints |
| :--- | :--- | :--- | :--- | :--- |
| Workout History | `WorkoutHistory` | `Stack` (LIFO) | O(1) | `POST /api/workout/log`, `POST /api/workout/undo`, `GET /api/workout/history` |
| Workout Circuit | `CircuitManager` | `Queue` / `ArrayDeque` (FIFO) | O(1) | `POST /api/circuit/add`, `POST /api/circuit/next` |
| Exercise Library | `ExerciseLibrary` | `HashMap` | O(1) avg | `GET /api/exercises` |
| Exercise Search | `SearchUtility` | Binary Search | O(log n) | `GET /api/search` |

### HTTP API Reference

All endpoints are at `http://localhost:8080` and return JSON.

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET`  | `/api/exercises` | All exercises in the catalog |
| `POST` | `/api/workout/log?name=…` | Log an exercise (stack push) |
| `POST` | `/api/workout/undo` | Undo last exercise (stack pop) |
| `GET`  | `/api/workout/history` | Full workout history |
| `GET`  | `/api/stats` | Calorie and workout totals |
| `POST` | `/api/circuit/add?name=…` | Add exercise to circuit (enqueue) |
| `POST` | `/api/circuit/next` | Next circuit exercise (dequeue) |
| `GET`  | `/api/search?name=…` | Binary search the exercise catalog |
| `POST` | `/api/ai/workout-plan` | Generate AI plan via Groq (requires key) |
| `POST` | `/api/workout/log-reps` | Save rep tracking data |
| `GET`  | `/api/upc/lookup?upc=…` | Look up a scanned barcode |
| `POST` | `/api/upc/save` | Save a new scanned product |
| `GET`  | `/api/upc/all` | All saved scanned products |
| `GET`  | `/api/daily-images[?day=N]` | Hero images by day of week |

### Manual Startup (no IntelliJ)

```bash
# Terminal 1 — Java backend
javac -d out -sourcepath src/main/java src/main/java/com/fitnesspro/api/BackendServer.java
java  -cp out com.fitnesspro.api.BackendServer

# Terminal 2 — React frontend
npm install
npm run dev
```

</details>

---

*Original UI design:*
[*Figma*](https://www.figma.com/design/z3iw9KD9u4IqoqnrL5TRpn/Data-Structures-Final-Project)
