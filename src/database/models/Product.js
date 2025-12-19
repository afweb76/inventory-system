import db from '../db';

const Product = {
  // Create a new product
  create: async (productData) => {
    const {
      name, brand, model, barcode, category,
      stock_quantity, min_stock_alert, cost_price,
      selling_price_afg, selling_price_usd,
      accessories, photo, created_by
    } = productData;

    const result = await db.run(
      `INSERT INTO products (
        name, brand, model, barcode, category,
        stock_quantity, min_stock_alert, cost_price,
        selling_price_afg, selling_price_usd,
        accessories, photo, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, brand, model, barcode, category,
        stock_quantity, min_stock_alert, cost_price,
        selling_price_afg, selling_price_usd,
        JSON.stringify(accessories || []), photo, created_by
      ]
    );
    return result.lastInsertRowid;
  },

  // Get all products
  getAll: async () => {
    return await db.query('SELECT * FROM products ORDER BY created_at DESC');
  },

  // Find product by ID
  findById: async (id) => {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (product && product.accessories) {
      product.accessories = JSON.parse(product.accessories);
    }
    return product;
  },

  // Find product by barcode
  findByBarcode: async (barcode) => {
    const product = await db.get('SELECT * FROM products WHERE barcode = ?', [barcode]);
    if (product && product.accessories) {
      product.accessories = JSON.parse(product.accessories);
    }
    return product;
  },

  // Search products
  search: async (searchTerm) => {
    return await db.query(
      `SELECT * FROM products 
       WHERE name LIKE ? OR brand LIKE ? OR model LIKE ? OR barcode LIKE ?
       ORDER BY name`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
  },

  // Filter by category
  filterByCategory: async (category) => {
    return await db.query(
      'SELECT * FROM products WHERE category = ? ORDER BY name',
      [category]
    );
  },

  // Get low stock products
  getLowStock: async () => {
    return await db.query(
      'SELECT * FROM products WHERE stock_quantity <= min_stock_alert ORDER BY stock_quantity'
    );
  },

  // Get out of stock products
  getOutOfStock: async () => {
    return await db.query(
      'SELECT * FROM products WHERE stock_quantity = 0 ORDER BY name'
    );
  },

  // Get most sold products
  getMostSold: async (limit = 10) => {
    return await db.query(
      `SELECT p.*, COALESCE(SUM(si.quantity), 0) as total_sold
       FROM products p
       LEFT JOIN sale_items si ON p.id = si.product_id
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT ?`,
      [limit]
    );
  },

  // Update product
  update: async (id, productData) => {
    const {
      name, brand, model, barcode, category,
      stock_quantity, min_stock_alert, cost_price,
      selling_price_afg, selling_price_usd,
      accessories, photo
    } = productData;

    await db.run(
      `UPDATE products SET
        name = ?, brand = ?, model = ?, barcode = ?, category = ?,
        stock_quantity = ?, min_stock_alert = ?, cost_price = ?,
        selling_price_afg = ?, selling_price_usd = ?,
        accessories = ?, photo = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, brand, model, barcode, category,
        stock_quantity, min_stock_alert, cost_price,
        selling_price_afg, selling_price_usd,
        JSON.stringify(accessories || []), photo, id
      ]
    );
  },

  // Update stock quantity
  updateStock: async (id, quantity) => {
    await db.run(
      'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );
  },

  // Decrease stock (for sales)
  decreaseStock: async (id, quantity) => {
    await db.run(
      'UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );
  },

  // Increase stock (for returns/purchases)
  increaseStock: async (id, quantity) => {
    await db.run(
      'UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );
  },

  // Delete product
  delete: async (id) => {
    await db.run('DELETE FROM products WHERE id = ?', [id]);
  },

  // Get product statistics
  getStats: async () => {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN stock_quantity <= min_stock_alert THEN 1 ELSE 0 END) as low_stock
      FROM products
    `);
    return stats;
  }
};

export default Product;
