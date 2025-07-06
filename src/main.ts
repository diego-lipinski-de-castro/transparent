import {
	app,
	BrowserWindow,
	ipcMain,
	screen,
	globalShortcut,
	desktopCapturer,
	dialog,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { generateText, Message, readFile, transcribeAudio } from "./gemini";
import fs from "node:fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}

// https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
// We can use deeplinks to websites can sent commands to the app

const winWidth = 600;
let winHeight = 50; // input height + padding
let mainWindow: BrowserWindow;
let isVisible = false;

const isHidden = false;

const createWindow = () => {
	// Get the primary display's dimensions
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;
	// Calculate bottom center position
	// const x = Math.round((width - winWidth) / 2);
	const x = 100;
	const y = Math.round(height - winHeight - 80);

	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: winWidth,
		height: winHeight,
		x,
		y,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
		},
		// show: true,
		frame: false,
		transparent: true,
		hasShadow: false,
		alwaysOnTop: true,
		resizable: false,
		movable: true,
		skipTaskbar: isHidden,
		hiddenInMissionControl: isHidden,
		vibrancy: "fullscreen-ui",
		visualEffectState: "active",
		titleBarStyle: "default",
		trafficLightPosition: undefined,
		roundedCorners: false,
	});

	mainWindow.excludedFromShownWindowsMenu = isHidden;
	mainWindow.setContentProtection(isHidden);

	// mainWindow.setWindowButtonVisibility(false);
	// mainWindow.setIgnoreMouseEvents(true);

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(
				__dirname,
				`../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
			)
		);
	}

	// Open the DevTools.
	// mainWindow.webContents.openDevTools({
	// 	mode: "detach",
	// });

	globalShortcut.register("Cmd+\\", () => {
		if (isVisible) {
			mainWindow.hide();
			isVisible = false;
		} else {
			mainWindow.show();
			isVisible = true;
		}
	});

	// mainWindow.webContents.on("before-input-event", (event, input) => {
	// 	if (input.control && input.key.toLowerCase() === "i") {
	// 		console.log("Pressed Control+I");
	// 		event.preventDefault();
	// 	}
	// });

	// const icon = nativeImage.createFromPath(path.join(__dirname, "../icon.png"));
	// const tray = new Tray(icon);

	// tray.setToolTip("This is my application.");
	// tray.setTitle("This is my application.");

	// tray.setContextMenu(Menu.buildFromTemplate([
	// 	{ label: "Item1", type: "radio" },
	// 	{ label: "Item2", type: "radio" },
	// ]));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	createWindow();

	if (process.platform === "darwin") {
		app.dock.hide();
	}
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// ipcMain.handle("dark-mode:toggle", () => {
// 	if (nativeTheme.shouldUseDarkColors) {
// 		nativeTheme.themeSource = "light";
// 	} else {
// 		nativeTheme.themeSource = "dark";
// 	}
// 	return nativeTheme.shouldUseDarkColors;
// });

// ipcMain.handle("dark-mode:system", () => {
// 	nativeTheme.themeSource = "system";
// });

// ipcMain.handle("dark-mode:light", () => {
// 	nativeTheme.themeSource = "light";
// });

// ipcMain.handle("dark-mode:dark", () => {
// 	nativeTheme.themeSource = "dark";
// });

// const menu = new Menu();

// menu.append(
// 	new MenuItem({
// 		label: "Electron",
// 		submenu: [
// 			{
// 				role: "help",
// 				accelerator:
// 					process.platform === "darwin" ? "Shift+Cmd+I" : "Alt+Shift+I",
// 				click: () => {
// 					console.log("Electron rocks!");
// 				},
// 			},
// 		],
// 	})
// );

// Menu.setApplicationMenu(menu);

let heightUpdated = false;

const updateSize = () => {
	const growth = 300;
	winHeight += growth;

	const { x, y } = mainWindow.getBounds();

	mainWindow.setBounds(
		{
			x,
			y: y - growth,
			width: winWidth,
			height: winHeight,
		},
		true
	);

	heightUpdated = true;
}

ipcMain.handle("gemini:generateText", async (event, messages: Message[]) => {
	if (!heightUpdated) {
		updateSize();
	}

	const { text, groundingMetadata, urlContextMetadata } = await generateText(messages);
	return { text, groundingMetadata, urlContextMetadata };
});

ipcMain.handle("screenshot", async () => {
	if (!heightUpdated) {
		updateSize();
	}

	const sources = await desktopCapturer.getSources({
		types: ["screen"], // ['screen'] window: To capture only application window
		thumbnailSize: { width: 1920, height: 1080 },
	});

	// console.log(sources);

	const screenshotDir = "screenshots";

	if (!fs.existsSync(screenshotDir)) {
		fs.mkdirSync(screenshotDir, { recursive: true });
	}

	if (sources.length !== 1) {
		return null;
	}

	const source = sources[0];

	const dataURL = source.thumbnail.toDataURL();

	fs.writeFileSync(
		`${screenshotDir}/screenshot_${Date.now()}.png`,
		dataURL.split(",")[1],
		"base64"
	);

	const base64ImageFile = dataURL.split(",")[1];
	const { text } = await readFile(base64ImageFile, "image/png", "This is a screenshot of the user computer screen. The user wants to know about the content of the screen. Do not describe the elements, just do a research and resume the content.");

	return { text };
});

ipcMain.handle("audio:capture", async (event, arrayBuffer: ArrayBuffer) => {
	if (!heightUpdated) {
		updateSize();
	}

	const audioDir = "audio";

	if (!fs.existsSync(audioDir)) {
		fs.mkdirSync(audioDir, { recursive: true });
	}

	const buffer = Buffer.from(arrayBuffer);

	fs.writeFileSync(`${audioDir}/audio_${Date.now()}.webm`, buffer);

	const base64AudioFile = buffer.toString("base64");

	const transcription = await transcribeAudio(base64AudioFile);

	return transcription;
});

ipcMain.handle("files:drop", async (event, files: File[]) => {
	console.log(files);
});