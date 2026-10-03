import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("DeepTrust root element is missing");
}

createRoot(root).render(<App />);
