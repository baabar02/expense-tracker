export const typeDefs = `#graphql

  type User {
    id: String!
    email: String!
    name: String!
    createdAt: String!
  }

  type Category {
    id: String!
    name: String!
  }

type Expense {
    id: String!
    amount: Float!
    note: String
    date: String!
    categoryId: String!
    userId: String!
    category: Category!
    user: User!
  }

  type Budget {
    id: String!
    amount: Float!
    month: Int!
    year: Int!
    category: Category!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Report {
    category: Category!
    totalSpent: Float!
    budget: Float
    remaining: Float
  }



  type Query {
    me: User
    categories: [Category!]!
    expenses(categoryId: String, startDate: String, endDate: String): [Expense!]!
    budgets: [Budget!]!
    reports(month: Int!, year: Int!): [Report!]!
  }

  type Mutation {
    register(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createCategory(name: String!): Category!
    createExpense(amount: Float!, categoryId: String!, note: String, date: String): Expense!
    updateExpense(id: String!, amount: Float, categoryId: String, note: String): Expense!
    deleteExpense(id: String!): String!
    createBudget(amount: Float!, categoryId: String!, month: Int!, year: Int!): Budget!
    updateBudget(id: String!, amount: Float!): Budget!
    deleteBudget(id: String!): String!
    deleteCategory(id: String!): String!
  }
`;
