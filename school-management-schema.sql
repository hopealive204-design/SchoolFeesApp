-- SchoolFees.NG - School Management and Payment System Database Schema
-- Supporting Nigerian payment gateways and manual bank transfers

-- Schools table - Core school information
CREATE TABLE IF NOT EXISTS schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    state VARCHAR(100),
    lga VARCHAR(100), -- Local Government Area
    school_type VARCHAR(50) DEFAULT 'private', -- private, public, international
    student_capacity INTEGER DEFAULT 0,
    current_student_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended, cancelled
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School administrators table
CREATE TABLE IF NOT EXISTS school_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID, -- References auth.users when using Supabase Auth
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin, billing_admin
    is_primary BOOLEAN DEFAULT FALSE, -- Primary contact for the school
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, inactive
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    max_students INTEGER,
    max_admins INTEGER DEFAULT 5,
    features JSONB DEFAULT '[]', -- Array of features included
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School subscriptions table
CREATE TABLE IF NOT EXISTS school_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired, suspended
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    next_billing_date TIMESTAMPTZ,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    auto_renew BOOLEAN DEFAULT TRUE,
    cancelled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment gateways configuration
CREATE TABLE IF NOT EXISTS payment_gateways (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Paystack, Flutterwave, Payvessel, Manual Transfer
    slug VARCHAR(50) UNIQUE NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- api, manual
    is_active BOOLEAN DEFAULT TRUE,
    test_mode BOOLEAN DEFAULT TRUE,
    configuration JSONB DEFAULT '{}', -- API keys, webhook URLs, etc.
    supported_methods JSONB DEFAULT '[]', -- card, bank_transfer, ussd, etc.
    fees JSONB DEFAULT '{}', -- Fee structure
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES school_subscriptions(id),
    gateway_id UUID REFERENCES payment_gateways(id),
    reference VARCHAR(255) UNIQUE NOT NULL, -- Unique transaction reference
    gateway_reference VARCHAR(255), -- Gateway's transaction ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(20) DEFAULT 'pending', -- pending, successful, failed, cancelled, refunded
    payment_method VARCHAR(50), -- card, bank_transfer, ussd, manual
    gateway_response JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    verified_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment receipts table (for manual bank transfers)
CREATE TABLE IF NOT EXISTS payment_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    uploaded_by UUID, -- school admin who uploaded
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    bank_name VARCHAR(100),
    account_number VARCHAR(20),
    amount_paid DECIMAL(10,2),
    payment_date DATE,
    reference_number VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID, -- admin who reviewed
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plan features lookup table
CREATE TABLE IF NOT EXISTS plan_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    feature_key VARCHAR(100) UNIQUE NOT NULL, -- programmatic key
    feature_type VARCHAR(50) DEFAULT 'boolean', -- boolean, number, text
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_email ON schools(email);
CREATE INDEX IF NOT EXISTS idx_school_admins_school_id ON school_admins(school_id);
CREATE INDEX IF NOT EXISTS idx_school_admins_email ON school_admins(email);
CREATE INDEX IF NOT EXISTS idx_school_subscriptions_school_id ON school_subscriptions(school_id);
CREATE INDEX IF NOT EXISTS idx_school_subscriptions_status ON school_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_school_id ON payment_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_status ON payment_receipts(status);

-- Row Level Security (RLS) Policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Super Admin policies (full access)
CREATE POLICY "Super admins have full access to schools" ON schools
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins have full access to school_admins" ON school_admins
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins have full access to school_subscriptions" ON school_subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins have full access to payment_transactions" ON payment_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins have full access to payment_receipts" ON payment_receipts
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- School admin policies (access to their own school's data)
CREATE POLICY "School admins can view their school" ON schools
    FOR SELECT USING (id IN (
        SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    ));

CREATE POLICY "School admins can update their school" ON schools
    FOR UPDATE USING (id IN (
        SELECT school_id FROM school_admins WHERE user_id = auth.uid()
    ));

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, max_students, features, is_popular, sort_order) VALUES
('Basic', 'basic', 'Perfect for small schools just getting started', 15000, 150000, 500, '["Student Management", "Basic Reporting", "Email Support", "Payment Collection"]', false, 1),
('Professional', 'professional', 'Best for growing schools with advanced needs', 35000, 350000, 2000, '["Everything in Basic", "Advanced Analytics", "Bulk SMS", "Custom Reports", "Priority Support", "Parent Portal"]', true, 2),
('Enterprise', 'enterprise', 'For large institutions with complex requirements', 75000, 750000, 10000, '["Everything in Professional", "API Access", "Custom Integrations", "Dedicated Support", "Training", "Multi-Campus Support"]', false, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert default payment gateways
INSERT INTO payment_gateways (name, slug, provider_type, supported_methods, is_active, sort_order) VALUES
('Paystack', 'paystack', 'api', '["card", "bank_transfer", "ussd", "mobile_money"]', true, 1),
('Flutterwave', 'flutterwave', 'api', '["card", "bank_transfer", "ussd", "mobile_money", "bvn"]', true, 2),
('Payvessel', 'payvessel', 'api', '["card", "bank_transfer", "virtual_account"]', true, 3),
('Manual Bank Transfer', 'manual_transfer', 'manual', '["bank_transfer"]', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert default plan features
INSERT INTO plan_features (name, description, feature_key, feature_type, sort_order) VALUES
('Student Management', 'Manage student profiles and enrollment', 'student_management', 'boolean', 1),
('Payment Collection', 'Collect school fees and generate receipts', 'payment_collection', 'boolean', 2),
('Basic Reporting', 'Generate basic reports and analytics', 'basic_reporting', 'boolean', 3),
('Advanced Analytics', 'Detailed insights and custom dashboards', 'advanced_analytics', 'boolean', 4),
('Bulk SMS', 'Send SMS notifications to parents and students', 'bulk_sms', 'boolean', 5),
('Parent Portal', 'Dedicated portal for parent access', 'parent_portal', 'boolean', 6),
('API Access', 'Programmatic access to platform data', 'api_access', 'boolean', 7),
('Multi-Campus Support', 'Manage multiple school locations', 'multi_campus', 'boolean', 8),
('Custom Integrations', 'Connect with third-party systems', 'custom_integrations', 'boolean', 9),
('Priority Support', '24/7 dedicated customer support', 'priority_support', 'boolean', 10)
ON CONFLICT (feature_key) DO NOTHING;

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_admins_updated_at BEFORE UPDATE ON school_admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_subscriptions_updated_at BEFORE UPDATE ON school_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_gateways_updated_at BEFORE UPDATE ON payment_gateways
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_receipts_updated_at BEFORE UPDATE ON payment_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();