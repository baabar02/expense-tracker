"use client";
import { useState, useEffect } from "react";
import {
  getBudgets,
  getCategories,
  createBudget,
  deleteBudget,
} from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [budgetsData, categoriesData] = await Promise.all([
          getBudgets(),
          getCategories(),
        ]);
        setBudgets(budgetsData.budgets);
        setCategories(categoriesData.categories);
        if (categoriesData.categories.length > 0) {
          setCategoryId(categoriesData.categories[0].id);
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    setError("");
    try {
      const data = await createBudget(
        parseFloat(amount),
        categoryId,
        month,
        year,
      );
      setBudgets([...budgets, data.createBudget]);
      setAmount("");
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      setBudgets(budgets.filter((b) => b.id !== id));
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong");
    }
  };

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
          <h1 className="text-3xl font-bold">Budgets</h1>
          <Link
            href="/dashboard"
            className="text-sm text-blue-500 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Add budget form */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-4">Add Budget</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-3 rounded-lg"
              required
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border p-3 rounded-lg"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border p-3 rounded-lg"
            />
            <button
              type="submit"
              className="col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Add Budget
            </button>
          </form>
        </div>

        {/* Budget list */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">All Budgets</h2>
          {budgets.length === 0 ? (
            <p className="text-gray-400 text-sm">No budgets yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {budgets.map((budget) => (
                <li
                  key={budget.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {budget.category.name} — ${budget.amount.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {months[budget.month - 1]} {budget.year}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
