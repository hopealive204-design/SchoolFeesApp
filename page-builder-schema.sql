-- WordPress-like CMS + Elementor Page Builder Database Schema
-- This creates the foundation for visual page building with JSONB storage

-- 1. Pages table - stores all pages with their metadata
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_homepage BOOLEAN DEFAULT FALSE,
  schema JSONB NOT NULL DEFAULT '[]', -- Array of block configurations
  meta_title VARCHAR(255), -- SEO title
  meta_description TEXT, -- SEO description
  meta_keywords TEXT, -- SEO keywords
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Page versions table - stores version history for rollbacks
CREATE TABLE page_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  schema JSONB NOT NULL, -- Snapshot of page schema at this version
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, version)
);

-- 3. Media library table - for file/image management
CREATE TABLE media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Block templates table - for reusable block presets
CREATE TABLE block_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  block_type VARCHAR(100) NOT NULL, -- hero, features, testimonials, etc.
  template_schema JSONB NOT NULL, -- Block configuration template
  thumbnail_url TEXT, -- Preview image
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_homepage ON pages(is_homepage) WHERE is_homepage = TRUE;
CREATE INDEX idx_pages_published ON pages(published_at) WHERE status = 'published';
CREATE INDEX idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX idx_page_versions_version ON page_versions(page_id, version DESC);
CREATE INDEX idx_media_library_type ON media_library(file_type);
CREATE INDEX idx_block_templates_type ON block_templates(block_type);

-- Ensure only one homepage at a time
CREATE UNIQUE INDEX idx_pages_single_homepage ON pages(is_homepage) WHERE is_homepage = TRUE;

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Pages
-- Public can read published pages
CREATE POLICY "Public read published pages" ON pages
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- Super admins have full access to all pages
CREATE POLICY "Super admin full access pages" ON pages
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

-- RLS Policies for Page Versions
-- Super admins can read all page versions
CREATE POLICY "Super admin read page versions" ON page_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Super admins can create page versions
CREATE POLICY "Super admin create page versions" ON page_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- RLS Policies for Media Library
-- Public can read media (for published pages)
CREATE POLICY "Public read media" ON media_library
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Super admins can manage media
CREATE POLICY "Super admin manage media" ON media_library
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

-- RLS Policies for Block Templates
-- Public can read public templates
CREATE POLICY "Public read public templates" ON block_templates
  FOR SELECT TO anon, authenticated
  USING (is_public = TRUE);

-- Super admins can manage all templates
CREATE POLICY "Super admin manage templates" ON block_templates
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

-- Functions for automatic version creation
CREATE OR REPLACE FUNCTION create_page_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Create version when page is updated (but not on first insert)
  IF TG_OP = 'UPDATE' AND (OLD.schema != NEW.schema OR OLD.title != NEW.title) THEN
    INSERT INTO page_versions (
      page_id, 
      version, 
      title, 
      schema, 
      meta_title, 
      meta_description, 
      meta_keywords, 
      created_by
    )
    SELECT 
      NEW.id,
      COALESCE((SELECT MAX(version) FROM page_versions WHERE page_id = NEW.id), 0) + 1,
      OLD.title,
      OLD.schema,
      OLD.meta_title,
      OLD.meta_description,
      OLD.meta_keywords,
      NEW.updated_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create versions
CREATE TRIGGER page_version_trigger
  AFTER UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION create_page_version();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON media_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_block_templates_updated_at BEFORE UPDATE ON block_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default block templates
