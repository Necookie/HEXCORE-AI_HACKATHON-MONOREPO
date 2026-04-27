/**
 * StudyBearerChatbot - A modularized client-side chatbot logic.
 * Optimizes DOM interactions and provides clean API communication.
 */
export class StudyBearerChatbot {
  private elements: {
    toggle: HTMLElement | null;
    window: HTMLElement | null;
    close: HTMLElement | null;
    form: HTMLFormElement | null;
    input: HTMLInputElement | null;
    messages: HTMLElement | null;
  };
  private typingIndicator: HTMLElement | null = null;
  private webhookUrl: string;

  constructor() {
    this.elements = {
      toggle: document.getElementById("chat-toggle"),
      window: document.getElementById("chat-window"),
      close: document.getElementById("close-chat"),
      form: document.getElementById("chat-form") as HTMLFormElement,
      input: document.getElementById("chat-input") as HTMLInputElement,
      messages: document.getElementById("chat-messages"),
    };

    this.webhookUrl = (import.meta as any).env.PUBLIC_N8N_CHAT_WEBHOOK_URL?.trim() || "";
    
    this.init();
  }

  private init() {
    if (!this.elements.toggle || !this.elements.window) return;

    this.elements.toggle.addEventListener("click", () => this.toggleChat());
    this.elements.close?.addEventListener("click", () => this.toggleChat());
    this.elements.form?.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  private toggleChat() {
    this.elements.window?.classList.toggle("hidden");
    if (!this.elements.window?.classList.contains("hidden")) {
      this.elements.input?.focus();
    }
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const text = this.elements.input?.value.trim();
    if (!text || !this.webhookUrl) return;

    this.addMessage(text, true);
    if (this.elements.input) this.elements.input.value = "";

    this.showTyping();

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          sessionId: this.getSessionId(),
          chatInput: text,
        }),
      });

      this.handleSessionUpdate(response);
      const botResponseText = await this.parseResponse(response);
      
      this.removeTyping();
      this.addMessage(botResponseText, false);
    } catch (error) {
      console.error("Chat error:", error);
      this.removeTyping();
      this.addMessage("Sorry, I encountered an error. Please try again.", false);
    }
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem("sb_chat_session");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("sb_chat_session", sessionId);
    }
    return sessionId;
  }

  private handleSessionUpdate(response: Response) {
    const sessionDataHeader = response.headers.get("session-data");
    if (sessionDataHeader) {
      try {
        const { id } = JSON.parse(sessionDataHeader);
        if (id) localStorage.setItem("sb_chat_session", id);
      } catch (e) { /* Ignore parse errors */ }
    }
  }

  private async parseResponse(response: Response): Promise<string> {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return data.output || data.message || data.response || JSON.stringify(data);
    }
    return response.text();
  }

  private addMessage(text: string, isUser: boolean) {
    if (!this.elements.messages) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
    
    const contentDiv = document.createElement("div");
    contentDiv.className = "msg-content";
    contentDiv.textContent = text;

    msgDiv.appendChild(contentDiv);
    this.elements.messages.appendChild(msgDiv);
    this.scrollToBottom();
  }

  private showTyping() {
    if (!this.elements.messages || this.typingIndicator) return;

    this.typingIndicator = document.createElement("div");
    this.typingIndicator.className = "message bot-message typing-indicator-container";
    this.typingIndicator.innerHTML = `
      <div class="msg-content typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;

    this.elements.messages.appendChild(this.typingIndicator);
    this.scrollToBottom();
  }

  private removeTyping() {
    if (this.typingIndicator && this.typingIndicator.parentNode) {
      this.typingIndicator.parentNode.removeChild(this.typingIndicator);
      this.typingIndicator = null;
    }
  }

  private scrollToBottom() {
    if (this.elements.messages) {
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
  }
}

// Auto-initialize when script loads
document.addEventListener("DOMContentLoaded", () => {
  new StudyBearerChatbot();
});
