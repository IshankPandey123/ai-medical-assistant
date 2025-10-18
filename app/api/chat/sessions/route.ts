import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = (await clientPromise).db();
    const chatCollection = db.collection("chats");

    // Get all unique chat sessions for the user
    const sessions = await chatCollection.aggregate([
      { $match: { userId: session.user.id } },
      { 
        $group: {
          _id: "$sessionId",
          lastMessage: { $last: "$createdAt" },
          firstMessage: { $first: "$createdAt" },
          messageCount: { $sum: 1 },
          preview: {
            $first: {
              $cond: [
                { $eq: ["$role", "user"] },
                "$content",
                null
              ]
            }
          }
        }
      },
      { $sort: { lastMessage: -1 } },
      { $limit: 50 }
    ]).toArray();

    // Format the sessions
    const formattedSessions = sessions.map(session => ({
      sessionId: session._id,
      lastMessage: session.lastMessage,
      firstMessage: session.firstMessage,
      messageCount: session.messageCount,
      preview: session.preview || "AI Response",
      title: session.preview ? 
        (session.preview.length > 50 ? session.preview.substring(0, 50) + "..." : session.preview) :
        "New Chat"
    }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Chat sessions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
