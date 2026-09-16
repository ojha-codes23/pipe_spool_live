
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Spool = lazy(() => import("./pages/Spool"));
const DrawingSpool = lazy(() => import("./pages/DrawingSpool"));

const PageLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <div className="spinner-border" role="status" style={{ color: "#2563eb", width: "40px", height: "40px" }}>
      <span className="visually-hidden">Loading page...</span>
    </div>
  </div>
);

const Approuter = () => {
  return (
    <div>
      <Router>
        <AppLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/spool" element={<Spool />} />
              <Route path="/drawing-spool" element={<DrawingSpool />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </Router>
    </div>
  );
};

export default Approuter;