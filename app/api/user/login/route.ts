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

export async function POST(request: Request) {
  try {
    // 1. Get the username and password from the frontend request
    const { username, password } = await request.json();

    const client = await connectToMongo();
    const db = client.db("cost-of-living-calculator");
    const collection = db.collection("user");

    // 2. Look for a user that matches BOTH username and password
    const user = await collection.findOne({ username: username, password: password });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // 3. Return success and the account ID (user.id)
    return NextResponse.json({
      success: true,
      accountNo: user.id,
      username: user.username
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}