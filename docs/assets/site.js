(function () {
  var root = document.documentElement;
  var button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  function current() {
    var set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function label() {
    var mode = current();
    var next = mode === "dark" ? "light" : "dark";
    button.textContent = next === "dark" ? "Dark theme" : "Light theme";
    button.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
  }

  button.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("opms-theme", next);
    } catch (e) {}
    label();
  });

  label();
})();
