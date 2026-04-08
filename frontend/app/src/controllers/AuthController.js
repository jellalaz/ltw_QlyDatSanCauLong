import AuthService from '../services/AuthService';
import Auth from '../models/Auth';

/**
 * Auth Controller - Quản lý logic đăng nhập và đăng ký
 */
class AuthController {
  /**
   * Xử lý đăng ký
   * @param {Object} signupData - { fullname, email, phone, password, confirmPassword }
   * @returns {Promise<Auth>}
   */
  static async signup(signupData) {
    try {
      // Validate dữ liệu
      if (!signupData.fullname || !signupData.fullname.trim()) {
        throw new Error('Vui lòng nhập họ tên đầy đủ');
      }

      if (!signupData.email || !signupData.email.trim()) {
        throw new Error('Vui lòng nhập email');
      }

      // Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupData.email)) {
        throw new Error('Email không đúng định dạng');
      }

      if (!signupData.phone || !signupData.phone.trim()) {
        throw new Error('Vui lòng nhập số điện thoại');
      }

      // Kiểm tra định dạng số điện thoại Việt Nam (10-11 số)
      const phoneRegex = /^0\d{9,10}$/;
      if (!phoneRegex.test(signupData.phone)) {
        throw new Error('Số điện thoại phải là 10-11 số và bắt đầu bằng 0');
      }

      if (!signupData.password || !signupData.password.trim()) {
        throw new Error('Vui lòng nhập mật khẩu');
      }

      if (signupData.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      if (!signupData.confirmPassword || !signupData.confirmPassword.trim()) {
        throw new Error('Vui lòng xác nhận mật khẩu');
      }

      if (signupData.password !== signupData.confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }

      const response = await AuthService.signup(signupData);

      if (response.data.data) {
        const auth = Auth.fromAPI(response.data.data);
        AuthService.setToken(auth.jwtToken);
        return auth;
      }

      throw new Error(response.data.message || 'Đăng ký thất bại');
    } catch (error) {
      // Xử lý lỗi từ API response
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || AuthService.getErrorMessage(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Xử lý đăng nhập
   * @param {Object} loginData - { phone, password }
   * @returns {Promise<Auth>}
   */
  static async login(loginData) {
    try {
      // Validate dữ liệu
      if (!loginData.phone || !loginData.phone.trim()) {
        throw new Error('Vui lòng nhập số điện thoại');
      }

      if (!loginData.password || !loginData.password.trim()) {
        throw new Error('Vui lòng nhập mật khẩu');
      }

      const response = await AuthService.login(loginData);

      if (response.data.data) {
        const auth = Auth.fromAPI(response.data.data);
        AuthService.setToken(auth.jwtToken);
        return auth;
      }

      throw new Error(response.data.message || 'Đăng nhập thất bại');
    } catch (error) {
      // Xử lý lỗi từ API response
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || AuthService.getErrorMessage(error);
        throw new Error(errorMessage);
      }
      // Xử lý lỗi từ axios (network error, etc)
      throw new Error(AuthService.getErrorMessage(error));
    }
  }

  /**
   * Xử lý đăng xuất
   */
  static logout() {
    AuthService.removeToken();
  }

  /**
   * Kiểm tra xem người dùng đã đăng nhập hay chưa
   */
  static isAuthenticated() {
    return AuthService.isAuthenticated();
  }

  /**
   * Lấy token từ localStorage
   */
  static getToken() {
    return AuthService.getToken();
  }

  /**
   * Khởi tạo auth header khi app load
   */
  static initializeAuthHeader() {
    AuthService.initializeAuthHeader();
  }
}

export default AuthController;

