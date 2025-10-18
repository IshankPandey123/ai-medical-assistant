import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geminiService } from "@/lib/gemini";
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

    const { symptoms, additionalInfo = "", severity = "mild" } = await request.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { error: "Symptoms array is required" },
        { status: 400 }
      );
    }

    // Generate AI analysis using our existing Gemini service
    const analysis = await geminiService.generateSymptomAnalysis(symptoms);

    // Save the symptom analysis to database
    const db = (await clientPromise).db();
    const symptomCollection = db.collection("symptom_analyses");

    const analysisRecord = {
      userId: session.user.id,
      symptoms: symptoms,
      additionalInfo: additionalInfo,
      severity: severity,
      analysis: analysis.message,
      timestamp: analysis.timestamp,
      createdAt: new Date(),
    };

    await symptomCollection.insertOne(analysisRecord);

    return NextResponse.json({
      analysis: analysis.message,
      timestamp: analysis.timestamp,
      symptoms: symptoms,
      severity: severity,
    });
  } catch (error) {
    console.error("Symptom analysis API error:", error);
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
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get symptom analysis history from database
    const db = (await clientPromise).db();
    const symptomCollection = db.collection("symptom_analyses");

    const analyses = await symptomCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Format the response
    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis._id,
      symptoms: analysis.symptoms,
      additionalInfo: analysis.additionalInfo,
      severity: analysis.severity,
      analysis: analysis.analysis,
      timestamp: analysis.timestamp,
      createdAt: analysis.createdAt,
    }));

    return NextResponse.json({ analyses: formattedAnalyses });
  } catch (error) {
    console.error("Symptom history API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
