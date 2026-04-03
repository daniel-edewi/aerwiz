import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const HIDE_FOOTER = ['/book', '/seats', '/payment/verify', '/admin/login'];
const HIDE_NAVBAR = ['/admin/login'];

const Layout = ({ children }) => {
  const location = useLocation();
  const hideFooter = HIDE_FOOTER.some(p => location.pathname.startsWith(p));
  const hideNavbar = HIDE_NAVBAR.some(p => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;