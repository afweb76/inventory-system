-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    barcode TEXT UNIQUE,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 10,
    cost_price REAL DEFAULT 0,
    selling_price_afg REAL DEFAULT 0,
    selling_price_usd REAL DEFAULT 0,
    accessories TEXT, -- JSON array of accessories
    photo TEXT, -- Base64 or file path
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    customer_number TEXT UNIQUE,
    total_purchases INTEGER DEFAULT 0,
    total_spent_afg REAL DEFAULT 0,
    total_spent_usd REAL DEFAULT 0,
    last_purchase_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER,
    total_amount_afg REAL DEFAULT 0,
    total_amount_usd REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    final_amount_afg REAL DEFAULT 0,
    final_amount_usd REAL DEFAULT 0,
    currency TEXT DEFAULT 'AFG',
    payment_status TEXT DEFAULT 'completed',
    sold_by INTEGER,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (sold_by) REFERENCES users(id)
);

-- Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_afg REAL DEFAULT 0,
    unit_price_usd REAL DEFAULT 0,
    total_price_afg REAL DEFAULT 0,
    total_price_usd REAL DEFAULT 0,
    warranty_value INTEGER DEFAULT 0,
    warranty_unit TEXT, -- 'month' or 'year'
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    sale_item_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    refund_amount_afg REAL DEFAULT 0,
    refund_amount_usd REAL DEFAULT 0,
    reason TEXT,
    returned_by INTEGER,
    return_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (sale_item_id) REFERENCES sale_items(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (returned_by) REFERENCES users(id)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company_name TEXT,
    company_phone TEXT,
    email TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Purchases table (incoming products)
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    supplier_id INTEGER,
    category TEXT,
    brand TEXT,
    barcode TEXT,
    quantity INTEGER NOT NULL,
    unit_cost_price REAL NOT NULL,
    total_cost_afg REAL DEFAULT 0,
    total_cost_usd REAL DEFAULT 0,
    payment_type TEXT, -- 'cash', 'credit', 'fully_paid'
    amount_paid REAL DEFAULT 0,
    remaining_balance REAL DEFAULT 0,
    photo TEXT,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    added_by INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (added_by) REFERENCES users(id)
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action_type TEXT NOT NULL, -- 'add', 'update', 'delete', 'sale', 'return', 'login'
    entity_type TEXT, -- 'product', 'sale', 'customer', etc.
    entity_id INTEGER,
    details TEXT, -- JSON details about the action
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Login Logs table
CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    login_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(created_at);

-- Insert default admin user (password: admin123 - should be hashed in production)
INSERT OR IGNORE INTO users (id, first_name, last_name, email, password, role) 
VALUES (1, 'Admin', 'User', 'admin@inventory.com', 'admin123', 'admin');
