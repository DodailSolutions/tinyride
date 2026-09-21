-- ============================================================================
-- TINYRIDE BY DODAIL — DATABASE SCHEMA MIGRATION 004
-- ============================================================================
-- Content Management System (CMS), SEO Settings, FAQs, Articles, Leads
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CMS ENUMS
-- ----------------------------------------------------------------------------
CREATE TYPE cms_lead_type AS ENUM ('PARENT', 'DRIVER', 'SCHOOL');
CREATE TYPE cms_lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'ARCHIVED');

-- ----------------------------------------------------------------------------
-- 2. CMS SETTINGS & GLOBAL SEO
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title VARCHAR(150) NOT NULL DEFAULT 'TinyRide by Dodail — School Transport Platform Hyderabad',
    meta_description TEXT NOT NULL DEFAULT 'Safe, verified, and transparent school auto & van transport in Hyderabad. Real-time child tracking, police-verified drivers, and simple monthly payments.',
    keywords TEXT[] NOT NULL DEFAULT ARRAY['school transport hyderabad', 'school van gachibowli', 'school auto begumpet', 'child safety transport', 'tinyride dodail'],
    canonical_url VARCHAR(255) NOT NULL DEFAULT 'https://tinyride.in',
    og_image_url VARCHAR(255) NOT NULL DEFAULT 'https://tinyride.in/og-image.jpg',
    contact_phone VARCHAR(30) NOT NULL DEFAULT '+91 40 4567 8900',
    contact_email VARCHAR(100) NOT NULL DEFAULT 'support@dodail.com',
    pilot_city VARCHAR(50) NOT NULL DEFAULT 'Hyderabad, Telangana, India',
    office_address TEXT NOT NULL DEFAULT 'Cyber Towers, Hitec City, Hyderabad, Telangana 500081',
    google_site_verification VARCHAR(100),
    is_live BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. CMS FAQS (SEO RICH SNIPPETS)
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. CMS ARTICLES & SAFETY GUIDES (SEO BLOG)
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(60) NOT NULL DEFAULT 'Child Safety',
    cover_image_url TEXT,
    author_name VARCHAR(100) NOT NULL DEFAULT 'Dodail Safety Committee',
    reading_time_minutes INTEGER NOT NULL DEFAULT 3,
    meta_title VARCHAR(150),
    meta_description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. CMS TESTIMONIALS
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(60) NOT NULL DEFAULT 'Parent',
    child_info VARCHAR(100) NOT NULL,
    school_name VARCHAR(120) NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    quote TEXT NOT NULL,
    area VARCHAR(60) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 6. CMS LEADS & WAITLIST INQUIRIES
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_type cms_lead_type NOT NULL DEFAULT 'PARENT',
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    area VARCHAR(100) NOT NULL,
    school_name VARCHAR(150),
    child_grade VARCHAR(50),
    vehicle_type vehicle_type,
    notes TEXT,
    status cms_lead_status NOT NULL DEFAULT 'NEW',
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 7. RLS POLICIES FOR CMS
-- ----------------------------------------------------------------------------
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_leads ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public can read live cms settings" ON public.cms_settings FOR SELECT USING (is_live = true);
CREATE POLICY "Public can read active faqs" ON public.cms_faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read published articles" ON public.cms_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read active testimonials" ON public.cms_testimonials FOR SELECT USING (is_active = true);

-- Public can submit lead inquiries
CREATE POLICY "Public can insert lead inquiries" ON public.cms_leads FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admins have full access to cms settings" ON public.cms_settings FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));
CREATE POLICY "Admins have full access to cms faqs" ON public.cms_faqs FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));
CREATE POLICY "Admins have full access to cms articles" ON public.cms_articles FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));
CREATE POLICY "Admins have full access to cms testimonials" ON public.cms_testimonials FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));
CREATE POLICY "Admins have full access to cms leads" ON public.cms_leads FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

-- ----------------------------------------------------------------------------
-- 8. SEED CMS DATA (Hyderabad Specific)
-- ----------------------------------------------------------------------------
INSERT INTO public.cms_settings (site_title, meta_description, canonical_url)
VALUES (
    'TinyRide by Dodail — Trusted School Transport Platform in Hyderabad',
    'Connecting Hyderabad parents with police-verified school auto & van drivers. Real-time boarding alerts, transparent monthly pricing, and strict seat capacity limits for DPS, Oakridge, HPS, and Glendale.',
    'https://tinyride.in'
);

