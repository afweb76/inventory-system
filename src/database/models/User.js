import db from '../db';

const User = {
  // Create a new user
  create: async (userData) => {
    const { first_name, last_name, email, password, role = 'user' } = userData;
    const result = await db.run(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, password, role]
    );
    return result.lastInsertRowid;
  },

  // Find user by email
  findByEmail: async (email) => {
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
  },

  // Find user by ID
  findById: async (id) => {
    return await db.get('SELECT * FROM users WHERE id = ?', [id]);
  },

  // Get all users
  getAll: async () => {
    return await db.query('SELECT id, first_name, last_name, email, role, created_at FROM users');
  },

  // Update user
  update: async (id, userData) => {
    const { first_name, last_name, email } = userData;
    await db.run(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [first_name, last_name, email, id]
    );
  },

  // Update password
  updatePassword: async (id, newPassword) => {
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPassword, id]
    );
  },

  // Delete user
  delete: async (id) => {
    await db.run('DELETE FROM users WHERE id = ?', [id]);
  },

  // Log user login
  logLogin: async (userId, email) => {
    await db.run(
      'INSERT INTO login_logs (user_id, email) VALUES (?, ?)',
      [userId, email]
    );
  },

  // Get login logs
  getLoginLogs: async (limit = 50) => {
    return await db.query(
      `SELECT ll.*, u.first_name, u.last_name 
       FROM login_logs ll 
       JOIN users u ON ll.user_id = u.id 
       ORDER BY ll.login_date DESC 
       LIMIT ?`,
      [limit]
    );
  }
};

export default User;
