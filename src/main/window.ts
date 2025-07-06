import { BrowserWindow, screen, globalShortcut } from "electron";
import path from "node:path";
import { WINDOW_DEFAULTS, SHORTCUTS } from "../shared/constants";
import { WindowState } from "../shared/types";

class WindowManager {
	private mainWindow: BrowserWindow | null = null;
	private isVisible = false;
	private isHidden = false;
	private heightUpdated = false;
	private devTools = true;

	createWindow(): BrowserWindow {
		// Get the primary display's dimensions
		const primaryDisplay = screen.getPrimaryDisplay();
		const { height } = primaryDisplay.workAreaSize;
		
		// Calculate position
		const x = 100;
		const y = Math.round(height - WINDOW_DEFAULTS.height - 80);

		// Create the browser window
		this.mainWindow = new BrowserWindow({
			width: WINDOW_DEFAULTS.width,
			height: WINDOW_DEFAULTS.height,
			x,
			y,
			webPreferences: {
				preload: path.join(__dirname, "../preload/index.js"),
				nodeIntegration: false,
				contextIsolation: true,
			},
			frame: false,
			transparent: true,
			hasShadow: false,
			alwaysOnTop: true,
			resizable: false,
			movable: true,
			skipTaskbar: this.isHidden,
			hiddenInMissionControl: this.isHidden,
			vibrancy: "fullscreen-ui",
			visualEffectState: "active",
			titleBarStyle: "default",
			trafficLightPosition: undefined,
			roundedCorners: false,
		});

		this.mainWindow.excludedFromShownWindowsMenu = this.isHidden;
		this.mainWindow.setContentProtection(this.isHidden);

		// Load the app
		if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
			this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
		} else {
			this.mainWindow.loadFile(
				path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
			);
		}

		// Register global shortcuts
		this.registerShortcuts();

		if (this.devTools) {
			this.mainWindow.webContents.openDevTools({ mode: "detach" });
		}

		return this.mainWindow;
	}

	private registerShortcuts(): void {
		globalShortcut.register(SHORTCUTS.TOGGLE, () => {
			this.toggle();
		});

		globalShortcut.register(SHORTCUTS.SCREENSHOT, () => {
			this.expandIfNeeded();
			// Trigger screenshot via IPC
			this.mainWindow?.webContents.send('shortcut:screenshot');
		});

		globalShortcut.register(SHORTCUTS.AUDIO, () => {
			this.expandIfNeeded();
			// Trigger audio recording via IPC
			this.mainWindow?.webContents.send('shortcut:audio');
		});
	}

	toggle(): void {
		if (!this.mainWindow) return;

		if (this.isVisible) {
			this.mainWindow.hide();
			this.isVisible = false;
		} else {
			this.mainWindow.show();
			this.isVisible = true;
		}
	}

	expandIfNeeded(): void {
		if (!this.mainWindow || this.heightUpdated) return;

		const growth = WINDOW_DEFAULTS.expandedHeight - WINDOW_DEFAULTS.height;
		const { x, y } = this.mainWindow.getBounds();

		this.mainWindow.setBounds(
			{
				x,
				y: y - growth,
				width: WINDOW_DEFAULTS.width,
				height: WINDOW_DEFAULTS.expandedHeight,
			},
			true
		);

		this.heightUpdated = true;
	}

	getState(): WindowState {
		if (!this.mainWindow) {
			return {
				width: WINDOW_DEFAULTS.width,
				height: WINDOW_DEFAULTS.height,
				x: 100,
				y: 0,
				isVisible: false,
			};
		}

		const bounds = this.mainWindow.getBounds();

		return {
			width: bounds.width,
			height: bounds.height,
			x: bounds.x,
			y: bounds.y,
			isVisible: this.isVisible,
		};
	}

	show(): void {
		if (this.mainWindow) {
			this.mainWindow.show();
			this.isVisible = true;
		}
	}

	hide(): void {
		if (this.mainWindow) {
			this.mainWindow.hide();
			this.isVisible = false;
		}
	}

	close(): void {
		if (this.mainWindow) {
			this.mainWindow.close();
			this.mainWindow = null;
		}
	}

	getWindow(): BrowserWindow | null {
		return this.mainWindow;
	}

	isWindowVisible(): boolean {
		return this.isVisible;
	}

	setHidden(hidden: boolean): void {
		this.isHidden = hidden;
		if (this.mainWindow) {
			this.mainWindow.setSkipTaskbar(hidden);
			this.mainWindow.setHiddenInMissionControl(hidden);
			this.mainWindow.excludedFromShownWindowsMenu = hidden;
			this.mainWindow.setContentProtection(hidden);
		}
	}
}

export const windowManager = new WindowManager(); 