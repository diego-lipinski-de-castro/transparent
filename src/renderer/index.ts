import "./index.css";
import { ChatComponent } from "./components/chat";
import { InputComponent } from "./components/input";
import { MediaControlsComponent } from "./components/media-controls";
import { FilePickerComponent } from "./components/file-picker";
import { apiService } from "./services/api";
import { storageService } from "./services/storage";
import { getElement } from "./utils/dom";
import { Message } from "../shared/types";

class App {
	private chat: ChatComponent;
	private input: InputComponent;
	private mediaControls: MediaControlsComponent;
	private filePicker: FilePickerComponent;
	private currentConversationId: string | null = null;

	constructor() {
		this.initializeComponents();
		this.setupEventListeners();
		this.loadSettings();
	}

	private initializeComponents(): void {
		const outputElement = getElement<HTMLElement>("#output");
		const inputElement = getElement<HTMLInputElement>("#prompt");

		this.chat = new ChatComponent(outputElement);

		this.input = new InputComponent(
			inputElement,
			this.handleSendMessage.bind(this),
			this.handleScreenshot.bind(this),
			this.handleAudio.bind(this)
		);

		this.mediaControls = new MediaControlsComponent(
			this.handleAudioCaptured.bind(this)
		);

		this.filePicker = new FilePickerComponent(
			this.handleFilePick.bind(this)
		);
	}

	private setupEventListeners(): void {
		// Global shortcuts
		window.electronAPI.on('shortcut:screenshot', () => {
			this.handleScreenshot();
		});

		window.electronAPI.on('shortcut:audio', () => {
			this.handleAudio();
		});
	}

	private async handleSendMessage(message: Message): Promise<void> {
		if (this.chat.isLoading()) return;

		await this.chat.addMessage(message);
		this.input.disable();
		this.chat.showLoading();

		try {
			const messages = this.chat.getMessages();
			const response = await apiService.generateText(messages);

			const assistantMessage: Message = {
				role: "assistant",
				content: response.text,
				timestamp: Date.now(),
				id: this.generateId(),
			};

			await this.chat.addMessage(assistantMessage);
			this.saveConversation();
		} catch (error) {
			console.error('Error generating response:', error);
			const errorMessage: Message = {
				role: "assistant",
				content: "Sorry, I encountered an error. Please try again.",
				timestamp: Date.now(),
				id: this.generateId(),
			};
			await this.chat.addMessage(errorMessage);
		} finally {
			this.chat.hideLoading();
			this.input.enable();
			this.input.focus();
		}
	}

	private async handleScreenshot(): Promise<void> {
		if (this.chat.isLoading()) return;

		const userMessage: Message = {
			role: "user",
			content: "Take a screenshot of the current screen",
			timestamp: Date.now(),
			id: this.generateId(),
		};

		await this.chat.addMessage(userMessage);
		this.chat.showLoading();

		try {
			const result = await apiService.captureScreenshot();
			
			const assistantMessage: Message = {
				role: "assistant",
				content: result.text,
				timestamp: Date.now(),
				id: this.generateId(),
			};

			await this.chat.addMessage(assistantMessage);
			this.saveConversation();
		} catch (error) {
			console.error('Error capturing screenshot:', error);
			const errorMessage: Message = {
				role: "assistant",
				content: "Failed to capture screenshot. Please try again.",
				timestamp: Date.now(),
				id: this.generateId(),
			};
			await this.chat.addMessage(errorMessage);
		} finally {
			this.chat.hideLoading();
		}
	}

	private async handleAudio(): Promise<void> {
		if (this.mediaControls.isRecording()) {
			this.mediaControls.stopRecording();
		} else {
			try {
				await this.mediaControls.startRecording();
			} catch (error) {
				console.error('Error starting audio recording:', error);
			}
		}
	}

	private async handleAudioCaptured(arrayBuffer: ArrayBuffer): Promise<void> {
		if (this.chat.isLoading()) return;

		this.chat.showLoading();

		try {
			const result = await apiService.captureAudio(arrayBuffer);
			
			const userMessage: Message = {
				role: "user",
				content: result.text,
				timestamp: Date.now(),
				id: this.generateId(),
			};

			await this.chat.addMessage(userMessage);
			this.saveConversation();
		} catch (error) {
			console.error('Error processing audio:', error);
			const errorMessage: Message = {
				role: "assistant",
				content: "Failed to process audio. Please try again.",
				timestamp: Date.now(),
				id: this.generateId(),
			};
			await this.chat.addMessage(errorMessage);
		} finally {
			this.chat.hideLoading();
		}
	}

	private async handleFilePick(): Promise<void> {
		const filePath = await apiService.pickFile();
		
		if(filePath === null) {
			return;
		}

		if (this.chat.isLoading()) return;

		const userMessage: Message = {
			role: "user",
			content: `File: ${filePath}`,
			timestamp: Date.now(),
			id: this.generateId(),
		};

		await this.chat.addMessage(userMessage);
		this.chat.showLoading();

		try {
			const result = await apiService.processFile(filePath);

			const assistantMessage: Message = {
				role: "assistant",
				content: result.text,
				timestamp: Date.now(),
				id: this.generateId(),
			};

			await this.chat.addMessage(assistantMessage);

			this.saveConversation();
		} catch (error) {
			console.error('Error processing files:', error);
			const errorMessage: Message = {
				role: "assistant",
				content: "Failed to process files. Please try again.",
				timestamp: Date.now(),
				id: this.generateId(),
			};
			await this.chat.addMessage(errorMessage);
		} finally {
			this.chat.hideLoading();
		}
	}

	private generateId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
	}

	private saveConversation(): void {
		const messages = this.chat.getMessages();
		if (messages.length === 0) return;

		const conversation = {
			id: this.currentConversationId || this.generateId(),
			title: messages[0].content.substring(0, 50) + (messages[0].content.length > 50 ? '...' : ''),
			messages,
			createdAt: this.currentConversationId ? Date.now() : Date.now(),
			updatedAt: Date.now(),
		};

		this.currentConversationId = conversation.id;
		storageService.saveConversation(conversation);
	}

	private loadSettings(): void {
		const settings = storageService.getSettings();
		// Apply theme
		document.documentElement.setAttribute('data-theme', settings.theme);
	}
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new App();
}); 