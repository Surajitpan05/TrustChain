import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useRef, useState, useCallback } from "react";

import { S } from "./styles/index.js";
import { useGlobalStyles } from "./hooks/useGlobalStyles.js";
import { useThreeScene } from "./hooks/useThreeScene.js";

import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import TxFeed from "./components/TxFeed.jsx";
import ChainStatusBadge from "./components/ChainStatusBadge.jsx";

import Admin from "./components/Admin";
import ProductDashboard from "./components/ProductDashboard";

/* =========================
   LAYOUT COMPONENT
========================= */
function Layout({ canvasRef, txFeed }) {
  const location = useLocation();

  // Hide Navbar only for product dashboard
  const hideNavbar = location.pathname.startsWith("/product");

  return (
    <div style={S.root}>
      {/* Background Canvas */}
      <canvas ref={canvasRef} style={S.canvas} />

      {/* Navbar */}
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <>
              {/* 🔥 IMPORTANT WRAPPER */}
              <div style={S.page}>
                <Hero />
                <TxFeed txFeed={txFeed} />
              </div>

              {/* Badge stays fixed */}
              <ChainStatusBadge />
            </>
          }
        />

        {/* Admin Page */}
        <Route path="/admin" element={<Admin />} />

        {/* Product Dashboard */}
        <Route path="/product/:id" element={<ProductDashboard />} />
      </Routes>
    </div>
  );
}

/* =========================
   MAIN APP
========================= */
export default function App() {
  const canvasRef = useRef(null);
  const [txFeed, setTxFeed] = useState([]);

  useGlobalStyles();

  const handleTxEvent = useCallback((msg) => {
    setTxFeed((prev) => [
      { msg, id: Date.now() },
      ...prev,
    ].slice(0, 6));
  }, []);

  useThreeScene(canvasRef, handleTxEvent);

  return (
    <BrowserRouter>
      <Layout canvasRef={canvasRef} txFeed={txFeed} />
    </BrowserRouter>
  );
}