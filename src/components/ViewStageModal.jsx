import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpools } from '../redux/slice/spoolSlice';

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

const ViewStageModal = ({ initialId }) => {
    const dispatch = useDispatch();
    const modalRef = useRef(null);

    const { spoolData } = useSelector((state) => state.spools)
    const [allStages, setAllStages] = useState([]);
    const [spools, setSpools] = useState(null)


    const [expandedStages, setExpandedStages] = useState({});

    useEffect(() => {
        if (initialId) {
            dispatch(fetchSpools({ spool_id: initialId }))
        }
    }, [initialId]);

    useEffect(() => {
        if (spoolData) {
            const spoolObj = spoolData?.spools ? spoolData.spools[0] : spoolData;
            setSpools(spoolObj?.spool_number)

            const stages = spoolObj?.spool_stages || spoolObj?.parallel_stages || [];
            setAllStages(stages)

            const initialExpanded = {};
            stages.forEach((stage, index) => {
                const stageId = stage?.stage_id || stage?.id || index;
                if (stage?.sub_stages && stage.sub_stages.length > 0) {
                    initialExpanded[stageId] = true;
                }
            });
            setExpandedStages(initialExpanded);
        }
    }, [spoolData])

    const toggleStage = (stageId) => {
        setExpandedStages(prev => ({
            ...prev,
            [stageId]: !prev[stageId]
        }));
    };

    useEffect(() => {
        const modalEl = modalRef.current;
        if (!modalEl) return;

        const handleShown = () => {
            const modalBody = modalEl.querySelector(".modal-body");
            if (modalBody) modalBody.scrollTop = 0;
        };

        // Listen to Bootstrap event on this modal
        modalEl.addEventListener("shown.bs.modal", handleShown);

        return () => {
            modalEl.removeEventListener("shown.bs.modal", handleShown);
        };
    }, []);


    console.log("spoolData", spoolData)



    return (
        <>
            <div className="modal fade other-popup" id="view-stages-popup" ref={modalRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            <i className="hgi hgi-stroke hgi-cancel-01"></i>
                        </button>
                        <div className="modal-body">
                            <div className="view-stages-popup-in">
                                <h1>{spools}</h1>
                                <p>Stage progress and workflow.</p>
                                <div className="view-stages-popup-in-table">
                                    <div className="table-responsive">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Stage</th>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Current Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allStages?.map((item, index) => {
                                                    const stageId = item?.stage_id || item?.id || index;
                                                    const hasSubStages = item?.sub_stages && item.sub_stages.length > 0;
                                                    const isExpanded = expandedStages[stageId];

                                                    return (
                                                        // <React.Fragment key={stageId}>
                                                        //     <tr>
                                                        //         <td>
                                                        //             {hasSubStages ? (
                                                        //                 <button 
                                                        //                     type="button" 
                                                        //                     style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '5px' }}
                                                        //                     onClick={() => toggleStage(stageId)}
                                                        //                 >
                                                        //                     <i className={`hgi hgi-stroke ${isExpanded ? 'hgi-arrow-down-01' : 'hgi-arrow-right-01'}`}></i>
                                                        //                 </button>
                                                        //             ) : null}
                                                        //             {index + 1}
                                                        //         </td>
                                                        //         <td>{item?.stage_name}</td>   
                                                        //         <td>
                                                        //             {item?.status === "completed"
                                                        //                 ? "Done"
                                                        //                 : item?.status
                                                        //                     ? item.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
                                                        //                     : ""}
                                                        //         </td>

                                                        //         <td>
                                                        //             {item?.current_status && item?.current_status !== "-" ? (
                                                        //                 <div className={`status-tag ${STATUS_CONFIG[item?.current_status]?.className}`}>
                                                        //                     <i className={`hgi hgi-stroke ${STATUS_CONFIG[item?.current_status]?.icon}`}></i>
                                                        //                     {STATUS_CONFIG[item?.current_status]?.label}
                                                        //                 </div>)
                                                        //                 :
                                                        //                 (<>-</>)
                                                        //             }
                                                        //         </td>
                                                        //     </tr>
                                                        //     {hasSubStages && isExpanded && (
                                                        //         <tr className="sub-stages-row">
                                                        //             <td colSpan="4" style={{ padding: '0', background: '#f8f9fa' }}>
                                                        //                 <div style={{ padding: '10px 20px', borderLeft: '3px solid #ccc' }}>
                                                        //                     <table style={{ width: '100%', marginBottom: 0, background: 'transparent' }}>
                                                        //                         <thead>
                                                        //                             <tr>
                                                        //                                 <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Sub Stage</th>
                                                        //                                 <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                                                        //                             </tr>
                                                        //                         </thead>
                                                        //                         <tbody>
                                                        //                             {item.sub_stages.map((sub, subIndex) => (
                                                        //                                 <tr key={sub.sub_stage_id || subIndex} style={{ borderBottom: '1px solid #eee' }}>
                                                        //                                     <td style={{ width: '50%', padding: '8px' }}>
                                                        //                                         <i className="hgi hgi-stroke hgi-corner-down-right" style={{ marginRight: '10px', color: '#666' }}></i>
                                                        //                                         {sub.sub_stage_name}
                                                        //                                     </td>
                                                        //                                     <td style={{ padding: '8px' }}>
                                                        //                                         {sub.status === "completed" 
                                                        //                                             ? "Done" 
                                                        //                                             : sub.status 
                                                        //                                                 ? sub.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) 
                                                        //                                                 : "-"}

                                                        //                                         {sub.current_status && sub.current_status !== "-" && (
                                                        //                                             <span style={{ marginLeft: '10px' }} className={`status-tag ${STATUS_CONFIG[sub.current_status]?.className || ''}`}>
                                                        //                                                 {STATUS_CONFIG[sub.current_status]?.label || sub.current_status}
                                                        //                                             </span>
                                                        //                                         )}
                                                        //                                     </td>
                                                        //                                 </tr>
                                                        //                             ))}
                                                        //                         </tbody>
                                                        //                     </table>
                                                        //                 </div>
                                                        //             </td>
                                                        //         </tr>
                                                        //     )}
                                                        // </React.Fragment>
                                                        <React.Fragment key={stageId}>
                                                            {/* Main Stage Row */}
                                                            <tr>
                                                                <td>

                                                                    {index + 1}
                                                                </td>
                                                                <td>{item?.stage_name}

                                                                    {hasSubStages && (
                                                                        <button
                                                                            type="button"
                                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: '5px' }}
                                                                            onClick={() => toggleStage(stageId)}
                                                                        >
                                                                            <i
                                                                                className={`hgi hgi-stroke ${isExpanded ? 'hgi-arrow-down-01' : 'hgi-arrow-right-01'}`}
                                                                                style={{
                                                                                    display: 'inline-block',
                                                                                    transform: 'translateY(5px)'
                                                                                }}
                                                                            ></i>
                                                                        </button>
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {item?.status === "completed"
                                                                        ? "Done"
                                                                        : item?.status
                                                                            ? item.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
                                                                            : "-"}
                                                                </td>
                                                                <td>
                                                                    {item?.current_status && item?.current_status !== "-" ? (
                                                                        <div className={`status-tag ${STATUS_CONFIG[item?.current_status]?.className || ''}`}>
                                                                            <i className={`hgi hgi-stroke ${STATUS_CONFIG[item?.current_status]?.icon || ''}`}></i>
                                                                            {STATUS_CONFIG[item?.current_status]?.label}
                                                                        </div>
                                                                    ) : (
                                                                        <>-</>
                                                                    )}
                                                                </td>
                                                            </tr>

                                                            {/* Nested Sub-stages Section */}


                                                            {hasSubStages && isExpanded && item?.sub_stages?.map((sub, subIndex) => (
                                                                <tr key={sub.sub_stage_id || subIndex} className="sub-stage-row" style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                                                                    {/* Column 1: S.No Alignment (Blank / Indented Icon) */}
                                                                    <td style={{ padding: '8px 8px 8px 30px' }}>
                                                                        <i className="hgi hgi-stroke hgi-corner-down-right" style={{ marginRight: '6px', color: '#666' }}></i>
                                                                        {/* {index + 1}.{subIndex + 1} */}
                                                                    </td>

                                                                    {/* Column 2: Stage Name Column Alignment */}
                                                                    <td style={{ padding: '8px', fontWeight: '500' }}>
                                                                        {sub.sub_stage_name}
                                                                    </td>

                                                                    {/* Column 3: Status Column Alignment */}
                                                                    <td style={{ padding: '8px' }}>
                                                                        {sub.status === "completed"
                                                                            ? "Done"
                                                                            : sub.status
                                                                                ? sub.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
                                                                                : "-"}
                                                                    </td>

                                                                    {/* Column 4: Current Status Column Alignment */}
                                                                    <td style={{ padding: '8px' }}>
                                                                        {sub.current_status && sub.current_status !== "-" ? (
                                                                            <div className={`status-tag ${STATUS_CONFIG[sub.current_status]?.className || ''}`}>
                                                                                {STATUS_CONFIG[sub.current_status]?.icon && (
                                                                                    <i className={`hgi hgi-stroke ${STATUS_CONFIG[sub.current_status]?.icon}`}></i>
                                                                                )}
                                                                                {STATUS_CONFIG[sub.current_status]?.label || sub.current_status}
                                                                            </div>
                                                                        ) : (
                                                                            "-"
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}



                                                        </React.Fragment>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default React.memo(ViewStageModal)