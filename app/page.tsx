"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CHART_COLORS } from "@/components/ui/theme";

interface Expense {
  name: string;
  amount: number;
  date: string;
}

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingData, setLoadingData] = useState(false);
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

  const chartData = useMemo(() => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);

    let currentAngle = 0;
    const colors = CHART_COLORS;

    const segments = expenses.map((item, index) => {
      const percentage = (item.amount / total) * 100;
      const color = colors[index % colors.length];
      const segmentString = `${color} ${currentAngle}% ${currentAngle + percentage}%`;
      currentAngle += percentage;

      return { ...item, color, segmentString };
    });

    return {
      total,
      gradient: `conic-gradient(${segments.map((s) => s.segmentString).join(", ")})`,
      segments,
    };
  }, [expenses]);

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
        <div className="flex items-center justify-between bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 mb-8 backdrop-blur">
          <div>
            <h1 className="text-2xl font-semibold text-soft">Dashboard</h1>
            <p className="text-sm text-subtle">Welcome back, {username}</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="uppercase tracking-wide">
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 flex flex-col items-center transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02]">
            <h2 className="text-lg font-semibold text-soft mb-6 w-full text-left">
              Spending Breakdown
            </h2>

            {loadingData ? (
              <p className="text-sm text-muted">Loading chart...</p>
            ) : expenses.length === 0 ? (
              <p className="text-sm text-muted">No data to display</p>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  className="w-48 h-48 rounded-full mb-6 relative shadow-inner shadow-black/40"
                  style={{ background: chartData.gradient }}
                >
                  <div className="absolute inset-0 m-auto w-32 h-32 bg-rp-base border border-rp-border rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-soft">
                      €{chartData.total}
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  {chartData.segments.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="text-soft">{item.name}</span>
                      </div>
                      <span className="font-medium text-soft">
                        €{item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-rp-surface/80 border border-rp-border p-6 rounded-2xl shadow-lg shadow-black/30 transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02]">
            <h2 className="text-lg font-semibold text-soft mb-4">
              Detailed List
            </h2>

            {loadingData ? (
              <p className="text-sm text-muted">Loading list...</p>
            ) : expenses.length === 0 ? (
              <p className="text-sm text-muted">No expenses found.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-rp-border bg-rp-surface/80 shadow-lg shadow-black/30">
                <table className="min-w-full divide-y divide-rp-border text-sm">
                  <thead className="bg-rp-overlay">
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
                    {expenses.map((expense, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-soft">
                          {expense.name}
                          <div className="text-xs text-muted font-normal">
                            {new Date(expense.date).toLocaleDateString("en-GB")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-soft font-semibold">
                          €{expense.amount}
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
    </div>
  );
}
