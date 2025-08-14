import React from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import '../Homepage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function Offcanvas1() {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
            <div className="offcanvas-header dashboard-title">
                <h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel">TUTORLINK PORTAL</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>

            <div className="offcanvas-body">
                <div
                    className={`dashboard-items ${isActive('/LecturerHome') ? 'active-page' : ''}`}
                    onClick={() => navigate('/LecturerHome')}
                >
                    Home
                </div>

                <div
                    className={`dashboard-items ${isActive('/KnowYourStudents') ? 'active-page' : ''}`}
                    onClick={() => navigate('/KnowYourStudents')}
                >
                    Know Your Students
                </div>

                <div
                    className={`dashboard-items ${isActive('/ChatWithStudents') ? 'active-page' : ''}`}
                    onClick={() => navigate('/ChatWithStudents')}
                >
                    Chat with Your Students
                </div>

                <div
                    className={`dashboard-items ${isActive('/LecturerMeeting') ? 'active-page' : ''}`}
                    onClick={() => navigate('/LecturerMeeting')}
                >
                    Schedule Meeting
                </div>

                <div
                    className={`dashboard-items ${isActive('/LecturerCalendar') ? 'active-page' : ''}`}
                    onClick={() => navigate('/LecturerCalendar')}
                >
                    Calendar
                </div>
{/* 
                <div
                    className={`dashboard-items ${isActive('/Notification') ? 'active-page' : ''}`}
                    onClick={() => navigate('/Notification')}
                >
                    Notifications
                </div> */}
{/* 
                <div
                    className={`dashboard-items ${isActive('/ProjectSupervisor') ? 'active-page' : ''}`}
                    onClick={() => navigate('/ProjectSupervisor')}
                >
                    Project Supervising
                </div> */}

                <div
                    className={`dashboard-items ${isActive('/LecturerSchedules') ? 'active-page' : ''}`}
                    onClick={() => navigate('/LecturerSchedules')}
                >
                    Schedules
                </div>
            </div>
        </div>
    );
}

export default Offcanvas1;
