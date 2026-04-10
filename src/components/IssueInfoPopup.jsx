import React, { useEffect, useState } from 'react'
import ReportedIssuePopup from './ReportedIssuePopup'

const IssueInfoPopup = ({ onSubmit }) => {
    // const background = useSelector((state) => state.entity.primaryColor);
      const [them, setThem] = useState('')
      const background = them;
    
      useEffect(() => {
        const themColor = JSON.parse(localStorage.getItem('selectedEntity'));
        setThem(themColor?.entity_secondary_color)
        // console.log("them", them?.entity_primary_color)
      }, []);
      

    return (
        <>
            <div className="modal fade other-popup" id="issue-info-popup" tabIndex="-1" aria-hidden="true">
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
                                    <p className="text-center">Reporting an issue will pause this spool immediately. No further work
                                        can continue until
                                        the issue is reviewed and cleared by an administrator. Do you wish to continue?</p>
                                    <form action="" className="mt-3">
                                        <div className="other-popup-cta-grp mt-2">
                                            <button type="button" className="primary-cta" data-bs-toggle="modal"
                                                data-bs-dismiss="modal" data-bs-target="#reported-issue-popup">Proceed</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ReportedIssuePopup handleSubmit={onSubmit} />
        </>
    )
}

export default React.memo(IssueInfoPopup)
