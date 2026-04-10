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


    useEffect(() => {
        if (initialId) {
            dispatch(fetchSpools({ spool_id: initialId }))
        }
    }, [initialId]);

    useEffect(() => {
        if (spoolData) {
            setSpools(spoolData?.spool_number)
            setAllStages(spoolData?.spool_stages)
        }
    }, [spoolData])

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
                                                {allStages?.map((item, index) => (
                                                    <tr key={item?.id || index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item?.stage_name}</td>
                                                        <td>
                                                            {item?.status === "completed"
                                                                ? "Done"
                                                                : item?.status
                                                                    ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                                                                    : ""}
                                                        </td>

                                                        <td>
                                                            {item?.current_status !== "-" ? (
                                                                <div className={`status-tag ${STATUS_CONFIG[item?.current_status]?.className}`}>
                                                                    <i className={`hgi hgi-stroke ${STATUS_CONFIG[item?.current_status]?.icon}`}></i>
                                                                    {STATUS_CONFIG[item?.current_status]?.label}
                                                                </div>)
                                                                :
                                                                (<>-</>)
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
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