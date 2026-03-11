import { AppError } from "../services/appError";

describe("AppError", () => {
  it("should set message and statusCode", () => {
    const error = new AppError("Not found", 404);

    expect(error.message).toBe("Not found");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("AppError");
  });

  it("should be an instance of Error", () => {
    const error = new AppError("Bad request", 400);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});
