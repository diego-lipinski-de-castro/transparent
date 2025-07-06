export const createElement = <K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className?: string,
	attributes?: Record<string, string>
): HTMLElementTagNameMap[K] => {
	const element = document.createElement(tag);
	if (className) {
		element.className = className;
	}
	if (attributes) {
		Object.entries(attributes).forEach(([key, value]) => {
			element.setAttribute(key, value);
		});
	}
	return element;
};

export const getElement = <T extends HTMLElement>(selector: string): T => {
	const element = document.querySelector<T>(selector);
	if (!element) {
		throw new Error(`Element not found: ${selector}`);
	}
	return element;
};

export const getElementOrNull = <T extends HTMLElement>(selector: string): T | null => {
	return document.querySelector<T>(selector);
};

export const addEventListeners = (
	element: HTMLElement,
	events: Record<string, EventListener>
): void => {
	Object.entries(events).forEach(([event, listener]) => {
		element.addEventListener(event, listener);
	});
};

export const removeEventListeners = (
	element: HTMLElement,
	events: Record<string, EventListener>
): void => {
	Object.entries(events).forEach(([event, listener]) => {
		element.removeEventListener(event, listener);
	});
};

export const scrollToBottom = (element: HTMLElement, smooth = true): void => {
	element.scrollTo({
		top: element.scrollHeight,
		behavior: smooth ? 'smooth' : 'auto',
	});
};

export const addClass = (element: HTMLElement, ...classNames: string[]): void => {
	element.classList.add(...classNames);
};

export const removeClass = (element: HTMLElement, ...classNames: string[]): void => {
	element.classList.remove(...classNames);
};

export const setValue = (element: HTMLInputElement, value: string): void => {
	element.value = value;
};

export const setInnerHTML = (element: HTMLElement, html: string): void => {
	element.innerHTML = html;
};

export const appendChild = (parent: HTMLElement, child: HTMLElement): void => {
	parent.appendChild(child);
};

export const removeChild = (parent: HTMLElement, child: HTMLElement): void => {
	parent.removeChild(child);
};

export const showElement = (element: HTMLElement): void => {
	element.style.display = '';
};

export const hideElement = (element: HTMLElement): void => {
	element.style.display = 'none';
};
