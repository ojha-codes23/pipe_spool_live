import React, { useEffect, useState } from 'react'



const ReportedIssuePopup = ({ handleSubmit }) => {
    
    const [them, setThem] = useState('')
     const [reportText, setReportText] = useState("")

    useEffect(() => {
        const themColor = JSON.parse(localStorage.getItem('selectedEntity'));
        setThem(themColor?.entity_secondary_color)
        
    }, []);
    const background = them;
   

    return (
        <>
            <div className="modal fade other-popup" id="reported-issue-popup" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            <i className="hgi hgi-stroke hgi-cancel-01"></i>
                        </button>
                        <div className="modal-body">
                            <div className="other-popup-in">
                                <div className="other-popup-icon" style={{ background: background }}>
                                    <i className="hgi hgi-stroke hgi-alert-01" style={{ color: background && "white" }}></i>
                                </div>
                                <div className="other-popup-data mb-0">
                                    <h1>Report an Issue</h1>
                                    <p>This will automatically flag the spool for admin review</p>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSubmit(reportText);
                                        }}
                                        className="mt-3">
                                        <textarea
                                            value={reportText}
                                            onChange={(e) => setReportText(e.target.value)}
                                            placeholder="Describe the issue with this spool, stage, or any concerns..."></textarea>
                                        <div className="other-popup-cta-grp mt-2">
                                            <button type="button" className="primary-cta non-active"
                                                data-bs-dismiss="modal" style={{ borderColor: background, color: background }}>Cancel</button>
                                            <button className="primary-cta">Submit & Flag</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default React.memo(ReportedIssuePopup)