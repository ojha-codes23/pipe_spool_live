import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import IssueInfoPopup from '../components/IssueInfoPopup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import StartPopup from '../components/StartPopup'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSpoolsDrawing, resetSpoolDrawingDetails } from '../redux/slice/spoolSlice'
import { pauseAndResumeTask, reportTask, startAndComplateTask } from '../redux/slice/taskSlice'
import { toast } from 'react-toastify'
const imagebaseUrl = import.meta.env.VITE_IMAGE_URL;

const getActionFromBarcode = (code) => {
    if (!code) return null;

    return code.split("|").pop().split("-").pop();
};

const STATUS_CONFIG = {
    ready_to_start: {
        className: "start",
        icon: "hgi-play",
        label: "Ready to Start",
    },
    paused: {
        className: "paused",
        icon: "hgi-pause",
        label: "Paused",
    },
    in_progress: {
        className: "inprogress",
        icon: "hgi-refresh",
        label: "In Progress",
    },
    completed: {
        className: "completed",
        icon: "hgi-checkmark-circle-01",
        label: "Completed",
    },
};

const DrawingSpool = () => {
    const [pauseId, setPauseId] = useState(null)
    const navigate = useNavigate()
    const location = useLocation();
    const { stage_id, spool_id } = location?.state || {};
    const startTime = useRef(0);
    const scannerInputRef = useRef(null);
    const { state } = useLocation();
    const dispatch = useDispatch();
    const { spoolDrawingDetails } = useSelector((state) => state.spools)
    const [them, setThem] = useState('')
    const selected = useSelector((state) => state.entity.selected);

    useEffect(() => {
        const themColor = JSON.parse(localStorage.getItem('selectedEntity'));
        setThem(themColor?.entity_secondary_color)
    }, [selected]);
    const background = them;
    const [showReportIssue, setShowReportIssue] = useState(false)
    const [spoolId, setSpoolId] = useState(null || spool_id)
    const [stageId, setStageId] = useState(null || stage_id);
    const [spoolDetails, setSpoolDetails] = useState(null);
    const [type, setType] = useState(null)
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsTablet(width >= 800 && width <= 1334);
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const onScan = async (eventCall) => {
        try {
            const entity_id = JSON.parse(localStorage.getItem('selectedEntity'))?.id
            const project_id = spoolDetails?.project?.id
            const spool_id = spoolId
            const stage_id = stageId
            if (spoolDetails?.flag_status === 'open') {
                toast.error('Your flag has opend please wait while flag closed by admin!');
                return;
            }
            if (eventCall === 'START' || eventCall === 'END') {
                if (eventCall === 'START') {
                    if (currentStatus === 'ready_to_start') {
                        
                        await dispatch(startAndComplateTask({
                            entity_id: entity_id,
                            project_id: project_id,
                            spool_id: spool_id,
                            stage_id: stage_id,
                            action_type: 'start'
                        }))
                    } else {
                        toast.error('You need to go in the ready to start start!')
                    }
                }
                else {
                    if (currentStatus === 'in_progress') {
                        
                        await dispatch(startAndComplateTask({
                            entity_id: entity_id,
                            project_id: project_id,
                            spool_id: spool_id,
                            stage_id: stage_id,
                            action_type: 'complete'
                        }))
                    } else {
                        toast.error('Your task is not in progress!')
                    }
                }
                const data = await dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId }));
                if (data?.payload?.data?.stage_barcode?.stage_status === 'completed') {
                    // navigate(-1)
                }
            } else if (eventCall === 'PAUSE' || eventCall === 'RESUME') {
                if (eventCall === 'PAUSE') {
                    if (currentStatus === 'in_progress' && currentStatus !== 'ready_to_start') {
                        
                        const pauseData = await dispatch(pauseAndResumeTask({
                            entity_id: entity_id,
                            project_id: project_id,
                            spool_id: spool_id,
                            stage_id: stage_id,
                            action_type: 'pause'
                        }));
                        
                        if (pauseData?.payload?.success) {
                            localStorage.setItem('project_assign_id', pauseData?.payload?.data?.id)
                            setPauseId(pauseData?.payload?.data?.id)
                        }
                    } else {
                        toast.error('Your task is not in progress!')
                    }
                } else {
                    if (currentStatus === 'paused') {
                       
                        await dispatch(pauseAndResumeTask({
                            entity_id: entity_id,
                            project_id: project_id,
                            spool_id: spool_id,
                            stage_id: stage_id,
                            action_type: 'resume'
                        }))
                    } else {
                        toast.error('Your task is already in progress!')
                    }
                }
                const data = await dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId }));
                if (data?.payload?.data?.stage_barcode?.stage_status === 'completed') {
                    // navigate(-1)
                }
            } else {
                console.log("You have a wronge event call")
            }
        } catch (error) {
            console.log("Error message when call a event", error)
        }
    }

    useEffect(() => {
        const inputEl = scannerInputRef.current;
        if (!inputEl) return;
        const handleWindowFocus = () => inputEl.focus();
        window.addEventListener("focus", handleWindowFocus);
        return () => {
            window.removeEventListener("focus", handleWindowFocus);
        };
    }, []);

    useEffect(() => {
        if (state?.spool_id && state?.stage_id) {
            setSpoolId(state?.spool_id);
            setStageId(state?.stage_id);
        } else {
            navigate(-1)
        }
    }, [state]);

    // useEffect(() => {
    //     if (spoolId && stageId) {
    //         dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId }));
    //     }
    // }, [spoolId, stageId])

    // useEffect(() => {
    //    
    //         if (spoolId && stageId) {
    //             dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId }));
    //         }
    //         return () => {
    //             dispatch(resetSpoolDrawingDetails());
    //         };
    // }, [spoolId, stageId]);
    useEffect(() => {
        const fetchData = async () => {
            if (spoolId && stageId) {
                try {
                    await dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId })).unwrap();
                } catch (error) {
                    if (error?.code === 404 || error?.status === 404) {
                        console.log("Redirecting due to 404:", error);
                        navigate(-1);
                    }
                }
            }
        };
        fetchData();
        return () => {
            dispatch(resetSpoolDrawingDetails());
        };
    }, [spoolId, stageId, dispatch, navigate]);

    // useEffect(() => {
    //     if (spoolDrawingDetails) {
    //         console.log("spoolDrawingDetails", spoolDrawingDetails)
    //         setSpoolDetails(spoolDrawingDetails)
    //     };
    //     setTimeout(() => {
    //         handleRediract()
    //     }, 3000)
    //     // if (spoolDrawingDetails?.stage_barcode?.stage_status === 'completed') {
    //     //     navigate(-1)
    //     // }
    // }, [spoolDrawingDetails])

    useEffect(() => {
        if (!spoolDrawingDetails) return;

        setSpoolDetails(spoolDrawingDetails);

        if (spoolDrawingDetails?.stage_barcode?.stage_status === 'completed') {
            if (spoolDrawingDetails?.stage_barcode?.stage_status === 'completed') {
                navigate(-1)
            }
        }

    }, [spoolDrawingDetails]);



    const currentStatus =
        spoolDetails?.stage_barcode?.stage_status;


    // useEffect(() => {
    //     const inputEl = scannerInputRef.current;
    //     if (!inputEl) return;

    //     const handleKeyDown = async (e) => {
    //         if (e.key !== "Enter") return;
    //         e.preventDefault();
    //         e.stopPropagation();
    //         const scannedCodeData = e.target.value.trim();
    //         if (!scannedCodeData) return;
    //         const action = getActionFromBarcode(scannedCodeData);
    //         await onScan(action);
    //         e.target.value = "";
    //     };
    //     inputEl.addEventListener("keydown", handleKeyDown);
    //     const handleModalHidden = () => {
    //         inputEl.focus();
    //     };

    //     document.addEventListener("hidden.bs.modal", handleModalHidden);
    //     inputEl.focus();

    //     return () => {
    //         inputEl.removeEventListener("keydown", handleKeyDown);
    //         document.removeEventListener("hidden.bs.modal", handleModalHidden);
    //     };
    // }, [onScan]);

    // Barcode Scanner

    // useEffect(() => {
    //     const inputEl = scannerInputRef.current;
    //     if (!inputEl) return;

    //     const handleKeyDown = async (e) => {
    //         if (e.key !== "Enter") return;
    //         e.preventDefault();
    //         e.stopPropagation();
    //         console.log("e", e)
    //         const scannedCodeData = e.target.value.trim();
    //         console.log("scannedCodeData", scannedCodeData)
    //         if (!scannedCodeData) return;
    //         const action = getActionFromBarcode(scannedCodeData);
    //         console.log("action", action)
    //         await onScan(action);
    //         e.target.value = "";
    //     };

    //     // const handleBlur = () => {
    //     //     setTimeout(() => {
    //     //         inputEl.focus();
    //     //     }, 0);
    //     // };
    //     const handleBlur = () => {
    //         setTimeout(() => {
    //             const modalOpen = document.querySelector(".modal.show");
    //             if (modalOpen) return; // popup is open, don’t focus scanner
    //             inputEl.focus();
    //         }, 0);
    //     };

    //     inputEl.addEventListener("keydown", handleKeyDown);
    //     inputEl.addEventListener("blur", handleBlur);
    //     const handleModalHidden = () => {
    //         inputEl.focus();
    //     };
    //     document.addEventListener("hidden.bs.modal", handleModalHidden);

    //     // Initial focus
    //     inputEl.focus();

    //     return () => {
    //         inputEl.removeEventListener("keydown", handleKeyDown);
    //         inputEl.removeEventListener("blur", handleBlur);
    //         document.removeEventListener("hidden.bs.modal", handleModalHidden);
    //     };
    // }, [onScan]);

    // useEffect(() => {
    //     const inputEl = scannerInputRef.current;
    //     console.log("inputEl", inputEl)
    //     if (!inputEl) return;

    //     // Focus helper
    //     const focusInput = () => {
    //         const modalOpen = document.querySelector(".modal.show");
    //         if (!modalOpen) {
    //             inputEl.focus({ preventScroll: true });
    //         }
    //     };
    //     let isProcessing = false;
    //     // const handleKeyDown = async (e) => {
    //     //     console.log("e", e)
    //     //     // if (e.key !== "Enter") return;
    //     //     if (e.key !== "Enter" && e.key !== " ") return;
    //     //     if (isProcessing) return;

    //     //     e.preventDefault();
    //     //     e.stopPropagation();

    //     //     isProcessing = true;
    //     //     const scannedCodeData = inputEl.value.trim();
    //     //     console.log("Scanned Barcode:", scannedCodeData);
    //     //     if (!scannedCodeData) return;

    //     //     try {
    //     //         const action = getActionFromBarcode(scannedCodeData);
    //     //         console.log("action value:", action);
    //     //         await onScan(action);
    //     //     } catch (err) {
    //     //         console.error("Scan error:", err);
    //     //     }

    //     //     inputEl.value = ""; // clear after scan
    //     //     focusInput();       // refocus
    //     // };

    //     // 🔹 Refocus if blur

    //     // let isProcessing = false;

    //     // const handleKeyDown = async (e) => {
    //     //     if (e.key !== "Enter" && e.key !== " ") return;
    //     //     if (isProcessing) return;

    //     //     isProcessing = true;

    //     //     e.preventDefault();
    //     //     e.stopPropagation();

    //     //     const scannedCodeData = inputEl.value.trim();
    //     //     if (!scannedCodeData) {
    //     //         isProcessing = false;
    //     //         return;
    //     //     }

    //     //     try {
    //     //         const action = getActionFromBarcode(scannedCodeData);
    //     //         await onScan(action);
    //     //     } catch (err) {
    //     //         console.error("Scan error:", err);
    //     //     }

    //     //     inputEl.value = "";
    //     //     focusInput();

    //     //     // Small delay before allowing next scan
    //     //     setTimeout(() => {
    //     //         isProcessing = false;
    //     //     }, 100);
    //     // };


    //     let scanLock = false;

    //     const handleKeyDown = async (e) => {
    //         console.log("e", e)
    //         if (e.repeat) return;
    //         if (e.key !== "Enter" && e.key !== " ") return;
    //         if (scanLock) return;

    //         scanLock = true;

    //         e.preventDefault();
    //         e.stopPropagation();

    //         const scannedCodeData = inputEl.value.trim();
    //         console.log("scannedCodeData", scannedCodeData)
    //         if (!scannedCodeData) {
    //             scanLock = false;
    //             return;
    //         }

    //         try {
    //             const action = getActionFromBarcode(scannedCodeData);
    //             console.log("action", action)
    //             await onScan(action);
    //         } catch (err) {
    //             console.error(err);
    //         }

    //         inputEl.value = "";

    //         setTimeout(() => {
    //             scanLock = false;
    //             focusInput();
    //         }, 150);
    //     };


    //     const handleBlur = () => {
    //         setTimeout(() => {
    //             focusInput();
    //         }, 0);
    //     };

    //     // 🔹 Refocus when tab visible
    //     const handleVisibilityChange = () => {
    //         if (!document.hidden) {
    //             focusInput();
    //         }
    //     };

    //     // 🔹 Refocus when window regains focus
    //     const handleWindowFocus = () => {
    //         focusInput();
    //     };

    //     // 🔹 Refocus after bootstrap modal closes
    //     const handleModalHidden = () => {
    //         focusInput();
    //     };

    //     // Attach listeners
    //     inputEl.addEventListener("keydown", handleKeyDown);
    //     inputEl.addEventListener("blur", handleBlur);
    //     document.addEventListener("visibilitychange", handleVisibilityChange);
    //     window.addEventListener("focus", handleWindowFocus);
    //     document.addEventListener("hidden.bs.modal", handleModalHidden);

    //     // Initial focus
    //     focusInput();

    //     return () => {
    //         inputEl.removeEventListener("keydown", handleKeyDown);
    //         inputEl.removeEventListener("blur", handleBlur);
    //         document.removeEventListener("visibilitychange", handleVisibilityChange);
    //         window.removeEventListener("focus", handleWindowFocus);
    //         document.removeEventListener("hidden.bs.modal", handleModalHidden);
    //     };
    // }, [onScan]);

    useEffect(() => {
        let buffer = "";
        let lastKeyTime = 0;
        let scanLock = false;
        const SCAN_SPEED_THRESHOLD = 50;
        const SCAN_COMPLETE_DELAY = 100;
        const MIN_BARCODE_LENGTH = 3;

        let scanTimeout = null;

        const handleKeyDown = async (e) => {
            if (!e.key) return;
           
            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime;
            lastKeyTime = currentTime;

            // Ignore modifier keys
            if (["Shift", "Control", "Alt"].includes(e.key)) return;

            // Reset buffer if typing too slow (human typing)
            if (timeDiff > SCAN_SPEED_THRESHOLD) {
                buffer = "";
            }

            // Do NOT collect Enter
            if (e.key !== "Enter") {
                buffer += e.key;
            }

            if (scanTimeout) clearTimeout(scanTimeout);

            scanTimeout = setTimeout(async () => {
                const cleaned = buffer.trim();
                
                buffer = "";

                // ✅ Ignore empty or too short values
                if (!cleaned || cleaned.length < MIN_BARCODE_LENGTH) {
                    return;
                }

                if (scanLock) return;
                scanLock = true;

                try {
                    const action = getActionFromBarcode(cleaned);
                    await onScan(action?.toUpperCase());
                } catch (err) {
                    console.error("Scan error:", err);
                }

                setTimeout(() => {
                    scanLock = false;
                }, 150);
            }, SCAN_COMPLETE_DELAY);
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (scanTimeout) clearTimeout(scanTimeout);
        };
    }, [onScan]);


    // useEffect(() => {
    //     let buffer = "";
    //     let timeout = null;

    //     const handleKeyDown = async (e) => {
    //         // Ignore typing in inputs, textareas, modals
    //         console.log("e", e)
    //         const activeEl = document.activeElement;
    //         console.log("activeEl", activeEl)
    //         if (
    //             activeEl &&
    //             (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")
    //         ) return;

    //         if (timeout) clearTimeout(timeout);

    //         if (e.key === "Enter") {
    //             if (!buffer) return;

    //             const scannedCode = buffer.trim();
    //             buffer = "";

    //             const action = getActionFromBarcode(scannedCode);
    //             await onScan(action);
    //             return;
    //         }

    //         buffer += e.key;

    //         timeout = setTimeout(() => {
    //             buffer = "";
    //         }, 50);
    //     };

    //     document.addEventListener("keydown", handleKeyDown);

    //     return () => {
    //         document.removeEventListener("keydown", handleKeyDown);
    //     };
    // }, [onScan]);




    // useEffect(() => {
    //     const handleUnload = () => {
    //         sendPauseBeacon();
    //     };

    //     window.addEventListener("pagehide", handleUnload);
    //     window.addEventListener("beforeunload", handleUnload);

    //     return () => {
    //         window.removeEventListener("pagehide", handleUnload);
    //         window.removeEventListener("beforeunload", handleUnload);
    //     };
    // }, []);

    // const handlePauseTask = async () => {
    //     if (currentStatus !== "in_progress") return;
    //     const entity_id = JSON.parse(localStorage.getItem("selectedEntity"))?.id;
    //     const project_id = spoolDetails?.project?.id;

    //     try {
    //         await dispatch(
    //             pauseAndResumeTask({
    //                 entity_id,
    //                 project_id,
    //                 spool_id: spoolId,
    //                 stage_id: stageId,
    //                 action_type: "pause",
    //             })
    //         );
    //         await dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId }));
    //     } catch (err) {
    //         console.log("Auto pause failed", err);
    //     }
    // };

    // const sendPauseBeacon = async () => {
    //     if (currentStatus !== "in_progress") return;
    //     const entity_id = JSON.parse(localStorage.getItem("selectedEntity"))?.id;
    //     const project_id = spoolDetails?.project?.id;

    //     const payload = {
    //         entity_id,
    //         project_id,
    //         spool_id: spoolId,
    //         stage_id: stageId,
    //         action_type: "pause",
    //     };
    //     console.log("Hello", currentStatus)
    //     // await dispatch(
    //     //     pauseAndResumeTask({
    //     //         entity_id,
    //     //         project_id,
    //     //         spool_id: spoolId,
    //     //         stage_id: stageId,
    //     //         action_type: "pause",
    //     //     })
    //     // );
    //     // await dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId }));

    //     const blob = new Blob([JSON.stringify(payload)], {
    //         type: "application/json",
    //     });

    //     navigator.sendBeacon("https://pipespool.tgastaging.com/api/pause_or_resume_task", blob);
    // };


    // useEffect(() => {
    //     const handleVisibilityChange = () => {
    //         if (document.visibilityState === "hidden") {
    //             handlePauseTask(); // works
    //         }
    //     };

    //     const handleUnload = () => {
    //         sendPauseBeacon(); // works for close/refresh/back
    //     };

    //     document.addEventListener("visibilitychange", handleVisibilityChange);
    //     window.addEventListener("beforeunload", handleUnload);
    //     window.addEventListener("pagehide", handleUnload);

    //     return () => {
    //         document.removeEventListener("visibilitychange", handleVisibilityChange);
    //         window.removeEventListener("beforeunload", handleUnload);
    //         window.removeEventListener("pagehide", handleUnload);
    //     };
    // }, [currentStatus, spoolId, stageId, spoolDetails]);


    // const handlePauseTask = async () => {
    //     if (currentStatus !== "in_progress") return;

    //     try {
    //         await dispatch(pauseAndResumeTask({
    //             entity_id,
    //             project_id,
    //             spool_id: spoolId,
    //             stage_id: stageId,
    //             action_type: "pause",
    //         }));
    //         await dispatch(fetchSpoolsDrawing({
    //             spool_id: spoolId,
    //             stage_id: stageId,
    //         }));
    //     } catch (err) {
    //         console.log("Auto pause failed", err);
    //     }
    // };


    const handleReportIssueSubmit = async (reason) => {
        if (!reason || reason.trim().length === 0) {
            toast.error("Please enter the issue description")
            return
        }
        const project_assign_id = JSON.parse(localStorage.getItem('project_assign_id'))
        if (currentStatus === 'in_progress' || currentStatus === 'paused' && currentStatus !== 'ready_to_start') {
            await dispatch(reportTask({
                project_assign_id: pauseId || project_assign_id,
                reason: reason,
            }))
            dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId }))
            localStorage.removeItem('project_assign_id');
            setPauseId(null)
            const modalEl = document.getElementById("reported-issue-popup");
            const modalInstance = window.bootstrap?.Modal.getInstance(modalEl);
            modalInstance?.hide();
        } else {
            toast.error('You need to start a task first!')
        }
    }
    const handlePdfDownload = (pdf) => {
        if (!pdf) return;
        const pdfUrl = `${imagebaseUrl}${pdf}`;
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
    };
    return (
        <>
            <div className="page-wrapper">
                <Header />
                <main className="spools-page">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <div className="page-heading">
                                    <h1><i className="hgi hgi-stroke hgi-folder-02" style={{ color: background }}></i> {spoolDetails?.project?.project_name}</h1>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                                <div className="page-search">
                                    <Link onClick={(e) => {
                                        e.preventDefault();
                                        navigate(-1)
                                    }} className="back-cta">
                                        <img src="/images/projects/arrow-left.svg" alt="" /> Back to Spools
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="spool-strip-wrp">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6 col-md-9">
                                    <div className="spool-strip-details">
                                        <p>Spool Number <b>{spoolDetails?.spool_drawing?.spool_number}</b></p>
                                        <p>Current Stage <b>{spoolDetails?.stage_barcode?.stage_name}</b></p>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-3">
                                    <div className="spool-strip-stat-report">
                                        <p>Status:</p>
                                        {STATUS_CONFIG[currentStatus] && (
                                            !isTablet && <div className={`status-tag ${STATUS_CONFIG[currentStatus]?.className}`}>
                                                <i className={`hgi hgi-stroke ${STATUS_CONFIG[currentStatus]?.icon}`}></i>
                                                {STATUS_CONFIG[currentStatus]?.label}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            data-bs-toggle={currentStatus === "in_progress" || spoolDetails?.flag_status === 'open' ? undefined : "modal"}
                                            data-bs-target={currentStatus === "in_progress" || spoolDetails?.flag_status === 'open' ? undefined : "#issue-info-popup"}
                                            onClick={() => {
                                                if (currentStatus !== "in_progress" || spoolDetails?.flag_status === 'open') {
                                                    setShowReportIssue(true);
                                                }
                                            }}
                                            disabled={currentStatus === "in_progress" || spoolDetails?.flag_status === 'open'}
                                            className="status-tag"
                                            style={
                                                currentStatus === "in_progress" || spoolDetails?.flag_status === 'open'
                                                    ? {
                                                        backgroundColor: "#ffffff",
                                                        color: "#999999",
                                                        border: "1px solid #e0e0e0",
                                                        cursor: "not-allowed",
                                                        opacity: 0.7,
                                                    }
                                                    : {}
                                            }
                                        >
                                            <i
                                                className="hgi hgi-stroke hgi-alert-01"
                                                style={
                                                    currentStatus === "in_progress" || spoolDetails?.flag_status === 'open'
                                                        ? { color: "#999999" }
                                                        : {}
                                                }
                                            ></i>
                                            {" "}Report Issue
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="drawing-wrp">
                                    {/* <!-- DESKTOP --> */}
                                    <div className="bar-code-wrp">
                                        <input
                                            // id="scannerInput"
                                            ref={scannerInputRef}
                                            autoFocus
                                            style={{ position: "absolute", left: "-1000px", top: "-1000px" }}
                                        />
                                        <div className="bar-code-in">
                                            <p>Scan to Start & Complete</p>
                                            <img src={`${currentStatus === 'ready_to_start' ? imagebaseUrl + spoolDetails?.stage_barcode?.start_barcode : imagebaseUrl + spoolDetails?.stage_barcode?.end_barcode}`} alt="" />
                                        </div>
                                        <div className="bar-code-in" >
                                            <p>Scan to Pause & Resume</p>
                                            <img src={`${currentStatus === 'paused' ? imagebaseUrl + spoolDetails?.spool_drawing?.resume_barcode : imagebaseUrl + spoolDetails?.spool_drawing?.pause_barcode}`} alt="" />
                                        </div>
                                    </div>
                                    {/* <!-- DESKTOP --> */}
                                    {/* <!-- MOBILE-TAB --> */}
                                    <div className="drow-status-cta-wrp">
                                        <div className="drow-status-in">
                                            <p>Status:<b> {STATUS_CONFIG[currentStatus]?.label}</b></p>
                                        </div>
                                        <div className="drow-cta-grp">
                                            {
                                                currentStatus === 'ready_to_start' ? (
                                                    <button type="button" className="btn-1" data-bs-target="#stage-start-popup"
                                                        data-bs-toggle="modal" onClick={() => setType('START')}>
                                                        <div className="start active">
                                                            <i className="hgi hgi-stroke hgi-play"></i>
                                                            Ready to Start
                                                        </div>
                                                    </button>
                                                ) :
                                                    (<button type="button" className="btn-1" data-bs-target="#stage-start-popup"
                                                        data-bs-toggle="modal" onClick={() => setType('END')}>
                                                        <div className="complete active">
                                                            <i className="hgi hgi-stroke hgi-checkmark-circle-01"></i>
                                                            Mark as Complete
                                                        </div>
                                                    </button>)
                                            }
                                            {
                                                currentStatus === 'paused' ? (
                                                    <button type="button" className="btn-2" onClick={() => setType('RESUME')} data-bs-target="#stage-start-popup"
                                                        data-bs-toggle="modal">
                                                        <div className="resume active">
                                                            <i className="hgi hgi-stroke hgi-play"></i>
                                                            Resume
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <button type="button" className="btn-2" onClick={() => setType('PAUSE')} data-bs-target="#stage-start-popup"
                                                        data-bs-toggle="modal">
                                                        <div className="pause active">
                                                            <i className="hgi hgi-stroke hgi-pause"></i>
                                                            Pause
                                                        </div>
                                                    </button>
                                                )
                                            }
                                        </div>
                                    </div>
                                    {/* <!-- MOBILE-TAB --> */}
                                    <div className="drawing-frame" >
                                        <div className="drawing-frame-data" >
                                            <div className="icon" style={{ background: background }} onClick={() => handlePdfDownload(spoolDetails?.spool_drawing?.drawing)}><i className="hgi hgi-stroke hgi-file-01" ></i></div>
                                            <h3>PDF spool drawing would be embedded here</h3>
                                            <p>Drawing remains visible until stage is completed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <IssueInfoPopup show={showReportIssue} handleClose={() => setShowReportIssue(false)} onSubmit={handleReportIssueSubmit} />
            <StartPopup type={type} onScan={onScan} />
            {/* <ReportedIssuePopup onSubmit={handleReportIssueSubmit} /> */}
        </>
    )
}

export default React.memo(DrawingSpool)