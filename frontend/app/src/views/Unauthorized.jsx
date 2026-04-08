import { useNavigate } from 'react-router-dom';
import '../styles/Layout.css';

/**
 * Unauthorized - Trang hiển thị khi không có quyền truy cập
 */
function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <div style={{ fontSize: '80px', marginBottom: '8px' }}>🔐</div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Không có quyền truy cập
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 28px', maxWidth: '400px' }}>
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/home')}>
          🏠 Về trang chủ
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
