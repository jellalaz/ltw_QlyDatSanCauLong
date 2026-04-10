const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getApiOrigin = () => (API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL);

export const toAssetUrl = (url) => {
  if (!url) return '';

  const raw = String(url).trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  if (raw.startsWith('/api/')) {
    // Backend serves uploaded files at /api/files/**, so keep /api prefix.
    return `${getApiOrigin()}${raw}`;
  }

  if (raw.startsWith('/')) {
	return `${getApiOrigin()}${raw}`;
  }

  return `${getApiOrigin()}/${raw}`;
};


