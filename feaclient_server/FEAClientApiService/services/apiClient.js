// services/apiClient.js

export async function apiClient(
  path,
  options = {}
) {

  const token =
    localStorage.getItem("jwt");

  const response =
    await fetch(path, {
      ...options,
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${token}`,
        ...(options.headers || {
          
// services/sessionService.js

import { apiClient }
  from "./apiClient";

export async function loadSession() {

            const user =
            await apiClient(
              "/auth/me"
            );

            const [
              projects,
              personalCanvases,
              sharedCanvases
            ] = await Promise.all([
              apiClient("/auth/projects"),
              apiClient("/api/canvases/personal"),
              apiClient("/api/canvases/shared")
            ]);

            return {
              user,
              projects,
              personalCanvases,
              sharedCanvases
            };
          
          }

        })
      }
    });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  return response.json();

}
