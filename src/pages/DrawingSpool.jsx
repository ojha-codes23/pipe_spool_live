import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import IssueInfoPopup from '../components/IssueInfoPopup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import StartPopup from '../components/StartPopup'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSpoolsDrawing, resetSpoolDrawingDetails } from '../redux/slice/spoolSlice'
import { pauseAndResumeTask, reportTask, startAndComplateTask } from '../redux/slice/taskSlice'
import { toast } from 'react-hot-toast'
const imagebaseUrl = import.meta.env.VITE_IMAGE_URL;

const getActionFromBarcode = (code) => {
    if (!code) return { action: null, subStageId: null };

    let subStageId = null;
    const subStageMatch = code.match(/substage_(\d+)/i);
    if (subStageMatch) {
        subStageId = parseInt(subStageMatch[1], 10);
    }

    let action = null;

    // Safely match the action keyword exactly, avoiding substrings like 'END' in 'backend'
    const actionMatch = code.match(/(START|END|COMPLETE|PAUSE|RESUME)(?:\.\w+)?$/i);
    if (actionMatch) {
        action = actionMatch[1].toUpperCase();
    } else {
        // Fallback for custom formats like SP-001|COMPLETE
        action = code.split("|").pop().split("-").pop().toUpperCase();
    }

    if (action === 'COMPLETE') {
        action = 'END';
    } else if (!["START", "END", "PAUSE", "RESUME"].includes(action)) {
        // Last resort strict boundary check
        const strictMatch = code.match(/\b(START|END|COMPLETE|PAUSE|RESUME)\b/i);
        if (strictMatch) {
            action = strictMatch[1].toUpperCase();
            if (action === 'COMPLETE') action = 'END';
        } else {
            action = null; // Unrecognized format
        }
    }

    return { action, subStageId };
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
    const { stage_id, spool_id, sub_stage_id } = location?.state || {};
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
    const [subStageid, setSubStageid] = useState(null || sub_stage_id)
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

    const onScan = async (eventCall, subStageIdFromScanner = null) => {
        try {
            const entity_id = JSON.parse(localStorage.getItem('selectedEntity'))?.id
            const project_id = spoolDetails?.project?.id
            const spool_id = spoolId
            const stage_id = stageId
            const activeSubStageId = subStageIdFromScanner || subStageid;

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
                            ...(activeSubStageId && { sub_stage_id: activeSubStageId }),
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
                            ...(activeSubStageId && { sub_stage_id: activeSubStageId }),
                            action_type: 'complete'
                        }))
                    } else {
                        toast.error('Your task is not in progress!')
                    }
                }
                const data = await dispatch(fetchSpoolsDrawing({
                    spool_id: spoolId, stage_id: stageId, sub_stage_id: subStageid || null
                }));
                if (data?.payload?.data?.stage_barcode?.stage_status === 'completed') {
                    if (subStageid) {
                        setSubStageid(null)
                    } else {
                        setStageId(null)
                    }
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
                            ...(activeSubStageId && { sub_stage_id: activeSubStageId }),
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
                            ...(activeSubStageId && { sub_stage_id: activeSubStageId }),
                            action_type: 'resume'
                        }))
                    } else {
                        toast.error('Your task is already in progress!')
                    }
                }
                const data = await dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId, sub_stage_id: activeSubStageId || null }));
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

    useEffect(() => {
        const fetchData = async () => {
            if (spoolId && stageId) {
                try {
                    await dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId, sub_stage_id: subStageid || null })).unwrap();
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
    useEffect(() => {
        let buffer = "";
        let lastKeyTime = 0;
        let scanLock = false;
        const SCAN_SPEED_THRESHOLD = 200;
        const SCAN_COMPLETE_DELAY = 100;
        const MIN_BARCODE_LENGTH = 1;

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
                    const parsed = getActionFromBarcode(cleaned);
                    if (!parsed.action || !["START", "END", "PAUSE", "RESUME"].includes(parsed.action)) {
                        if (cleaned.length >= 6) {
                            toast.error("Unrecognized barcode format: " + cleaned);
                        }
                        return;
                    }
                    await onScan(parsed.action, parsed.subStageId);
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
            // await dispatch(reportTask({
            //     project_assign_id: pauseId || project_assign_id,
            //     sub_stage_assign_id: subStageId? subStageIdproject_assign_id : null,
            //     reason: reason,
            // }))
            await dispatch(
                reportTask({
                    ...(subStageid
                        ? { sub_stage_assign_id: project_assign_id || pauseId || spoolDetails?.stage_barcode?.id }
                        : { project_assign_id: project_assign_id || pauseId || spoolDetails?.stage_barcode?.id }),
                    reason,
                })
            );

            dispatch(fetchSpoolsDrawing({ spool_id: spoolId, stage_id: stageId, sub_stage_id: subStageid || null }))
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
                    <div className="container-fluid">
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
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-6 col-md-9">
                                    <div className="spool-strip-details">
                                        <p>Spool Number <b>{spoolDetails?.spool_drawing?.spool_number}</b></p>
                                        <p>Current Stage <b>{subStageid ? spoolDetails?.stage_barcode?.sub_stage_name : spoolDetails?.stage_barcode?.stage_name}</b></p>
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
                    <div className="container-fluid">
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
                                            <img src={`${imagebaseUrl}${currentStatus === 'ready_to_start' ? (spoolDetails?.stage_barcode?.start_barcode || spoolDetails?.spool_drawing?.start_barcode) : (spoolDetails?.stage_barcode?.end_barcode || spoolDetails?.spool_drawing?.end_barcode)}`} alt="" />
                                        </div>
                                        <div className="bar-code-in" >
                                            <p>Scan to Pause & Resume</p>
                                            <img src={`${imagebaseUrl}${currentStatus === 'paused' ? (spoolDetails?.stage_barcode?.resume_barcode || spoolDetails?.spool_drawing?.resume_barcode) : (spoolDetails?.stage_barcode?.pause_barcode || spoolDetails?.spool_drawing?.pause_barcode)}`} alt="" />
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