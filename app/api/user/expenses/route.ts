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


//post
export async function POST(request: Request) {
  try {

    const body = await request.json();
    console.log("POST payload:", body);
    const { accountNo, id, category, description, merchant, amount, date } = body;

    if (!accountNo || !id || !category || !description || !merchant || !amount == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await connectToMongo();
    const db = client.db("cost-of-living-calculator");
    const collection = db.collection("user");


const result = await collection.updateOne(
  { id: Number(accountNo) }, 
  { 
    $push: { 
      expenses: { 
        id,
        category,
        description,
        merchant,
        amount: amount, 
        date: date ?? Date.now(),
        createdAt: Date.now()
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


//postus deletus
export async function DELETE(request: Request){
  try{
    const { accountNo, expenseId}  = await request.json ();

    if ( !accountNo || !expenseId ) {
      return NextResponse.json(
        { error: "Missing account or expense id"},
        { status: 400 },
      )
    }

    const client = await connectToMongo();
    const db = client.db("cost-of-living-calculator");
    const collection = db.collection("user");

    const result = await collection.updateOne(
      { id: Number(accountNo) },
      { 
        $pull :{
        expenses: { id: expenseId }
      }
      }as any 
    );

    if (result.matchedCount === 0){
      return NextResponse.json({error: "User not fonud" }, {status: 400})
    }
    return NextResponse.json({ success: true });

  } catch (error){
    console.error("Error deleting", error)
    return NextResponse.json({error: "Failed to delete expense"}, {status: 500})
  }
}


// get
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountNo = searchParams.get("accountNo");

    if (!accountNo) {
      return NextResponse.json(
        { error: "Missing accountNo" },
        { status: 400 }
      );
    }

    const client = await connectToMongo();
    const db = client.db("cost-of-living-calculator");
    const collection = db.collection("user");

    const user = await collection.findOne(
      { id: Number(accountNo) },
      { projection: { expenses: 1, _id: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      expenses: user.expenses ?? [],
    });

  } catch (error) {
    console.error("GET expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}