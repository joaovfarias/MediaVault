export function getAuthToken(): string {
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return directToken;
  }
  throw new Error("No authentication token found");
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}
