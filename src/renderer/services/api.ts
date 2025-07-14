import { IPC_CHANNELS } from "../../shared/constants";
import { Message, AIResponse, ScreenshotResult, AudioResult, WindowState, FileResult } from "../../shared/types";

class APIService {
	async generateText(messages: Message[]): Promise<AIResponse> {
		return await window.electronAPI.invoke(IPC_CHANNELS.AI.GENERATE_TEXT, messages);
	}

	async transcribeAudio(base64Audio: string, prompt?: string): Promise<AIResponse> {
		return await window.electronAPI.invoke(IPC_CHANNELS.AI.TRANSCRIBE_AUDIO, base64Audio, prompt);
	}

	async generateAudio(text: string): Promise<{ text: string; audio: ArrayBuffer | null; error?: string }> {
		return await window.electronAPI.invoke(IPC_CHANNELS.AI.GENERATE_AUDIO, text);
	}

	async generateImage(text: string): Promise<{ text: string; image: ArrayBuffer | null; error?: string }> {
		return await window.electronAPI.invoke(IPC_CHANNELS.AI.GENERATE_IMAGE, text);
	}

	async readFile(base64File: string, mimeType: string, prompt: string): Promise<AIResponse> {
		return await window.electronAPI.invoke(IPC_CHANNELS.AI.READ_FILE, base64File, mimeType, prompt);
	}

	async captureScreenshot(): Promise<ScreenshotResult> {
		return await window.electronAPI.invoke(IPC_CHANNELS.SCREENSHOT.CAPTURE);
	}

	async captureAudio(arrayBuffer: ArrayBuffer): Promise<AudioResult> {
		return await window.electronAPI.invoke(IPC_CHANNELS.AUDIO.CAPTURE, arrayBuffer);
	}

	async pickFile(): Promise<string | null> {
		return await window.electronAPI.invoke(IPC_CHANNELS.FILES.PICK_FILE);
	}

	async processFile(filePath: string, prompt?: string): Promise<FileResult> {
		return await window.electronAPI.invoke(IPC_CHANNELS.FILES.PROCESS, filePath, prompt);
	}

	async toggleWindow(): Promise<WindowState> {
		return await window.electronAPI.invoke(IPC_CHANNELS.WINDOW.TOGGLE);
	}

	async getWindowState(): Promise<WindowState> {
		return await window.electronAPI.invoke(IPC_CHANNELS.WINDOW.GET_STATE);
	}

	async expandWindow(): Promise<void> {
		return await window.electronAPI.invoke(IPC_CHANNELS.WINDOW.EXPAND);
	}
}

export const apiService = new APIService(); 