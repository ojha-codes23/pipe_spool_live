import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import ReportIssue from "../components/ReportIssue";
import ViewStageModal from "../components/ViewStageModal";
import Pagination from "../commanComponents/Pagination";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { spoolByProject } from "../redux/slice/projectSlice";
import { toast } from "react-toastify";

const status = [
  "ready_to_start",
  "paused",
  "in_progress",
  "all_completed"
]

const Spool = () => {
  const navigate = useNavigate()
  const { state } = useLocation();
  const dispatch = useDispatch()
  const closedDispatchedRef = useRef(false);
  const timerRef = useRef(null)
  const itemsPerPage = 10;

  const selected = useSelector((state) => state.entity.selected);
  const { projectsData } = useSelector((state) => state.project);
  const projectsDataRef = useRef(projectsData);
  const [pId, setPid] = useState(null)
  const [spools, setSpools] = useState([]);
  const [filteredSpools, setFilteredSpools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1)
  const [flagText, setFlagText] = useState("");
  const [selectStatus, setSelectStatus] = useState("");
  const [selectStage, setSelectStage] = useState(null);
  const [isflagged, setIsFlagged] = useState(false);
  const [projectName, setProjectName] = useState(null);
  const [selectSpool, setSelectSpool] = useState(null)
  const [them, setThem] = useState('');
  const [search, setSearch] = useState("");
  const prevFiltersRef = useRef({ search, selectStage, selectStatus, isflagged });
  const flag_status = filteredSpools?.[0]?.flag_status;

  useEffect(() => {
    projectsDataRef.current = projectsData;
  }, [projectsData]);

  useEffect(() => {
    const themColor = JSON.parse(localStorage.getItem('selectedEntity'));
    setThem(themColor?.entity_secondary_color)
  }, [selected]);
  const background = them;

  const stages = [...new Set(spools?.map(spool => spool?.stage_name))];

  useEffect(() => {
    if (state?.id) {
      console.log("state", state)
      setPid(state.id);
    } else {
      navigate(-1)
    }
  }, [state]);



  // useEffect(() => {
  //   // 1. Initial Call
  //   if (pId) {
  //     dispatch(spoolByProject({ project_id: pId }));
  //   }

  //   const rawSpools = projectsData?.spools || [];
  //   const isAnySpoolClosed = rawSpools.some(s => s.flag_status === "closed");
  //   console.log("isAnySpoolClosed", isAnySpoolClosed)
  //   // 2. Real-time Polling Logic
  //   const interval = setInterval(() => {
  //     // Check raw data from Redux, not the filtered state
  //     const rawSpools = projectsData?.spools || [];
  //     const isAnySpoolClosed = rawSpools.some(s => s.flag_status === "closed");
  //     console.log("isAnySpoolClosed", isAnySpoolClosed)

  //     if (pId && isAnySpoolClosed) {
  //       console.log("Admin sync: Status is closed, refreshing...");
  //       // dispatch(spoolByProject({ project_id: pId }));
  //     }
  //   }, 5000);

  //   return () => clearInterval(interval);

  //   // We only watch pId. If we watch flag_status, it resets the timer too fast.
  // }, [pId, dispatch]);

  useEffect(() => {
    if (pId) {
      dispatch(spoolByProject({ project_id: pId }));
    }
    const interval = setInterval(() => {
      const currentData = projectsDataRef.current;
      const rawSpools = currentData?.spools || [];
      console.log("projectsData", projectsData)
      const isAnySpoolOpen = rawSpools.some(s => s.flag_status !== "closed");
      console.log("isAnySpoolOpen", isAnySpoolOpen)
      if (pId && isAnySpoolOpen) {
        console.log("Polling: Status is OPEN, fetching updates...");
        dispatch(spoolByProject({ project_id: pId }));
      } else {
        console.log("Polling Paused: All spools are CLOSED.");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pId, dispatch]);


  useEffect(() => {
    if (projectsData) {
      setSpools(projectsData?.spools || []);
      setProjectName(projectsData?.project_name || null)
    }
  }, [projectsData])


  useEffect(() => {
    const spoolsData = Array.isArray(spools) ? spools : [];
    let filtered = [...spoolsData];

    if (search.trim() && search.trim().length >= 2) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(item =>
        item?.spool_number?.toLowerCase().includes(term)
      );
    }
    console.log("filtered", filtered)
    if (selectStage) {
      const term = selectStage.toLowerCase();
      filtered = filtered.filter(item =>
        item?.stage_name?.toLowerCase().includes(term)
      );
    }
    if (selectStatus) {
      const term = selectStatus.toLowerCase();
      filtered = filtered.filter(item =>
        item?.status?.toLowerCase().includes(term)
      );
    }
    if (isflagged) {
      filtered = filtered.filter(item => {
        const flagStatus = item?.flag_status;
        return flagStatus == 'open'
        // return flagStatus !== null && flagStatus !== undefined && flagStatus !== "" && flagStatus !== "closed";
      });
    }
    setFilteredSpools(filtered);
    // setCurrentPage(1)
    const filtersChanged =
      prevFiltersRef.current.search !== search ||
      prevFiltersRef.current.selectStage !== selectStage ||
      prevFiltersRef.current.selectStatus !== selectStatus ||
      prevFiltersRef.current.isflagged !== isflagged;
    if (filtersChanged) {
      setCurrentPage(1);
      localStorage.setItem("currentPage", 1);
      prevFiltersRef.current = { search, selectStage, selectStatus, isflagged };
    } else {
      const savedPage = localStorage.getItem("currentPage");
      if (savedPage) {
        setCurrentPage(Number(savedPage));
      }
    }
  }, [spools, selectStage, selectStatus, isflagged, search]);

  const formatStatus = (value) =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());

  const handleToggle = (e) => {
    setIsFlagged(e.target.checked);
  };

  const handleSelectSpool = (id) => {
    setSelectSpool(id)
  }

  const handlenext = (item) => {

    if (item?.status === "all_completed") {
      toast.error("This spool is already completed. Please choose another spool.");
      return;
    }

    navigate("/drawing-spool", {
      state: {
        spool_id: item?.spool_id,
        stage_id: item?.stage_id,
      },
    });
  };

  const totalItems = filteredSpools?.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredSpools.slice(startIndex, startIndex + itemsPerPage);

  console.log("search", search)
  console.log("filteredSpools", filteredSpools)

  return (
    <>
      <div className="page-wrapper">
        <Header />
        <main className="spools-page">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="page-heading">
                  <h1>{projectName}</h1>
                  <p>Select a spool to view stages.</p>
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="page-search">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by spool number…"
                    className="srch-field"
                    style={{
                      marginRight: "10px",
                      // marginBottom: "10"
                    }}
                  />
                  <Link onClick={(e) => {
                    e.preventDefault();
                    navigate(-1)
                  }} className="back-cta">
                    <img src="/images/projects/arrow-left.svg" alt="" style={{
                      width: '11px'
                    }} /> Back to
                    Projects
                  </Link>

                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="spools-table">
              <div className="spools-head">
                <h1>
                  <i className="hgi hgi-stroke hgi-file-01" style={{
                    color: background
                  }}></i>
                  Spools
                  in {projectName}
                </h1>
                <div className="spools-filter">
                  <form action="">
                    <label>
                      <i className="hgi hgi-stroke hgi-filter"></i> Filters:
                    </label>
                    <select
                      value={selectStatus}
                      onChange={(e) => setSelectStatus(e.target.value)}
                    >
                      <option value="">Status</option>
                      {status.map((item, index) => (
                        <option key={index} value={item}>
                          {formatStatus(item === ("all_completed" || "completed") ? "Completed" : item)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectStage ?? ""}
                      onChange={(e) => setSelectStage(e.target.value)}
                    >
                      <option value="">Stages</option>

                      {stages.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="flexSwitchCheckChecked"
                        checked={isflagged}
                        onChange={handleToggle}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flexSwitchCheckChecked"
                      >
                        Show Flagged Only
                      </label>
                    </div>
                  </form>
                </div>
              </div>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Spool Number</th>
                      <th>Current Stage</th>
                      <th>Status</th>
                      <th>Flagged</th>
                      <th>Issue Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems?.length > 0 ? (
                      currentItems?.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="spool-tag" style={{
                              background: background
                            }}>
                              {item?.spool_number || "-"}
                            </div>
                          </td>
                          <td>{item?.stage_name || "-"}</td>
                          <td>
                            {item?.status === "ready_to_start" && (
                              <div className="status-tag start">
                                <i className="hgi hgi-stroke hgi-play"></i>
                                Ready to Start
                              </div>
                            )}

                            {item?.status === "paused" && (
                              <div className="status-tag paused">
                                <i className="hgi hgi-stroke hgi-pause"></i>
                                Paused
                              </div>
                            )}

                            {item?.status === "in_progress" && (
                              <div className="status-tag inprogress">
                                <i className="hgi hgi-stroke hgi-refresh"></i>
                                In Progress
                              </div>
                            )}

                            {item?.status === "complete" || item?.status === "all_completed" && (
                              <div className="status-tag completed">
                                <i className="hgi hgi-stroke hgi-checkmark-circle-01"></i>
                                Completed
                              </div>
                            )}
                          </td>
                          <td>
                            {(item?.flag_status !== null && item?.flag_status !== "closed" && item?.flag_status !== '' && item?.flag_status !== undefined) && item?.status !== "all_completed" ? (
                              <div className="status-tag flagged">
                                <i className="hgi hgi-stroke hgi-flag-02"></i>
                                Flagged
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td>

                            {item?.flag_reason !== null && item?.status !== "all_completed" && item.flag_status !== "closed" ? (
                              <a
                                type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#reported-issue-popup"
                                className="view-btn"
                                onClick={() => setFlagText(item?.flag_reason)}
                              >
                                View
                              </a>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td>
                            <div className="action-grp">
                              <button
                                type="button"
                                className="non-primary-cta"
                                data-bs-toggle="modal"
                                data-bs-target="#view-stages-popup"
                                onClick={() => handleSelectSpool(item?.spool_id)}
                                style={{
                                  background: background,
                                  borderColor: background
                                }}
                              >
                                View Stages
                              </button>
                              <button
                                onClick={() => handlenext(item)}
                                // to="/drawing-spool"
                                // state={{
                                //   spool_id: item?.spool_id,
                                //   stage_id: item?.stage_id
                                // }}
                                className="primary-cta"
                              >
                                Open
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                          No spools found .
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              showResult={true}
            />
          </div>
        </main>
      </div>

      <ReportIssue
        issueReason={flagText}
      />
      <ViewStageModal
        initialId={selectSpool}
      />
    </>
  );
};

export default Spool;
