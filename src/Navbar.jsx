import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar({ children }) {
  const navigate = useNavigate();

  

  return (
    <nav className='navbar1'>
    
      {children}
      
    </nav>
    
  );
}

export default Navbar;
