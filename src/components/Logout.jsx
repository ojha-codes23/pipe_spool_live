import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { resetEntityState, setEntity } from "../redux/slice/entitySlice";

const Logout = () => {
  const navigator = useNavigate()
  const dispatch = useDispatch()

  const selectedEntity = useSelector((state) => state.entity.selected);

  const [them, setThem] = useState('')
  const background = them;

  useEffect(() => {
    const themColor = selectedEntity?.entity_secondary_color || JSON.parse(localStorage.getItem('selectedEntity'));
    setThem(themColor)
  }, [selectedEntity]);
  


  const handleLogout = () => {
    Cookies.remove("pipeSpool");
    localStorage.removeItem('user')
    localStorage.removeItem("selectedEntity");

    dispatch(setEntity(null));
    toast.success("Logged out successfully");

    navigator('/');
    dispatch(resetEntityState())
  }

  return (

    <div className="modal fade other-popup" id="logout-popup" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
            <i className="hgi hgi-stroke hgi-cancel-01"></i>
          </button>
          <div className="modal-body">
            <div className="other-popup-in">
              <div className="other-popup-icon" style={{ background: background }}>
                <i className="hgi hgi-stroke hgi-logout-circle-02" style={{ color: background && "white" }}></i>
              </div>
              <div className="other-popup-data">
                <h1>Logout</h1>
                <p>Are you sure you want to logout?</p>
              </div>
              <div className="other-popup-cta-grp">
                <button type="button" className="primary-cta" data-bs-dismiss="modal" onClick={handleLogout}>Logout</button>
                <button type="button" className="primary-cta non-active" style={{ borderColor: background, color: background }} data-bs-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Logout);
