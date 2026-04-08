import UserService from '../services/UserService';
import User from '../models/User';

/**
 * User Controller - Quản lý logic người dùng
 */
class UserController {
  /**
   * Lấy thông tin user hiện tại
   * @returns {Promise<User>}
   */
  static async getCurrentUser() {
    try {
      const response = await UserService.getCurrentUser();

      if (response.data.data) {
        return User.fromAPI(response.data.data);
      }

      throw new Error(response.data.message || 'Không thể lấy thông tin user');
    } catch (error) {
      // Xử lý lỗi từ API response
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Không thể lấy thông tin user');
      }
      throw error;
    }
  }

  /**
   * Cập nhật thông tin user
   * @param {Object} updateData - { fullname, email, phone, bankName, bankAccountNumber, bankAccountName }
   * @returns {Promise<User>}
   */
  static async updateCurrentUser(updateData) {
    try {
      // Validate dữ liệu
      if (!updateData.fullname || !updateData.email || !updateData.phone) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      const response = await UserService.updateCurrentUser(updateData);

      if (response.data.data) {
        return User.fromAPI(response.data.data);
      }

      throw new Error(response.data.message || 'Cập nhật thông tin thất bại');
    } catch (error) {
      // Xử lý lỗi từ API response
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Cập nhật thông tin thất bại');
      }
      throw error;
    }
  }

  /**
   * Nâng cấp thành chủ sân (owner)
   * @returns {Promise<string>}
   */
  static async requestOwnerRole() {
    try {
      const response = await UserService.requestOwnerRole();
      return response.data.message || 'Nâng cấp thành công';
    } catch (error) {
      // Xử lý lỗi từ API response
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Nâng cấp thất bại');
      }
      throw error;
    }
  }
}

export default UserController;

