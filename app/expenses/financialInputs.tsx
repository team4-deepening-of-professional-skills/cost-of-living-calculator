'use client'
import { useEffect, useState } from "react"
// get entrylist (all entries) and entries by category (entries categorized) components
import EntryList from "./entryList"
import EntriesByCategory from "./entriesByCategory"
import { useRouter } from "next/navigation";

// create categories from spending to income (id --> value saved to the mongo database, label is for choosing category)
const CATEGORIES = [
  { id: "savings", label: "Savings" },
  { id: "housing", label: "Housing" },
  { id: "food", label: "Food" },
  { id: "entertainment", label: "Entertainment" },
  { id: "personal_care", label: "Personal Care" },
  { id: "transportation", label: "Transportation" },
  { id: "loan", label: "Loan Payments" },
  { id: "income", label: "Income" }
]


// set a type for the entries (id category amount timestamp and recurring expenses (like subscriptions))
// createdAt saves a timestamp automatically to the database
// recurring is for optional use and everything you have to write / choose
export type Entry = {
  id: string
  category: string
  description: string
  merchant: string
  amount: number
  createdAt: number
  recurring?: RecurringRule
}


// here for choosing if the input is recurring. choose days, weeks or months.
export type RecurringRule = {
  every: number
  interval: "days" | "weeks" | "months"
}


// main component for the page.
export default function FinancialInput() {

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [merchant, setMerchant] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])
  const [isRecurring, setIsRecurring] = useState(false)
  const [every, setEvery] = useState(1)
  const [interval, setInterval] = useState<"days" | "weeks" | "months">("months")
  const [loading, setLoading] = useState(true)
  const router = useRouter();

// load expenses from database using user id (logged in user)
useEffect(() => {
  async function loadExpenses() {
    const accountNo = localStorage.getItem("userId");
    if (!accountNo) return;

    try {
      const res = await fetch(`/api/user/expenses?accountNo=${accountNo}`);
      const data = await res.json();

      if (res.ok) {
        setEntries(data.expenses);
      } else {
        console.error("Failed to load expenses:", data);
      }
    } catch (err) {
      console.error("Error loading expenses:", err);
    } finally {
      setLoading(false);
    }
  }

  loadExpenses();
}, [])


// create / post  a new entry. saves to db. checks all required fields are filled and the user is logged in.
  async function handleAddEntry() {
    if (!amount || !category || !description || !merchant) return


    const newEntry: Entry ={
        id: crypto.randomUUID(),
        category,
        description,
        merchant,
        amount: Number(amount),
        createdAt: Date.now(),
        recurring: isRecurring
        ? { every, interval }
        : undefined
    }


    const accountNo = localStorage.getItem("userId")

    if (accountNo) {
      try {
        const res = await fetch("/api/user/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountNo,
            id: newEntry.id,
            category: newEntry.category,
            description: newEntry.description,
            merchant: newEntry.merchant,
            amount: newEntry.amount,
            date: newEntry.createdAt
          })
        })
        const data = await res.json()
        console.log("POST response:", data)
        if (!res.ok) {
          alert("Failed to save expense: " + data.error)
        }
      } catch (err) {
        console.error("Failed to save expenses", err)
      }
    }


    setEntries((prev) => [...prev, newEntry ])

    setAmount("")
    setCategory("")
    setDescription("")
    setMerchant("")
    setIsRecurring(false)
    setEvery(1)
    setInterval("months")
  }

  // frontend logic for deleting entries.
  async function handleDeleteEntry(id: string) {
    const accountNo = localStorage.getItem("userId")
    if (!accountNo) return;

    try {
      const res = await fetch("/api/user/expenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNo,
          expenseId: id
        })
      })

      if (!res.ok) {
        const data = await res.json()
        alert("Delete failed" + data.error)
        return
      }

      setEntries((prev) => prev.filter((e) => e.id !==id))

    } catch (err){
      console.error("Expense delete failed", err)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1>Expenses</h1>

        <button
          onClick={() => router.push("/")}
          className="border px-3 py-1 rounded text-sm hover:bg-gray-100 transition">
            Back to Dashboard
        </button>
      </div>

      <div className="space-y-2 border p-4 rounded"> 

        {/* Input */} 
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount (EUR)"
          className="border p-2 w-full"
        />

        {/* description */} 
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description"
          className="border p-2 w-full"
        />


        {/*choose category*/}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        

        {/*merchant or vendor*/}
        <input
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="Merchant"
          className="border p-2 w-full"
        />


        {/* recurring button*/ }
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            />
          Set as recurring
        </label>

        
        {/* options for cycle*/}
        {isRecurring && (
          <div className="flex gap-2 text-sm">
            <span>Every</span>

            <input
              type="number"
              min={1}
              value={every}
              onChange={(e) => setEvery(Number(e.target.value))}
              className="border p-1 w-16"
              />

            <select
              value={interval}
              onChange={(e) =>
                setInterval(e.target.value as "days" | "weeks" | "months")
              }
              className="border p-1"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>
        )}
        
        {/* Save button */} 
        <button
          onClick={handleAddEntry}
          disabled={!amount || !category}
          className="bg-black text-white px-4 py-2 disabled:opacity-40"
        >
          Save
        </button>

      </div>

      {/* Lists. shows full list of entries and entries divided into categories. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EntryList entries={entries} onDelete={handleDeleteEntry} />
        <EntriesByCategory entries={entries} onDelete={handleDeleteEntry} />
      </div>
    </div>
  )
}