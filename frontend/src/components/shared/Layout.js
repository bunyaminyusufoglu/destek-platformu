import React, { useEffect } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  useEffect(() => {
    // Her sayfa değişiminde en üste scroll et
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
