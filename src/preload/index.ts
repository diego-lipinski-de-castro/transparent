import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../shared/constants";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
	invoke: (channel: string, ...args: any[]) => {
		// Whitelist channels
		const validChannels = Object.values(IPC_CHANNELS).flatMap(Object.values);
		if (validChannels.includes(channel)) {
			return ipcRenderer.invoke(channel, ...args);
		}
		throw new Error(`Invalid channel: ${channel}`);
	},
	on: (channel: string, func: (...args: any[]) => void) => {
		const validChannels = ['shortcut:screenshot', 'shortcut:audio'];
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, (_, ...args) => func(...args));
		}
	},
	removeAllListeners: (channel: string) => {
		ipcRenderer.removeAllListeners(channel);
	},
});

// Type declarations for the exposed API
declare global {
	interface Window {
		electronAPI: {
			invoke: (channel: string, ...args: any[]) => Promise<any>;
			on: (channel: string, func: (...args: any[]) => void) => void;
			removeAllListeners: (channel: string) => void;
		};
	}
} 