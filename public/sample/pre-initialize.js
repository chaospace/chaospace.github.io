let d = document.documentElement;
let t = `(prefers-color-scheme: dark)`;
// let m = window.matchMedia(t);
let savedTheme = localStorage.getItem("theme");
console.log(d, window, savedTheme);
//저장값이 있으면
if (savedTheme) {
  d.dataset.theme = savedTheme;
} else {
  d.dataset.theme = m.matches === "dark" ? "light" : "dark";
}

// let themeInfo = localStorage.getItem("themeStore");
// if (themeInfo) {
//   const { theme } = JSON.parse(themeInfo).state;
//   console.log("pre---", theme);
//   console.log("pre---", document.documentElement.dataset);
//   document.documentElement.dataset.theme = theme;
//   if (theme === "dark") {
//     document.documentElement.classList.add(theme);
//   } else {
//     document.documentElement.classList.remove("dark");
//   }
// }
