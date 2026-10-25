import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./app/App";
createRoot(document.getElementById("root")).render(<App />);

// A successful start clears the one-time reload flag used when a new version is released.
setTimeout(()=>{try{sessionStorage.removeItem("kk-chunk-reload")}catch{}},10000);
