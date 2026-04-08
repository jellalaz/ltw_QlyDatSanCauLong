import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/users';

class UserService {
  /**
   * Lấy thông tin user hiện tại
   * @returns {Promise<Response>}
   */
  static getCurrentUser() {
    return axios.get(`${API_BASE_URL}/me`);
  }

  /**
   * Cập nhật thông tin user hiện tại
   * @param {Object} updateData - { fullname, email, phone, bankName, bankAccountNumber, bankAccountName }
   * @returns {Promise<Response>}
   */
  static updateCurrentUser(updateData) {
    return axios.put(`${API_BASE_URL}/me`, updateData);
  }

  /**
   * Nâng cấp thành chủ sân (owner)
   * @returns {Promise<Response>}
   */
  static requestOwnerRole() {
    return axios.post(`${API_BASE_URL}/me/request-owner-role`);
  }
}

export default UserService;

