import User from "../models/User";

export const getAllUsersWithStorage = async () => {
  const users = await User.find()
    .select("username email storageUsed role createdAt")
    .sort({ createdAt: -1 });

  return users;
};
