import React from 'react'

const CompletePopup = () => {
  return (
     <>
     <div className="modal fade other-popup" id="stage-start-popup" tabindex="-1" aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                    <i className="hgi hgi-stroke hgi-cancel-01"></i>
                </button>
                <div className="modal-body">
                    <div className="other-popup-in">
                        <div className="other-popup-icon">
                            <i className="hgi hgi-stroke hgi-play"></i>
                        </div>
                        <div className="other-popup-data">
                            <h1>Stage Start</h1>
                            <p className="text-center">Are you sure you want to start this stage?</p>
                        </div>
                        <div className="other-popup-cta-grp">
                            <button type="button" className="primary-cta non-active" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" className="primary-cta" data-bs-dismiss="modal">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
     </>
  )
}

export default React.memo(CompletePopup)
