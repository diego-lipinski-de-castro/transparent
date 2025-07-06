import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("darkMode", {
	toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
	system: () => ipcRenderer.invoke("dark-mode:system"),
	light: () => ipcRenderer.invoke("dark-mode:light"),
	dark: () => ipcRenderer.invoke("dark-mode:dark"),
});

contextBridge.exposeInMainWorld("gemini", {
	generateText: (prompt: string) =>
		ipcRenderer.invoke("gemini:generateText", prompt),
});

contextBridge.exposeInMainWorld("screenshot", {
	capture: () => ipcRenderer.invoke("screenshot"),
});

contextBridge.exposeInMainWorld("audio", {
	capture: (arrayBuffer: ArrayBuffer) =>
		ipcRenderer.invoke("audio:capture", arrayBuffer),
});

contextBridge.exposeInMainWorld("files", {
	drop: (files: File[]) => ipcRenderer.invoke("files:drop", files),
});