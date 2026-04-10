
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Login'
import Dashboard from "./pages/Dashboard";
import Spool from "./pages/Spool";
import DrawingSpool from "./pages/DrawingSpool";
import AppLayout from "./components/AppLayout";

const Approuter = () => {
  return (
    <div>
      <Router>
        <AppLayout>
        <Routes>
          <Route>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/spool" element={<Spool />} />
            <Route path="/drawing-spool" element={<DrawingSpool />} />
          </Route>
        </Routes>
        </AppLayout>
      </Router>
    </div>
  )
}

export default Approuter