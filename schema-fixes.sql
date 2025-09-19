-- CRITICAL SECURITY FIXES for SchoolFees.NG Super Admin System
-- This file fixes the major security vulnerabilities identified

-- 1. Fix super_admins table to properly link to auth users
-- Drop existing table and recreate with proper structure
DROP TABLE IF EXISTS super_admins CASCADE;

CREATE TABLE super_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for performance
CREATE INDEX idx_super_admins_user_id ON super_admins(user_id);
CREATE INDEX idx_super_admins_email ON super_admins(email);

-- 2. Enable Row Level Security on all tables (CRITICAL)
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies and create secure ones
DROP POLICY IF EXISTS "Public can view hero content" ON hero_content;
DROP POLICY IF EXISTS "Public can view features" ON features;
DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view pricing plans" ON pricing_plans;
DROP POLICY IF EXISTS "Public can view pricing plan features" ON pricing_plan_features;
DROP POLICY IF EXISTS "Public can view contact info" ON contact_info;
DROP POLICY IF EXISTS "Public can view website settings" ON website_settings;
DROP POLICY IF EXISTS "Super admins can do everything on hero_content" ON hero_content;
DROP POLICY IF EXISTS "Super admins can do everything on features" ON features;
DROP POLICY IF EXISTS "Super admins can do everything on testimonials" ON testimonials;
DROP POLICY IF EXISTS "Super admins can do everything on pricing_plans" ON pricing_plans;
DROP POLICY IF EXISTS "Super admins can do everything on pricing_plan_features" ON pricing_plan_features;
DROP POLICY IF EXISTS "Super admins can do everything on contact_info" ON contact_info;
DROP POLICY IF EXISTS "Super admins can do everything on website_settings" ON website_settings;

-- 4. Create secure RLS policies

-- Public read access (website visitors can read active content)
CREATE POLICY "Public read hero_content" ON hero_content
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Public read features" ON features
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Public read testimonials" ON testimonials
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Public read pricing_plans" ON pricing_plans
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Public read pricing_plan_features" ON pricing_plan_features
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pricing_plans 
      WHERE pricing_plans.id = pricing_plan_features.plan_id 
      AND pricing_plans.is_active = TRUE
    )
  );

