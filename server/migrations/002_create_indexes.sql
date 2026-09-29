CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_tracking_number ON orders (tracking_number);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_created_at ON products (created_at DESC);
CREATE INDEX idx_products_popular ON products (is_popular);
CREATE INDEX idx_products_best_seller ON products (is_best_seller);

CREATE INDEX idx_categories_featured ON categories (featured DESC);
CREATE INDEX idx_categories_name ON categories (name ASC);

CREATE INDEX idx_hero_slides_active_order ON hero_slides (is_active, display_order ASC);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_reviews_status ON reviews (status);
CREATE INDEX idx_quotes_status ON quotes (status);
CREATE INDEX idx_payments_order_id ON payments (order_id);
CREATE INDEX idx_portfolio_category ON portfolio (category);
