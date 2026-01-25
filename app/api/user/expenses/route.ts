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
    const { accountNo, expenseName, amount, date } = await request.json();

    if (!accountNo || !expenseName || !amount ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await connectToMongo();
    const db = client.db("cost-of-living-calculator");
    const collection = db.collection("user");


const result = await collection.updateOne(
  { id: accountNo }, 
  { 
    $push: { 
      expenses: { 
        name: expenseName, 
        amount: amount, 
        date: date
      } 
    } 
  } as any 
);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Expense added!" });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 });
  }
}