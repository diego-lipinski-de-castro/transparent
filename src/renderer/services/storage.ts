import { Conversation, AppConfig } from "../../shared/types";
import { STORAGE_KEYS } from "../../shared/constants";

class StorageService {
	private storage = window.localStorage;

	// Conversation management
	saveConversation(conversation: Conversation): void {
		const conversations = this.getConversations();
		const existingIndex = conversations.findIndex(c => c.id === conversation.id);
		
		if (existingIndex >= 0) {
			conversations[existingIndex] = conversation;
		} else {
			conversations.push(conversation);
		}
		
		this.storage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
	}

	getConversations(): Conversation[] {
		try {
			const data = this.storage.getItem(STORAGE_KEYS.CONVERSATIONS);
			return data ? JSON.parse(data) : [];
		} catch (error) {
			console.error('Error loading conversations:', error);
			return [];
		}
	}

	getConversation(id: string): Conversation | null {
		const conversations = this.getConversations();
		return conversations.find(c => c.id === id) || null;
	}

	deleteConversation(id: string): void {
		const conversations = this.getConversations();
		const filtered = conversations.filter(c => c.id !== id);
		this.storage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
	}

	clearConversations(): void {
		this.storage.removeItem(STORAGE_KEYS.CONVERSATIONS);
	}

	// Settings management
	saveSettings(settings: Partial<AppConfig>): void {
		const currentSettings = this.getSettings();
		const updatedSettings = { ...currentSettings, ...settings };
		this.storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
	}

	getSettings(): AppConfig {
		try {
			const data = this.storage.getItem(STORAGE_KEYS.SETTINGS);
			const defaultSettings: AppConfig = {
				theme: 'system',
				shortcuts: {
					toggle: 'Cmd+\\',
					screenshot: 'Cmd+Shift+S',
					audio: 'Cmd+Shift+A',
				},
				storage: {
					conversations: true,
					analytics: false,
				},
			};
			return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
		} catch (error) {
			console.error('Error loading settings:', error);
			return {
				theme: 'system',
				shortcuts: {
					toggle: 'Cmd+\\',
					screenshot: 'Cmd+Shift+S',
					audio: 'Cmd+Shift+A',
				},
				storage: {
					conversations: true,
					analytics: false,
				},
			};
		}
	}

	// API Key management
	saveApiKey(apiKey: string): void {
		this.storage.setItem(STORAGE_KEYS.API_KEY, apiKey);
	}

	getApiKey(): string | null {
		return this.storage.getItem(STORAGE_KEYS.API_KEY);
	}

	clearApiKey(): void {
		this.storage.removeItem(STORAGE_KEYS.API_KEY);
	}

	// Utility methods
	clearAll(): void {
		this.storage.clear();
	}

	getStorageSize(): number {
		let size = 0;
		for (let i = 0; i < this.storage.length; i++) {
			const key = this.storage.key(i);
			if (key) {
				size += this.storage.getItem(key)?.length || 0;
			}
		}
		return size;
	}

	exportData(): string {
		const data = {
			conversations: this.getConversations(),
			settings: this.getSettings(),
			exportedAt: new Date().toISOString(),
		};
		return JSON.stringify(data, null, 2);
	}

	importData(jsonData: string): boolean {
		try {
			const data = JSON.parse(jsonData);
			if (data.conversations) {
				this.storage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data.conversations));
			}
			if (data.settings) {
				this.storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
			}
			return true;
		} catch (error) {
			console.error('Error importing data:', error);
			return false;
		}
	}
}

export const storageService = new StorageService(); 