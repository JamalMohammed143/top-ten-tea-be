import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

// Generate Token
const generateToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: (process.env.JWT_EXPIRE || "1d") as any,
    } as jwt.SignOptions,
  );
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide an email and password", 400));
    }

    // Role is NOT accepted from frontend, pulled from database
    const user = await User.findOne({ email }).select("+password");

    console.log(user, "user");

    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
