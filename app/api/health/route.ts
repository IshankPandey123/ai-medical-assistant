import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

// Health Metrics Types
export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  timestamp: Date;
  notes?: string;
}

export interface BloodSugarReading {
  value: number;
  type: 'fasting' | 'post-meal' | 'random' | 'hba1c';
  timestamp: Date;
  notes?: string;
}

export interface WeightReading {
  value: number;
  timestamp: Date;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  reminders: {
    time: string;
    days: string[];
  }[];
  notes?: string;
}

export interface MedicationLog {
  medicationId: string;
  taken: boolean;
  timestamp: Date;
  notes?: string;
}

// Blood Pressure API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type and data are required" },
        { status: 400 }
      );
    }

    const db = (await clientPromise).db();
    
    switch (type) {
      case 'blood-pressure':
        const bpRecord = {
          userId: session.user.id,
          systolic: data.systolic,
          diastolic: data.diastolic,
          timestamp: new Date(data.timestamp || Date.now()),
          notes: data.notes || '',
          createdAt: new Date(),
        };
        
        await db.collection("blood_pressure").insertOne(bpRecord);
        return NextResponse.json({ success: true, data: bpRecord });

      case 'blood-sugar':
        const bsRecord = {
          userId: session.user.id,
          value: data.value,
          type: data.type,
          timestamp: new Date(data.timestamp || Date.now()),
          notes: data.notes || '',
          createdAt: new Date(),
        };
        
        await db.collection("blood_sugar").insertOne(bsRecord);
        return NextResponse.json({ success: true, data: bsRecord });

      case 'weight':
        const weightRecord = {
          userId: session.user.id,
          value: data.value,
          timestamp: new Date(data.timestamp || Date.now()),
          notes: data.notes || '',
          createdAt: new Date(),
        };
        
        await db.collection("weight").insertOne(weightRecord);
        return NextResponse.json({ success: true, data: weightRecord });

      case 'medication':
        const medicationRecord = {
          userId: session.user.id,
          name: data.name,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          reminders: data.reminders || [],
          notes: data.notes || '',
          createdAt: new Date(),
        };
        
        const result = await db.collection("medications").insertOne(medicationRecord);
        return NextResponse.json({ 
          success: true, 
          data: { ...medicationRecord, id: result.insertedId } 
        });

      case 'medication-log':
        const logRecord = {
          userId: session.user.id,
          medicationId: data.medicationId,
          taken: data.taken,
          timestamp: new Date(data.timestamp || Date.now()),
          notes: data.notes || '',
          createdAt: new Date(),
        };
        
        await db.collection("medication_logs").insertOne(logRecord);
        return NextResponse.json({ success: true, data: logRecord });

      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Health metrics API error:", error);
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
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const days = parseInt(searchParams.get('days') || '30');

    const db = (await clientPromise).db();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let data = {};

    switch (type) {
      case 'blood-pressure':
        const bpData = await db.collection("blood_pressure")
          .find({ 
            userId: session.user.id,
            timestamp: { $gte: startDate }
          })
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray();
        data = { bloodPressure: bpData };
        break;

      case 'blood-sugar':
        const bsData = await db.collection("blood_sugar")
          .find({ 
            userId: session.user.id,
            timestamp: { $gte: startDate }
          })
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray();
        data = { bloodSugar: bsData };
        break;

      case 'weight':
        const weightData = await db.collection("weight")
          .find({ 
            userId: session.user.id,
            timestamp: { $gte: startDate }
          })
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray();
        data = { weight: weightData };
        break;

      case 'medications':
        const medications = await db.collection("medications")
          .find({ userId: session.user.id })
          .sort({ createdAt: -1 })
          .toArray();
        data = { medications };
        break;

      case 'medication-logs':
        const medicationLogs = await db.collection("medication_logs")
          .find({ 
            userId: session.user.id,
            timestamp: { $gte: startDate }
          })
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray();
        data = { medicationLogs };
        break;

      case 'all':
        const [bp, bs, w, meds, medLogs] = await Promise.all([
          db.collection("blood_pressure")
            .find({ userId: session.user.id, timestamp: { $gte: startDate } })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray(),
          db.collection("blood_sugar")
            .find({ userId: session.user.id, timestamp: { $gte: startDate } })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray(),
          db.collection("weight")
            .find({ userId: session.user.id, timestamp: { $gte: startDate } })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray(),
          db.collection("medications")
            .find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .toArray(),
          db.collection("medication_logs")
            .find({ userId: session.user.id, timestamp: { $gte: startDate } })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray()
        ]);
        
        data = {
          bloodPressure: bp,
          bloodSugar: bs,
          weight: w,
          medications: meds,
          medicationLogs: medLogs
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Health metrics GET API error:", error);
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
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: "Type and id are required" },
        { status: 400 }
      );
    }

    const db = (await clientPromise).db();
    let collectionName = '';

    switch (type) {
      case 'blood-pressure':
        collectionName = 'blood_pressure';
        break;
      case 'blood-sugar':
        collectionName = 'blood_sugar';
        break;
      case 'weight':
        collectionName = 'weight';
        break;
      case 'medication':
        collectionName = 'medications';
        break;
      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }

    const result = await db.collection(collectionName).deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Health metrics DELETE API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
