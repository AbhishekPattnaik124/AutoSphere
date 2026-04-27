import Header from './Header/Header';
import Footer from './Footer/Footer';
import AIConcierge from './AIConcierge/AIConcierge';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <AIConcierge />
      <Footer />
    </div>
  );
};

export default MainLayout;
