'use client'

import { useMemo, useState } from 'react';
import { Container, Theme } from './settings/types';
import { HealthcarePlusLandingPage } from './features/landing';
import { AuthPages } from './features/auth';
import { HealthcarePlusApp } from './features/patient';
import { DoctorAppLayout } from './features/doctor';

let theme: Theme = 'light';
// only use 'centered' container for standalone components, never for full page apps or websites.
let container: Container = 'none';

type AppPage = 'landing' | 'auth' | 'patient-app' | 'doctor-app';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');

  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  const handleNavigateToAuth = () => {
    setCurrentPage('auth');
  };

  const handleNavigateToLanding = () => {
    setCurrentPage('landing');
  };

  const handleLoginSuccess = (email: string) => {
    console.log('Login with email:', email); // Debug log
    if (email.toLowerCase().trim() === 'patient') {
      setCurrentPage('patient-app');
    } else if (email.toLowerCase().trim() === 'doctor') {
      setCurrentPage('doctor-app');
    } else {
      // Default to patient app for any other email
      setCurrentPage('patient-app');
    }
  };

  const generatedComponent = useMemo(() => {
    if (currentPage === 'auth') {
      return <AuthPages onBackToHome={handleNavigateToLanding} onLoginSuccess={handleLoginSuccess} />;
    } else if (currentPage === 'patient-app') {
      return <HealthcarePlusApp />;
    } else if (currentPage === 'doctor-app') {
      return <DoctorAppLayout />;
    }
    return <HealthcarePlusLandingPage onLoginClick={handleNavigateToAuth} />;
  }, [currentPage]);

  if (container === 'centered') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {generatedComponent}
      </div>
    );
  } else {
    return generatedComponent;
  }
}

export default App;