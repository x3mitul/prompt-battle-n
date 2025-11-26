import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { SocketProvider } from "./contexts/SocketProvider";
import { initMonitoring } from "./lib/monitoring";
import { initWebVitals, trackPageLoad } from "./lib/analytics";
import "./index.css";

// Initialize monitoring and analytics
initMonitoring();
initWebVitals({ debug: import.meta.env.DEV });

// Track page load performance
window.addEventListener('load', trackPageLoad);

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <App />
  </SocketProvider>
);
