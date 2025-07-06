import { Message } from "../../shared/types";
import { renderMarkdown } from "../utils/markdown";
import { 
	createElement, 
	appendChild, 
	scrollToBottom, 
	addClass, 
	setInnerHTML,
	getElementOrNull,
	removeChild,
	removeClass
} from "../utils/dom";

export class ChatComponent {
	private outputElement: HTMLElement;
	private messages: Message[] = [];
	private loading = false;

	constructor(outputElement: HTMLElement) {
		this.outputElement = outputElement;
	}

	async addMessage(message: Message): Promise<void> {
		this.messages.push(message);
		await this.renderMessage(message);
	}

	async renderMessage(message: Message): Promise<void> {
		if (this.messages.length === 1) {
			addClass(this.outputElement, "animate-in");
		}

		const messageElement = createElement("div", "message");
		addClass(messageElement, message.role);

		if (message.role === "user") {
			setInnerHTML(messageElement, `<p>${message.content}</p>`);
		} else {
			const html = await renderMarkdown(message.content);
			setInnerHTML(messageElement, html);
		}

		appendChild(this.outputElement, messageElement);
		scrollToBottom(this.outputElement);
	}

	showLoading(): void {
		if (this.loading) return;
		
		this.loading = true;
		const loadingElement = createElement("div", "loader");
		loadingElement.id = "loader";
		appendChild(this.outputElement, loadingElement);
		scrollToBottom(this.outputElement);
	}

	hideLoading(): void {
		this.loading = false;
		const loadingElement = getElementOrNull<HTMLElement>("#loader");
		if (loadingElement) {
			removeChild(this.outputElement, loadingElement);
		}
	}

	clear(): void {
		this.messages = [];
		this.outputElement.innerHTML = '';
		removeClass(this.outputElement, "animate-in");
	}

	getMessages(): Message[] {
		return [...this.messages];
	}

	setMessages(messages: Message[]): void {
		this.messages = [...messages];
		this.renderAllMessages();
	}

	private async renderAllMessages(): Promise<void> {
		this.outputElement.innerHTML = '';
		for (const message of this.messages) {
			await this.renderMessage(message);
		}
	}

	isLoading(): boolean {
		return this.loading;
	}
} 