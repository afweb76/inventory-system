import db from '../db';
import Product from './Product';
import Customer from './Customer';

const Sale = {
  // Generate unique invoice number
  generateInvoiceNumber: async () => {
    const timestamp = Date.now().toString().slice(-10);
    return `INV${timestamp}`;
  },

  // Create a new sale
  create: async (saleData) => {
    const {
      customer_id, items, discount = 0, currency = 'AFG', sold_by
    } = saleData;

    // Calculate totals
    let total_afg = 0;
    let total_usd = 0;

    items.forEach(item => {
      total_afg += item.unit_price_afg * item.quantity;
      total_usd += item.unit_price_usd * item.quantity;
    });

    const final_afg = total_afg - (currency === 'AFG' ? discount : 0);
    const final_usd = total_usd - (currency === 'USD' ? discount : 0);

    // Generate invoice number
    const invoice_number = await Sale.generateInvoiceNumber();

    // Insert sale
    const saleResult = await db.run(
      `INSERT INTO sales (
        invoice_number, customer_id, total_amount_afg, total_amount_usd,
        discount, final_amount_afg, final_amount_usd, currency, sold_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number, customer_id, total_afg, total_usd,
        discount, final_afg, final_usd, currency, sold_by
      ]
    );

    const sale_id = saleResult.lastInsertRowid;

    // Insert sale items and update stock
    for (const item of items) {
      await db.run(
        `INSERT INTO sale_items (
          sale_id, product_id, product_name, quantity,
          unit_price_afg, unit_price_usd, total_price_afg, total_price_usd,
          warranty_value, warranty_unit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sale_id, item.product_id, item.product_name, item.quantity,
          item.unit_price_afg, item.unit_price_usd,
          item.unit_price_afg * item.quantity,
          item.unit_price_usd * item.quantity,
          item.warranty_value || 0,
          item.warranty_unit || null
        ]
      );

      // Decrease product stock
      await Product.decreaseStock(item.product_id, item.quantity);
    }

    // Update customer stats
    if (customer_id) {
      await Customer.updatePurchaseStats(customer_id, final_afg, final_usd);
    }

    return { sale_id, invoice_number };
  },

  // Get sale by ID with items
  findById: async (id) => {
    const sale = await db.get('SELECT * FROM sales WHERE id = ?', [id]);
    if (sale) {
      sale.items = await db.query(
        'SELECT * FROM sale_items WHERE sale_id = ?',
        [id]
      );
    }
    return sale;
  },

  // Get sale by invoice number
  findByInvoice: async (invoiceNumber) => {
    const sale = await db.get(
      'SELECT * FROM sales WHERE invoice_number = ?',
      [invoiceNumber]
    );
    if (sale) {
      sale.items = await db.query(
        'SELECT * FROM sale_items WHERE sale_id = ?',
        [sale.id]
      );
    }
    return sale;
  },

  // Get all sales
  getAll: async (limit = 100) => {
    return await db.query(
      'SELECT * FROM sales ORDER BY sale_date DESC LIMIT ?',
      [limit]
    );
  },

  // Get sales by date range
  getByDateRange: async (startDate, endDate) => {
    return await db.query(
      'SELECT * FROM sales WHERE sale_date BETWEEN ? AND ? ORDER BY sale_date DESC',
      [startDate, endDate]
    );
  },

  // Get today's sales
  getTodaySales: async () => {
    return await db.query(
      `SELECT * FROM sales 
       WHERE DATE(sale_date) = DATE('now')
       ORDER BY sale_date DESC`
    );
  },

  // Get sales statistics
  getStats: async (days = 1) => {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(final_amount_afg), 0) as total_afg,
        COALESCE(SUM(final_amount_usd), 0) as total_usd,
        COALESCE(AVG(final_amount_afg), 0) as avg_afg,
        COALESCE(AVG(final_amount_usd), 0) as avg_usd
      FROM sales
      WHERE sale_date >= datetime('now', '-${days} days')
    `);
    return stats;
  },

  // Get recent sales
  getRecent: async (limit = 10) => {
    return await db.query(
      `SELECT s.*, c.first_name, c.last_name, c.phone
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       ORDER BY s.sale_date DESC
       LIMIT ?`,
      [limit]
    );
  }
};

export default Sale;
