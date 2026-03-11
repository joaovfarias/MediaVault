import { registerUser, loginUser } from "../services/auth.service";
import { AppError } from "../services/appError";

// Mock dependencies
jest.mock("../models/User", () => {
  const mockUser = {
    _id: "user123",
    username: "testuser",
    email: "test@example.com",
    role: "user",
    comparePassword: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    _mockUser: mockUser,
  };
});

jest.mock("../utils/generateToken", () => ({
  generateToken: jest.fn().mockReturnValue("mock-jwt-token"),
}));

const User = require("../models/User").default;
const mockUser = require("../models/User")._mockUser;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("registerUser", () => {
  it("should throw if fields are missing", async () => {
    await expect(
      registerUser({ username: "", email: "a@b.com", password: "123" }),
    ).rejects.toThrow(AppError);

    await expect(
      registerUser({ username: "user", email: "", password: "123" }),
    ).rejects.toThrow("All fields are required");

    await expect(
      registerUser({ username: "user", email: "a@b.com", password: "" }),
    ).rejects.toThrow(AppError);
  });

  it("should throw if user already exists", async () => {
    User.findOne.mockResolvedValue({ email: "test@example.com" });

    await expect(
      registerUser({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("User with that email or username already exists");
  });

  it("should create user and return token on success", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser);

    const result = await registerUser({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      _id: "user123",
      username: "testuser",
      email: "test@example.com",
      role: "user",
      token: "mock-jwt-token",
    });
    expect(User.create).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });
  });
});

describe("loginUser", () => {
  it("should throw if email or password is missing", async () => {
    await expect(loginUser({ email: "", password: "123" })).rejects.toThrow(
      "Email and password are required",
    );

    await expect(loginUser({ email: "a@b.com", password: "" })).rejects.toThrow(
      AppError,
    );
  });

  it("should throw if user not found", async () => {
    User.findOne.mockResolvedValue(null);

    await expect(
      loginUser({ email: "no@user.com", password: "pass" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw if password is wrong", async () => {
    mockUser.comparePassword.mockResolvedValue(false);
    User.findOne.mockResolvedValue(mockUser);

    await expect(
      loginUser({ email: "test@example.com", password: "wrong" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("should return user data and token on success", async () => {
    mockUser.comparePassword.mockResolvedValue(true);
    User.findOne.mockResolvedValue(mockUser);

    const result = await loginUser({
      email: "test@example.com",
      password: "correct",
    });

    expect(result).toEqual({
      _id: "user123",
      username: "testuser",
      email: "test@example.com",
      role: "user",
      token: "mock-jwt-token",
    });
  });
});
