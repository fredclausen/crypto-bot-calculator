// index.js
// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const Store = require("./store.js");
let mainWindow; //do this so that the window object doesn't get GC'd

// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: "user-preferences",
  defaults: {
    // 800x600 is the default size of our window
    windowBounds: {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
    },
  },
});

function createWindow() {
  // Create the browser window.
  let { x, y, width, height } = store.get("windowBounds");
  mainWindow = new BrowserWindow({
    x: x,
    y: y,
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("src/index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  mainWindow.on("resized", () => {
    save_bounds();
  });

  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on("moved", () => {
    save_bounds();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function save_bounds() {
  // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
  // the height, width, and x and y coordinates.
  let { x, y, width, height } = mainWindow.getBounds();
  // Now that we have them, save them using the `set` method.
  store.set("windowBounds", { x, y, width, height });
}
