export interface Message {
	role: "user" | "assistant";
	content: string;
	timestamp?: number;
	id?: string;
}

export interface Conversation {
	id: string;
	title: string;
	messages: Message[];
	createdAt: number;
	updatedAt: number;
}

export interface AIResponse {
	text: string;
	groundingMetadata?: any;
	urlContextMetadata?: any;
	error?: string;
}

export interface ScreenshotResult {
	text: string;
	filePath?: string;
	error?: string;
}

export interface AudioResult {
	text: string;
	filePath?: string;
	error?: string;
}

export interface FileResult {
	text: string;
	fileName: string;
	fileType: string;
	error?: string;
}

export interface WindowState {
	width: number;
	height: number;
	x: number;
	y: number;
	isVisible: boolean;
}

export interface AppConfig {
	apiKey?: string;
	theme: 'light' | 'dark' | 'system';
	shortcuts: {
		toggle: string;
		screenshot: string;
		audio: string;
	};
	storage: {
		conversations: boolean;
		analytics: boolean;
	};
} 