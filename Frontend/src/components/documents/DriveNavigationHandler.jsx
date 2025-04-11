import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DocumentsDrive from './DocumentsDrive';

const DriveNavigationHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Extract the path from the URL
    const path = location.pathname.replace('/drive', '') || '/';
    
    // Only set the path in localStorage if it's coming from a direct URL navigation
    // This prevents interference with normal in-app folder navigation
    const isDirectUrlNavigation = !localStorage.getItem('inAppNavigation');
    if (isDirectUrlNavigation) {
      localStorage.setItem('currentDrivePath', path);
    }
    
    // Clear the flag used to identify in-app navigation
    localStorage.removeItem('inAppNavigation');
    
  }, [location.pathname]);
  
  return <DocumentsDrive />;
};

export default DriveNavigationHandler;
