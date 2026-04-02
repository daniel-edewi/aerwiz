import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const HIDE_FOOTER = ['/book', '/seats', '/payment/verify'];
const HIDE_NAVBAR = [];

const Layout = ({ children }) => {
  const path = window.location.pathname;
  const hideFooter = HIDE_FOOTER.some(p => path.startsWith(p));
  const hideNavbar = HIDE_NAVBAR.some(p => path.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;