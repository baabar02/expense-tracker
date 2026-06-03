import axios from "axios";

const API = axios.create({
  baseURL: "https://expense-tracker-em5s.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const graphql = async (query: string, variables?: Record<string, unknown>) => {
  const res = await API.post("/graphql", { query, variables });
  if (res.data.errors) {
    throw new Error(res.data.errors[0].message);
  }
  return res.data.data;
};

// auth
export const register = (name: string, email: string, password: string) =>
  graphql(`
    mutation {
      register(name: "${name}", email: "${email}", password: "${password}") {
        token
        user { id email name }
      }
    }
  `);

export const login = (email: string, password: string) =>
  graphql(`
    mutation {
      login(email: "${email}", password: "${password}") {
        token
        user { id email name }
      }
    }
  `);

export const getMe = () =>
  graphql(`
    query {
      me {
        id
        email
        name
      }
    }
  `);

// categories
export const getCategories = () =>
  graphql(`
    query {
      categories {
        id
        name
      }
    }
  `);

export const createCategory = (name: string) =>
  graphql(`
    mutation {
      createCategory(name: "${name}") { id name }
    }
  `);

// expenses
export const getExpenses = (
  categoryId?: string,
  startDate?: string,
  endDate?: string,
) => {
  const args: string[] = [];
  if (categoryId) args.push(`categoryId: "${categoryId}"`);
  if (startDate) args.push(`startDate: "${startDate}"`);
  if (endDate) args.push(`endDate: "${endDate}"`);

  const argsStr = args.length > 0 ? `(${args.join(", ")})` : "";

  return graphql(`
    query {
      expenses${argsStr} {
        id amount note date
        category { id name }
      }
    }
  `);
};

export const createExpense = (
  amount: number,
  categoryId: string,
  note?: string,
  date?: string,
) =>
  graphql(`
    mutation {
      createExpense(
        amount: ${amount}
        categoryId: "${categoryId}"
        ${note ? `note: "${note}"` : ""}
        ${date ? `date: "${date}"` : ""}
      ) {
        id amount note date
        category { id name }
      }
    }
  `);

export const deleteExpense = (id: string) =>
  graphql(`
    mutation {
      deleteExpense(id: "${id}")
    }
  `);

// budgets
export const getBudgets = () =>
  graphql(`
    query {
      budgets {
        id
        amount
        month
        year
        category {
          id
          name
        }
      }
    }
  `);

export const createBudget = (
  amount: number,
  categoryId: string,
  month: number,
  year: number,
) =>
  graphql(`
    mutation {
      createBudget(
        amount: ${amount}
        categoryId: "${categoryId}"
        month: ${month}
        year: ${year}
      ) {
        id amount month year
        category { id name }
      }
    }
  `);

export const deleteBudget = (id: string) =>
  graphql(`
    mutation {
      deleteBudget(id: "${id}")
    }
  `);

// reports
export const getReports = (month: number, year: number) =>
  graphql(`
    query {
      reports(month: ${month}, year: ${year}) {
        category { name }
        totalSpent
        budget
        remaining
      }
    }
  `);
