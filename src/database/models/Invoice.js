import db from '../db';

const Invoice = {
  // Get invoice data by sale ID
  getBySaleId: async (saleId) => {
    const invoice = await db.get(
      `SELECT s.*, c.first_name, c.last_name, c.phone, c.customer_number,
              u.first_name as seller_first_name, u.last_name as seller_last_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN users u ON s.sold_by = u.id
       WHERE s.id = ?`,
      [saleId]
    );

    if (invoice) {
      invoice.items = await db.query(
        `SELECT si.*, p.brand, p.category, p.barcode
         FROM sale_items si
         LEFT JOIN products p ON si.product_id = p.id
         WHERE si.sale_id = ?`,
        [saleId]
      );
    }

    return invoice;
  },

  // Get invoice by invoice number
  getByInvoiceNumber: async (invoiceNumber) => {
    const invoice = await db.get(
      `SELECT s.*, c.first_name, c.last_name, c.phone, c.customer_number,
              u.first_name as seller_first_name, u.last_name as seller_last_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN users u ON s.sold_by = u.id
       WHERE s.invoice_number = ?`,
      [invoiceNumber]
    );

    if (invoice) {
      invoice.items = await db.query(
        `SELECT si.*, p.brand, p.category, p.barcode
         FROM sale_items si
         LEFT JOIN products p ON si.product_id = p.id
         WHERE si.sale_id = ?`,
        [invoice.id]
      );
    }

    return invoice;
  }
};

export default Invoice;
