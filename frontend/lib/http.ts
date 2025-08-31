// lib/http.ts

function showToast(message: string) {
  console.warn("TOAST:", message);
}

function logoutUser() {
  console.log("Logging out user due to failed refresh");
  // Redirect user to login page or clear auth state
  // window.location.href = "/login";
}

export async function http(input: RequestInfo, init?: RequestInit): Promise<Response> {
  async function makeRequest(retry = false): Promise<Response> {
    const response = await fetch(input, {
      ...init,
      credentials: "include",
    });

    if (response.status !== 401) {
      // If request is not unauthorized, just return response
      return response;
    }

    // If 401 and already retried once, logout user
    if (retry) {
      showToast("Session expired. Please log in again.");
      logoutUser();
      return response;
    }

    // Try to refresh token
    const refreshRes = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Your backend extracts refresh token from cookie
    });

    if (refreshRes.ok) {
      // Refresh succeeded - retry original request once
      return makeRequest(true);
    } else {
      // Refresh failed - logout user
      const errorData = await refreshRes.json().catch(() => ({}));
      if (errorData.detail === "Token is expired" || errorData.detail === "Token is invalid") {
        showToast("Session expired. Please log in again.");
      } else {
        showToast("Authentication error. Please log in again.");
      }
      logoutUser();
      return response;
    }
  }

  return makeRequest(false);
}
