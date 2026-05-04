import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import ReportIssue from "../components/ReportIssue";
import ViewStageModal from "../components/ViewStageModal";
import Pagination from "../commanComponents/Pagination";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getstageDetails, spoolByProject } from "../redux/slice/projectSlice";
import { toast } from "react-hot-toast";

const status = [
  "ready_to_start",
  "paused",
  "in_progress",
  "all_completed",
  
]

const Spool = () => {
  const navigate = useNavigate()
  const { state } = useLocation();
  const dispatch = useDispatch()
  const closedDispatchedRef = useRef(false);
  const selectedStageRef = useRef({});
  const timerRef = useRef(null)
  const itemsPerPage = 10;

  const selected = useSelector((state) => state.entity.selected);
  const { projectsData , getstageDetailsData} = useSelector((state) => state.project);
  const hasHandledParallel = useRef(false);

  console.log("getstageDetailsData", getstageDetailsData)
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
  const [type, setType] = useState("");

  console.log(type)
  // const [handleChnageStage, setHandleChangeStage] = useState(null);

  const [selectedStage, setSelectedStage] = useState({});

  const [selectedStageStatus, setSelectedStagesStatus] = useState({});
  const  [newStageDetails, setNewStageDetails] = useState({})
  const [parallelStageStatus, setParallelStageStatus] = useState({})

  console.log("newStageDetails", newStageDetails)



useEffect(() => {
  selectedStageRef.current = selectedStage;
}, [selectedStage]);

// const handleStageChange =async(stageId, spoolId) => {
//   console.log("Stage ID:", stageId);
//   console.log("Spool ID:", spoolId);

//   try {
//       const response = await dispatch(getstageDetails({ 
//             project_id:projectsData?.project_id,
//             spool_id:spoolId,
//             stage_id:stageId})).unwrap();
      
//             if(response?.data){
//                setNewStageDetails(response.data);
//             }
//   } catch (error) {
//      toast.error(error?.message || "Failed to change stage");
//   }
// };


const handleStageChange = async (stageId, spoolId) => {
  console.log("Stage ID:", stageId);
  console.log("Spool ID:", spoolId);

  try {
    const response = await dispatch(
      getstageDetails({
        project_id: projectsData?.project_id,
        spool_id: spoolId,
        stage_id: stageId,
      })
    ).unwrap();

    if (response?.data) {
      setNewStageDetails((prev) => ({
        ...prev,
        [spoolId]: response.data,
      }));
    }
  } catch (error) {
    toast.error(error?.message || "Failed to change stage");
  }
};



// useEffect(() => {

//   handleStageChange()

// }, [selectedStage])


// console.log(handleChnageStage,"haneleChnageStage")

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

  // const stages = [...new Set(spools?.map(spool => spool?.stage_name))];

  const stages = [
  ...new Set(
    spools?.flatMap((spool) => {
      if (spool?.type === "parallel") {
        return spool?.parallel_stages?.map((s) => s?.stage_name) || [];
      }
      return spool?.stage_name ? [spool.stage_name] : [];
    })
  ),
];

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
    // if (selectStage) {
    //   const term = selectStage.toLowerCase();
    //   filtered = filtered.filter(item =>
    //     item?.stage_name?.toLowerCase().includes(term)
    //   );
    // }

   if (selectStage) {
  const term = selectStage.toLowerCase();

  filtered = filtered.filter((item) => {
    if (item?.type === "parallel") {
      return item?.parallel_stages?.some((stage) =>
        stage?.stage_name?.toLowerCase().includes(term)
      );
    }

    return item?.stage_name?.toLowerCase().includes(term);
  });
}
     


    // if (selectStatus) {
    //   const term = selectStatus.toLowerCase();
    //   filtered = filtered.filter(item =>
    //     item?.status?.toLowerCase().includes(term)
    //   );
    // }


// if (selectStatus) {

//   const term = (selectStatus === "all_completed" || selectStatus === "completed")
//     ? "completed"
//     : selectStatus.toLowerCase().replace(/\s+/g, "_");

//      filtered = filtered.filter((item) => {
//     const stageDetails = getstageDetailsData?.[item?.spool_id]||item?.parallel_stages?.status;

//     console.log("stageDetails", stageDetails, item)
    
//     const stages = stageDetails?.stages?.status||item?.parallel_stages?.status||[] ;

//     console.log("stages", stages)

//     if (stages.length > 0) {
//       return stages.every((stage) => {
//         const stageStatus = (stage?.status || "").toLowerCase();
//         if (term === "completed") {
//           return stageStatus === "completed" || stageStatus === "all_completed";
//         }
//         return stageStatus === term;
//       });
//     }

//     const mainStatus = (stageDetails?.status || item?.status || "").toLowerCase();
//     if (term === "completed") {
//       return mainStatus === "completed" || mainStatus === "all_completed";
//     }
//     return mainStatus === term;
//   });
// }


                  // if (selectStatus) {
                  //   const term =
                  //     selectStatus === "all_completed" || selectStatus === "completed"
                  //       ? "completed"
                  //       : selectStatus.toLowerCase().replace(/\s+/g, "_");

                  //       console.log(filtered, "before  status filter")

                  //   filtered = filtered.filter((item) => {


                  //     console.log("item?.parallel_stages", item?.parallel_stages)
                  //     const stageDetails = item?.parallel_stages || item || {};

       
                  //       console.log("stageDetails", stageDetails, item)

                  //     const stages =
                  //       stageDetails?.stages_name ||
                  //       item?.parallel_stages ||
                  //       [];

                  //     // ✅ check all stages (parallel case)
                  //     if (Array.isArray(stages) && stages.length > 0) {
                  //       return stages.every((stage) => {
                  //         const stageStatus = (stage?.status || "").toLowerCase();

                  //         if (term === "completed") {
                  //           return (
                  //             stageStatus === "completed" ||
                  //             stageStatus === "all_completed" ||
                  //             stageStatus === "complete"
                  //           );
                  //         }

                  //         return stageStatus === term;
                  //       });
                  //     }

                  //     // ✅ fallback (normal case)
                  //     let mainStatus = (stageDetails?.status || item?.status || "").toLowerCase();

                  //     if (term === "completed") {
                  //       return (
                  //         mainStatus === "completed" ||
                  //         mainStatus === "all_completed" ||
                  //         mainStatus === "complete"
                  //       );
                  //     }

                  //     return mainStatus === term;
                  //   });
                  // }



                  if (selectStatus) {
  const term =
    selectStatus === "all_completed" || selectStatus === "completed"
      ? "completed"
      : selectStatus.toLowerCase().replace(/\s+/g, "_");

  filtered = filtered.filter((item) => {
    // ✅ PARALLEL CASE
    if (item?.type === "parallel" && Array.isArray(item?.parallel_stages)) {
      return item.parallel_stages.some((stage) => {
        const stageStatus = (stage?.status || "").toLowerCase();

        if (term === "completed") {
          return (
            stageStatus === "completed" ||
            stageStatus === "all_completed" ||
            stageStatus === "complete"
          );
        }

        return stageStatus === term;
      });
    }

    // ✅ NORMAL CASE
    const status = (item?.status || "").toLowerCase();

    if (term === "completed") {
      return (
        status === "completed" ||
        status === "all_completed" ||
        status === "complete"
      );
    }

    return status === term;
  });
}


    // if (isflagged) {
    //   filtered = filtered.filter(item => {
    //     const flagStatus = item?.flag_status;
    //     return flagStatus === 'open'
    //     // return flagStatus !== null && flagStatus !== undefined && flagStatus !== "" && flagStatus !== "closed";
    //   });
    // }

    if (isflagged) {
  filtered = filtered.filter((item) => {
    const stageData = (getstageDetailsData || {})[item?.spool_id] || {};

    const flagStatus =
      item?.type === "parallel"
        ? (stageData?.flag_status || item?.flag_status)
        : item?.flag_status;

    return flagStatus === "open";
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

  // const handlenext = (item) => {

  //   if (item?.status === "all_completed") {
  //     toast.error("This spool is already completed. Please choose another spool.");
  //     return;
  //   }

  //   navigate("/drawing-spool", {
  //     state: {
  //       spool_id:  item?.spool_id,
  //       stage_id: item?.stage_id,
  //     },
  //   });
  // };

//   const handlenext = (item) => {
//   const spoolId = item?.spool_id;

//   // ✅ get correct stage id
//   const stageId =
//     item?.type === "parallel"
//       ? selectedStage[spoolId] || item?.stage_id
//       : item?.stage_id;

//   // ✅ get correct status (important if using API data)
//   const stageData = getstageDetailsData[spoolId] || {};
//   const status =
//     item?.type === "parallel"
//       ? stageData?.status || item?.status
//       : item?.status;

//   if (status === "all_completed") {
//     toast.error("This spool is already completed. Please choose another spool.");
//     return;
//   }

//   navigate("/drawing-spool", {
//     state: {
//       spool_id: item?.spool_id || spoolId,
//       stage_id: item?.stage_id || stageId,
//     },
//   });
// };



  const totalItems = filteredSpools?.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredSpools.slice(startIndex, startIndex + itemsPerPage);


// useEffect(() => {
//   if (hasHandledParallel.current) return;
//   if (!currentItems?.length) return;

//   const initialSelected = {};

//   currentItems.forEach((item) => {
//     if (item?.type !== "parallel") return;

//     const spoolId = item?.spool_id;

//     const stageId =
//       item?.stage_id || item?.parallel_stages?.[0]?.stage_id;

//     if (!stageId) return;

//     // collect default selections
//     initialSelected[spoolId] = stageId;

//     // call API per spool
//     handleStageChange(stageId, spoolId);
//   });

//   // ✅ set all at once (important)
//   setSelectedStage((prev) => ({
//     ...initialSelected,
//     ...prev,
//   }));

//   // ✅ set once (outside loop)
//   hasHandledParallel.current = true;
//   setType("parallel");

// }, [currentItems]);



useEffect(() => {
  if (hasHandledParallel.current) return;
  if (!currentItems?.length) return;

  const initialSelected = {};

  currentItems.forEach((item) => {
    if (item?.type !== "parallel") return;

    const spoolId = item?.spool_id;

    // ✅ pick first incomplete stage
    const stageId =
      item?.parallel_stages?.find(
        (s) =>
          !["completed", "all_completed", "complete"].includes(
            s?.status?.toLowerCase()
          )
      )?.stage_id ||
      item?.parallel_stages?.[0]?.stage_id;

    if (!stageId) return;

    initialSelected[spoolId] = stageId;

    // ✅ call API
    handleStageChange(stageId, spoolId);
  });

  setSelectedStage((prev) => ({
    ...initialSelected,
    ...prev,
  }));

  hasHandledParallel.current = true;
  setType("parallel");

}, [currentItems]);






//   const handlenext = (item) => {
//   const spoolId = item?.spool_id;

//   // ✅ get correct stage id
//   const stageId =
//     item?.type === "parallel"
//       ? selectedStage[spoolId] || item?.stage_id
//       : item?.stage_id;

//   // ✅ get correct status (important if using API data)
//   const stageData = getstageDetailsData[spoolId] || {};
//   const status =
//     item?.type === "parallel"
//       ? stageData?.status || item?.status
//       : item?.status;

//   if (status === "all_completed") {
//     toast.error("This spool is already completed. Please choose another spool.");
//     return;
//   }

//   navigate("/drawing-spool", {
//     state: {
//       spool_id: item?.spool_id || spoolId,
//       stage_id: item?.stage_id || stageId,
//     },
//   });
// };


const handlenext = (item) => {
  if (!item) return;

  const spoolId = item?.spool_id;

  const safeSelectedStage = selectedStage || {};
  const safeStageDetails = getstageDetailsData || {};

  // ✅ get correct stage id
  const stageId =
    item?.type === "parallel"
      ? safeSelectedStage[spoolId] || item?.stage_id
      : item?.stage_id;

  // ✅ get correct status
  const stageData = safeStageDetails[spoolId] || {};
  const status =
    item?.type === "parallel"
      ? stageData?.status || item?.status
      : item?.status;

    if(item?.message){
        toast.error(item?.message || "Failed to fetch stage details");
        return;
    }

  if (status === "all_completed") {
    toast.error("This spool is already completed. Please choose another spool.");
    return;
  }

  navigate("/drawing-spool", {
    state: {
      spool_id: spoolId,
      stage_id: stageId,
    },
  });
};




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
                            {formatStatus(
                                  item === "all_completed" || item === "completed"
                                    ? "completed"
                                    : item
                            )}
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
                          {/* <td>{item?.stage_name || "-"}</td> */}

                          {/* my new code */}
                  {/* <td>
                    {item?.type === "parallel" ? (
                   
                        <select  style={{padding:'10px',borderRadius:'10px'}}
                        //  value={selectedStage[item.spool_id] ?? item?.stage_id ?? ""}

                                                value={
                          selectedStage[item.spool_id] ??
                          item?.stage_id ??
                          item?.parallel_stages?.[0]?.stage_id ??
                          ""
                        }

                          // onChange={(e) => {
                          //   const stageId = e.target.value;
                          //   const spoolId = item?.spool_id;

                            
                          //   setSelectedStage((prev) => ({
                          //     ...prev,
                          //     [spoolId]: stageId,
                          //   }));

                          //   handleStageChange(stageId, spoolId);
                          // }}


                       onChange={(e) => {
                        const stageId = e.target.value;
                        const spoolId = item?.spool_id;

                        setSelectedStage((prev) => ({
                          ...prev,
                          [spoolId]: stageId,
                        }));

                        if (item?.type === "parallel") {
                          setType("parallel");
                        }

                        handleStageChange(stageId, spoolId);
                      }}
                    >
                      {item?.parallel_stages?.map((stage) => (
                        <option key={stage?.stage?.id} value={stage?.stage_id}>
                          {stage?.stage_name}
                        </option>
                      ))}
                        </select>
                     
                    ) : (
                      item?.stage_name || "-"
                    )}
                 </td> */}

                                <td>
                          {item?.type === "parallel"   ? (
                            <select
                              style={{ padding: "10px", borderRadius: "10px" }}
                              value={
                                selectedStage[item.spool_id] ??
                                item?.stage_id ??
                                item?.parallel_stages?.[0]?.stage_id ??
                                ""
                              }
                              onChange={(e) => {
                                const stageId = e.target.value;
                                const spoolId = item?.spool_id;

                                setSelectedStage((prev) => ({
                                  ...prev,
                                  [spoolId]: stageId,
                                }));

                                handleStageChange(stageId, spoolId);
                              }}
                            >
                          
                              {item?.parallel_stages?.map((stage) =>
                                stage?.status !== "completed" ? (
                                  <option key={stage?.stage_id} value={stage?.stage_id}>
                                    {stage?.stage_name}
                                  </option>
                                ) : null
                              )}
                               </select>
                                ) : (
                                  item?.stage_name || "-"
                                )}
                               </td>

                          <td>


                              {
                                  (() => {
                                    const stageData = (getstageDetailsData || {})[item?.spool_id] || {};

                                    const status =
                                      // item?.type === "parallel"
                                        // ? stageData?.status || item?.status || item?.parallel_stages?.status
                                        // :
                                         item?.status||item?.parallel_stages?.status|| stageData?.status ;

                                    return (
                                      <>
                                        {status === "ready_to_start" && (
                                          <div className="status-tag start">
                                            <i className="hgi hgi-stroke hgi-play"></i>
                                            Ready to Start
                                          </div>
                                        )}

                                        {status === "paused" && (
                                          <div className="status-tag paused">
                                            <i className="hgi hgi-stroke hgi-pause"></i>
                                            Paused
                                          </div>
                                        )}

                                        {status === "in_progress" && (
                                          <div className="status-tag inprogress">
                                            <i className="hgi hgi-stroke hgi-refresh"></i>
                                            In Progress
                                          </div>
                                        )}

                                        {(status === "completed" || status === "all_completed") && (
                                          <div className="status-tag completed">
                                            <i className="hgi hgi-stroke hgi-checkmark-circle-01"></i>
                                            Completed
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()
                                }
  
                          </td>
                          <td>

                          
                                                            {
                                    (
                                      item?.type === "parallel"
                                        ? (
                                            ((getstageDetailsData || {})[item?.spool_id]?.flag_status || item?.flag_status) &&
                                            (getstageDetailsData || {})[item?.spool_id]?.flag_status !== "closed" &&
                                            (getstageDetailsData || {})[item?.spool_id]?.flag_status !== "" &&
                                            ((getstageDetailsData || {})[item?.spool_id]?.status || item?.status) !== "all_completed"
                                          )
                                        : (
                                            item?.flag_status &&
                                            item?.flag_status !== "closed" &&
                                            item?.flag_status !== "" &&
                                            item?.status !== "all_completed"
                                          )
                                    ) ? (
                                      <div className="status-tag flagged">
                                        <i className="hgi hgi-stroke hgi-flag-02"></i>
                                        Flagged
                                      </div>
                                    ) : (
                                      <span>-</span>
                                    )
                                  }

                                                          
                           </td>



                          <td>
                            {(
                              (item?.type === "parallel"
                                ? ((getstageDetailsData || {})[item?.spool_id]?.flag_reason || item?.flag_reason)
                                : item?.flag_reason) &&
                              (item?.type === "parallel"
                                ? ((getstageDetailsData || {})[item?.spool_id]?.status || item?.status)
                                : item?.status) !== "all_completed" &&
                              (item?.type === "parallel"
                                ? ((getstageDetailsData || {})[item?.spool_id]?.flag_status || item?.flag_status)
                                : item?.flag_status) !== "closed"
                            ) ? (
                              <a
                                type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#reported-issue-popup"
                                className="view-btn"
                                onClick={() =>
                                  setFlagText(
                                    item?.type === "parallel"
                                      ? ((getstageDetailsData || {})[item?.spool_id]?.flag_reason || item?.flag_reason)
                                      : item?.flag_reason
                                  )
                                }
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
