import OpenAI from "openai";

export class OpenAIAssistant {
  private client: OpenAI;
  private assistant: any;
  private thread: any;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  /*
  async initialize(
    instructions: string = `You are an Korean tutor. Help students improve their language skills by:
    - Correcting mistakes in grammar and vocabulary
    - Explaining concepts with examples
    - Engaging in conversation practice
    - Providing learning suggestions
    Be friendly, adapt to student's level, and always give concise answers.`
  ) {
  */

  async initialize(
    instructions: string = `당신은 신수철의 회사 업무를 돕기 위한 인공지능 직원 입니다:
    - 세금계산서 조회, 취소, 수정계산서 발행 할수 있습니다.
    - 거리단위는 Meter를 사용합니다. 온도단위는 Celcius를 사용합니다.
    - 요청하는 고객사의 시스템점검보고서를 생성해서 이메일과 텔레그램으로 보낼수 있습니다.`
  ) {
    // Create an assistant
    this.assistant = await this.client.beta.assistants.create({
      name: "Korean Assistant Agent",
      instructions,
      tools: [],
      model: "gpt-4-turbo-preview",
    });

    // Create a thread
    this.thread = await this.client.beta.threads.create();
  }

  async getResponse(userMessage: string): Promise<string> {
    if (!this.assistant || !this.thread) {
      throw new Error("Assistant not initialized. Call initialize() first.");
    }

    // Add user message to thread
    await this.client.beta.threads.messages.create(this.thread.id, {
      role: "user",
      content: userMessage,
    });

    // Create and run the assistant
    const run = await this.client.beta.threads.runs.createAndPoll(
      this.thread.id,
      { assistant_id: this.assistant.id }
    );

    if (run.status === "completed") {
      // Get the assistant's response
      const messages = await this.client.beta.threads.messages.list(
        this.thread.id
      );

      // Get the latest assistant message
      const lastMessage = messages.data.filter(
        (msg) => msg.role === "assistant"
      )[0];

      if (lastMessage && lastMessage.content[0].type === "text") {
        return lastMessage.content[0].text.value;
      }
    }

    return "Sorry, I couldn't process your request.";
  }
}