CREATE POLICY "Public read contact_info" ON contact_info
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Public read website_settings" ON website_settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Super admin full access policies (using proper user_id linkage)
CREATE POLICY "Super admin full access hero_content" ON hero_content
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin full access features" ON features
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin full access testimonials" ON testimonials
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin full access pricing_plans" ON pricing_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin full access pricing_plan_features" ON pricing_plan_features
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin full access contact_info" ON contact_info
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin full access website_settings" ON website_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Super admin read access policy
CREATE POLICY "Super admin read access" ON super_admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 5. Add unique constraints to prevent multiple active records
CREATE UNIQUE INDEX idx_hero_content_active ON hero_content (is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX idx_contact_info_active ON contact_info (is_active) WHERE is_active = TRUE;

-- 6. Re-insert default content (this will be the initial data)
-- Default hero content
INSERT INTO hero_content (title, subtitle, primary_cta_text, secondary_cta_text, stats_schools, stats_debt_reduction, stats_payments_processed) VALUES (
  'Nigeria''s #1 School Fees Management System',
  'Simplify fee collection, reduce outstanding debt by up to 65%, and empower parents with seamless online payments. Trusted by over 500 Nigerian schools.',
  'Start Free 30-Day Trial',
  'Watch Demo',
  500,
  65,
  '₦2.5B+'
) ON CONFLICT DO NOTHING;

-- Default features
INSERT INTO features (title, description, icon_name, sort_order) VALUES 
  ('Multiple Payment Options', 'Accept payments via Paystack, Flutterwave, bank transfers, and cards. Give parents flexibility in how they pay.', 'CreditCardIcon', 1),
  ('AI-Powered Analytics', 'Get intelligent insights on payment patterns, debt recovery strategies, and financial forecasting with Google Gemini AI.', 'ChartBarIcon', 2),
  ('Automated Reminders', 'Send SMS and email reminders automatically. Reduce manual work and improve collection rates significantly.', 'BellIcon', 3),
  ('Secure & Compliant', 'Bank-level security with encrypted data storage. Fully compliant with Nigerian financial regulations.', 'ShieldCheckIcon', 4),
  ('Multi-Role Dashboard', 'Separate dashboards for admins, parents, teachers, and staff. Everyone sees what they need to see.', 'UserGroupIcon', 5),
  ('Instant Receipts', 'Generate and send payment receipts automatically. Keep perfect records for auditing and transparency.', 'DocumentTextIcon', 6)
ON CONFLICT DO NOTHING;

-- Default testimonials
INSERT INTO testimonials (name, role, content, rating, sort_order) VALUES 
  ('Mrs. Adebayo Olumide', 'Bursar, Lagos International School', 'SchoolFees.NG reduced our outstanding debt by 65% in just 3 months. The automated reminders are a game-changer!', 5, 1),
  ('Mr. Chukwu Emmanuel', 'Parent', 'Finally, I can pay my children''s fees online without stress. The receipts are instant and the process is so smooth.', 5, 2),
  ('Dr. Fatima Hassan', 'Principal, Abuja Model School', 'The AI insights help us understand payment patterns and plan better. Our collection rate improved from 70% to 92%.', 5, 3)
ON CONFLICT DO NOTHING;

-- Default pricing plans
INSERT INTO pricing_plans (name, price, period, description, is_popular, sort_order) VALUES 
  ('Starter', '₦15,000', '/month', 'Perfect for small schools', FALSE, 1),
  ('Professional', '₦35,000', '/month', 'Most popular for growing schools', TRUE, 2),
  ('Enterprise', 'Custom', '', 'For large institutions', FALSE, 3)
ON CONFLICT DO NOTHING;

-- Default pricing plan features
INSERT INTO pricing_plan_features (plan_id, feature_text, sort_order) VALUES 
  ((SELECT id FROM pricing_plans WHERE name = 'Starter' LIMIT 1), 'Up to 500 students', 1),
  ((SELECT id FROM pricing_plans WHERE name = 'Starter' LIMIT 1), 'Basic payment processing', 2),
  ((SELECT id FROM pricing_plans WHERE name = 'Starter' LIMIT 1), 'Email reminders', 3),
  ((SELECT id FROM pricing_plans WHERE name = 'Starter' LIMIT 1), 'Standard support', 4),
  ((SELECT id FROM pricing_plans WHERE name = 'Starter' LIMIT 1), 'Basic reporting', 5),
  
  ((SELECT id FROM pricing_plans WHERE name = 'Professional' LIMIT 1), 'Up to 2,000 students', 1),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional' LIMIT 1), 'All payment methods', 2),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional' LIMIT 1), 'SMS + Email reminders', 3),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional' LIMIT 1), 'AI-powered analytics', 4),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional' LIMIT 1), 'Priority support', 5),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional' LIMIT 1), 'Advanced reporting', 6),
  ((SELECT id FROM pricing_plans WHERE name = 'Professional' LIMIT 1), 'Custom branding', 7),
  
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise' LIMIT 1), 'Unlimited students', 1),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise' LIMIT 1), 'White-label solution', 2),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise' LIMIT 1), 'API access', 3),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise' LIMIT 1), 'Dedicated support', 4),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise' LIMIT 1), 'Custom integrations', 5),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise' LIMIT 1), 'Advanced AI features', 6),
  ((SELECT id FROM pricing_plans WHERE name = 'Enterprise' LIMIT 1), 'Multi-campus support', 7)
ON CONFLICT DO NOTHING;

-- Default contact info
INSERT INTO contact_info (phone, email, address) VALUES 
  ('+234 (0) 800 SCHOOL (726665)', 'hello@schoolfees.ng', 'Lagos, Nigeria')
ON CONFLICT DO NOTHING;

-- Default website settings
INSERT INTO website_settings (setting_key, setting_value, setting_type, description) VALUES 
  ('site_name', 'SchoolFees.NG', 'text', 'Website name/brand'),
  ('site_tagline', 'Empowering Nigerian schools with intelligent fee management solutions since 2024.', 'text', 'Footer tagline'),
  ('copyright_year', '2024', 'text', 'Copyright year'),
  ('how_it_works_title', 'How SchoolFees.NG Works', 'text', 'How it works section title'),
  ('how_it_works_subtitle', 'Get started in just 3 simple steps', 'text', 'How it works section subtitle')
ON CONFLICT (setting_key) DO NOTHING;