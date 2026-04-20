import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllEntity,
  getNotification,
  readNotification,
  selectEntity,
  setEntity,
} from "../redux/slice/entitySlice";
import Logout from "./Logout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchSpoolsDrawing } from "../redux/slice/spoolSlice";
import { toast } from "react-hot-toast";


const imagebaseUrl = import.meta.env.VITE_IMAGE_URL;

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate()
  const pendingReadIdsRef = useRef(new Set());
  const debounceTimerRef = useRef(null);

  const selectedEntity = useSelector((state) => state.entity.selected);
  const notifications = useSelector((state) => state.entity.notifications);
  const selected = useSelector((state) => state.entity.selected);
  const Logo = useSelector((state) => state.entity.selectedLogo);
  const allEntity = useSelector((state) => state.entity.list);

  const hideHeader = ["/spool", "/drawing-spool"].includes(location.pathname);
  const hideLogout = ["/drawing-spool"].includes(location.pathname);

  const user = JSON.parse(localStorage.getItem("user"));
  const savedEntity = JSON.parse(localStorage.getItem("selectedEntity"));

  const [them, setThem] = useState("");
  const [showLogout, setShowLogoutModal] = useState(false);
  const [notification, setNotification] = useState([]);

  useEffect(() => {
    const themColor =
      selectedEntity?.entity_secondary_color ||
      JSON.parse(localStorage.getItem("selectedEntity"));
    setThem(themColor);
  }, [selectedEntity]);
  const background = them;

  const timeAgo = (createdAt) => {
    const now = new Date();
    const createdTime = new Date(createdAt);
    const diffInSeconds = Math.floor((now - createdTime) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const markAllAsRead = () => {
    setNotification((prev) => prev?.map((n) => ({ ...n, isUnread: false })));
  };

  useEffect(() => {
    if (notifications) {
      setNotification(notifications?.notifications);
    }
  }, [notifications]);

  useEffect(() => {
    dispatch(getNotification());
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) return;
    if (selected?.id && !hideHeader) {
      dispatch(selectEntity({ entity_id: selected?.id }));
    }
  }, [selected?.id]);

  const handleSelectEntity = (entity) => {
    if (!entity) return;

    if (!selected || selected.id !== entity.id) {
      dispatch(setEntity(entity));
      localStorage.setItem("selectedEntity", JSON.stringify(entity));
    }
  };

  useEffect(() => {
    dispatch(getAllEntity());
  }, [hideHeader, dispatch]);

  useEffect(() => {
    if (!allEntity || allEntity.length === 0) return;
    let entityToSelect;
    if (selected) {
      return;
    } else if (savedEntity) {
      entityToSelect =
        allEntity.find((e) => e.id === savedEntity.id) || allEntity[0];
    } else {
      entityToSelect = allEntity[0];
    }
    dispatch(setEntity(entityToSelect));
    if (!hideHeader) {
      console.log("Hello here selectEntity");
      dispatch(selectEntity({ entity_id: entityToSelect.id }));
    }
  }, [allEntity, selected, dispatch]);

  const flushReadNotifications = async () => {
    const ids = Array.from(pendingReadIdsRef.current);
    if (ids.length === 0) return;

    try {
      await dispatch(readNotification({ notification_id: ids }));
      await dispatch(getNotification());
      setNotification((prev) =>
        prev.map((item) =>
          ids.includes(String(item.id))
            ? { ...item, isUnread: false, is_read: 1 }
            : item,
        ),
      );
      pendingReadIdsRef.current.clear();
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.dataset.id;
          const isRead = entry.target.dataset.isRead === "1";
          if (isRead) return;
          if (!pendingReadIdsRef.current.has(id)) {
            pendingReadIdsRef.current.add(id);
          }
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            flushReadNotifications();
          }, 1000);
        });
      },
      {
        root: document.querySelector(".notification-container"),
        threshold: 0.6,
      },
    );

    const elements = document.querySelectorAll(".noti-in");
    elements.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [notification]);


  const handleSpoolClick = async (item, e) => {
    e.preventDefault();

    const spoolId = item?.spool_id;
    const stageId = item?.stage_id;

    if (!spoolId || !stageId) return;

    try {
      const response = await dispatch(
        fetchSpoolsDrawing({
          spool_id: spoolId,
          stage_id: stageId,
        })
      ).unwrap();

      // console.log("API Response:", response?.data?.stage_barcode?.stage_status);

      if (response?.data?.stage_barcode?.stage_status === "completed") {
        toast.error("This spool is already completed.")
        return;
      }

      navigate("/drawing-spool", {
        state: {
          stage_id: stageId,
          spool_id: spoolId,
        },
      });

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <header>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-3">
              <div className="header-in">
                <Link to="/dashboard">
                  <img src="/images/projects/logo-w.svg" alt="Logo" />
                </Link>
                <div className="logo-data">
                  <img src="/images/projects/rpr-spool-tracker.svg" alt="" />
                  <p>
                    Logged in as <span>{user?.name}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-9">
              <div className="header-right">
                {/* ENTITY SWITCHER */}
                {!hideHeader && (
                  <div className="entity-swtich entity-dropdown">
                    <button
                      className="dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <div className="entity-logo">
                        <img
                          src={
                            Logo
                              ? `${imagebaseUrl + Logo}`
                              : "/images/projects/entity-logo.svg"
                          }
                          alt=""
                        />
                      </div>
                      <div className="entity-swtich-btn">
                        <span className="entity-dropdown-btn">
                          {selected?.entity_name || "select entity"}
                        </span>
                        <i className="fa-regular fa-angle-down"></i>
                      </div>
                    </button>

                    <div className="dropdown-menu dropdown-menu-end">
                      <div className="select-entity-list">
                        <h4 style={{ color: background }}>Select Entity</h4>
                        <ul>
                          {!allEntity?.length ? (
                            <li className="text-center py-2 text-muted">
                              No entity found
                            </li>
                          ) : (
                            allEntity?.map((entity) => (
                              <li key={entity?.id}>
                                <button
                                  type="button"
                                  className={`dropdown-item ${selected?.id === entity?.id ? "active" : ""
                                    }`}
                                  onClick={() => handleSelectEntity(entity)}
                                >
                                  {entity?.entity_name}
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                <div className="notification">
                  <button
                    className="dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{ color: background }}
                    onClick={() => {
                      markAllAsRead();
                    }}
                  >
                    <i
                      className="hgi hgi-stroke hgi-notification-01"
                      style={{ color: background }}
                    ></i>
                    <span className="count" style={{ background: background }}>
                      {notifications?.notification_count}
                    </span>
                  </button>
                  <div className="dropdown-menu dropdown-menu-end">
                    <div className="noti-dropdown">
                      <h2 style={{ color: background }}>Notifications</h2>
                      <div className="noti-scroll">
                        <div className="noti-list">
                          {notification?.length > 0 ? (
                            <div className="noti-list">
                              {notification.map((item) => (
                                <div
                                  className="noti-in"
                                  data-is-read={item?.is_read}
                                  data-id={item?.id}
                                  key={item?.id}
                                >
                                  
                                  <Link
                                    to="/drawing-spool"
                                    state={{
                                      stage_id: item?.stage_id,
                                      spool_id: item?.spool_id,
                                    }}
                                    data-id={item?.id}
                                    data-is-read={item?.is_read}
                                    style={{
                                      fontWeight: item?.isUnread ? "bold" : "normal",
                                    }}
                                    onClick={(e) => handleSpoolClick(item, e)}
                                  >
                                    <h3>
                                      {item?.get_spool?.spool_number}
                                      {item?.is_read === 0 && <span></span>}
                                      <b>{timeAgo(item.created_at)}</b>
                                    </h3>

                                    <p>{item?.get_project?.project_name}</p>

                                    <p>
                                      <b>Admin reply:</b> {item?.message}
                                    </p>
                                  </Link>

                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="noti-list text-center">
                              No notifications found.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* LOGOUT */}
                {!hideLogout && (
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="logout-cta"
                    style={{ background: background }}
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#logout-popup"
                  >
                    Logout{" "}
                    <i className="hgi hgi-stroke hgi-logout-circle-02"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <Logout show={showLogout} handleClose={() => setShowLogoutModal(false)} />
    </>
  );
};

export default Header;
