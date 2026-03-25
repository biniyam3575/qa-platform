import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = () => {
  return (
    <>
      <Header />
      {/* Adding a 'min-height' style here ensures your Footer 
          stays at the bottom even if the page content is short.
      */}
      <main style={{ minHeight: '80vh' }}>
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
};

export default Layout; 