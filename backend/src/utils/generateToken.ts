import jwt from "jsonwebtoken";

export const generateToken = (userId: string, userRole: string) => {
  return jwt.sign(
    { id: userId, role: userRole },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );
};
