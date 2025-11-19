import React, { useState } from 'react';
import {Nav, Offcanvas, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaTicketAlt, 
  FaChartBar, 
  FaCog,   
  FaSignOutAlt,
  FaUserShield,
  FaHandshake,
  FaFileAlt
} from 'react-icons/fa';
import { useAdminAuth } from './AdminAuthProvider';

const AdminLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { adminUser, logout } = useAdminAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt, path: '/admin/dashboard' },
    { id: 'users', label: 'Kullanıcı Yönetimi', icon: FaUsers, path: '/admin/users' },
    { id: 'requests', label: 'Destek Talepleri', icon: FaTicketAlt, path: '/admin/requests' },
    { id: 'request-approvals', label: 'Talep Onayları', icon: FaFileAlt, path: '/admin/request-approvals' },
    { id: 'offers', label: 'Teklif Onayları', icon: FaHandshake, path: '/admin/offers' },
    { id: 'payment-approvals', label: 'Ödeme Onayları', icon: FaChartBar, path: '/admin/payment-approvals' },
    { id: 'reports', label: 'Raporlar', icon: FaChartBar, path: '/admin/reports' },
    { id: 'settings', label: 'Ayarlar', icon: FaCog, path: '/admin/settings' }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-layout">
      {/* Sidebar - Desktop */}
      <div className="sidebar d-none d-lg-block">
        <div className="sidebar-header">
          <div className="user-section">
            <div className="user-avatar">
              {adminUser?.name
                ?.split(" ")
                .map(word => word.charAt(0).toUpperCase())
                .slice(0, 2)
                .join("")}
            </div>
            <div className="user-info">
              <div className="user-name">{adminUser?.name}</div>
              <div className="user-role">
                <span className="badge bg-warning">
                  <FaUserShield className="me-1" />
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <Nav className="flex-column sidebar-nav">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Nav.Link 
                  key={index} 
                  as={Link}
                  to={item.path}
                  className="sidebar-nav-link d-flex align-items-center mb-2"
                  style={{ cursor: 'pointer' }}
                >
                  <span className="nav-icon">
                    <IconComponent />
                  </span>
                  <span className="nav-text">{item.label}</span>
                </Nav.Link>
              );
            })}
            
            <Nav.Link 
              onClick={handleLogout}
              className="sidebar-nav-link logout-link d-flex align-items-center mb-2"
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon">
                <FaSignOutAlt />
              </span>
              <span className="nav-text">Çıkış Yap</span>
            </Nav.Link>
          </Nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="mobile-header d-lg-none">
        <div className="mobile-header-content">
          <div className="user-section">
            <div className="user-avatar">
              {adminUser?.name
                ?.split(" ")
                .map(word => word.charAt(0).toUpperCase())
                .slice(0, 2)
                .join("")}
            </div>
            <div className="user-info">
              <div className="user-name">{adminUser?.name}</div>
              <div className="user-role">
                <span className="badge bg-warning">
                  <FaUserShield className="me-1" />
                  Admin
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline-light" 
            className="mobile-menu-toggle"
            onClick={() => setShowSidebar(true)}
          >
            ☰
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)}
        placement="start"
        className="mobile-sidebar-offcanvas"
      >
        <Offcanvas.Header className="sidebar-header" closeButton>
          <Offcanvas.Title>
            <div className="user-section">
              <div className="user-avatar">
                {adminUser?.name
                  ?.split(" ")
                  .map(word => word.charAt(0).toUpperCase())
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="user-info">
                <div className="user-name">{adminUser?.name}</div>
                <div className="user-role">
                  <span className="badge bg-warning">
                    <FaUserShield className="me-1" />
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="sidebar-content">
          <Nav className="flex-column sidebar-nav">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Nav.Link 
                  key={index} 
                  as={Link}
                  to={item.path}
                  className="sidebar-nav-link d-flex align-items-center mb-2"
                  onClick={() => setShowSidebar(false)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="nav-icon">
                    <IconComponent />
                  </span>
                  <span className="nav-text">{item.label}</span>
                </Nav.Link>
              );
            })}
            
            <Nav.Link 
              onClick={handleLogout}
              className="sidebar-nav-link logout-link d-flex align-items-center mb-2"
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon">
                <FaSignOutAlt />
              </span>
              <span className="nav-text">Çıkış Yap</span>
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
