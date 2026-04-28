
  # FitnessPro - Data Structures Final Project

  A professional fitness application that combines a modern React/TypeScript frontend with a powerful Java backend. This project was developed as a final for the Data Structures and Algorithms course, focusing on the practical implementation of core computer science concepts.

  ## 🚀 Core Features & Java Data Structures

  Every interaction in the UI is powered by a custom-built Java logic engine. Below are the data structures utilized to manage the application's state and operations:

  | Feature | Data Structure | Concept | Complexity | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | **Workout History** | `java.util.Stack` | **LIFO** | $O(1)$ | Enables a robust "Undo" feature for logged exercises. |
  | **Circuit Manager** | `java.util.Queue` | **FIFO** | $O(1)$ | Manages exercises in a sequential workout circuit. |
  | **Exercise Library** | `java.util.HashMap`| **Hashing** | $O(1)$ | Provides constant-time lookup for exercise data. |
  | **Exercise Search** | **Binary Search** | **Searching** | $O(\log n)$ | High-speed search utility for the exercise database. |

  ## 🛠️ How to Run the Project

  You can launch both the Java backend and the React frontend simultaneously using any of the following methods:

  ### 1. One-Click Startup (Windows)
  Double-click the **`run-app.bat`** script located in the project root. This automated script will:
  - Compile all Java classes into the `out` directory.
  - Launch the **Java Logic Server** on port `8080`.
  - Start the **Vite Frontend** and open it in your default browser.

  ### 2. IntelliJ IDEA Run Configurations
  We have provided pre-configured shared settings for IntelliJ IDEA:
  1. Look at the top right of your IntelliJ window (near the search and settings icons).
  2. Click the dropdown menu and select **"Run All (Backend + Frontend)"**.
  3. Click the green **Play** button.
  
  *Note: Double-clicking the configuration files in the file explorer or project tree will only open the code; you must use the toolbar button to actually run the program.*

  ### 3. Manual Startup
  If you prefer the terminal, run these commands in separate windows:
  - **Backend:** `javac -d out -sourcepath src/main/java src/main/java/com/fitnesspro/api/BackendServer.java && java -cp out com.fitnesspro.api.BackendServer`
  - **Frontend:** `npm install && npm run dev`

  ## 🏗️ Project Architecture

  The application follows a decoupled architecture where the **View** and **Logic** are strictly separated:

  1.  **Frontend (React/TypeScript):** Handles the UI components and user interactions (imported and cleaned up from Figma).
  2.  **API Bridge (REST/JSON):** React sends fetch requests to the Java server whenever an event occurs.
  3.  **Backend (Java):** The "Brain" of the app. It receives requests, processes data using the appropriate Data Structures, and returns JSON responses.

  ## 📚 Documentation
  - **Javadoc:** All Java source files (`src/main/java/...`) include comprehensive Javadoc headers explaining the purpose of each class and method.
  - **Complexity Analysis:** Major logic methods include inline comments documenting their **Big-O Time Complexity**.

  ---
  *Original UI Design available at [Figma](https://www.figma.com/design/z3iw9KD9u4IqoqnrL5TRpn/Data-Structures-Final-Project).*
  