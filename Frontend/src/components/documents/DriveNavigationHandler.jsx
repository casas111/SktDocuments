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
    } else {
      // If this is in-app navigation, we don't need to do anything special
      // as the DocumentsDrive component is already handling the navigation
    }
    
    // Clear the flag used to identify in-app navigation
    localStorage.removeItem('inAppNavigation');
    
  }, [location.pathname]);
  
  // Listen for popstate events (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      // When user uses browser back/forward buttons, we need to sync the path
      const path = window.location.pathname.replace('/drive', '') || '/';
      localStorage.setItem('currentDrivePath', path);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  return <DocumentsDrive />;
};

export default DriveNavigationHandler;
