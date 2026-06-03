import prisma from "../prisma";
import { getUser } from "../utils/getUser";

export const budgetResolvers = {
  Query: {
    budgets: async (_: any, __: any, { token }: { token: string }) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      return prisma.budget.findMany({
        where: { userId },
        include: { category: true },
      });
    },
  },

  Mutation: {
    createBudget: async (
      _: any,
      { amount, categoryId, month, year }: any,
      { token }: { token: string },
    ) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      return prisma.budget.create({
        data: { amount, categoryId, month, year, userId },
        include: { category: true },
      });
    },

    updateBudget: async (
      _: any,
      { id, amount }: any,
      { token }: { token: string },
    ) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      return prisma.budget.update({
        where: { id },
        data: { amount },
        include: { category: true },
      });
    },

    deleteBudget: async (
      _: any,
      { id }: { id: string },
      { token }: { token: string },
    ) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      await prisma.budget.delete({ where: { id, userId } });
      return "Budget deleted";
    },
  },
};
