"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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
    const colors = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
    ];

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
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition text-sm font-medium"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 w-full text-left">
              Spending Breakdown
            </h2>

            {loadingData ? (
              <p className="text-gray-400">Loading chart...</p>
            ) : expenses.length === 0 ? (
              <p className="text-gray-400">No data to display</p>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  className="w-48 h-48 rounded-full mb-6 relative"
                  style={{ background: chartData.gradient }}
                >
                  <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">
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
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        €{item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Detailed List
            </h2>

            {loadingData ? (
              <p className="text-gray-400">Loading list...</p>
            ) : expenses.length === 0 ? (
              <p className="text-gray-400">No expenses found.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.name}
                          <div className="text-xs text-gray-400 font-normal">
                            {new Date(expense.date).toLocaleDateString("en-GB")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
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
