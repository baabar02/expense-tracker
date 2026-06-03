import prisma from "../prisma";
import { getUser } from "../utils/getUser";

export const expenseResolvers = {
  Query: {
    expenses: async (
      _: any,
      { categoryId, startDate, endDate }: any,
      { token }: { token: string },
    ) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      return prisma.expense.findMany({
        where: {
          userId,
          ...(categoryId && { categoryId }),
          ...(startDate || endDate
            ? {
                date: {
                  ...(startDate && { gte: new Date(startDate) }),
                  ...(endDate && { lte: new Date(endDate) }),
                },
              }
            : {}),
        },
        include: { category: true, user: true },
        orderBy: { date: "desc" },
      });
    },
  },

  Mutation: {
    createExpense: async (
      _: any,
      { amount, categoryId, note, date }: any,
      { token }: { token: string },
    ) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      return prisma.expense.create({
        data: {
          amount,
          categoryId,
          note,
          date: date ? new Date(date) : new Date(),
          userId,
        },
        include: { category: true, user: true },
      });
    },

    updateExpense: async (
      _: any,
      { id, amount, categoryId, note }: any,
      { token }: { token: string },
    ) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      return prisma.expense.update({
        where: { id, userId },
        data: {
          ...(amount !== undefined && { amount }),
          ...(categoryId !== undefined && { categoryId }),
          ...(note !== undefined && { note }),
        },
        include: { category: true, user: true },
      });
    },

    deleteExpense: async (
      _: any,
      { id }: { id: string },
      { token }: { token: string },
    ) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      await prisma.expense.delete({ where: { id, userId } });
      return "Expense deleted";
    },
  },
};
