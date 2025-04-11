import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DocumentsDrive from './components/documents/DocumentsDrive';

const DriveNavigationHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Extract the path from the URL
    const path = location.pathname.replace('/drive', '') || '/';
    
    // Store the current path in localStorage for the DocumentsDrive component to use
    localStorage.setItem('currentDrivePath', path);
    
  }, [location.pathname]);
  
  return <DocumentsDrive />;
};

export default DriveNavigationHandler;
