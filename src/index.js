// index.js
// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Store = require("./store.js");
let mainWindow; //do this so that the window object doesn't get GC'd

// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: "user-preferences",
  defaults: {
    windowBounds: {
      x: 0,
      y: 0,
      width: 930,
      height: 345,
    },
    user_input: {
      selected_bot: 0,
      cash: {
        free_cash: 0.0,
        cash_in_bots: 0.0,
      },
      bots: [
        {
          num_bots: 1,
          base_order_size: 10.0,
          safety_order_size: 20.0,
          safety_order_scaling: 1.0,
          max_safety_orders: 5,
        },
      ],
    },
  },
});

function createWindow() {
  // Create the browser window.
  let { x, y, width, height } = store.get("windowBounds");
  height = height > 370 ? height : 370;
  width = width > 930 ? width : 930;
  const minHeight = 370;
  const minWidth = 930;

  // Init the window
  mainWindow = new BrowserWindow({
    x: x,
    y: y,
    width: width,
    height: height,
    minWidth: minWidth,
    minHeight: minHeight,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      enableRemoteModule: true,
      contextIsolation: true, //required flag
    },
  });

  // Open up the IPC listener
  ipcMain.on("savesettings", (event, settings) => {
    store.set("user_input", settings);
  });

  ipcMain.handle("getsettings", async () => {
    return store.get("user_input");
  });

  // and load the index.html of the app.
  mainWindow.loadFile("src/index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

async function get_settings() {
  const settings = await store.get("user_input");
  return settings;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  save_bounds();
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
  // TODO: There is a bug here with multiple monitors
  // At least on the macOS
  // Window size exceeding what can be displayed on the main (??? maybe smallest)
  // monitor gets loaded as some random size that will fit on the main monitor
  // On app reload, anyway

  // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
  // the height, width, and x and y coordinates.
  let { x, y, width, height } = mainWindow.getBounds();
  // Now that we have them, save them using the `set` method.
  store.set("windowBounds", { x, y, width, height });
}
