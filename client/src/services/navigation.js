let appNavigator = null;

export const setAppNavigator = (navigate) => {
  appNavigator = navigate;
};

export const clearAppNavigator = () => {
  appNavigator = null;
};

export const navigateToLogin = () => {
  if (appNavigator) {
    appNavigator("/login", { replace: true });
    return;
  }

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};
