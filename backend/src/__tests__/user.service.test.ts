import { getUser } from "../services/user.service";
import { getAllUsersWithStorage } from "../services/admin.service";
import { AppError } from "../services/appError";

// Mock User model
jest.mock("../models/User", () => {
  const selectMock = jest.fn();
  const sortMock = jest.fn();

  return {
    __esModule: true,
    default: {
      findById: jest.fn().mockReturnValue({ select: selectMock }),
      find: jest.fn().mockReturnValue({ select: selectMock }),
      _selectMock: selectMock,
      _sortMock: sortMock,
    },
  };
});

// Mock File model (imported by user.service)
jest.mock("../models/File", () => ({
  __esModule: true,
  default: {},
}));

const User = require("../models/User").default;
const selectMock = require("../models/User").default._selectMock;
const sortMock = require("../models/User").default._sortMock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getUser", () => {
  it("should return user when found", async () => {
    const mockUser = {
      _id: "user123",
      username: "testuser",
      email: "test@example.com",
      storageUsed: 1024,
    };
    selectMock.mockResolvedValue(mockUser);

    const result = await getUser("user123");

    expect(result).toEqual(mockUser);
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(selectMock).toHaveBeenCalledWith("-password");
  });

  it("should throw AppError when user not found", async () => {
    selectMock.mockResolvedValue(null);

    await expect(getUser("nonexistent")).rejects.toThrow(AppError);
    await expect(getUser("nonexistent")).rejects.toThrow(
      "Usuário não encontrado",
    );
  });
});

describe("getAllUsersWithStorage", () => {
  it("should return all users sorted by createdAt", async () => {
    const mockUsers = [
      {
        _id: "u1",
        username: "alice",
        email: "a@b.com",
        storageUsed: 500,
        role: "admin",
      },
      {
        _id: "u2",
        username: "bob",
        email: "b@b.com",
        storageUsed: 200,
        role: "user",
      },
    ];

    sortMock.mockResolvedValue(mockUsers);
    selectMock.mockReturnValue({ sort: sortMock });

    const result = await getAllUsersWithStorage();

    expect(result).toEqual(mockUsers);
    expect(User.find).toHaveBeenCalled();
    expect(selectMock).toHaveBeenCalledWith(
      "username email storageUsed role createdAt",
    );
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
  });
});
