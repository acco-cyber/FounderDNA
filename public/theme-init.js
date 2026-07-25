(() => {
  try {
    const saved = localStorage.getItem("founder-dna-theme-v1");
    const darkSystem = matchMedia("(prefers-color-scheme: dark)").matches;
    const theme =
      saved === "dark" || saved === "light"
        ? saved
        : darkSystem
          ? "dark"
          : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
