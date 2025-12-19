import db from '../db';
import Product from './Product';

const Purchase = {
  // Create a new purchase
  create: async (purchaseData) => {
    const {
      product_id, product_name, supplier_id, category, brand, barcode,
      quantity, unit_cost_price, total_cost_afg, total_cost_usd,
      payment_type, amount_paid, photo, added_by
    } = purchaseData;

    const remaining_balance = total_cost_afg - amount_paid;

    const result = await db.run(
      `INSERT INTO purchases (
        product_id, product_name, supplier_id, category, brand, barcode,
        quantity, unit_cost_price, total_cost_afg, total_cost_usd,
        payment_type, amount_paid, remaining_balance, photo, added_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id, product_name, supplier_id, category, brand, barcode,
        quantity, unit_cost_price, total_cost_afg, total_cost_usd,
        payment_type, amount_paid, remaining_balance, photo, added_by
      ]
    );

    // Update or increase product stock if product exists
    if (product_id) {
      await Product.increaseStock(product_id, quantity);
    }

    return result.lastInsertRowid;
  },

  // Get all purchases
  getAll: async () => {
    return await db.query(
      `SELECT p.*, s.name as supplier_name, s.company_name
       FROM purchases p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       ORDER BY p.purchase_date DESC`
    );
  },

  // Find purchase by ID
  findById: async (id) => {
    return await db.get(
      `SELECT p.*, s.name as supplier_name, s.company_name
       FROM purchases p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ?`,
      [id]
    );
  },

  // Get purchases by supplier
  getBySupplier: async (supplierId) => {
    return await db.query(
      'SELECT * FROM purchases WHERE supplier_id = ? ORDER BY purchase_date DESC',
      [supplierId]
    );
  },

  // Get purchases by date range
  getByDateRange: async (startDate, endDate) => {
    return await db.query(
      'SELECT * FROM purchases WHERE purchase_date BETWEEN ? AND ? ORDER BY purchase_date DESC',
      [startDate, endDate]
    );
  },

  // Get purchase statistics
  getStats: async (days = 1) => {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_purchases,
        COALESCE(SUM(quantity), 0) as total_quantity,
        COALESCE(SUM(total_cost_afg), 0) as total_cost_afg,
        COALESCE(SUM(total_cost_usd), 0) as total_cost_usd,
        COALESCE(AVG(unit_cost_price), 0) as avg_unit_cost
      FROM purchases
      WHERE purchase_date >= datetime('now', '-${days} days')
    `);
    return stats;
  },

  // Update purchase
  update: async (id, purchaseData) => {
    const {
      product_name, supplier_id, category, brand, barcode,
      quantity, unit_cost_price, total_cost_afg, total_cost_usd,
      payment_type, amount_paid, photo
    } = purchaseData;

    const remaining_balance = total_cost_afg - amount_paid;

    await db.run(
      `UPDATE purchases SET
        product_name = ?, supplier_id = ?, category = ?, brand = ?, barcode = ?,
        quantity = ?, unit_cost_price = ?, total_cost_afg = ?, total_cost_usd = ?,
        payment_type = ?, amount_paid = ?, remaining_balance = ?, photo = ?
       WHERE id = ?`,
      [
        product_name, supplier_id, category, brand, barcode,
        quantity, unit_cost_price, total_cost_afg, total_cost_usd,
        payment_type, amount_paid, remaining_balance, photo, id
      ]
    );
  },

  // Delete purchase
  delete: async (id) => {
    await db.run('DELETE FROM purchases WHERE id = ?', [id]);
  }
};

export default Purchase;
