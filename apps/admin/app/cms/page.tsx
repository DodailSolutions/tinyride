'use client';

import { useState } from 'react';
import {
  Sliders,
  Globe,
  Search,
  FileText,
  HelpCircle,
  Users,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
  Eye,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { FAQ_DATA } from '@/components/landing/FaqAccordion';
import { ARTICLES_DATA } from '@/components/landing/KnowledgeHubSection';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
}

interface LeadItem {
  id: string;
  type: 'PARENT' | 'DRIVER' | 'SCHOOL';
  name: string;
  phone: string;
  area: string;
  detail: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED';
  date: string;
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'lead-1',
    type: 'PARENT',
    name: 'Harika Reddy',
    phone: '+91 98490 12345',
    area: 'Kondapur, Hitec City',
    detail: 'DPS Gachibowli • Grade 4',
    status: 'NEW',
    date: 'Today, 02:15 PM',
  },
  {
    id: 'lead-2',
    type: 'DRIVER',
    name: 'V. Krishna (Commercial Auto)',
    phone: '+91 98490 67890',
    area: 'Gachibowli / Telecom Nagar',
    detail: 'Bajaj RE Auto (TS07UC8890) • 6 yrs exp',
    status: 'CONTACTED',
    date: 'Today, 11:30 AM',
  },
  {
    id: 'lead-3',
    type: 'PARENT',
    name: 'Sunil Nair',
    phone: '+91 98490 54321',
    area: 'Manikonda / Puppalguda',
    detail: 'Oakridge International • Grade 2',
    status: 'CONVERTED',
    date: 'Yesterday',
  },
  {
    id: 'lead-4',
    type: 'SCHOOL',
    name: 'CHIREC International (Admin Office)',
    phone: '+91 98490 98765',
    area: 'Kondapur Campus',
    detail: 'Exploring partner feeder routes for 2026',
    status: 'NEW',
    date: '20 Sep 2026',
  },
];

