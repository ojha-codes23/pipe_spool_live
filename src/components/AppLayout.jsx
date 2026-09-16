import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getSafeStorageItem } from "../utils/safeStorage";

function AppLayout({ children }) {
  const location = useLocation();

  const selectedEntity = useSelector((state) => state.entity.selected);

  const [them, setThem] = useState('')
  useEffect(() => {
    const storedEntity = getSafeStorageItem('selectedEntity');
    const themColor = selectedEntity?.entity_secondary_color || storedEntity?.entity_secondary_color || storedEntity;
    setThem(typeof themColor === 'string' ? themColor : '');
  }, [selectedEntity]);

  const background = them ? `linear-gradient(135deg, ${them}, #fff)` : "";
  const hidebackGround = ['/'].includes(location.pathname);

  return (
    <div className="page-wrapper" style={{ background: hidebackGround ? "" : background }}>
      {children}
    </div>
  );
}

export default AppLayout;