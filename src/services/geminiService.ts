
import { GoogleGenAI, Chat } from "@google/genai";
import { Product } from "../types";

// This simulates a backend service using Gemini
class GeminiService {
  private ai: GoogleGenAI;
  private modelName = "gemini-2.5-flash";

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  // Create a chat session with context about the products
  public createShoppingAssistantChat(products: Product[]): Chat {
    const productContext = products.map(p => {
      let stockInfo = `Stock: ${p.stock}`;
      if (p.variants && p.variants.length > 0) {
        const variants = p.variants.map(v => `${v.name} (${v.stock})`).join(', ');
        stockInfo = `Variants Available: ${variants}`;
      }
      return `- ${p.title} (ID: ${p.id}): $${p.price}. ${p.description} Category: ${p.category}. ${stockInfo}`;
    }).join('\n');

    const systemInstruction = `You are "Lumina", a helpful and enthusiastic AI sales assistant for Lumina Market.
    
    Here is our current product inventory (Note: Only available products are listed):
    ${productContext}

    Your goal is to help customers find products, compare them, and check availability.
    - Be concise and friendly.
    - If a user asks for a recommendation, suggest products from the inventory list above.
    - Format prices nicely (e.g., $1,200.00).
    - If a user asks about a product NOT in this list, politely inform them it is currently out of stock or unavailable.
    - If asked about shipping, say we offer free shipping on orders over $500.
    `;

    return this.ai.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: systemInstruction,
      },
    });
  }
}

export const geminiService = new GeminiService();
