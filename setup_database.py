import sqlite3
import os

db_path = "./brain.db"

# Connect to SQLite database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Enable foreign keys
cursor.execute("PRAGMA foreign_keys = ON;")

# 1. Create products table
cursor.execute("""
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('physical', 'digital', 'service')),
    price REAL NOT NULL,
    description TEXT,
    stock_quantity INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
""")

# 2. Create customers table
cursor.execute("""
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    zalo TEXT UNIQUE,
    email TEXT,
    hotel TEXT,
    room TEXT,
    registration_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    map_link TEXT
);
""")

# 3. Create orders table
cursor.execute("""
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    order_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    collect_scheduled_time TEXT,
    collected_time TEXT,
    weighed_time TEXT,
    wash_start_time TEXT,
    dry_start_time TEXT,
    fold_complete_time TEXT,
    out_for_delivery_time TEXT,
    delivered_time TEXT,
    fold_report_photo_url TEXT,
    delivery_proof_photo_url TEXT,
    receipt_number TEXT,
    lang TEXT,
    agent_notified INTEGER DEFAULT 0,
    order_status TEXT DEFAULT 'Chờ lấy',
    weight REAL DEFAULT 0,
    notes TEXT,
    pickup_photo_url TEXT,
    bill_photo_url TEXT,
    delivery_photo_url TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
""")

# 4. Create sepay_transactions table
cursor.execute("""
CREATE TABLE IF NOT EXISTS sepay_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sepay_id INTEGER UNIQUE,
    gateway TEXT,
    transaction_date TEXT,
    account_number TEXT,
    content TEXT,
    transfer_type TEXT,
    transfer_amount REAL,
    accumulated REAL,
    reference_code TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    agent_notified INTEGER DEFAULT 0
);
""")

# 5. Create order_telegram_mappings table
cursor.execute("""
CREATE TABLE IF NOT EXISTS order_telegram_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT NOT NULL,
    telegram_message_id INTEGER NOT NULL,
    telegram_chat_id INTEGER NOT NULL,
    message_type TEXT NOT NULL
);
""")

# 6. Create missing_items table
cursor.execute("""
CREATE TABLE IF NOT EXISTS missing_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT,
    photo_path TEXT NOT NULL,
    date_added TEXT DEFAULT CURRENT_TIMESTAMP,
    is_resolved INTEGER DEFAULT 0,
    agent_notified INTEGER DEFAULT 0
);
""")

# 7. Create knowledge table
cursor.execute("""
CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
""")

# 8. Create business table
cursor.execute("""
CREATE TABLE IF NOT EXISTS business (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
""")

# 9. Create brand_voice table
cursor.execute("""
CREATE TABLE IF NOT EXISTS brand_voice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
""")

conn.commit()
print("1. All tables created successfully.")

# 10. Seed products (Wash & Fold only, with customized pricing for 1997 Laundry)
products_data = [
    ("Standard Wash & Fold (24h)", "service", 45000.0, "Standard wash & fold laundry service. Min weight 3kg."),
    ("Same-day Wash & Fold (8h-12h)", "service", 55000.0, "Same-day express wash & fold service. Min weight 4kg."),
    ("Express Wash & Fold (4h)", "service", 75000.0, "Super express wash & fold laundry service. Min weight 4kg.")
]

for name, ptype, price, desc in products_data:
    cursor.execute("SELECT id FROM products WHERE name = ?", (name,))
    if not cursor.fetchone():
        cursor.execute("INSERT INTO products (name, type, price, description) VALUES (?, ?, ?, ?)", (name, ptype, price, desc))

conn.commit()
print("2. Seeded 1997 Laundry Wash & Fold products.")

conn.close()
print("Database setup complete.")
