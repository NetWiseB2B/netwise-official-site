import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import DefaultCart from './components/DefaultCart';
import NetWiseCart from './components/NetWiseCart';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import ProductPage from './pages/ProductPage';
import B2BApplicationPage from './pages/B2BApplicationPage';
import QuickOrderPage from './pages/QuickOrderPage';
import CreateNewOrderPage from './pages/CreateNewOrderPage';
import ThankYouPage from './pages/ThankYouPage';

function CartSwitch() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <NetWiseCart /> : <DefaultCart />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/collections/:handle" element={<CollectionPage />} />
              <Route path="/products/:handle" element={<ProductPage />} />
              <Route path="/b2b-application" element={<B2BApplicationPage />} />
              <Route path="/quick-order" element={<QuickOrderPage />} />
              <Route path="/quick-order/new" element={<CreateNewOrderPage />} />
              <Route path="/quick-order/thank-you" element={<ThankYouPage />} />
            </Routes>
          </main>
          <Footer />
          <LoginModal />
          <CartSwitch />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
