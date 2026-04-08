import '../../styles/Layout.css';

/**
 * ComingSoon - Placeholder dùng chung cho các trang chưa implement
 * @param {string} title     - Tên trang
 * @param {string} subtitle  - Mô tả ngắn
 * @param {string} icon      - Emoji icon
 */
function ComingSoon({ title = 'Tính năng đang phát triển', subtitle = 'Chức năng này sẽ sớm được hoàn thiện.', icon = '🚧' }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-icon">{icon}</div>
      <h2 className="coming-soon-title">{title}</h2>
      <p className="coming-soon-desc">{subtitle}</p>
      <div
        style={{
          marginTop: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: '#eef2ff',
          color: '#4f46e5',
          fontSize: '12px',
          fontWeight: '600',
        }}
      >
        Coming Soon
      </div>
    </div>
  );
}

export default ComingSoon;
