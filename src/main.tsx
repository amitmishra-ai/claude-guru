import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { EmotionCacheProvider } from "@/theme/EmotionCacheProvider";
import { AppThemeProvider } from "@/theme/theme";
import { store } from "@/store";
import App from "@/App";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <EmotionCacheProvider>
        <AppThemeProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </AppThemeProvider>
      </EmotionCacheProvider>
    </Provider>
  </React.StrictMode>,
);
