/**
 * User Model - Đại diện cho dữ liệu người dùng
 */
class User {
  constructor(
    id,
    fullname,
    phone,
    email,
    roles = [],
    bankName = '',
    bankAccountNumber = '',
    bankAccountName = ''
  ) {
    this.id = id;
    this.fullname = fullname;
    this.phone = phone;
    this.email = email;
    this.roles = roles;
    this.bankName = bankName;
    this.bankAccountNumber = bankAccountNumber;
    this.bankAccountName = bankAccountName;
  }

  /**
   * Kiểm tra xem user có phải là OWNER không
   */
  isOwner() {
    return this.roles && this.roles.includes('ROLE_OWNER');
  }

  /**
   * Kiểm tra xem user có phải là ADMIN không
   */
  isAdmin() {
    return this.roles && this.roles.includes('ROLE_ADMIN');
  }

  /**
   * Convert từ API response sang User object
   */
  static fromAPI(apiData) {
    return new User(
      apiData.id,
      apiData.fullname,
      apiData.phone,
      apiData.email,
      apiData.roles,
      apiData.bankName,
      apiData.bankAccountNumber,
      apiData.bankAccountName
    );
  }
}

export default User;

