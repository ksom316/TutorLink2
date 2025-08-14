import React from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import './Homepage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function Offcanvas() {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
            <div className="offcanvas-header dashboard-title">
                <h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel">TUTORLINK PORTAL</h5>
                <button type="button" className="btn-close bg-primary" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>

            <div className="offcanvas-body">
                <div
                    className={`dashboard-items ${isActive('/Homepage') ? 'active-page' : ''}`}
                    onClick={() => navigate('/Homepage')}
                >
                    Home
                </div>

                <div
                    className={`dashboard-items ${isActive('/KnowYourTutor') ? 'active-page' : ''}`}
                    onClick={() => navigate('/KnowYourTutor')}
                >
                    Know Your Academic Tutor
                </div>

                <div
                    className={`dashboard-items ${isActive('/Chat') ? 'active-page' : ''}`}
                    onClick={() => navigate('/Chat')}
                >
                    Chat with Your Academic Tutor
                </div>

                <div
                    className={`dashboard-items ${isActive('/ScheduleMeeting') ? 'active-page' : ''}`}
                    onClick={() => navigate('/ScheduleMeeting')}
                >
                    Schedule Meeting
                </div>

                <div
                    className={`dashboard-items ${isActive('/Calendar') ? 'active-page' : ''}`}
                    onClick={() => navigate('/Calendar')}
                >
                    Calendar
                </div>

                {/* <div
                    className={`dashboard-items ${isActive('/Notification') ? 'active-page' : ''}`}
                    onClick={() => navigate('/Notification')}
                >
                    Notifications
                </div> */}

                {/* <div
                    className={`dashboard-items ${isActive('/ProjectSupervisor') ? 'active-page' : ''}`}
                    onClick={() => navigate('/ProjectSupervisor')}
                >
                    Project Supervisor
                </div> */}

                <div
                    className={`dashboard-items ${isActive('/Schedules') ? 'active-page' : ''}`}
                    onClick={() => navigate('/Schedules')}
                >
                    Schedules
                </div>
            </div>
        </div>
    );
}

export default Offcanvas;
