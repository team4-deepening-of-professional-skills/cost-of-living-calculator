import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

let mongoClient: MongoClient | null = null;

async function connectToMongo() {
  if (mongoClient) return mongoClient;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  return mongoClient;
}

export async function GET() {
  try {
    const client = await connectToMongo();
    const db = client.db("cost-of-living-calculator");
    const collection = db.collection("status");

    const statusData = await collection.findOne({});

    if (!statusData) {
      return NextResponse.json(
        { message: "No status information found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: statusData
    });

  } catch (error) {
    console.error("Failed to fetch status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}