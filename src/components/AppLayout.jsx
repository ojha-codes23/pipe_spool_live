import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

function AppLayout({ children }) {
  const location = useLocation();

  const selectedEntity = useSelector((state) => state.entity.selected);

  const [them, setThem] = useState('')
  useEffect(() => {
    const themColor = selectedEntity?.entity_secondary_color || JSON.parse(localStorage.getItem('selectedEntity'));
    setThem(themColor)
  }, [selectedEntity]);

  const background = `linear-gradient(135deg, ${them}, #fff)`
  const hidebackGround = ['/'].includes(location.pathname)

  return (
    <div className="page-wrapper" style={{ background: hidebackGround ? "" : background }}>
      {children}
    </div>
  );
}

export default AppLayout;