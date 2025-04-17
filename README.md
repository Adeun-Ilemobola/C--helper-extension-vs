# C++ Project Wizard — Quick Guide

A minimal VS Code extension that lets you **scaffold ↔ edit ↔ build ↔ run** a CMake‑based C++ project in seconds.

---

## 1. Commands provided by the extension

| Command (⇧⌘P / Ctrl+Shift+P) | What it does | Default key | Context menu |
|------------------------------|--------------|-------------|--------------|
| **C++: Initialize Project** | • Creates `header/`, `source/`<br>• Generates *CMakeLists.txt* & `source/main.cpp`<br>• Drops `.vscode/tasks.json` + `launch.json` for one‑click run | — | *Explorer background* ▼ |
| **C++: Create Class** | Prompts for **ClassName** → `header/ClassName.hpp` & `source/ClassName.cpp` with boiler‑plate ctor/dtor | — | *Right‑click any folder* ▼ |
| **C++: Build & Run main.cpp** | Runs `cmake -S . -B build && cmake --build build` then executes `build/<target>` in the integrated terminal | ⌃⌥ R / Ctrl+Alt R | — |

> **Tip**: Re‑run *Initialize Project* in an empty folder if you ever want a fresh skeleton.

---

## 2. One‑time CMake Tools setup

The extension depends on the official **CMake Tools** extension; it will be installed automatically.  After you initialise a project follow these **four clicks** inside the *Extension Development Host* (or any VS Code window):

| Step | Where to click | What it does |
|------|----------------|--------------|
| **1 – Select Kit** | Status‑bar → **No Kit Selected** | Pick your compiler (e.g. *Clang 🛠 19*). |
| **2 – Configure** | Status‑bar → ⚙️ | Generates `build/` folder & Make/Ninja files. |
| **3 – Build** | Status‑bar → 🔨 (or **Build ▶️ all** in *PROJECT STATUS*) | Compiles your sources. |
| **4 – Run / Debug** | Status‑bar → ▶️ (run) or 🐞▶️ (debug) | Launches the compiled binary. |

> *Keyboard equivalents*: `CMake: Select a Kit`, `CMake: Configure`, `CMake: Build`, `CMake: Run` / `CMake: Debug`.

### Switching variants & targets

* **Build type** (Debug/Release): status‑bar → **Debug** ▾.
* **Target** (if you add more executables): status‑bar next to the hammer ▾.

---

## 3. Frequently‑asked tweaks

### Add new source files automatically
Insert extra `.cpp` paths in *CMakeLists.txt* under `add_executable()` **or** replace the list with:
```cmake
file(GLOB SRC "source/*.cpp")
add_executable(${PROJECT_NAME} ${SRC})
```

### Change the C++ standard
Set `cppWizard.cppStandard` in **Settings → Extensions → C++ Project Wizard**; initialise a new project or tweak *CMakeLists.txt* manually.

---

## 4. Troubleshooting

| Symptom | Fix |
|---------|-----|
| **Target name `$PROJECT_NAME$` is reserved** | You edited *CMakeLists.txt* before running *Initialize Project*. Delete the file and run the command again so placeholders are replaced. |
| **`g++ ... 'header/Thing.hpp' not found`** | Use *Build & Run main.cpp* or CMake Tools. Ad‑hoc file runners don’t know your include path. |
| **⚙️ / 🔨 icons missing** | CMake Tools not active in this window → ⇧⌘P → `CMake: Enable`. |

---

Happy hacking! If you hit a snag open an issue or PR.

