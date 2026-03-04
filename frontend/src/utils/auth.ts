export function getAuthToken(): string | null {
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return directToken;
  }

  const userRaw = localStorage.getItem("user");
  if (!userRaw) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(userRaw) as { token?: string };
    return parsedUser.token ?? null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}
