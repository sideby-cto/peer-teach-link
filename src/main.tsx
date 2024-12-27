import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/lib/supabase";
import App from "./App";
import "./index.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Get the base URL from the current hostname and environment
const getBaseUrl = () => {
  if (import.meta.env.MODE === 'production' && window.location.hostname === "sideby-cto.github.io") {
    return "/peer-teach-link";
  }
  return "";
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider 
        supabaseClient={supabase}
        initialSession={null}
      >
        <BrowserRouter basename={getBaseUrl()}>
          <App />
        </BrowserRouter>
      </SessionContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);