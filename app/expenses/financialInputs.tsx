"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

// get entrylist (all entries) and entries by category (entries categorized) components
import EntryList from "./entryList";
import EntriesByCategory from "./entriesByCategory";

// create categories from spending to income (id --> value saved to the mongo database, label is for choosing category)
const CATEGORIES = [
  { id: "savings", label: "Savings" },
  { id: "housing", label: "Housing" },
  { id: "food", label: "Food" },
  { id: "entertainment", label: "Entertainment" },
  { id: "personal_care", label: "Personal Care" },
  { id: "transportation", label: "Transportation" },
  { id: "loan", label: "Loan Payments" },
  { id: "income", label: "Income" },
];

// set a type for the entries (id category amount timestamp and recurring expenses (like subscriptions))
// createdAt saves a timestamp automatically to the database
// recurring is for optional use and everything you have to write / choose
export type Entry = {
  id: string;
  category: string;
  description: string;
  merchant: string;
  amount: number;
  createdAt: number;
  recurring?: RecurringRule;
};

// here for choosing if the input is recurring. choose days, weeks or months.
export type RecurringRule = {
  every: number;
  interval: "days" | "weeks" | "months";
};

const inputClassName =
  "block w-full rounded-md border border-rp-border bg-rp-overlay px-3 py-2 text-sm text-soft placeholder-muted focus:outline-none focus:ring-2 focus:ring-foam focus:border-foam";

// main component for the page.
export default function FinancialInput() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [every, setEvery] = useState(1);
  const [interval, setInterval] = useState<"days" | "weeks" | "months">("months");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // load expenses from database using user id (logged in user)
  useEffect(() => {
    const accountNo = localStorage.getItem("userId");
    if (!accountNo) {
      router.push("/login");
      return;
    }

    async function loadExpenses() {
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
  }, [router]);

  // create / post  a new entry. saves to db. checks all required fields are filled and the user is logged in.
  async function handleAddEntry() {
    if (!amount || !category || !description || !merchant) return;

    const newEntry: Entry = {
      id: crypto.randomUUID(),
      category,
      description,
      merchant,
      amount: Number(amount),
      createdAt: Date.now(),
      recurring: isRecurring ? { every, interval } : undefined,
    };

    const accountNo = localStorage.getItem("userId");

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
            date: newEntry.createdAt,
          }),
        });

        const data = await res.json();
        console.log("POST response:", data);
        if (!res.ok) {
          alert("Failed to save expense: " + data.error);
        }
      } catch (err) {
        console.error("Failed to save expenses", err);
      }
    }

    setEntries((prev) => [...prev, newEntry]);

    setAmount("");
    setCategory("");
    setDescription("");
    setMerchant("");
    setIsRecurring(false);
    setEvery(1);
    setInterval("months");
  }

  // frontend logic for deleting entries.
  async function handleDeleteEntry(id: string) {
    const accountNo = localStorage.getItem("userId");
    if (!accountNo) return;

    try {
      const res = await fetch("/api/user/expenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNo,
          expenseId: id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert("Delete failed" + data.error);
        return;
      }

      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Expense delete failed", err);
    }
  }

  const canSave = Boolean(amount && category && description && merchant);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 backdrop-blur gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-soft">Expenses</h1>
          <p className="text-sm text-subtle">
            Add entries and review your spending history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
            className="uppercase tracking-wide border border-rp-border"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Input form */}
      <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 backdrop-blur space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-soft">
              Amount (EUR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className={inputClassName}
            />
          </div>

          {/* Merchant */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-soft">Merchant</label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Lidl"
              className={inputClassName}
            />
          </div>

          {/* Description */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-soft">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className={inputClassName}
            />
          </div>

          {/* Category */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-soft">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClassName}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurring */}
        <div className="flex flex-col gap-3 pt-2">
          <label className="flex items-center gap-2 text-sm text-soft">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-love)]"
            />
            Set as recurring
          </label>

          {isRecurring && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-subtle">Every</span>

              <input
                type="number"
                min={1}
                value={every}
                onChange={(e) => setEvery(Number(e.target.value))}
                className="w-20 rounded-md border border-rp-border bg-rp-overlay px-2 py-1 text-sm text-soft focus:outline-none focus:ring-2 focus:ring-foam"
              />

              <select
                value={interval}
                onChange={(e) =>
                  setInterval(e.target.value as "days" | "weeks" | "months")
                }
                className="rounded-md border border-rp-border bg-rp-overlay px-2 py-1 text-sm text-soft focus:outline-none focus:ring-2 focus:ring-foam"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button onClick={handleAddEntry} disabled={!canSave}>
            Save
          </Button>
        </div>
      </div>

      {/* Lists. shows full list of entries and entries divided into categories. */}
      {loading ? (
        <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EntryList entries={entries} onDelete={handleDeleteEntry} />
          <EntriesByCategory entries={entries} onDelete={handleDeleteEntry} />
        </div>
      )}
    </div>
  );
}
