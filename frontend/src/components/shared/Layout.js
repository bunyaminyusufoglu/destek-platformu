import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

const Layout = ({ children }) => {
  useEffect(() => {
    // Her sayfa değişiminde en üste scroll et
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <div className="content-header d-none d-lg-flex">
          <div className="ms-auto d-flex align-items-center gap-2">
            <NotificationBell />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
