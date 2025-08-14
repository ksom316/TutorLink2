import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Homepage.css'; // Use this for all styles
import './Navbar.css'

function Tutorlink() {
  const navigate = useNavigate();

  const scrollToBottom = () => {
    const bottomSection = document.getElementById('bottom-section');
    if (bottomSection) {
      bottomSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
    <Navbar>
      <div className="navbar-content">
        <h2 className="navbar-title">TutorLink</h2>
        <div className="navbar-buttons">
          <button className="navbar-login " onClick={() => navigate('/Login')}>Login</button>
          <button className="navbar-signup" onClick={() => navigate('/SignUp')}>Sign Up</button>
        </div>
      </div>
    </Navbar>

    <div className='main-content'>
      <div className='land'>
      <div className="landing-header">
        <div className="header-content">
          <h1>
            Unlock Your Potential with <div style={{color: "orange"}}>TutorLink</div>
          </h1>
          <p>
            Connect with your academic tutor, get personalized guidance, and achieve your learning goals.
            Connect as a tutor to guide your students through their academic journey.
          </p>
          <div className="cta-buttons">
            <button className="find-tutor-btn" onClick={() => navigate('/Login')}>
              Login
            </button>
            <button className="learn-more-btn" onClick={scrollToBottom}>
              Learn More
            </button>
          </div>
        </div>
        {/* <div className="header-image">
          <img src="/assets/bg.jpg" alt="Sea and Rock" />
        </div> */}
      </div>

      <div className="why-choose">
        <h2>Why Choose TutorLink?</h2>
        <p>We provide the tools and connections you need to succeed.</p>
        <div className="features">
          
          <div className="feature-card">
            <h3>👨‍🏫 Chat Feature</h3>
            <p>Chat as a student and have a conversation with your academic tutor. Chat as a lecturer with a Bot Assistant that can automatically reply some messages

            </p>
          </div>
          <div className="feature-card" style={{height: "275px"}}>
            <h3>📘Flexible Meetings</h3>
            <p>Book sessions with your academic partner that fit your schedule with easy calendar integration.</p>
          </div>
        </div>
      </div>

      <div className="bottom-section" id="bottom-section">
        <h2>Ready to Use Tutorlink?</h2>
        <p>Join us today and take the next step in your educational journey.</p>
        <button className="sign-up-btn" onClick={() => navigate('/SignUp')}>
          Sign Up →
        </button>
      </div>

      <footer className="footer1">
        <p>© {new Date().getFullYear()} TutorLink. All rights reserved.</p>
      </footer>
      </div>
          </div>
      

      
    </>
  );
}

export default Tutorlink;
