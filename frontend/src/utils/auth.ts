export function getAuthToken(): string | null {
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return directToken;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}
