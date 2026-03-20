import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { AppError } from "./appError";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

export const registerUser = async ({
  username,
  email,
  password,
}: RegisterInput): Promise<AuthResponse> => {
  if (!username || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  const userExists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    throw new AppError("User with that email or username already exists", 400);
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  const token = generateToken(user._id.toString(), user.role);

  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    token,
  };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user._id.toString(), user.role);

  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    token,
  };
};

export const guestLoginUser = async () => {
  const guestId = crypto.randomUUID().slice(0, 6);
  const randomPassword = crypto
    .getRandomValues(new Uint32Array(1))[0]
    .toString(36)
    .slice(-6);

  const guestUser = await User.create({
    username: `guest_${guestId}`,
    email: `guest_${guestId}@example.com`,
    password: randomPassword,
    isGuest: true,
    role: "user",
  });

  const token = generateToken(guestUser._id.toString(), guestUser.role);

  return {
    _id: guestUser._id.toString(),
    username: guestUser.username,
    email: guestUser.email,
    role: guestUser.role,
    isGuest: guestUser.isGuest,
    token,
  };
};