INSERT INTO public.cms_faqs (category, question, answer, display_order)
VALUES
    ('Safety & Drivers', 'How are TinyRide school drivers verified in Hyderabad?', 'Every driver undergoes an exhaustive 4-step verification process: (1) Commercial Transport Driving License validation with Telangana RTA, (2) Telangana Police Clearance Certificate (PCC), (3) Annual Vehicle Fitness Certificate (FC) and commercial insurance check, and (4) Personal interview and road safety audit by Dodail Operations.', 1),
    ('Safety & Drivers', 'Are vehicles allowed to carry excess students?', 'Strictly NO. TinyRide strictly enforces local transport regulations: maximum 4-6 children in an Auto-rickshaw and 8-12 children in a school van. Our automated booking system prevents overselling seats.', 2),
    ('Bookings & Payments', 'How does monthly payment work?', 'Parents pay a transparent monthly fee online via Razorpay (UPI, Google Pay, PhonePe, Debit/Credit cards, or NetBanking). No cash handling or sudden fare hikes.', 3),
    ('Trip Tracking', 'How do parents know their child arrived safely at school?', 'Parents receive real-time notifications when the morning trip begins, when their child is picked up at the gate, and when the driver confirms safe handover at the school gate.', 4),
    ('Coverage & Routes', 'Which areas in Hyderabad does TinyRide cover?', 'Our initial pilot focuses on Gachibowli, Kondapur, Madhapur, Manikonda, Puppalguda, Begumpet, and Sun City, servicing partner schools like DPS Gachibowli, Oakridge International, HPS Begumpet, and Glendale Academy.', 5);

INSERT INTO public.cms_testimonials (author_name, relationship, child_info, school_name, rating, quote, area)
VALUES
    ('Pooja Deshmukh', 'Mother', 'Aarav (Grade 3)', 'DPS Gachibowli', 5, 'Before TinyRide, we were always anxious about whether our regular auto driver would turn up on time. The real-time pickup alerts give us total peace of mind every single morning!', 'Kondapur'),
    ('K. V. S. Murthy', 'Father', 'Sanya (Grade 5)', 'Oakridge International', 5, 'Clean vehicles, verified drivers who do not use their phones while driving, and transparent monthly UPI payments. Exactly what Hyderabad parents needed.', 'Manikonda'),
    ('Dr. Farhan Ali', 'Parent & Pediatrician', 'Zain (Grade 2)', 'Glendale Academy', 5, 'The strict seat limits was what convinced me. No overcrowding, polite driver, and prompt customer support.', 'Sun City');

INSERT INTO public.cms_articles (slug, title, excerpt, content, category, meta_title, meta_description)
VALUES
    ('hyderabad-school-transport-safety-rules-2026',
     'Telangana School Vehicle Safety Guidelines: What Every Hyderabad Parent Must Know',
     'A comprehensive guide to commercial driver badges, vehicle fitness certificates, and student capacity limits under Telangana RTA rules.',
     'School transportation safety is the highest priority for every parent in Hyderabad. Under the latest Telangana Motor Vehicles Rules and Supreme Court school transport guidelines, commercial auto-rickshaws carrying schoolchildren cannot exceed 6 children, while school vans must adhere strictly to their permitted RTA capacity. In this article, Dodail Solutions breaks down the essential legal checklists every parent should verify...',
     'Parent Safety Guide',
     'Telangana School Transport Safety Rules 2026 — Parent Guide',
     'Learn about Telangana RTA rules for school autos and vans in Hyderabad: capacity limits, police verification, and commercial driver licenses.'),
    ('how-tinyride-protects-student-data',
     'Child Privacy in School Logistics: How TinyRide Protects Student Locations',
     'Why public GPS links and unsecured group chats compromise child safety, and how our strict Row Level Security (RLS) keeps your child data private.',
     'In today’s connected world, sharing your child’s live location or school routine in unmoderated WhatsApp groups or public tracking links exposes sensitive private data. TinyRide was built from day one under the Digital Personal Data Protection Act (DPDPA 2023). Drivers only access passenger details for their assigned route, and location data is never made public...',
     'Privacy & Technology',
     'Child Privacy in School Logistics — TinyRide Safety Architecture',
     'How TinyRide uses enterprise PostgreSQL Row Level Security and encrypted streams to protect Hyderabad school children data.');
