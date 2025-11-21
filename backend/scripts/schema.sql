-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- e.g., 'plomeria', 'electricidad', 'limpieza'
  price DECIMAL(10, 2),
  city VARCHAR(100),
  provider_id VARCHAR(255), -- Reference to MongoDB user ID or external ID
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_city ON services(city);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price);
CREATE INDEX IF NOT EXISTS idx_services_search ON services USING GIN(to_tsvector('spanish', title || ' ' || coalesce(description, '')));


-- Products (Marketplace) Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  brand VARCHAR(100),
  condition VARCHAR(50), -- 'new', 'used'
  price DECIMAL(10, 2),
  city VARCHAR(100),
  shipping_available BOOLEAN DEFAULT FALSE,
  seller_id VARCHAR(255), -- Reference to MongoDB user ID
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_city ON products(city);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('spanish', title || ' ' || coalesce(description, '')));


-- Roommates Table
CREATE TABLE IF NOT EXISTS roommates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL, -- e.g., "Busco roomie en Roma Norte"
  description TEXT,
  city VARCHAR(100),
  budget DECIMAL(10, 2),
  move_in_date DATE,
  gender_preference VARCHAR(50), -- 'any', 'male', 'female'
  pets_allowed BOOLEAN DEFAULT FALSE,
  is_student BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(255), -- Reference to MongoDB user ID
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roommates_city ON roommates(city);
CREATE INDEX IF NOT EXISTS idx_roommates_budget ON roommates(budget);
CREATE INDEX IF NOT EXISTS idx_roommates_search ON roommates USING GIN(to_tsvector('spanish', title || ' ' || coalesce(description, '')));
