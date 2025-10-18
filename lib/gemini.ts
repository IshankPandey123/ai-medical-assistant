import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId?: string;
}

export interface ChatResponse {
  message: string;
  timestamp: Date;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

  async generateHealthResponse(
    userMessage: string,
    chatHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      // Create a health-focused system prompt with engaging formatting
      const systemPrompt = `You are a friendly, engaging AI medical assistant. You provide general health information, wellness tips, and guidance in a modern, visually appealing format.

RESPONSE FORMATTING GUIDELINES:
- Use emojis strategically to make responses more engaging (🌡️ for fever, 💊 for medicine, etc.)
- Structure information with clear headings and bullet points
- Use modern formatting like bold text, italics, and clear sections
- Make responses conversational and easy to read
- Include practical tips and actionable advice
- Use visual separators and clear organization

IMPORTANT MEDICAL GUIDELINES:
- Always remind users that you are not a substitute for professional medical advice
- For serious symptoms or emergencies, advise users to consult healthcare professionals
- Provide evidence-based health information when possible
- Be empathetic and supportive in your responses
- Keep responses informative but engaging
- If asked about specific medical conditions, provide general information and recommend consulting a doctor

Previous conversation context:`;

      // Build the conversation context
      const contextMessages = chatHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}\n${contextMessages}\n\nUser: ${userMessage}\nAssistant:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        message: text.trim(),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSymptomAnalysis(symptoms: string[]): Promise<ChatResponse> {
    try {
      const symptomPrompt = `You are a friendly, engaging AI medical assistant analyzing symptoms. The user has reported the following symptoms: ${symptoms.join(', ')}.

Please provide a well-formatted, engaging response that includes:

🎯 **Quick Assessment**
- Brief overview of what these symptoms might indicate

📋 **Possible Conditions** 
- General information about conditions that could cause these symptoms (not a diagnosis)

⚠️ **When to Seek Help**
- Clear guidance on when immediate medical attention is needed

💡 **Self-Care Tips**
- Practical recommendations for managing symptoms at home

🔍 **Next Steps**
- Suggestions for monitoring and follow-up

FORMATTING REQUIREMENTS:
- Use emojis strategically to make it visually appealing
- Structure with clear headings and bullet points
- Use bold text for important information
- Make it conversational and easy to scan
- Include practical, actionable advice

IMPORTANT: Always remind users that this is not a diagnosis and professional medical consultation is needed for proper evaluation.`;

      const result = await this.model.generateContent(symptomPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        message: text.trim(),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to analyze symptoms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();
