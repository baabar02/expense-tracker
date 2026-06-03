import prisma from "../prisma";
import { getUser } from "../utils/getUser";

export const reportResolvers = {
  Query: {
    reports: async (
      _: any,
      { month, year }: { month: number; year: number },
      { token }: { token: string },
    ) => {
      const userId = getUser(token);
      if (!userId) throw new Error("Not authenticated");

      const categories = await prisma.category.findMany();

      const reports = await Promise.all(
        categories.map(async (category) => {
          const expenses = await prisma.expense.findMany({
            where: {
              userId,
              categoryId: category.id,
              date: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          });

          const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

          const budget = await prisma.budget.findFirst({
            where: { userId, categoryId: category.id, month, year },
          });

          return {
            category,
            totalSpent,
            budget: budget?.amount ?? null,
            remaining: budget ? budget.amount - totalSpent : null,
          };
        }),
      );

      return reports.filter((r) => r.totalSpent > 0 || r.budget !== null);
    },
  },
};
