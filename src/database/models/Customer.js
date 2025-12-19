import db from '../db';

const Customer = {
  // Create a new customer
  create: async (customerData) => {
    const { first_name, last_name, phone } = customerData;
    
    // Generate unique customer number
    const count = await db.get('SELECT COUNT(*) as count FROM customers');
    const customer_number = `CUS${String(count.count + 1).padStart(6, '0')}`;

    const result = await db.run(
      'INSERT INTO customers (first_name, last_name, phone, customer_number) VALUES (?, ?, ?, ?)',
      [first_name, last_name, phone, customer_number]
    );
    return result.lastInsertRowid;
  },

  // Find customer by ID
  findById: async (id) => {
    return await db.get('SELECT * FROM customers WHERE id = ?', [id]);
  },

  // Find customer by phone
  findByPhone: async (phone) => {
    return await db.get('SELECT * FROM customers WHERE phone = ?', [phone]);
  },

  // Search customers
  search: async (searchTerm) => {
    return await db.query(
      `SELECT * FROM customers 
       WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR customer_number LIKE ?
       ORDER BY first_name`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
  },

  // Get all customers
  getAll: async () => {
    return await db.query('SELECT * FROM customers ORDER BY created_at DESC');
  },

  // Update customer
  update: async (id, customerData) => {
    const { first_name, last_name, phone } = customerData;
    await db.run(
      'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [first_name, last_name, phone, id]
    );
  },

  // Update purchase stats
  updatePurchaseStats: async (id, amountAfg, amountUsd) => {
    await db.run(
      `UPDATE customers SET 
        total_purchases = total_purchases + 1,
        total_spent_afg = total_spent_afg + ?,
        total_spent_usd = total_spent_usd + ?,
        last_purchase_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [amountAfg, amountUsd, id]
    );
  },

  // Get customer purchase history
  getPurchaseHistory: async (customerId) => {
    return await db.query(
      `SELECT s.*, si.product_name, si.quantity, si.warranty_value, si.warranty_unit
       FROM sales s
       JOIN sale_items si ON s.id = si.sale_id
       WHERE s.customer_id = ?
       ORDER BY s.sale_date DESC`,
      [customerId]
    );
  },

  // Delete customer
  delete: async (id) => {
    await db.run('DELETE FROM customers WHERE id = ?', [id]);
  }
};

export default Customer;
