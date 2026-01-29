'use client'
import { useEffect, useState  } from "react"
import EntryList from "./entryList"
import EntriesByCategory from "./entriesByCategory"

// categories for using money and getting it in
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


// set a type for the entries (id category amount timestamp and recurring inputs(?))
export type Entry = {
  id: string
  category: string
  description: string
  amount: number
  createdAt: number
  recurring?: RecurringRule
}


// set the interval for recurring inputs
export type RecurringRule = {
  every: number
  interval: "days" | "weeks" | "months"
}


// financial input section
export default function FinancialInput() {

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])
  const [isRecurring, setIsRecurring] = useState(false)
  const [every, setEvery] = useState(1)
  const [interval, setInterval] = useState<"days" | "weeks" | "months">("months")
  const [setLoading] = useState(true);


// load expenses
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
}, []);


// post entries
  async function handleAddEntry() {
    if (!amount || !category || !description) return


    const newEntry: Entry ={
        id: crypto.randomUUID(),
        category,
        description,
        amount: Number(amount),
        createdAt: Date.now(),
        ...(isRecurring && {
          recurring:{
            every,
            interval
          }
        })
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
    setIsRecurring(false)
    setEvery(1)
    setInterval("months")
  }

  function handleDeleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }


  return (
    <div className="space-y-6 max-w-lg"> 
      {/* Input */} 
      <div className="space-y-2 border p-4 rounded"> 
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount (EUR)"
          className="border p-2 w-full"
        />


        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description"
          className="border p-2 w-full"
        />


        <select //select category for input
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
        

        <button
          onClick={handleAddEntry} //save button
          disabled={!amount || !category}
          className="bg-black text-white px-4 py-2 disabled:opacity-40"
        >
          Save
        </button>
      </div>


      {/* History / all entries */}
      <EntryList entries={entries} onDelete={handleDeleteEntry} />


      {/* Overview by category*/}
      <EntriesByCategory entries={entries} />
    </div>
  )
}