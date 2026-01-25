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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountNo = searchParams.get("accountNo");

    if (!accountNo) {
      return NextResponse.json({ error: "Missing accountNo" }, { status: 400 });
    }

    const client = await connectToMongo();
    const db = client.db("cost-of-living-calculator");
    const collection = db.collection("user");

    const userData = await collection.findOne({ id: Number(accountNo) });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      expenses: userData.expenses || [],
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
