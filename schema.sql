-- SchoolFees.NG Super Admin Content Management Schema
-- This schema enables full website content editing for the SaaS owner

-- Super Admin Users table
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero Section Content
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  primary_cta_text TEXT NOT NULL,
  secondary_cta_text TEXT NOT NULL,
  stats_schools INTEGER DEFAULT 500,
  stats_debt_reduction INTEGER DEFAULT 65,
  stats_payments_processed TEXT DEFAULT '₦2.5B+',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features Section
CREATE TABLE IF NOT EXISTS features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL, -- Icon identifier (e.g., 'CreditCardIcon')
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials Section
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Plans
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Plan Features
CREATE TABLE IF NOT EXISTS pricing_plan_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES pricing_plans(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Information
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website Settings (general configuration)
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'text', -- text, number, boolean, json
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Policies for public read access (website visitors can read content)
CREATE POLICY "Public can view hero content" ON hero_content
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view features" ON features
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view pricing plans" ON pricing_plans
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view pricing plan features" ON pricing_plan_features
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view contact info" ON contact_info
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view website settings" ON website_settings
  FOR SELECT USING (TRUE);

-- Policies for super admin full access
CREATE POLICY "Super admins can do everything on hero_content" ON hero_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can do everything on features" ON features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can do everything on testimonials" ON testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can do everything on pricing_plans" ON pricing_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can do everything on pricing_plan_features" ON pricing_plan_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can do everything on contact_info" ON contact_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can do everything on website_settings" ON website_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.id = auth.uid()
    )
  );

-- Insert default content based on existing hardcoded data
-- Default hero content
INSERT INTO hero_content (title, subtitle, primary_cta_text, secondary_cta_text, stats_schools, stats_debt_reduction, stats_payments_processed) VALUES (
  'Nigeria''s #1 School Fees Management System',
  'Simplify fee collection, reduce outstanding debt by up to 65%, and empower parents with seamless online payments. Trusted by over 500 Nigerian schools.',
  'Start Free 30-Day Trial',
  'Watch Demo',
  500,
  65,
  '₦2.5B+'
);

-- Default features
INSERT INTO features (title, description, icon_name, sort_order) VALUES 
  ('Multiple Payment Options', 'Accept payments via Paystack, Flutterwave, bank transfers, and cards. Give parents flexibility in how they pay.', 'CreditCardIcon', 1),
  ('AI-Powered Analytics', 'Get intelligent insights on payment patterns, debt recovery strategies, and financial forecasting with Google Gemini AI.', 'ChartBarIcon', 2),
  ('Automated Reminders', 'Send SMS and email reminders automatically. Reduce manual work and improve collection rates significantly.', 'BellIcon', 3),
  ('Secure & Compliant', 'Bank-level security with encrypted data storage. Fully compliant with Nigerian financial regulations.', 'ShieldCheckIcon', 4),
  ('Multi-Role Dashboard', 'Separate dashboards for admins, parents, teachers, and staff. Everyone sees what they need to see.', 'UserGroupIcon', 5),
  ('Instant Receipts', 'Generate and send payment receipts automatically. Keep perfect records for auditing and transparency.', 'DocumentTextIcon', 6);

-- Default testimonials
INSERT INTO testimonials (name, role, content, rating, sort_order) VALUES 
  ('Mrs. Adebayo Olumide', 'Bursar, Lagos International School', 'SchoolFees.NG reduced our outstanding debt by 65% in just 3 months. The automated reminders are a game-changer!', 5, 1),
  ('Mr. Chukwu Emmanuel', 'Parent', 'Finally, I can pay my children''s fees online without stress. The receipts are instant and the process is so smooth.', 5, 2),
  ('Dr. Fatima Hassan', 'Principal, Abuja Model School', 'The AI insights help us understand payment patterns and plan better. Our collection rate improved from 70% to 92%.', 5, 3);

-- Default pricing plans
INSERT INTO pricing_plans (name, price, period, description, is_popular, sort_order) VALUES 
  ('Starter', '₦15,000', '/month', 'Perfect for small schools', FALSE, 1),
  ('Professional', '₦35,000', '/month', 'Most popular for growing schools', TRUE, 2),
  ('Enterprise', 'Custom', '', 'For large institutions', FALSE, 3);

-- Default pricing plan features
INSERT INTO pricing_plan_features (plan_id, feature_text, sort_order) VALUES 
  ((SELECT id FROM pricing_plans WHERE name = 'Starter'), 'Up to 500 students', 1),
  ((SELECT id FROM pricing_plans WHERE name = 'Starter'), 'Basic payment processing', 2),
  ((SELECT id FROM pricing_plans WHERE name = 'Starter'), 'Email reminders', 3),
  ((SELECT id FROM pricing_plans WHERE name = 'Starter'), 'Standard support', 4),
  ((SELECT id FROM pricing_plans WHERE name = 'Starter'), 'Basic reporting', 5),
  
  ((SELECT id FROM pricing_plans WHERE name = 'Professional'), 'Up to 2,000 students', 1),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional'), 'All payment methods', 2),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional'), 'SMS + Email reminders', 3),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional'), 'AI-powered analytics', 4),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional'), 'Priority support', 5),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional'), 'Advanced reporting', 6),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional'), 'Custom branding', 7),
  
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise'), 'Unlimited students', 1),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise'), 'White-label solution', 2),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise'), 'API access', 3),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise'), 'Dedicated support', 4),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise'), 'Custom integrations', 5),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise'), 'Advanced AI features', 6),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise'), 'Multi-campus support', 7);

-- Default contact info
INSERT INTO contact_info (phone, email, address) VALUES 
  ('+234 (0) 800 SCHOOL (726665)', 'hello@schoolfees.ng', 'Lagos, Nigeria');

-- Default website settings
INSERT INTO website_settings (setting_key, setting_value, setting_type, description) VALUES 
  ('site_name', 'SchoolFees.NG', 'text', 'Website name/brand'),
  ('site_tagline', 'Empowering Nigerian schools with intelligent fee management solutions since 2024.', 'text', 'Footer tagline'),
  ('copyright_year', '2024', 'text', 'Copyright year'),
  ('how_it_works_title', 'How SchoolFees.NG Works', 'text', 'How it works section title'),
  ('how_it_works_subtitle', 'Get started in just 3 simple steps', 'text', 'How it works section subtitle');