import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

// Get the base URL from the current hostname and environment
const getBaseUrl = () => {
  if (import.meta.env.MODE === 'production' && window.location.hostname === "sideby-cto.github.io") {
    return "/peer-teach-link";
  }
  return "";
};

// Initialize the Supabase client
const supabaseUrl = 'https://avphywyhlxajyhqudkts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cGh5d3lobHhhanlocXVka3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTM1MDEsImV4cCI6MjA1MDQ2OTUwMX0.wwNFD49QaoTOc36E37MRpBtwptSYi5zrKmUSqPSLt04';
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabaseClient}>
      <BrowserRouter basename={getBaseUrl()}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </SessionContextProvider>
  </React.StrictMode>
);