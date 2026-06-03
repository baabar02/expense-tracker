import { authResolvers } from "./auth";
import { categoryResolvers } from "./category";
import { expenseResolvers } from "./expense";
import { budgetResolvers } from "./budget";
import { reportResolvers } from "./report";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...categoryResolvers.Query,
    ...expenseResolvers.Query,
    ...budgetResolvers.Query,
    ...reportResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...expenseResolvers.Mutation,
    ...budgetResolvers.Mutation,
  },
  Expense: {
    date: (parent: any) => new Date(parent.date).toISOString(),
  },
};
