import { Message } from "../../shared/types";
import { getElement, addEventListeners, setValue } from "../utils/dom";

export class InputComponent {
	private inputElement: HTMLInputElement;
	private onSend: (message: Message) => void;
	private onScreenshot: () => void;
	private onAudio: () => void;

	constructor(
		inputElement: HTMLInputElement,
		onSend: (message: Message) => void,
		onScreenshot: () => void,
		onAudio: () => void
	) {
		this.inputElement = inputElement;
		this.onSend = onSend;
		this.onScreenshot = onScreenshot;
		this.onAudio = onAudio;
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		addEventListeners(this.inputElement, {
			keydown: this.handleKeyDown.bind(this),
		});

		// Setup button event listeners
		const screenshotButton = getElement<HTMLButtonElement>("#screenshot-button");
		const audioButton = getElement<HTMLButtonElement>("#audio-button");

		addEventListeners(screenshotButton, {
			click: this.handleScreenshot.bind(this),
		});

		addEventListeners(audioButton, {
			click: this.handleAudio.bind(this),
		});
	}

	private handleKeyDown(event: KeyboardEvent): void {
		if (event.key === "Enter") {
			event.preventDefault();
			this.sendMessage();
		}
	}

	private sendMessage(): void {
		const content = this.inputElement.value.trim();
		if (!content) return;

		const message: Message = {
			role: "user",
			content,
			timestamp: Date.now(),
			id: this.generateId(),
		};

		this.onSend(message);
		setValue(this.inputElement, "");
	}

	private handleScreenshot(): void {
		this.onScreenshot();
	}

	private handleAudio(): void {
		this.onAudio();
	}

	private generateId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
	}

	focus(): void {
		this.inputElement.focus();
	}

	blur(): void {
		this.inputElement.blur();
	}

	isFocused(): boolean {
		return document.activeElement === this.inputElement;
	}

	getValue(): string {
		return this.inputElement.value;
	}

	disable(): void {
		this.inputElement.disabled = true;
	}

	enable(): void {
		this.inputElement.disabled = false;
	}
} 