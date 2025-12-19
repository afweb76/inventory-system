import db from '../db';

const Supplier = {
  // Create a new supplier
  create: async (supplierData) => {
    const { name, company_name, company_phone, email, address } = supplierData;
    
    const result = await db.run(
      'INSERT INTO suppliers (name, company_name, company_phone, email, address) VALUES (?, ?, ?, ?, ?)',
      [name, company_name, company_phone, email, address]
    );
    return result.lastInsertRowid;
  },

  // Find supplier by ID
  findById: async (id) => {
    return await db.get('SELECT * FROM suppliers WHERE id = ?', [id]);
  },

  // Get all suppliers
  getAll: async () => {
    return await db.query('SELECT * FROM suppliers ORDER BY name');
  },

  // Search suppliers
  search: async (searchTerm) => {
    return await db.query(
      `SELECT * FROM suppliers 
       WHERE name LIKE ? OR company_name LIKE ? OR company_phone LIKE ?
       ORDER BY name`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
  },

  // Update supplier
  update: async (id, supplierData) => {
    const { name, company_name, company_phone, email, address } = supplierData;
    await db.run(
      `UPDATE suppliers SET 
        name = ?, company_name = ?, company_phone = ?, email = ?, address = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, company_name, company_phone, email, address, id]
    );
  },

  // Delete supplier
  delete: async (id) => {
    await db.run('DELETE FROM suppliers WHERE id = ?', [id]);
  },

  // Get top suppliers by purchase volume
  getTopSuppliers: async (limit = 5) => {
    return await db.query(`
      SELECT s.*, COUNT(p.id) as purchase_count, SUM(p.total_cost_afg) as total_spent_afg
      FROM suppliers s
      LEFT JOIN purchases p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY total_spent_afg DESC
      LIMIT ?
    `, [limit]);
  }
};

export default Supplier;
