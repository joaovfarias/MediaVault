import { requireAdmin } from "../middleware/admin.middleware";
import { Request, Response, NextFunction } from "express";

describe("requireAdmin middleware", () => {
  let mockReq: Record<string, unknown>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = { status: statusMock } as Partial<Response>;
    mockNext = jest.fn();
  });

  it("should return 403 if no user on request", () => {
    mockReq = {};

    requireAdmin(mockReq as unknown as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Admin access required" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not admin", () => {
    mockReq = { user: { role: "user" } };

    requireAdmin(mockReq as unknown as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next if user is admin", () => {
    mockReq = { user: { role: "admin" } };

    requireAdmin(mockReq as unknown as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });
});
