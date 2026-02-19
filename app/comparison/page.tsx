"use client";

// page for comparing financial data between 2 periods. shows spending, income, net sum and breaks down categories for comparison.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { compareByPreset, compareCategoriesByPreset, PeriodPreset } from "./expenseComparison";

interface Expense {
  merchant: string;
  amount: number;
  date: string | number;
  category: string;
}

// dates
function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB");
}
// make sure its euros
function formatEUR(n: number) {
  return `€ ${n.toFixed(2).replace(".", ",")}`;
}

export default function ComparisonPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<PeriodPreset>("month");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }

    async function fetchExpenses() {
      try {
        const res = await fetch(`/api/user/expenses?accountNo=${userId}`);
        const data = await res.json();
        if (data.success) setExpenses(data.expenses);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, [router]);

// seperate spending expenses and income
  const spendingOnly = useMemo(
    () => expenses.filter((e) => e.category !== "income"),
    [expenses]
  );

  const incomeOnly = useMemo(
    () => expenses.filter((e) => e.category === "income"),
    [expenses]
  );

// compare spending and income between 2 time periods
  const spendingComparison = useMemo(
    () => compareByPreset(spendingOnly, preset),
    [spendingOnly, preset]
  );

  const incomeComparison = useMemo(
    () => compareByPreset(incomeOnly, preset),
    [incomeOnly, preset]
  );

// calculate net sum
  const netComparison = useMemo(() => {
    const currentTotal =
      incomeComparison.currentTotal - spendingComparison.currentTotal;

    const previousTotal =
      incomeComparison.previousTotal - spendingComparison.previousTotal;

    const difference = currentTotal - previousTotal;

    const percentageChange =
      previousTotal === 0 ? 0 : (difference / previousTotal) * 100;

    return {
      currentTotal,
      previousTotal,
      difference,
      percentageChange,
      currentRange: spendingComparison.currentRange,
      previousRange: spendingComparison.previousRange,
    };
  }, [incomeComparison, spendingComparison]);

// by categories
  const categoryComparison = useMemo(() => {
    return compareCategoriesByPreset(expenses, preset);
  }, [expenses, preset]);

  const periodLabel =
    preset === "month"
      ? "This Month"
      : preset === "7d"
      ? "Last 7 Days"
      : "Last 30 Days";

  const prevLabel =
    preset === "month"
      ? "Last Month"
      : preset === "7d"
      ? "Previous 7 Days"
      : "Previous 30 Days";

// divide by what is good and bad
  const spendingIsUpBad = (diff: number) => diff > 0;
  const incomeIsUpGood = (diff: number) => diff > 0;
  const netIsUpGood = (diff: number) => diff > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rp-base via-rp-surface to-rp-overlay px-4 py-10 text-soft">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* header */}
        <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30">
          <h1 className="text-2xl font-semibold mb-4">Comparison</h1>

        <button
          onClick={() => router.push("/")}
          className="bg-rp-base border border-rp-border px-3 py-1 rounded-lg text-sm text-soft hover:border-rp-iris hover:bg-rp-surface transition">
            Back to Dashboard
        </button>
        {/* time period buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPreset("7d")}
              className={`px-3 py-1 rounded-lg text-sm border border-rp-border ${
                preset === "7d" ? "bg-rp-iris text-white" : "bg-rp-base"
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setPreset("30d")}
              className={`px-3 py-1 rounded-lg text-sm border border-rp-border ${
                preset === "30d" ? "bg-rp-iris text-white" : "bg-rp-base"
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => setPreset("month")}
              className={`px-3 py-1 rounded-lg text-sm border border-rp-border ${
                preset === "month" ? "bg-rp-iris text-white" : "bg-rp-base"
              }`}
            >
              This month
            </button>
          </div>

        {/* date rnages */}
          {!loading && (
            <p className="text-xs text-subtle mt-3">
              Current: {formatDate(spendingComparison.currentRange.from)} –{" "}
              {formatDate(spendingComparison.currentRange.to)} · Previous:{" "}
              {formatDate(spendingComparison.previousRange.from)} –{" "}
              {formatDate(spendingComparison.previousRange.to)}
            </p>
          )}
        </div>

        {loading ? (
          <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30">
            Loading…
          </div>
        ) : (
          <>
            {/* summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* spending */}
              <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30">
                <p className="text-sm text-subtle">Spending ({periodLabel})</p>
                <p className="text-xl font-semibold mt-2">
                  {formatEUR(spendingComparison.currentTotal)}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    spendingIsUpBad(spendingComparison.difference)
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {spendingComparison.difference > 0 ? "↑" : "↓"}{" "}
                  {formatEUR(Math.abs(spendingComparison.difference))}
                </p>
              </div>

              {/* income */}
              <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30">
                <p className="text-sm text-subtle">Income ({periodLabel})</p>
                <p className="text-xl font-semibold mt-2">
                  {formatEUR(incomeComparison.currentTotal)}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    incomeIsUpGood(incomeComparison.difference)
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {incomeComparison.difference > 0 ? "↑" : "↓"}{" "}
                  {formatEUR(Math.abs(incomeComparison.difference))}
                </p>
              </div>

              {/* net */}
              <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30">
                <p className="text-sm text-subtle">Net ({periodLabel})</p>
                <p className="text-xl font-semibold mt-2">
                  {formatEUR(netComparison.currentTotal)}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    netIsUpGood(netComparison.difference)
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {netComparison.difference > 0 ? "↑" : "↓"}{" "}
                  {formatEUR(Math.abs(netComparison.difference))}
                </p>
              </div>
            </div>

            {/* comparing categories */}
            <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-soft">
                  Category comparison
                </h2>
                <span className="text-xs text-subtle">
                  {formatDate(categoryComparison.currentRange.from)} –{" "}
                  {formatDate(categoryComparison.currentRange.to)}
                </span>
              </div>

              {categoryComparison.rows.length === 0 ? (
                <p className="text-sm text-subtle">No data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {categoryComparison.rows.map((row) => {
                    const isIncome = row.category === "income";
                    const up = row.difference > 0;
                    const isGood = isIncome ? up : !up;

                    return (
                      <div
                        key={row.category}
                        className="flex items-start justify-between gap-4 border-b border-rp-border pb-3 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-soft capitalize">
                            {row.category.replace(/_/g, " ")}
                            {isIncome ? "" : ""}
                          </div>
                          <div className="text-xs text-subtle mt-1">
                            Current: {formatEUR(row.currentTotal)} · Previous:{" "}
                            {formatEUR(row.previousTotal)}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-semibold ${
                              isGood ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {up ? "↑" : "↓"}{" "}
                            {formatEUR(Math.abs(row.difference))}
                          </div>
                          <div className="text-xs text-subtle">
                            {row.previousTotal === 0
                              ? "—"
                              : `${Math.abs(row.percentageChange).toFixed(1)}%`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}



