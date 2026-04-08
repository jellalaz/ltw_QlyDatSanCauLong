import '../../styles/Layout.css';

/**
 * PageHeader - Tiêu đề trang dùng chung
 * @param {string}          title      - Tiêu đề chính
 * @param {string}          subtitle   - Mô tả (optional)
 * @param {React.ReactNode} actions    - Buttons bên phải (optional)
 */
function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
