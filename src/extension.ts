import * as vscode from "vscode";
import { TextEncoder } from "util";
import * as path from "path";

const enc = new TextEncoder();
let extUri: vscode.Uri;

export function activate(ctx: vscode.ExtensionContext) {
  extUri = ctx.extensionUri;
  ctx.subscriptions.push(
    vscode.commands.registerCommand("cpp.initProject", initProject),
    vscode.commands.registerCommand("cpp.createClass", createClass),
    vscode.commands.registerCommand("cpp.runMain", runMain)
  );
}

/** 1️⃣  initialise folder with CMake + src/include/main.cpp */
async function initProject(uri?: vscode.Uri) {
  const root = uri ?? vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!root) { vscode.window.showErrorMessage("Open a folder first."); return; }

  /* NEW — derive a safe project/target name from the folder */
  const projectName = path.basename(root.fsPath).replace(/[^a-zA-Z0-9_-]/g, "");

  // create header & source folders
  const header = vscode.Uri.joinPath(root, "header");
  const source = vscode.Uri.joinPath(root, "source");
  await createDir(header);
  await createDir(source);

  /* pass the replacement map */
  await writeTemplate("CMakeLists.txt.tpl",
                      vscode.Uri.joinPath(root, "CMakeLists.txt"),
                      { PROJECT_NAME: projectName });
  await writeTemplate("main.cpp.tpl",
                      vscode.Uri.joinPath(source, "main.cpp"),
                      { PROJECT_NAME: projectName });

  await writeTasks(root);
  vscode.window.showInformationMessage(`C++ project “${projectName}” initialised 🎉`);
}

/** 2️⃣  prompt for class name, create .hpp/.cpp in correct folders */
async function createClass(uri: vscode.Uri) {
  const root = vscode.workspace.workspaceFolders?.[0].uri;
  if (!root) return;
  const className = await vscode.window.showInputBox({ prompt: "Class name (PascalCase)" });
  if (!className) return;

  const headerPath = vscode.Uri.joinPath(root, "header", `${className}.hpp`);
  const sourcePath = vscode.Uri.joinPath(root, "source", `${className}.cpp`);

  await writeTemplate("class.hpp.tpl", headerPath, { CLASS: className });
  await writeTemplate("class.cpp.tpl", sourcePath, { CLASS: className });

  vscode.window.showInformationMessage(`Created ${className}.hpp / .cpp`);
}

/** 3️⃣  run `cmake --build` then execute the binary in integrated terminal */
async function runMain() {
  const root = vscode.workspace.workspaceFolders?.[0].uri;
  if (!root) return;
  const term = vscode.window.createTerminal("C++ Run");
  term.show();
  term.sendText("cmake -S . -B build");
  term.sendText("cmake --build build");
  term.sendText(path.join("build", process.platform === "win32" ? "Debug" : "", "main")); // tweak if config changes
}

/* ───────── helpers ───────── */

async function createDir(uri: vscode.Uri) {
  try { await vscode.workspace.fs.createDirectory(uri); } catch { /*ignore*/ }
}

async function writeTemplate(
  tpl: string,
  dest: vscode.Uri,
  vars: Record<string, string> = {}
) {
  /* use the extUri we saved instead of getExtension() */
  const tplUri = vscode.Uri.joinPath(extUri, "templates", tpl);

  let data = (await vscode.workspace.fs.readFile(tplUri)).toString();
  for (const [k, v] of Object.entries(vars)) data = data.replaceAll(`$${k}$`, v);
  await vscode.workspace.fs.writeFile(dest, enc.encode(data));
}

async function writeTasks(root: vscode.Uri) {
  const vscodeDir = vscode.Uri.joinPath(root, ".vscode");
  await createDir(vscodeDir);
  const tasksJson = vscode.Uri.joinPath(vscodeDir, "tasks.json");
  const launchJson = vscode.Uri.joinPath(vscodeDir, "launch.json");
  await vscode.workspace.fs.writeFile(tasksJson, enc.encode(TASKS));
  await vscode.workspace.fs.writeFile(launchJson, enc.encode(LAUNCH));
}

const TASKS = /* json */`{
  "version": "2.0.0",
  "tasks": [{
    "label": "CMake Build",
    "type": "shell",
    "command": "cmake",
    "args": ["--build", "build"],
    "problemMatcher": ["$gcc"],
    "group": "build"
  }]
}`;

const LAUNCH = /* json */`{
  "version": "0.2.0",
  "configurations": [{
    "name": "Run main",
    "type": "cppdbg",
    "request": "launch",
    "program": "\${workspaceFolder}/build/main",
    "cwd": "\${workspaceFolder}",
    "stopAtEntry": false,
    "externalConsole": true,
    "MIMode": "${process.platform === "win32" ? "gdb" : "lldb"}"
  }]
}`;