export default function ContentManagementSystemPage() {
  const [activeTab, setActiveTab] = useState<'SEO' | 'HERO' | 'FAQS' | 'ARTICLES' | 'LEADS'>('SEO');

  // SEO State
  const [siteTitle, setSiteTitle] = useState('TinyRide by Dodail — Trusted School Transport Platform in Hyderabad');
  const [metaDesc, setMetaDesc] = useState(
    'Safe, verified, and transparent school auto & van transport in Hyderabad. Real-time child tracking, police-verified drivers, and transparent monthly subscriptions for DPS, Oakridge, HPS, and Glendale.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://tinyride.in');
  const [keywords, setKeywords] = useState(
    'school transport hyderabad, school van gachibowli, school auto kondapur, child safety transport, dps gachibowli, tinyride dodail'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Hero State
  const [heroHeadline, setHeroHeadline] = useState('Safe, Verified School Transport for Hyderabad Kids');
  const [heroSubheadline, setHeroSubheadline] = useState(
    'TinyRide connects parents with strictly vetted independent school auto and van drivers. Enjoy real-time boarding alerts, transparent monthly UPI subscriptions, and zero vehicle overcrowding.'
  );
  const [heroBadge, setHeroBadge] = useState('Hyderabad Pilot Now Live — Gachibowli, Begumpet, Manikonda & Sun City');

  // FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>(
    FAQ_DATA.map((f, i) => ({
      id: `faq-${i + 1}`,
      category: 'General',
      question: f.question,
      answer: f.answer,
      isActive: true,
    }))
  );
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Articles State
  const [articles, setArticles] = useState(ARTICLES_DATA);

  // Leads State
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [leadFilter, setLeadFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'CONVERTED'>('ALL');

  const handleSaveSeo = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const item: FaqItem = {
      id: `faq-${Date.now()}`,
      category: 'General',
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      isActive: true,
    };
    setFaqs([...faqs, item]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const handleToggleFaq = (id: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f)));
  };

  const handleLeadStatus = (id: string, newStatus: 'NEW' | 'CONTACTED' | 'CONVERTED') => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  };

  const filteredLeads = leads.filter((l) => leadFilter === 'ALL' || l.status === leadFilter);

  return (
    <AdminShell>
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-orange-50 text-brand-orange-600 font-bold">
                <Sliders className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Content Management System (CMS) & SEO
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Control the live TinyRide landing page content, SEO metadata, FAQs, blog articles, and incoming leads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Eye className="w-4 h-4" /> Live Website Preview <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          {[
            { key: 'SEO', label: 'SEO & Search Snippet' },
            { key: 'HERO', label: 'Hero & Headlines' },
            { key: 'FAQS', label: `FAQs (${faqs.length})` },
            { key: 'ARTICLES', label: `Blog & Knowledge Base (${articles.length})` },
            { key: 'LEADS', label: `Waitlist Leads (${leads.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-brand-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SEO & SERP PREVIEW */}
        {activeTab === 'SEO' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Editor (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-extrabold text-base text-slate-900">Google Search Meta Settings</h2>
                {isSaved && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Saved Live!
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Page Title (Meta Title)</label>
                  <span className={`text-[10px] font-bold ${siteTitle.length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {siteTitle.length} / 60 chars (Recommended: 50-60)
                  </span>
                </div>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Meta Description</label>
                  <span className={`text-[10px] font-bold ${metaDesc.length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {metaDesc.length} / 160 chars (Recommended: 140-160)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Canonical URL</label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Search Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSaveSeo}
                  className="px-6 py-2.5 rounded-xl bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-950/20 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save SEO Settings
                </button>
              </div>
            </div>

            {/* Right: Live Google SERP Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Search className="w-4 h-4 text-brand-orange-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Google Search Snippet Preview
                  </h3>
                </div>

                {/* Google snippet card */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-1.5 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-orange-500 text-white flex items-center justify-center text-[10px] font-extrabold">
                      TR
                    </div>
                    <div>
                      <p className="text-[12px] text-slate-800 font-medium leading-none">TinyRide by Dodail</p>
                      <p className="text-[11px] text-slate-400 font-mono leading-none mt-0.5">{canonicalUrl}</p>
                    </div>
                  </div>

                  <h4 className="text-base text-blue-800 font-medium hover:underline cursor-pointer leading-snug pt-1">
                    {siteTitle || 'Page Title'}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {metaDesc || 'Meta description preview...'}
                  </p>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Schema.org Rich Results Active
                  </p>
                  <p className="text-[11px] text-emerald-700 leading-normal">
                    LocalBusiness, Organization, and FAQPage JSON-LD structures are automatically injected on the public page for Google carousel and snippet rankings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO & HEADLINES */}
        {activeTab === 'HERO' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-3xl">
            <h2 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
              Landing Page Hero Content
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hero Pilot Badge Text</label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary H1 Headline</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hero Subheadline</label>
              <textarea
                rows={3}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveSeo}
                className="px-6 py-2.5 rounded-xl bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                <Save className="w-4 h-4" /> Save Hero Section
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: FAQS MANAGER */}
        {activeTab === 'FAQS' && (
          <div className="space-y-6">
            {/* Add FAQ form */}
            <form onSubmit={handleAddFaq} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-orange-500" /> Add New FAQ Item (Auto-Synced with Google FAQPage Schema)
              </h2>

              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="Question (e.g. Can parents track the morning pickup in real-time?)"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="p-3 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Clear, authoritative answer explaining policy or workflow..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!newQuestion.trim() || !newAnswer.trim()}
                className="px-5 py-2.5 rounded-xl bg-brand-navy-900 text-white font-bold text-xs hover:bg-brand-navy-800 disabled:opacity-50"
              >
                + Publish FAQ to Website
              </button>
            </form>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between">
                <span>Active Website FAQs ({faqs.length})</span>
                <span>Actions</span>
              </div>

              {faqs.map((faq) => (
                <div key={faq.id} className="p-5 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1 flex-1">
                    <p className="font-bold text-slate-900 text-sm">{faq.question}</p>
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleFaq(faq.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        faq.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {faq.isActive ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BLOG ARTICLES */}
        {activeTab === 'ARTICLES' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">Safety Guides & Articles (SEO Hub)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Long-form content designed to rank for Telangana transport rules, auto vs van safety, and child privacy.
                </p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" /> Create New Guide
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div
                  key={art.slug}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-brand-orange-600 rounded">
                      {art.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-2 leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{art.date}</span>
                    <a
                      href={`/blog/${art.slug}`}
                      target="_blank"
                      className="text-xs font-bold text-brand-orange-600 hover:underline flex items-center gap-1"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: WAITLIST LEADS */}
        {activeTab === 'LEADS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">
                  Landing Page Waitlist Submissions & Leads
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time inquiries from parents, drivers, and schools who submitted the lead form.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['ALL', 'NEW', 'CONTACTED', 'CONVERTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      leadFilter === st
                        ? 'bg-brand-navy-900 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              <div className="p-4 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider grid grid-cols-12 gap-4">
                <span className="col-span-3">Contact & Type</span>
                <span className="col-span-3">Locality & Phone</span>
                <span className="col-span-4">Requirements / School</span>
                <span className="col-span-2 text-right">Status Action</span>
              </div>

              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-4 grid grid-cols-12 gap-4 items-center text-xs hover:bg-slate-50/80 transition-colors">
                  <div className="col-span-3">
                    <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        lead.type === 'PARENT'
                          ? 'bg-blue-100 text-blue-800'
                          : lead.type === 'DRIVER'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {lead.type}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-600" /> {lead.phone}
                    </p>
                    <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {lead.area}
                    </p>
                  </div>

                  <div className="col-span-4">
                    <p className="text-slate-700 font-medium">{lead.detail}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{lead.date}</p>
                  </div>

                  <div className="col-span-2 flex flex-col items-end gap-1.5">
                    <select
                      value={lead.status}
                      onChange={(e) => handleLeadStatus(lead.id, e.target.value as any)}
                      className={`text-[11px] font-bold p-1 rounded border focus:outline-none ${
                        lead.status === 'NEW'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : lead.status === 'CONTACTED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CONVERTED">CONVERTED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
