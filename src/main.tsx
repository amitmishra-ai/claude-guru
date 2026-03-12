import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { EmotionCacheProvider } from "@/theme/EmotionCacheProvider";
import { AppThemeProvider } from "@/theme/theme";
import { store } from "@/store";
import App from "@/App";
import "@/index.css";

// Use HashRouter for Capacitor (file:// protocol), BrowserRouter for web/PWA
const isCapacitor = window.location.protocol === "file:" ||
  window.location.href.includes("localhost") === false &&
  window.location.protocol === "https:" &&
  "Capacitor" in window;
const Router = isCapacitor ? HashRouter : BrowserRouter;

// Register service worker for PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <EmotionCacheProvider>
        <AppThemeProvider>
          <Router>
            <App />
          </Router>
        </AppThemeProvider>
      </EmotionCacheProvider>
    </Provider>
  </React.StrictMode>,
);
