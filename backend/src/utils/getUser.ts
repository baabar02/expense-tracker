import jwt from "jsonwebtoken";

export const getUser = (token: string) => {
  try {
    const cleaned = token.replace("Bearer ", "").replace(/"/g, ""); // remove any extra quotes
    const decoded = jwt.verify(cleaned, process.env.JWT_SECRET!) as {
      userId: string;
    };
    //console.log(decoded.userId,"userId");

    return decoded.userId;
  } catch {
    return null;
  }
};
