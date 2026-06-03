import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { getUser } from "../utils/getUser";

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, { token }: { token: string }) => {
      //console.log("token received:", token);
      const userId = getUser(token);
      //console.log("userId:", userId);
      if (!userId) throw new Error("Not authenticated");
      return prisma.user.findUnique({ where: { id: userId } });
    },
  },

  Mutation: {
    register: async (
      _: any,
      {
        email,
        password,
        name,
      }: { email: string; password: string; name: string },
    ) => {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error("Email already in use");

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashed, name },
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });
      return { token, user };
    },

    login: async (
      _: any,
      { email, password }: { email: string; password: string },
    ) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid credentials");

      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new Error("Invalid credentials");

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });
      return { token, user };
    },
  },
};
