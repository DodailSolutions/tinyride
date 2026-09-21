'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  Download,
  Copy,
  Shield,
  Heart,
  Leaf,
  AlertTriangle,
  BookOpen,
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
  const [activeTab, setActiveTab] = useState<'SEO' | 'HERO' | 'FAQS' | 'ARTICLES' | 'LEADS' | 'BRAND'>('BRAND');

  // SEO State conforming to Brand Guidelines v1.0
  const [siteTitle, setSiteTitle] = useState('TinyRide by Dodail — Little Rides. Big Peace of Mind.');
  const [metaDesc, setMetaDesc] = useState(
    'School transport, made easier to manage. Arrange your child’s school commute with clearer route details, verified driver credentials, and dependable support in Hyderabad.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://tinyride.in');
  const [keywords, setKeywords] = useState(
    'school transport coordination, school van hyderabad, school auto gachibowli, tinyride dodail, little rides big peace of mind'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Hero State conforming to Brand Guidelines v1.0
  const [heroHeadline, setHeroHeadline] = useState('School transport, made easier to manage.');
  const [heroSubheadline, setHeroSubheadline] = useState(
    'Arrange your child’s school commute with clearer route details, verified driver information, and dependable support. A more coordinated connection between Hyderabad families and independent drivers.'
  );
  const [heroBadge, setHeroBadge] = useState('TinyRide by Dodail • Hyderabad School Commute Coordination');

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
            { key: 'BRAND', label: 'Brand Guidelines v1.0' },
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

        {/* TAB 0: BRAND GUIDELINES v1.0 */}
        {activeTab === 'BRAND' && (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-brand-navy-900 to-[#1E3A5F] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy-800 text-brand-orange-400 border border-brand-orange-500/30 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Working Brand Foundation • Version 1.0
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  TinyRide by Dodail — Brand Guidelines
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed">
                  School-transport coordination platform by Dodail. Designed to make school journeys feel more organized, understandable, and reassuring—without making safety promises the service cannot substantiate.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-300">
                  <span>Tagline: <strong className="text-brand-orange-400 font-bold">Little Rides. Big Peace of Mind.</strong></span>
                  <span>•</span>
                  <span>Owner: <strong className="text-white">Dodail Solutions Pvt. Ltd.</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-400">Approved MVP Direction</strong></span>
                </div>
              </div>
            </div>

            {/* Section 1: Master Visual & Logo Artwork */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-orange-600" /> 1. Master Logo & Official Artwork
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Use only the approved TinyRide master logo. Maintain clear space equal to the height of the &quot;T&quot; on all sides.
                  </p>
                </div>
                <a
                  href="/brand/tinyride-master-logo.png"
                  download="tinyride-master-logo.png"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy-900 text-white hover:bg-brand-navy-800 text-xs font-bold shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Master PNG (941×941)
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Artwork display */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="relative w-full max-w-sm aspect-square bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-center shadow-inner">
                    <Image
                      src="/brand/tinyride-master-logo.png"
                      alt="TinyRide Master Logo"
                      width={320}
                      height={320}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-2">
                    tinyride-master-logo.png • 941×941 RGBA
                  </span>
                </div>

                {/* Logo Rules */}
                <div className="md:col-span-7 space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wide">Logo Lockup Standards</h4>
                    <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                      <li>Use only the approved master logo artwork. Keep it legible and proportionally intact.</li>
                      <li>Maintain clear space: working minimum is the height of the &quot;T&quot; on all sides.</li>
                      <li>Do not stretch, skew, rotate, recolor, add drop shadows/effects, or rearrange elements.</li>
                      <li>Do not recreate the wordmark with a substitute font.</li>
                      <li>Keep &quot;by Dodail&quot; endorsement consistent with the approved lockup.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <h4 className="font-bold uppercase tracking-wide flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-700" /> Master Hallmarks
                    </h4>
                    <p className="text-[11px] leading-relaxed">
                      The four bottom badges in the master illustration represent the core service standards:
                      <strong> Safe</strong> (Green shield), <strong>Reliable</strong> (Amber users), <strong>Trusted</strong> (Rose heart), and <strong>Brighter Tomorrows</strong> (Emerald leaf).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Color Palette Tokens */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">2. Visual Identity & Color Palette</h3>
              <p className="text-xs text-slate-500">
                The working brand palette tokens defined in Version 1.0 specifications.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                  <div className="h-16 rounded-lg shadow-sm" style={{ backgroundColor: '#142B4A' }} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Deep Navy</p>
                    <p className="text-[11px] font-mono text-slate-500">#142B4A</p>
                    <p className="text-[11px] text-slate-600 mt-1">Trust, headings, primary fields</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                  <div className="h-16 rounded-lg shadow-sm" style={{ backgroundColor: '#F07832' }} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Warm Orange</p>
                    <p className="text-[11px] font-mono text-slate-500">#F07832</p>
                    <p className="text-[11px] text-slate-600 mt-1">Highlights & calls to action</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                  <div className="h-16 rounded-lg border border-slate-300 shadow-sm" style={{ backgroundColor: '#FFFFFF' }} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Soft White</p>
                    <p className="text-[11px] font-mono text-slate-500">#FFFFFF</p>
                    <p className="text-[11px] text-slate-600 mt-1">Clean backgrounds</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                  <div className="h-16 rounded-lg shadow-sm" style={{ backgroundColor: '#F3F5F7' }} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mist Grey</p>
                    <p className="text-[11px] font-mono text-slate-500">#F3F5F7</p>
                    <p className="text-[11px] text-slate-600 mt-1">Cards & dividers</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                  <div className="h-16 rounded-lg shadow-sm" style={{ backgroundColor: '#2F3948' }} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Slate</p>
                    <p className="text-[11px] font-mono text-slate-500">#2F3948</p>
                    <p className="text-[11px] text-slate-600 mt-1">Readable body copy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Brand Core & Positioning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
                <h3 className="text-base font-bold text-slate-900">3. Purpose, Mission & Vision</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Purpose</span>
                    <p className="text-slate-600 mt-0.5">Reduce the everyday uncertainty parents experience when arranging school transport.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Mission</span>
                    <p className="text-slate-600 mt-0.5">Make school commuting easier to arrange and manage through clear booking, communication, and support processes.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Vision</span>
                    <p className="text-slate-600 mt-0.5">A future where families can manage school transport with greater clarity, consistency, and confidence.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Core Principle</span>
                    <p className="text-slate-600 mt-0.5 font-medium italic">“Trust is earned through transparent processes, verified information and dependable communication.”</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
                <h3 className="text-base font-bold text-slate-900">4. Core Values</h3>
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800">Child-first thinking:</span>
                    <p className="text-slate-600 mt-0.5">Account for children’s wellbeing and age-appropriate physical and emotional needs.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800">Trust through transparency:</span>
                    <p className="text-slate-600 mt-0.5">Explain what is verified, what is included, and what remains the independent driver’s responsibility.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800">Reliability & Respect:</span>
                    <p className="text-slate-600 mt-0.5">Set clear expectations, communicate schedule changes promptly, and treat drivers as essential partners.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800">Accountability:</span>
                    <p className="text-slate-600 mt-0.5">Provide clear, immediate paths for parent questions, incidents, and issue resolution.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Tone, Compliance & Claims to Avoid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900">5. Messaging Compliance & Claims to Avoid</h3>
              <p className="text-slate-500">
                All platform copy, app content, customer service responses, and social media posts must follow these non-negotiable boundaries:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
                  <h4 className="font-bold uppercase tracking-wide text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Never Use / Avoid
                  </h4>
                  <ul className="space-y-1 text-rose-900 list-disc list-inside">
                    <li><strong>&quot;100% safe&quot;</strong>, <strong>&quot;zero risk&quot;</strong>, or <strong>&quot;guaranteed safety&quot;</strong></li>
                    <li><strong>&quot;Every driver is police-verified&quot;</strong> unless exact status and certificate are audited</li>
                    <li><strong>&quot;Always on time&quot;</strong> or guaranteed arrival time claims</li>
                    <li>Any suggestion that TinyRide owns, leases, or directly operates transport vehicles</li>
                    <li>Overly sentimental, childish, or fear-based messaging</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <h4 className="font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approved Wording & Tone
                  </h4>
                  <ul className="space-y-1 text-emerald-900 list-disc list-inside">
                    <li><strong>&quot;Little Rides. Big Peace of Mind.&quot;</strong></li>
                    <li><strong>&quot;School transport, made easier to manage.&quot;</strong></li>
                    <li><strong>&quot;Clear information. Thoughtful coordination. Support when you need it.&quot;</strong></li>
                    <li>Explain exact verification steps: DL audit, vehicle fitness check, and Police Clearance submission</li>
                    <li>Always include operating disclaimer: <em>TinyRide is a coordination platform; Dodail does not own transport vehicles.</em></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
