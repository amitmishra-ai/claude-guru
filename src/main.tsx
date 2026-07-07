import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { EmotionCacheProvider } from "@/theme/EmotionCacheProvider";
import { AppThemeProvider } from "@/theme/theme";
import { store } from "@/store";
import App from "@/App";
import "@/index.css";

// Use HashRouter for Capacitor (file:// protocol) and for static hosts with no
// SPA rewrite (e.g. GitHub Pages, opted in via VITE_ROUTER=hash at build time);
// BrowserRouter for web/PWA where the server can serve index.html for any path.
const isCapacitor = window.location.protocol === "file:" ||
  window.location.href.includes("localhost") === false &&
  window.location.protocol === "https:" &&
  "Capacitor" in window;
const useHashRouter = isCapacitor || import.meta.env.VITE_ROUTER === "hash";
const Router = useHashRouter ? HashRouter : BrowserRouter;

// Register service worker for PWA support. Resolve relative to the app base so
// it also works when hosted under a subpath (e.g. /claude-guru/ on GitHub Pages).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
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