INSERT INTO block_templates (name, description, block_type, template_schema, is_public) VALUES
(
  'Default Hero Section',
  'A standard hero section with title, subtitle, and call-to-action buttons',
  'hero',
  '{
    "type": "hero",
    "props": {
      "title": "Welcome to Your Website",
      "subtitle": "Create amazing experiences with our platform",
      "primaryCtaText": "Get Started",
      "secondaryCtaText": "Learn More",
      "statsSchools": 100,
      "statsDebtReduction": 50,
      "statsPaymentsProcessed": "₦1M+"
    }
  }',
  TRUE
),
(
  'Feature Grid',
  'A responsive grid of features with icons and descriptions',
  'features',
  '{
    "type": "features",
    "props": {
      "title": "Key Features",
      "subtitle": "Everything you need to succeed",
      "features": [
        {
          "title": "Easy to Use",
          "description": "Intuitive interface designed for everyone",
          "iconName": "CheckCircleIcon"
        },
        {
          "title": "Secure & Reliable",
          "description": "Bank-level security with 99.9% uptime",
          "iconName": "ShieldCheckIcon"
        },
        {
          "title": "24/7 Support",
          "description": "Our team is here to help you succeed",
          "iconName": "ChatBubbleLeftRightIcon"
        }
      ]
    }
  }',
  TRUE
),
(
  'Customer Testimonials',
  'Social proof section with customer reviews and ratings',
  'testimonials',
  '{
    "type": "testimonials",
    "props": {
      "title": "What Our Customers Say",
      "subtitle": "Don''t just take our word for it",
      "testimonials": [
        {
          "name": "John Doe",
          "role": "CEO, Example Corp",
          "content": "This platform transformed our business operations completely.",
          "rating": 5
        }
      ]
    }
  }',
  TRUE
),
(
  'Pricing Plans',
  'Flexible pricing table with multiple plan options',
  'pricing',
  '{
    "type": "pricing",
    "props": {
      "title": "Choose Your Plan",
      "subtitle": "Flexible pricing for businesses of all sizes",
      "plans": [
        {
          "name": "Starter",
          "price": "₦10,000",
          "period": "/month",
          "description": "Perfect for small businesses",
          "isPopular": false,
          "features": ["Feature 1", "Feature 2", "Feature 3"]
        }
      ]
    }
  }',
  TRUE
),
(
  'Contact Information',
  'Contact details with phone, email, and address',
  'contact',
  '{
    "type": "contact",
    "props": {
      "title": "Get in Touch",
      "subtitle": "We''d love to hear from you",
      "phone": "+234 800 000 0000",
      "email": "hello@yourcompany.com",
      "address": "Lagos, Nigeria"
    }
  }',
  TRUE
);

-- Create default homepage if it doesn't exist
INSERT INTO pages (slug, title, status, is_homepage, schema, meta_title, meta_description)
VALUES (
  'home',
  'Homepage',
  'published',
  TRUE,
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "props": {
        "title": "Nigeria''s #1 School Fees Management System",
        "subtitle": "Simplify fee collection, reduce outstanding debt by up to 65%, and empower parents with seamless online payments. Trusted by over 500 Nigerian schools.",
        "primaryCtaText": "Start Free 30-Day Trial",
        "secondaryCtaText": "Watch Demo",
        "statsSchools": 500,
        "statsDebtReduction": 65,
        "statsPaymentsProcessed": "₦2.5B+"
      }
    },
    {
      "id": "features-1", 
      "type": "features",
      "props": {
        "title": "Everything You Need",
        "subtitle": "Comprehensive tools for modern school management"
      }
    },
    {
      "id": "testimonials-1",
      "type": "testimonials", 
      "props": {
        "title": "Trusted by Schools Across Nigeria",
        "subtitle": "See what educators and parents are saying"
      }
    },
    {
      "id": "pricing-1",
      "type": "pricing",
      "props": {
        "title": "Simple, Transparent Pricing", 
        "subtitle": "Choose the plan that fits your school"
      }
    },
    {
      "id": "contact-1",
      "type": "contact",
      "props": {
        "title": "Ready to Get Started?",
        "subtitle": "Contact us today for a free consultation"
      }
    }
  ]',
  'SchoolFees.NG - School Fee Management System',
  'Nigeria''s leading school fee management platform. Reduce debt, increase collections, and provide seamless payment experiences for parents and schools.'
)
ON CONFLICT (slug) DO NOTHING;