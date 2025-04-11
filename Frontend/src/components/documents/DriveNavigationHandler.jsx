import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DocumentsDrive from './DocumentsDrive';

const DriveNavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePathChange = (event) => {
      const { path } = event.detail;
      navigate(path, { replace: true });
    };

    window.addEventListener('drivePathChange', handlePathChange);
    return () => window.removeEventListener('drivePathChange', handlePathChange);
  }, [navigate]);

  return null;
};

export default DriveNavigationHandler;
