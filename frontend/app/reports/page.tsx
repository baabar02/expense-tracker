"use client";
import { useState, useEffect } from "react";
import { getReports } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Report {
  category: { name: string };
  totalSpent: number;
  budget: number | null;
  remaining: number | null;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    //
    const load = async () => {
      try {
        const data = await getReports(month, year);
        setReports(data.reports);
      } catch (error: unknown) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [month, year, router]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const data = await getReports(month, year);
      setReports(data.reports);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold">Reports</h1>
          <Link
            href="/dashboard"
            className="text-sm text-blue-500 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="border p-3 rounded-lg"
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-500">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="border p-3 rounded-lg w-28"
              />
            </div>
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              View Report
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-500 text-sm">Total Spent</p>
            <p className="text-3xl font-bold text-red-500 mt-1">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-500 text-sm">Total Budget</p>
            <p className="text-3xl font-bold text-green-500 mt-1">
              ${totalBudget.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Report by category */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">
            {months[month - 1]} {year}
          </h2>
          {reports.length === 0 ? (
            <p className="text-gray-400 text-sm">No data for this period.</p>
          ) : (
            <ul className="flex flex-col gap-6">
              {reports.map((report, i) => (
                <li key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-base">
                      {report.category.name}
                    </span>
                    <span className="text-gray-500">
                      ${report.totalSpent.toFixed(2)}
                      {report.budget
                        ? ` / $${report.budget.toFixed(2)}`
                        : " (no budget)"}
                    </span>
                  </div>
                  {report.budget && (
                    <>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            report.totalSpent > report.budget
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min((report.totalSpent / report.budget) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {report.remaining! >= 0
                          ? `$${report.remaining!.toFixed(2)} remaining`
                          : `$${Math.abs(report.remaining!).toFixed(2)} over budget`}
                      </p>
                    </>
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
