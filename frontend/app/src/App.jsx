import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import AuthController from './controllers/AuthController';
import AppRoutes from './routes/index';
import './App.css';

function App() {
  // Khởi tạo auth header khi app load
  useEffect(() => {
    AuthController.initializeAuthHeader();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
