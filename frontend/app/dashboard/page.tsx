"use client";
import { useState, useEffect } from "react";
import { getMe, getReports } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Report {
  category: { name: string };
  totalSpent: number;
  budget: number | null;
  remaining: number | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();



 useEffect(() => {
   const token = localStorage.getItem("token");
   if (!token) {
     router.push("/login");
     return;
   }

   const loadData = async () => {
     try {
       const [meData, reportsData] = await Promise.all([
         getMe(),
         getReports(currentMonth, currentYear),
       ]);
       setUser(meData.me);
       setReports(reportsData.reports);
     } catch (error) {
       router.push("/login");
     } finally {
       setLoading(false);
     }
   };

   loadData();
 }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const totalSpent = reports.reduce((sum, r) => sum + r.totalSpent, 0);
  const totalBudget = reports.reduce((sum, r) => sum + (r.budget || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>

        {/* Nav */}
        <div className="flex gap-3 mb-8">
          <Link
            href="/expenses"
            className="bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 text-sm"
          >
            Expenses
          </Link>
          <Link
            href="/budgets"
            className="bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 text-sm"
          >
            Budgets
          </Link>
          <Link
            href="/reports"
            className="bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 text-sm"
          >
            Reports
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-500 text-sm">Total Spent This Month</p>
            <p className="text-3xl font-bold text-red-500 mt-1">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-500 text-sm">Total Budget This Month</p>
            <p className="text-3xl font-bold text-green-500 mt-1">
              ${totalBudget.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Reports by category */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">Spending by Category</h2>
          {reports.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No data yet. Add some expenses!
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {reports.map((report, i) => (
                <li key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{report.category.name}</span>
                    <span className="text-gray-500">
                      ${report.totalSpent.toFixed(2)}{" "}
                      {report.budget ? `/ $${report.budget.toFixed(2)}` : ""}
                    </span>
                  </div>
                  {report.budget && (
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((report.totalSpent / report.budget) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
