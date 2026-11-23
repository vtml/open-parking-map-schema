import { render } from "preact";
import { App } from "./app";
import "./styles.css";

const stored = localStorage.getItem("opms-theme");
if (stored === "light" || stored === "dark") document.documentElement.setAttribute("data-theme", stored);

render(<App />, document.getElementById("app") as HTMLElement);
