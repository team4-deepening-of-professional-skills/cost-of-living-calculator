"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CHART_COLORS } from "@/components/ui/theme";
import { SpendingTipsModal, TipsResponse } from "@/components/SpendingTipsModal";

interface Expense {
  merchant: string;
  amount: number;
  date: string | number;
  category: string;
}

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [tipsLoadingCategory, setTipsLoadingCategory] = useState<string | null>(null);
  const [tipsError, setTipsError] = useState<string | null>(null);
  const [tipsData, setTipsData] = useState<TipsResponse | null>(null);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [tipsCategory, setTipsCategory] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("username");

    if (!userId) {
      router.push("/login");
      return;
    }

    setUsername(storedName || "User");

    const fetchExpenses = async () => {
      setLoadingData(true);
      try {
        const res = await fetch(`/api/user/data?accountNo=${userId}`);
        const data = await res.json();
        if (data.success) {
          setExpenses(data.expenses);
        }
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchExpenses();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handleQuickFilter = (type: "week" | "month") => {
    const today = new Date();
    const pastDate = new Date(today);

    if (type === "week") {
      pastDate.setDate(today.getDate() - 7);
    } else {
      pastDate.setMonth(today.getMonth() - 1);
    }

    setDateFilter({
      from: pastDate.toISOString().split("T")[0],
      to: today.toISOString().split("T")[0],
    });
  };

  const handleTipsRequest = async (category: string) => {
    setTipsCategory(category);
    setTipsLoadingCategory(category);
    setTipsError(null);
    setTipsData(null);
    setIsTipsModalOpen(true);

    const categoryExpenses = filteredExpenses.filter(
      (expense) => expense.category === category,
    );

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          expenses: categoryExpenses,
          from: dateFilter.from,
          to: dateFilter.to,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate tips");
      }

      const data = await res.json();
      const parsed = JSON.parse(data.output) as TipsResponse;
      setTipsData(parsed);
    } catch (error) {
      setTipsError(
        error instanceof Error ? error.message : "Unexpected response format",
      );
    } finally {
      setTipsLoadingCategory(null);
    }
  };

  const filteredExpenses = useMemo(() => {
    const fromDate = new Date(`${dateFilter.from}T00:00:00`);
    const toDate = new Date(`${dateFilter.to}T23:59:59.999`);

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= fromDate && expenseDate <= toDate;
    });
  }, [expenses, dateFilter]);

  const { spendingChartData, incomeChartData } = useMemo(() => {
    const spendingExpenses = filteredExpenses.filter(
      (e) => e.category !== "income",
    );
    const incomeExpenses = filteredExpenses.filter(
      (e) => e.category === "income",
    );

    const generateChartData = (
      data: Expense[],
      groupByKey: "category" | "merchant",
    ) => {
      const total = data.reduce((sum, item) => sum + item.amount, 0);

      const totals = data.reduce(
        (acc, item) => {
          const key = item[groupByKey] || "Uncategorized";
          acc[key] = (acc[key] || 0) + item.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      let currentAngle = 0;
      const colors = CHART_COLORS;

      const segments = Object.entries(totals).map(([name, amount], index) => {
        const percentage = (amount / total) * 100;
        const color = colors[index % colors.length];
        const segmentString = `${color} ${currentAngle}% ${currentAngle + percentage}%`;
        currentAngle += percentage;

        return { name, amount, color, segmentString };
      });

      return {
        total,
        gradient: `conic-gradient(${segments.map((s) => s.segmentString).join(", ")})`,
        segments,
      };
    };

    return {
      spendingChartData: generateChartData(spendingExpenses, "category"),
      incomeChartData: generateChartData(incomeExpenses, "merchant"),
    };
  }, [filteredExpenses]);

  if (!username) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#191724] via-[#1f1d2e] to-[#26233a] text-[#e0def4]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rp-base via-rp-surface to-rp-overlay px-4 py-10 text-soft">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 mb-8 backdrop-blur gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-soft">Dashboard</h1>
            <p className="text-sm text-subtle">Welcome back, {username}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => handleQuickFilter("week")}
                variant="ghost"
                size="sm"
                className="text-xs border border-rp-border"
              >
                Last 7 Days
              </Button>
              <Button
                onClick={() => handleQuickFilter("month")}
                variant="ghost"
                size="sm"
                className="text-xs border border-rp-border"
              >
                Last Month
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-subtle">From:</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) =>
                  setDateFilter((prev) => ({ ...prev, from: e.target.value }))
                }
                max={dateFilter.to}
                className="bg-rp-base border border-rp-border rounded px-2 py-1 text-soft text-sm focus:outline-none focus:border-rp-iris"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-subtle">To:</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) =>
                  setDateFilter((prev) => ({ ...prev, to: e.target.value }))
                }
                min={dateFilter.from}
                max={new Date().toISOString().split("T")[0]}
                className="bg-rp-base border border-rp-border rounded px-2 py-1 text-soft text-sm focus:outline-none focus:border-rp-iris"
              />
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="uppercase tracking-wide"
          >
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Income Chart */}
            <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 flex flex-col items-center transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02]">
              <h2 className="text-lg font-semibold text-soft mb-6 w-full text-left">
                Income Breakdown
              </h2>

              {loadingData ? (
                <p className="text-sm text-muted">Loading chart...</p>
              ) : incomeChartData.total === 0 ? (
                <p className="text-sm text-muted">No income data to display</p>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div
                    className="w-48 h-48 rounded-full mb-6 relative shadow-inner shadow-black/40"
                    style={{ background: incomeChartData.gradient }}
                  >
                    <div className="absolute inset-0 m-auto w-32 h-32 bg-rp-base border border-rp-border rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-soft">
                        € {incomeChartData.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-2">
                    {incomeChartData.segments.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center">
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className="text-soft capitalize">
                            {item.name.replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="font-medium text-soft">
                          € {item.amount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Spending Chart */}
            <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 flex flex-col items-center transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02]">
              <h2 className="text-lg font-semibold text-soft mb-6 w-full text-left">
                Spending Breakdown
              </h2>

              {loadingData ? (
                <p className="text-sm text-muted">Loading chart...</p>
              ) : spendingChartData.total === 0 ? (
                <p className="text-sm text-muted">
                  No spending data to display
                </p>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div
                    className="w-48 h-48 rounded-full mb-6 relative shadow-inner shadow-black/40"
                    style={{ background: spendingChartData.gradient }}
                  >
                    <div className="absolute inset-0 m-auto w-32 h-32 bg-rp-base border border-rp-border rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-soft">
                        € {spendingChartData.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-2">
                    {spendingChartData.segments.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className="text-soft capitalize">
                            {item.name.replace(/_/g, " ")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTipsRequest(item.name)}
                            className="group inline-flex h-6 w-6 items-center justify-center text-subtle transition hover:text-white hover:drop-shadow-[0_0_8px_rgba(196,167,231,0.8)] disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={
                              tipsLoadingCategory !== null &&
                              tipsLoadingCategory !== item.name
                            }
                            aria-label={`Get AI tips for ${item.name}`}
                            title="Get AI tips"
                          >
                            {tipsLoadingCategory === item.name ? (
                              <span className="inline-block h-4 w-4 rounded-full border-2 border-rp-border border-t-rp-iris animate-spin" />
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M12 3l1.6 3.9L18 8.5l-3.9 1.6L12 14l-1.6-3.9L6.5 8.5l3.9-1.6L12 3z" />
                                <path d="M6.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" />
                                <path d="M17 15l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <span className="font-medium text-soft">
                          € {item.amount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-soft">
                Detailed List
              </h2>
              <Button
                onClick={() => router.push("/expenses")}
                size="sm"
                className="text-xs"
              >
                Add Expense
              </Button>
            </div>

            {loadingData ? (
              <p className="text-sm text-muted">Loading list...</p>
            ) : filteredExpenses.length === 0 ? (
              <p className="text-sm text-muted">No expenses found.</p>
            ) : (
              <div className="overflow-y-auto max-h-[800px] rounded-2xl border border-rp-border bg-rp-surface/80 shadow-lg shadow-black/30 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-rp-border [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="min-w-full divide-y divide-rp-border text-sm">
                  <thead className="bg-rp-overlay sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-subtle uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-subtle uppercase tracking-wider">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-rp-border">
                    {filteredExpenses.map((expense, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-soft">
                          {expense.merchant}
                          <div className="text-xs text-muted font-normal">
                            {new Date(expense.date).toLocaleDateString("en-GB")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-soft font-semibold">
                          € {expense.amount.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <SpendingTipsModal
        isOpen={isTipsModalOpen}
        isLoading={tipsLoadingCategory !== null}
        error={tipsError}
        data={tipsData}
        category={tipsCategory}
        onClose={() => {
          setIsTipsModalOpen(false);
          setTipsCategory(null);
        }}
      />
    </div>
  );
}
