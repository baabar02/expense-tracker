"use client";
import { useState, useEffect } from "react";
import {
  getExpenses,
  getCategories,
  createExpense,
  deleteExpense,
} from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Expense {
  id: string;
  amount: number;
  note: string;
  date: string;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [expensesData, categoriesData] = await Promise.all([
          getExpenses(),
          getCategories(),
        ]);
        setExpenses(expensesData.expenses);
        setCategories(categoriesData.categories);
        if (categoriesData.categories.length > 0) {
          setCategoryId(categoriesData.categories[0].id);
        }
      } catch (error: unknown) {
        console.log("error:", error); 
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
      const data = await createExpense(
        parseFloat(amount),
        categoryId,
        note,
        date || undefined,
      );
      setExpenses([data.createExpense, ...expenses]);
      setAmount("");
      setNote("");
      setDate("");
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong");
    }
  };

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
          <h1 className="text-3xl font-bold">Expenses</h1>
          <Link
            href="/dashboard"
            className="text-sm text-blue-500 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Add expense form */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-4">Add Expense</h2>
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
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border p-3 rounded-lg"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-3 rounded-lg"
            />
            <button
              type="submit"
              className="col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Add Expense
            </button>
          </form>
        </div>

        {/* Expense list */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">All Expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-gray-400 text-sm">No expenses yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      ${expense.amount.toFixed(2)} — {expense.category.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {expense.note && `${expense.note} · `}
                      {new Date(parseInt(expense.date)).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(expense.id)}
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
