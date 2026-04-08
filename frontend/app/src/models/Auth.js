/**
 * Auth Model - Đại diện cho dữ liệu xác thực (JWT Response)
 */
class Auth {
  constructor(jwtToken, id, phone, roles = []) {
    this.jwtToken = jwtToken;
    this.id = id;
    this.phone = phone;
    this.roles = roles;
  }

  /**
   * Kiểm tra xem token có hợp lệ không
   */
  isValid() {
    return !!this.jwtToken && this.jwtToken.length > 0;
  }

  /**
   * Convert từ API response sang Auth object
   */
  static fromAPI(apiData) {
    return new Auth(apiData.jwtToken, apiData.id, apiData.phone, apiData.roles);
  }
}

export default Auth;

