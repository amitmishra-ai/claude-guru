import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
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
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppThemeProvider>
      </EmotionCacheProvider>
    </Provider>
  </React.StrictMode>,
);
