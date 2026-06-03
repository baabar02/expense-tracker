import prisma from "../prisma";

export const categoryResolvers = {
  Query: {
    categories: async () => {
      return prisma.category.findMany();
    },
  },

  Mutation: {
    createCategory: async (_: any, { name }: { name: string }) => {
      return prisma.category.create({ data: { name } });
    },
    deleteCategory: async (_: any, { id }: { id: string }) => {
      await prisma.category.delete({ where: { id } });
      return "Category deleted";
    },
  },
};
