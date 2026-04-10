import React, { useEffect, useState } from "react";

const StartPopup = ({ type, onScan }) => {
  const [them, setThem] = useState('')

  useEffect(() => {
    const themColor = JSON.parse(localStorage.getItem('selectedEntity'));
    setThem(themColor?.entity_secondary_color)
  }, []);
  const background = them;

  return (
    <>
      <div
        className="modal fade other-popup"
        id="stage-start-popup"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i className="hgi hgi-stroke hgi-cancel-01"></i>
            </button>
            <div className="modal-body">
              <div className="other-popup-in">
                <div className="other-popup-icon">
                  {type === "START" && (
                    <i className="hgi hgi-stroke hgi-play"></i>
                  )}
                  {type === "PAUSE" && (
                    <i className="hgi hgi-stroke hgi-pause"></i>
                  )}
                  {type === "RESUME" && (
                    <i className="hgi hgi-stroke hgi-play"></i>
                  )}
                  {type === "END" && (
                    <i className="hgi hgi-stroke hgi-checkmark-circle-01"></i>
                  )}
                </div>
                <div className="other-popup-data">
                  {type === "START" && (
                    <>
                      <h1>Stage Start</h1>
                      <p className="text-center">
                        Are you sure you want to start this stage?
                      </p>
                    </>
                  )}
                  {type === "END" && (
                    <>
                      <h1>Stage Completed</h1>
                      <p className="text-center">
                        Are you sure you want to complete this stage?
                      </p>
                    </>
                  )}
                  {type === "PAUSE" && (
                    <>
                      <h1>Stage Pause</h1>
                      <p className="text-center">
                        Are you sure you want to pause this stage?
                      </p>
                    </>
                  )}
                  {type === "RESUME" && (
                    <>
                      <h1>Stage Resume</h1>
                      <p className="text-center">
                        Are you sure you want to resume this stage?
                      </p>
                    </>
                  )}
                </div>
                <div className="other-popup-cta-grp">
                  <button
                    type="button"
                    className="primary-cta non-active"
                    data-bs-dismiss="modal"
                    style={{ color: background, borderColor: background }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-cta"
                    data-bs-dismiss="modal"
                    onClick={() => onScan(type)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(StartPopup);
