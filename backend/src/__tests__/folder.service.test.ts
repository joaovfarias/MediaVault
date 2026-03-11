import { createFolder, renameFolder } from "../services/folder.service";
import { AppError } from "../services/appError";

jest.mock("../models/Folder", () => {
  const saveMock = jest.fn();
  function MockFolder(data: Record<string, unknown>) {
    return { ...data, save: saveMock, _saveMock: saveMock };
  }
  MockFolder.find = jest.fn();
  MockFolder.findOne = jest.fn();
  MockFolder.findByIdAndUpdate = jest.fn();
  MockFolder.deleteMany = jest.fn();
  MockFolder._saveMock = saveMock;
  return { __esModule: true, default: MockFolder };
});

jest.mock("../models/File", () => ({
  __esModule: true,
  default: { find: jest.fn(), countDocuments: jest.fn() },
}));

jest.mock("../services/file.service", () => ({
  deleteFileForUser: jest.fn(),
  enrichFilesWithThumbnails: jest.fn((files: unknown[]) => files),
}));

const Folder = require("../models/Folder").default;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createFolder", () => {
  it("should throw if name is empty", async () => {
    await expect(createFolder("user1", "")).rejects.toThrow(AppError);
    await expect(createFolder("user1", "")).rejects.toThrow(
      "O nome da pasta é obrigatório",
    );
  });

  it("should create and save a folder", async () => {
    Folder._saveMock.mockResolvedValue(undefined);

    const result = await createFolder("user1", "My Folder");

    expect(result.owner).toBe("user1");
    expect(result.name).toBe("My Folder");
    expect(result.save).toHaveBeenCalled();
  });

  it("should set parentFolderId when provided", async () => {
    Folder._saveMock.mockResolvedValue(undefined);

    const result = await createFolder("user1", "Sub Folder", "parent123");

    expect(result.parentFolderId).toBe("parent123");
  });
});

describe("renameFolder", () => {
  it("should throw if newName is empty", async () => {
    await expect(
      renameFolder({ folderId: "f1", newName: "", ownerId: "u1" }),
    ).rejects.toThrow("O novo nome da pasta é obrigatório");
  });

  it("should throw if folder not found", async () => {
    Folder.findOne.mockResolvedValue(null);

    await expect(
      renameFolder({ folderId: "f1", newName: "New", ownerId: "u1" }),
    ).rejects.toThrow("Pasta não encontrada ou acesso negado");
  });

  it("should rename folder successfully", async () => {
    Folder.findOne.mockResolvedValue({ _id: "f1", name: "Old" });
    Folder.findByIdAndUpdate.mockResolvedValue({
      _id: "f1",
      name: "Renamed",
    });

    const result = await renameFolder({
      folderId: "f1",
      newName: "Renamed",
      ownerId: "u1",
    });

    expect(result.name).toBe("Renamed");
    expect(Folder.findByIdAndUpdate).toHaveBeenCalledWith(
      "f1",
      { name: "Renamed" },
      { new: true },
    );
  });
});
