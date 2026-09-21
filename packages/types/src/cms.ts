export type CmsLeadType = 'PARENT' | 'DRIVER' | 'SCHOOL';
export type CmsLeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'ARCHIVED';

export interface CmsSettings {
  id: string;
  site_title: string;
  meta_description: string;
  keywords: string[];
  canonical_url: string;
  og_image_url: string;
  contact_phone: string;
  contact_email: string;
  pilot_city: string;
  office_address: string;
  google_site_verification?: string | null;
  is_live: boolean;
  updated_at: string;
}

export interface CmsFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image_url?: string | null;
  author_name: string;
  reading_time_minutes: number;
  meta_title?: string | null;
  meta_description?: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface CmsTestimonial {
  id: string;
  author_name: string;
  relationship: string;
  child_info: string;
  school_name: string;
  rating: number;
  quote: string;
  area: string;
  is_active: boolean;
  created_at: string;
}

export interface CmsLead {
  id: string;
  lead_type: CmsLeadType;
  full_name: string;
  phone: string;
  email?: string | null;
  area: string;
  school_name?: string | null;
  child_grade?: string | null;
  vehicle_type?: 'AUTO' | 'VAN' | null;
  notes?: string | null;
  status: CmsLeadStatus;
  created_at: string;
  updated_at: string;
}
