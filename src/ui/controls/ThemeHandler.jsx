import { useEffect } from "react";

import storage from "../../storage/localStorage";

const ThemeHandler = ({ children }) => {
  useEffect(() => {
    const savedTheme = storage.get("theme");
    const theme = savedTheme || "default";
    if (!savedTheme) {
      storage.set("theme", theme);
    }
    document.documentElement.dataset.theme = theme;
  }, []);

  return <>{children}</>;
};

export default ThemeHandler;
