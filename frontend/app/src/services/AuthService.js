import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class AuthService {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} signupData - { fullname, email, phone, password, confirmPassword }
   * @returns {Promise<Response>}
   */
  static signup(signupData) {
    return axios.post(`${API_BASE_URL}/auth/signup`, signupData);
  }

  /**
   * Đăng nhập
   * @param {Object} loginData - { phone, password }
   * @returns {Promise<Response>}
   */
  static login(loginData) {
    return axios.post(`${API_BASE_URL}/auth/login`, loginData);
  }

  /**
   * Gửi yêu cầu quên mật khẩu – backend gửi token về email
   * @param {string} email - Email của tài khoản
   * @returns {Promise<Response>}
   */
  static forgotPassword(email) {
    return axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
  }

  /**
   * Đặt lại mật khẩu bằng token nhận được qua email
   * @param {string} token       - Token nhận được trong email
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise<Response>}
   */
  static resetPassword(token, newPassword) {
    return axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword });
  }

  /**
   * Đổi mật khẩu khi đã đăng nhập (cần Bearer token)
   * @param {string} currentPassword  - Mật khẩu hiện tại
   * @param {string} newPassword      - Mật khẩu mới
   * @param {string} confirmPassword  - Xác nhận mật khẩu mới
   * @returns {Promise<Response>}
   */
  static changePassword(currentPassword, newPassword, confirmPassword) {
    return axios.post(`${API_BASE_URL}/auth/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }



  /**
   * Lưu token vào localStorage
   */
  static setToken(token) {
    if (token) {
      localStorage.setItem('jwtToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Lấy token từ localStorage
   */
  static getToken() {
    return localStorage.getItem('jwtToken');
  }

  /**
   * Xóa token (đăng xuất)
   */
  static removeToken() {
    localStorage.removeItem('jwtToken');
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * Kiểm tra xem người dùng đã đăng nhập hay chưa
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Khởi tạo token vào header khi app load
   */
  static initializeAuthHeader() {
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Lấy thông báo lỗi chi tiết từ error object
   * @param {Error} error - Lỗi từ axios
   * @returns {String} - Thông báo lỗi
   */
  static getErrorMessage(error) {
    // Nếu có response từ server
    if (error.response) {
      const data = error.response.data;

      // Nếu server trả về message chi tiết
      if (data.message) {
        return data.message;
      }

      // Nếu có thêm details
      if (data.details) {
        return data.details;
      }

      // Xử lý theo status code
      switch (error.response.status) {
        case 400:
          return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        case 401:
          return 'Số điện thoại hoặc mật khẩu không đúng.';
        case 403:
          return 'Bạn không có quyền thực hiện hành động này.';
        case 404:
          return 'Không tìm thấy tài khoản.';
        case 409:
          return 'Tài khoản đã tồn tại.';
        case 500:
          return 'Lỗi server. Vui lòng thử lại sau.';
        default:
          return `Lỗi ${error.response.status}: ${error.response.statusText}`;
      }
    }

    // Nếu không có response (lỗi network)
    if (error.request) {
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối Internet.';
    }

    // Lỗi khác
    return error.message || 'Đã xảy ra lỗi không xác định.';
  }
}

export default AuthService;

