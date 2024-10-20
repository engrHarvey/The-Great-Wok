-- Create 'users' table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  phone VARCHAR(20),
  password VARCHAR(100) DEFAULT '',
  is_guest BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'addresses' table
CREATE TABLE addresses (
  address_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  address_line VARCHAR(255) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'categories' table
CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'dishes' table
CREATE TABLE dishes (
  dish_id SERIAL PRIMARY KEY,
  dish_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'inventory' table
CREATE TABLE inventory (
  inventory_id SERIAL PRIMARY KEY,
  dish_id INTEGER REFERENCES dishes(dish_id) ON DELETE CASCADE,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'orders' table
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Order Placed',
  delivery_type VARCHAR(20) DEFAULT 'delivery',
  address_id INTEGER REFERENCES addresses(address_id) ON DELETE SET NULL,
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'order_items' table
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  dish_id INTEGER REFERENCES dishes(dish_id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Preparing food'
);

-- Create 'cart_items' table
CREATE TABLE cart_items (
  cart_item_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  dish_id INTEGER REFERENCES dishes(dish_id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Create 'reviews' table
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  dish_id INTEGER REFERENCES dishes(dish_id) ON DELETE CASCADE,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'payments' table
CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  transaction_id VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
