import { app, ipcMain, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import { windowManager } from "./window";
import { aiService } from "./services/ai";
import { screenshotService } from "./services/screenshot";
import { audioService } from "./services/audio";
import { fileHandlerService } from "./services/file-handler";
import { IPC_CHANNELS } from "../shared/constants";
import { Message } from "../shared/types";

if (started) {
	app.quit();
}

// App lifecycle
app.on("ready", () => {
	windowManager.createWindow();

	if (process.platform === "darwin") {
		app.dock.hide();
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		windowManager.createWindow();
	}
});

// IPC Handlers
ipcMain.handle(IPC_CHANNELS.AI.GENERATE_TEXT, async (event, messages: Message[]) => {
	windowManager.expandIfNeeded();
	const response = await aiService.generateText(messages);
	return response;
});

ipcMain.handle(IPC_CHANNELS.AI.TRANSCRIBE_AUDIO, async (event, base64Audio: string, prompt?: string) => {
	windowManager.expandIfNeeded();
	const response = await aiService.transcribeAudio(base64Audio, prompt);
	return response;
});

ipcMain.handle(IPC_CHANNELS.AI.GENERATE_AUDIO, async (event, text: string) => {
	windowManager.expandIfNeeded();
	const response = await aiService.generateAudio(text);
	return response;
});

ipcMain.handle(IPC_CHANNELS.AI.GENERATE_IMAGE, async (event, text: string) => {
	windowManager.expandIfNeeded();
	const response = await aiService.generateImage(text);
	return response;
});

ipcMain.handle(IPC_CHANNELS.AI.READ_FILE, async (event, base64File: string, mimeType: string, prompt: string) => {
	windowManager.expandIfNeeded();
	const response = await aiService.readFile(base64File, mimeType, prompt);
	return response;
});

ipcMain.handle(IPC_CHANNELS.SCREENSHOT.CAPTURE, async () => {
	windowManager.expandIfNeeded();
	const result = await screenshotService.capture();
	return result;
});

ipcMain.handle(IPC_CHANNELS.AUDIO.CAPTURE, async (event, arrayBuffer: ArrayBuffer) => {
	windowManager.expandIfNeeded();
	const result = await audioService.capture(arrayBuffer);
	return result;
});

ipcMain.handle(IPC_CHANNELS.FILES.PICK_FILE, async () => {
	const result = await fileHandlerService.pickFile();

	if(result === null) {
		return null;
	}

	windowManager.expandIfNeeded();
	return result;
});

ipcMain.handle(IPC_CHANNELS.FILES.PROCESS, async (event, filePath: string, prompt?: string) => {
	// windowManager.expandIfNeeded();
	const result = await fileHandlerService.processFile(filePath, prompt);
	return result;
});

ipcMain.handle(IPC_CHANNELS.WINDOW.TOGGLE, () => {
	windowManager.toggle();
	return windowManager.getState();
});

ipcMain.handle(IPC_CHANNELS.WINDOW.GET_STATE, () => {
	return windowManager.getState();
});

// Cleanup on app quit
app.on("before-quit", () => {
	// Clean up old files
	fileHandlerService.cleanupOldFiles();
}); 