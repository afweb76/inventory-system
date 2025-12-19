import db from '../db';
import Product from './Product';

const Return = {
  // Create a new return
  create: async (returnData) => {
    const {
      sale_id, sale_item_id, product_id, customer_id,
      quantity, refund_amount_afg, refund_amount_usd,
      reason, returned_by
    } = returnData;

    const result = await db.run(
      `INSERT INTO returns (
        sale_id, sale_item_id, product_id, customer_id,
        quantity, refund_amount_afg, refund_amount_usd,
        reason, returned_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sale_id, sale_item_id, product_id, customer_id,
        quantity, refund_amount_afg, refund_amount_usd,
        reason, returned_by
      ]
    );

    // Increase product stock
    await Product.increaseStock(product_id, quantity);

    return result.lastInsertRowid;
  },

  // Get all returns
  getAll: async () => {
    return await db.query(
      `SELECT r.*, p.name as product_name, c.first_name, c.last_name, c.phone
       FROM returns r
       JOIN products p ON r.product_id = p.id
       JOIN customers c ON r.customer_id = c.id
       ORDER BY r.return_date DESC`
    );
  },

  // Get returns by customer
  getByCustomer: async (customerId) => {
    return await db.query(
      `SELECT r.*, p.name as product_name, s.invoice_number
       FROM returns r
       JOIN products p ON r.product_id = p.id
       JOIN sales s ON r.sale_id = s.id
       WHERE r.customer_id = ?
       ORDER BY r.return_date DESC`,
      [customerId]
    );
  },

  // Get return statistics
  getStats: async (days = 30) => {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_returns,
        COALESCE(SUM(quantity), 0) as total_quantity,
        COALESCE(SUM(refund_amount_afg), 0) as total_refund_afg,
        COALESCE(SUM(refund_amount_usd), 0) as total_refund_usd
      FROM returns
      WHERE return_date >= datetime('now', '-${days} days')
    `);
    return stats;
  }
};

export default Return;
