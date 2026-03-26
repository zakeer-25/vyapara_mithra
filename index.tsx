import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css";

// ✅ ADD THIS
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* ✅ WRAP APP */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);