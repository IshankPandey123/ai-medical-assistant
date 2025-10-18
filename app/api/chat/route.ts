import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geminiService, ChatMessage } from "@/lib/gemini";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { message, chatHistory = [], sessionId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate AI response
    const aiResponse = await geminiService.generateHealthResponse(
      message,
      chatHistory
    );

    // Save chat messages to database
    const db = (await clientPromise).db();
    const chatCollection = db.collection("chats");

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse.message,
      timestamp: aiResponse.timestamp,
    };

    // Generate session ID if not provided
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save both messages with session ID
    await chatCollection.insertMany([
      {
        userId: session.user.id,
        sessionId: currentSessionId,
        ...userMessage,
        createdAt: new Date(),
      },
      {
        userId: session.user.id,
        sessionId: currentSessionId,
        ...assistantMessage,
        createdAt: new Date(),
      },
    ]);

    return NextResponse.json({
      message: aiResponse.message,
      timestamp: aiResponse.timestamp,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get chat history from database
    const db = (await clientPromise).db();
    const chatCollection = db.collection("chats");

    let query: any = { userId: session.user.id };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const chatHistory = await chatCollection
      .find(query)
      .sort({ createdAt: 1 }) // Chronological order
      .limit(limit)
      .toArray();

    // Convert to ChatMessage format
    const messages = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      sessionId: msg.sessionId,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat history API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    const db = (await clientPromise).db();
    const chatCollection = db.collection("chats");

    let query: any = { userId: session.user.id };
    
    if (!deleteAll && sessionId) {
      query.sessionId = sessionId;
    }

    const result = await chatCollection.deleteMany(query);

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: deleteAll ? "All chats deleted" : "Chat session deleted"
    });
  } catch (error) {
    console.error("Delete chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
