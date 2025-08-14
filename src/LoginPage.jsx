// LoginPage.jsx
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import tutorLink from './assets/tutorLink.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css'

function LoginPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalStep, setModalStep] = useState('Question1');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isOpen]);

  return (
    <>
      <Navbar>
        <h2 style={{ color: 'rgb(4,10,34)' }}>TutorLink</h2>
      </Navbar>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <img src={tutorLink} alt="logo" />
        <div style={{ marginLeft: '400px' }}>
          <h2 style={{ color: 'white', fontSize: '50px' }}>Who are you?</h2>
          <button className="homepage-buttons" onClick={() => setModalStep('Student')}>
            Student
          </button>
          <h3>OR</h3>
          <button className="homepage-buttons" onClick={() => setModalStep('Lecturer')}>
            Lecturer
          </button>
        </div>
      </div>

      {(modalStep === 'Lecturer' || modalStep === 'Student') && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="close-button"
              onClick={() => {
                setIsOpen(false);
                setModalStep('Question1');
              }}
            >
              X
            </button>

            <h2>{modalStep} Login</h2>
            <hr
              style={{
                width: '100%',
                border: '0.5px solid black',
                margin: '1rem 0',
              }}
            />

            <form>
              <div style={{ display: 'flex', flexDirection: 'column', width: '300px', textAlign: 'left' }}>
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your username"
                />
                <br />
                <label>ID:</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter your ID"
                />
                <br />
                <label>Password:</label>
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <span onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <button style={{ marginTop: '20px', width: '100%' }}>Login</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginPage;
