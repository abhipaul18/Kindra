'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreePine,
  AlertTriangle,
  HeartHandshake,
  Dog,
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Search,
  Cpu,
  Layers,
  Zap,
  Globe,
  Star,
  ExternalLink,
  Mail,
  Lock,
  FileText,
  HelpCircle,
  Briefcase,
  Share2,
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { InfiniteSlider } from '@/components/core/infinite-slider';
import { AnimatedGroup } from '@/components/core/animated-group';
import { BorderTrail } from '@/components/core/border-trail';
import { AnimatedBackground } from '@/components/core/animated-background';
import { ScrollProgress } from '@/components/core/scroll-progress';
import { GlowEffect } from '@/components/core/glow-effect';
import { TextEffect } from '@/components/core/text-effect';
import { TextLoop } from '@/components/core/text-loop';
import { DialogCustomVariantsTransition } from '@/components/core/dialog-custom-variants-transition';
import { Magnetic } from '@/components/core/magnetic';

// Memoized text effect for hero description to ensure character animation runs ONLY ONCE on mount
const HeroDescriptionTextEffect = React.memo(function HeroDescriptionTextEffect() {
  return (
    <TextEffect
      per="char"
      preset="fade"
      as="p"
      className="text-base md:text-lg text-on-surface-variant max-w-lg leading-relaxed"
    >
      Join thousands of active citizens improving their local communities. Complete verified good deeds, report infrastructure issues, and earn Karma rewards verified by Gemma AI Vision.
    </TextEffect>
  );
});

// ============================================================
// DATA TYPES & MOCK DATA FOR LANDING PAGE
// ============================================================

interface LandingPageProps {
  onNavigateToRole?: (role: string) => void;
  onExploreMissions?: () => void;
  onNavigateToAuth?: () => void;
}

interface ImpactStateData {
  id: string;
  name: string;
  treesPlanted: string;
  issuesResolved: string;
  volunteers: string;
  karmaGenerated: string;
  topActivity: string;
}

const INDIA_STATES_DATA: Record<string, ImpactStateData> = {
  karnataka: {
    id: 'karnataka',
    name: 'Karnataka',
    treesPlanted: '8,420',
    issuesResolved: '2,940',
    volunteers: '14,200',
    karmaGenerated: '485,000 XP',
    topActivity: 'Urban Reforestation & Pothole Reporting',
  },
  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra',
    treesPlanted: '6,150',
    issuesResolved: '3,110',
    volunteers: '16,800',
    karmaGenerated: '520,000 XP',
    topActivity: 'Beach Cleanups & Blood Donation Drives',
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    treesPlanted: '4,890',
    issuesResolved: '1,850',
    volunteers: '9,400',
    karmaGenerated: '310,000 XP',
    topActivity: 'Air Quality Action & Stray Animal Feeding',
  },
  tamilnadu: {
    id: 'tamilnadu',
    name: 'Tamil Nadu',
    treesPlanted: '3,920',
    issuesResolved: '1,420',
    volunteers: '8,100',
    karmaGenerated: '275,000 XP',
    topActivity: 'Water Conservation & Library Book Donations',
  },
  telangana: {
    id: 'telangana',
    name: 'Telangana',
    treesPlanted: '2,460',
    issuesResolved: '910',
    volunteers: '5,800',
    karmaGenerated: '190,000 XP',
    topActivity: 'Solar Community Lighting & Park Maintenance',
  },
  westbengal: {
    id: 'westbengal',
    name: 'West Bengal',
    treesPlanted: '1,980',
    issuesResolved: '740',
    volunteers: '4,900',
    karmaGenerated: '160,000 XP',
    topActivity: 'Educational Tutoring & Flood Support',
  },
};

const COMMUNITY_FEED_ITEMS = [
  {
    id: '1',
    user: 'Rahul P.',
    city: 'Bengaluru',
    action: 'Planted 3 native saplings',
    categoryIcon: TreePine,
    categoryColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    status: 'Verified by Gemma AI',
    time: '2 min ago',
    karma: '+50 Karma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '2',
    user: 'Priya Sharma',
    city: 'Mumbai',
    action: 'Reported severe road pothole',
    categoryIcon: AlertTriangle,
    categoryColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    status: 'PWD Department Notified',
    time: '5 min ago',
    karma: '+40 Karma',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '3',
    user: 'Aman Verma',
    city: 'Delhi',
    action: 'Fed 12 street dogs in West Sector',
    categoryIcon: Dog,
    categoryColor: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    status: 'Verified by Gemma AI',
    time: '12 min ago',
    karma: '+35 Karma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '4',
    user: 'Sneha Reddy',
    city: 'Hyderabad',
    action: 'Donated 15 school textbooks',
    categoryIcon: HeartHandshake,
    categoryColor: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    status: 'Library Receipt Verified',
    time: '18 min ago',
    karma: '+60 Karma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '5',
    user: 'Vikram Singh',
    city: 'Pune',
    action: 'Donated blood at Rotary Drive',
    categoryIcon: HeartHandshake,
    categoryColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    status: 'Hospital Card Verified',
    time: '25 min ago',
    karma: '+100 Karma',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'KINDRA turned my daily morning walks into active tree care. Earning Gold Karma status while keeping my neighborhood green feels incredible!',
    name: 'Rohan Deshmukh',
    role: 'Citizen Volunteer',
    city: 'Bengaluru',
    karma: '2,840 Karma',
    tier: 'Gold Tier',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote:
      'Reporting a dangerous pothole took 30 seconds. Gemma AI verified it instantly and the municipal department resolved it within 48 hours.',
    name: 'Meera Nair',
    role: 'Civic Reporter',
    city: 'Kochi',
    karma: '1,450 Karma',
    tier: 'Silver Tier',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote:
      'Our NGO partnered with KINDRA for a blood donation drive. The transparent AI verification increased volunteer participation by 300%!',
    name: 'Dr. Aris Khan',
    role: 'Partner NGO Director',
    city: 'Delhi',
    karma: '4,900 Karma',
    tier: 'Platinum Tier',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];

export default function KindraLandingPage({ onNavigateToRole, onExploreMissions, onNavigateToAuth }: LandingPageProps) {
  const [selectedState, setSelectedState] = useState<string>('karnataka');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Auto rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentStateData = INDIA_STATES_DATA[selectedState];

  return (
    <div suppressHydrationWarning className="min-h-screen bg-background text-on-surface font-sans overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Scroll Progress Bar */}
      <ScrollProgress className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-amber-500 z-[100]" />

      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH ANIMATED FLOATING CARDS */}
      {/* ============================================================ */}
      <section className="relative pt-4 pb-20 overflow-hidden border-b border-outline-variant/20">
        {/* Soft Ambient Background Blobs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary-container/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-grid-pattern -z-20 opacity-40"></div>

        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-12 gap-gutter items-center min-h-[640px]">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-6 flex flex-col gap-6 z-10"
          >
            <div className="inline-flex items-center gap-2 bg-surface-container-high/80 backdrop-blur-md text-on-surface-variant px-4 py-2 rounded-full w-fit border border-outline-variant/30 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                AI-Powered Civic Platform
              </span>
              <span className="text-xs text-outline font-medium">| Join 50,000+ Citizens</span>
            </div>

            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight min-h-[140px] md:min-h-[160px]">
              <TextLoop interval={3} className="w-full">
                <div className="flex flex-col gap-1 sm:gap-2 leading-tight">
                  <span className="text-on-surface">Act Local.</span>
                  <span className="text-primary font-black">Change Everything.</span>
                </div>

                <div className="flex flex-col gap-1 sm:gap-2 leading-tight">
                  <span className="text-on-surface">Every Action.</span>
                  <span className="text-primary font-black">Every Impact.</span>
                </div>

                <div className="flex flex-col gap-1 sm:gap-2 leading-tight">
                  <span className="text-on-surface">One Good Deed.</span>
                  <span className="text-primary font-black">One Better World.</span>
                </div>

                <div className="flex flex-col gap-1 sm:gap-2 leading-tight">
                  <span className="text-on-surface">Small Acts.</span>
                  <span className="text-primary font-black">Massive Impact.</span>
                </div>

                <div className="flex flex-col gap-1 sm:gap-2 leading-tight">
                  <span className="text-on-surface">Take Action.</span>
                  <span className="text-primary font-black">Transform Communities.</span>
                </div>
              </TextLoop>
            </div>

            <HeroDescriptionTextEffect />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Magnetic>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToAuth) onNavigateToAuth();
                    else window.location.href = '/login';
                  }}
                  className="bg-primary text-on-primary font-bold px-7 py-3.5 rounded-2xl hover:shadow-level-2 hover:bg-primary-container transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group shadow-md cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Magnetic>
              <Magnetic>
                <a
                  href="#impact-categories"
                  className="bg-surface border border-outline-variant text-on-surface-variant font-bold px-7 py-3.5 rounded-2xl hover:border-primary hover:text-primary transition-all duration-200 active:scale-95 flex items-center justify-center"
                >
                  Explore Missions
                </a>
              </Magnetic>
            </div>

            {/* Micro Rating */}
            <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/30">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="User"
                    className="w-8 h-8 rounded-full border-2 border-surface object-cover shadow-sm"
                  />
                ))}
              </div>
              <div className="text-xs text-on-surface-variant">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                  <span className="text-on-surface ml-1">4.9/5</span>
                </div>
                <span>Verified by 50k+ active contributors</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Illustration & Floating Stats */}
          <div className="md:col-span-6 relative h-[420px] md:h-[560px] flex items-center justify-center">
            {/* Ambient Backing Glow */}
            <div className="absolute inset-0 bg-primary-container/10 rounded-full blur-3xl mix-blend-multiply"></div>

            {/* Central 3D Illustration */}
            <img
              src="/hero_illustration.png"
              alt="KINDRA Civic Action"
              className="w-full h-full object-contain floating relative z-10 drop-shadow-2xl"
            />

            {/* Floating Stat Card 1: Trees Planted (Top Left) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-0 md:-left-4 z-20 bg-surface/90 backdrop-blur-md border border-emerald-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-3 hidden sm:flex"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                🌱
              </div>
              <div>
                <p className="text-xs font-black text-on-surface">25,841</p>
                <p className="text-[10px] text-on-surface-variant font-medium">Trees Planted</p>
              </div>
            </motion.div>

            {/* Floating Stat Card 2: Issues Resolved (Top Right) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-10 right-0 md:-right-4 z-20 bg-surface/90 backdrop-blur-md border border-blue-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-3 hidden sm:flex"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
                🛣️
              </div>
              <div>
                <p className="text-xs font-black text-on-surface">8,230</p>
                <p className="text-[10px] text-on-surface-variant font-medium">Civic Issues Resolved</p>
              </div>
            </motion.div>

            {/* Floating Stat Card 3: Volunteer Hours (Middle Right) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-24 right-2 z-20 bg-surface/90 backdrop-blur-md border border-purple-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-3 hidden md:flex"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold">
                🤝
              </div>
              <div>
                <p className="text-xs font-black text-on-surface">14,320</p>
                <p className="text-[10px] text-on-surface-variant font-medium">Volunteer Hours</p>
              </div>
            </motion.div>

            {/* Floating Stat Card 4: Waste Collected (Bottom Left) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute bottom-6 left-2 z-20 bg-surface/90 backdrop-blur-md border border-amber-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-3 hidden sm:flex"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                ♻️
              </div>
              <div>
                <p className="text-xs font-black text-on-surface">98,000 kg</p>
                <p className="text-[10px] text-on-surface-variant font-medium">Waste Collected</p>
              </div>
            </motion.div>

            {/* Floating Stat Card 5: Blood Donations (Bottom Right) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute bottom-2 right-10 z-20 bg-surface/90 backdrop-blur-md border border-rose-500/30 p-3 rounded-2xl shadow-xl flex items-center gap-3 hidden lg:flex"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center font-bold">
                ❤️
              </div>
              <div>
                <p className="text-xs font-black text-on-surface">4,600</p>
                <p className="text-[10px] text-on-surface-variant font-medium">Blood Donations</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. LIVE IMPACT COUNTER */}
      {/* ============================================================ */}
      <section className="bg-surface-container-lowest py-10 border-b border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <AnimatedGroup
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              },
              item: {
                hidden: {
                  opacity: 0,
                  filter: 'blur(12px)',
                  y: -60,
                  rotateX: 90,
                },
                visible: {
                  opacity: 1,
                  filter: 'blur(0px)',
                  y: 0,
                  rotateX: 0,
                  transition: {
                    type: 'spring',
                    bounce: 0.3,
                    duration: 1,
                  },
                },
              },
            }}
          >
            <div key={1} className="p-4 rounded-2xl bg-surface/50 border border-outline-variant/20 hover:border-primary/30 transition-all shadow-sm">
              <p className="text-3xl md:text-4xl font-black text-primary tracking-tight">50,000+</p>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                Active Citizens
              </p>
            </div>

            <div key={2} className="p-4 rounded-2xl bg-surface/50 border border-outline-variant/20 hover:border-secondary/30 transition-all shadow-sm">
              <p className="text-3xl md:text-4xl font-black text-secondary tracking-tight">120,000+</p>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                Verified Missions
              </p>
            </div>

            <div key={3} className="p-4 rounded-2xl bg-surface/50 border border-outline-variant/20 hover:border-amber-500/30 transition-all shadow-sm">
              <p className="text-3xl md:text-4xl font-black text-amber-600 tracking-tight">₹3.2M</p>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                Community Value Created
              </p>
            </div>

            <div key={4} className="p-4 rounded-2xl bg-surface/50 border border-outline-variant/20 hover:border-purple-500/30 transition-all shadow-sm">
              <p className="text-3xl md:text-4xl font-black text-purple-600 tracking-tight">2,800+</p>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                Active Volunteers Today
              </p>
            </div>
          </AnimatedGroup>
        </div>
      </section>



      {/* ============================================================ */}
      {/* 3. MISSION CATEGORIES — "CHOOSE YOUR IMPACT" */}
      {/* ============================================================ */}
      <section id="impact-categories" className="py-20 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary-container/30 px-3.5 py-1.5 rounded-full border border-secondary/30">
            Civic Opportunities
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-on-surface mt-3">Choose Your Impact</h2>
          <p className="text-base text-on-surface-variant max-w-xl mx-auto mt-2">
            Explore verified missions designed to restore the environment, upgrade civic infrastructure, and strengthen communities.
          </p>
        </div>

        <AnimatedGroup preset="scale" delay={0.4} stagger={0.15} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Environment */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-level-1 hover:shadow-level-3 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TreePine className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">🌳 Environment</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Tree Plantation, Clean-up Drives, Seed Ball Campaigns, and Water Conservation.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>12,450+ Missions Completed</span>
              </div>
            </div>
            <a
              href="/citizen/dashboard"
              className="w-full py-2.5 bg-surface-container-low hover:bg-emerald-500 text-on-surface hover:text-white font-bold text-xs rounded-xl text-center border border-outline-variant/30 hover:border-emerald-500 transition-all flex items-center justify-center gap-1 group-hover:shadow-md mt-auto"
            >
              <span>Explore Missions</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Card 2: Civic Issues */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-level-1 hover:shadow-level-3 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">🚨 Civic Issues</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Road Potholes, Broken Street Lights, Garbage Dump Sites, and Infrastructure Hazards.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-full w-fit mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>8,920+ Issues Resolved</span>
              </div>
            </div>
            <a
              href="/citizen/report"
              className="w-full py-2.5 bg-surface-container-low hover:bg-blue-600 text-on-surface hover:text-white font-bold text-xs rounded-xl text-center border border-outline-variant/30 hover:border-blue-600 transition-all flex items-center justify-center gap-1 group-hover:shadow-md mt-auto"
            >
              <span>Report Issue</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Card 3: Community */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-level-1 hover:shadow-level-3 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">🤝 Community</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Volunteer Teaching, Food Donation Drives, Blood Donation, and School Book Donation.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-500/10 px-3 py-1.5 rounded-full w-fit mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>15,800+ Hours Contributed</span>
              </div>
            </div>
            <a
              href="/citizen/dashboard"
              className="w-full py-2.5 bg-surface-container-low hover:bg-rose-600 text-on-surface hover:text-white font-bold text-xs rounded-xl text-center border border-outline-variant/30 hover:border-rose-600 transition-all flex items-center justify-center gap-1 group-hover:shadow-md mt-auto"
            >
              <span>Join Drives</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Card 4: Animal Welfare */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-level-1 hover:shadow-level-3 transition-all flex flex-col justify-between group h-full"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Dog className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">🐾 Animal Welfare</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Stray Animal Feeding Stations, Animal Rescue Support, and Water Bowl Installation.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-500/10 px-3 py-1.5 rounded-full w-fit mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>4,120+ Animals Assisted</span>
              </div>
            </div>
            <a
              href="/citizen/dashboard"
              className="w-full py-2.5 bg-surface-container-low hover:bg-orange-600 text-on-surface hover:text-white font-bold text-xs rounded-xl text-center border border-outline-variant/30 hover:border-orange-600 transition-all flex items-center justify-center gap-1 group-hover:shadow-md mt-auto"
            >
              <span>Support Animals</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </AnimatedGroup>
      </section>
      {/* ============================================================ */}
      <section className="py-20 bg-surface-container-low/60 border-y border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-container/20 px-3.5 py-1.5 rounded-full border border-primary/20">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-on-surface mt-3">How KINDRA Works</h2>
            <p className="text-base text-on-surface-variant max-w-xl mx-auto mt-2">
              From real-world action to AI verification and instant Karma rewards.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-12 right-12 h-1 bg-gradient-to-r from-primary via-secondary to-amber-500 z-0 opacity-30 pointer-events-none" />

            <AnimatedGroup
              className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10"
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    filter: 'blur(12px)',
                    y: -60,
                    rotateX: 90,
                  },
                  visible: {
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    rotateX: 0,
                    transition: {
                      type: 'spring',
                      bounce: 0.3,
                      duration: 1,
                    },
                  },
                },
              }}
            >
              {/* Step 1 */}
              <div className="relative rounded-3xl group">
                <GlowEffect colors={['#0894FF', '#0052cc', '#38ef7d', '#00c6ff']} mode="rotate" blur="medium" />
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-surface-container-lowest p-6 rounded-3xl border border-primary/20 hover:border-primary hover:shadow-level-2 transition-all relative z-10 flex flex-col gap-4 h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary font-black text-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      1
                    </div>
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">Choose Mission</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Browse local civic needs, tree planting drives, or NGO campaigns that match your skills.
                  </p>
                </motion.div>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-3xl group">
                <GlowEffect colors={['#10b981', '#34d399', '#059669', '#6ee7b7']} mode="rotate" blur="medium" />
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-surface-container-lowest p-6 rounded-3xl border border-secondary/20 hover:border-secondary hover:shadow-level-2 transition-all relative z-10 flex flex-col gap-4 h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container font-black text-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      2
                    </div>
                    <HeartHandshake className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">Complete Good Deed</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Take real-world action and capture photo or video proof with live GPS tagging.
                  </p>
                </motion.div>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-3xl group">
                <GlowEffect colors={['#f59e0b', '#d97706', '#fbbf24', '#fef08a']} mode="rotate" blur="medium" />
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-surface-container-lowest p-6 rounded-3xl border border-amber-500/20 hover:border-amber-500 hover:shadow-level-2 transition-all relative z-10 flex flex-col gap-4 h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 font-black text-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      3
                    </div>
                    <Cpu className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">AI Verification (Gemma)</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Gemma AI Vision analyzes photo authenticity, perceptual hashes, and location in seconds.
                  </p>
                </motion.div>
              </div>

              {/* Step 4 */}
              <div className="relative rounded-3xl group">
                <GlowEffect colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']} mode="rotate" blur="medium" />
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-surface-container-lowest p-6 rounded-3xl border border-emerald-500/30 hover:border-emerald-500 hover:shadow-level-2 transition-all relative z-10 flex flex-col gap-4 border-l-4 border-l-emerald-500 h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      4
                    </div>
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">Earn Karma & Rewards</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Unlock reputation badges, level up your Karma tier, and redeem partner reward vouchers.
                  </p>
                </motion.div>
              </div>
            </AnimatedGroup>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. LIVE COMMUNITY FEED (HORIZONTALLY AUTO-SCROLLING TICKER) */}
      {/* ============================================================ */}
      <section className="py-16 bg-surface overflow-hidden border-b border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Live Activity Feed
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-on-surface mt-1">Real-Time Community Impact</h2>
          </div>
          <a
            href="/citizen/dashboard"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Activity</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Infinite Scrolling Ticker Track */}
        <div className="py-2">
          <InfiniteSlider gap={24} duration={35} durationOnHover={90} reverse>
            {COMMUNITY_FEED_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="w-80 flex-none bg-surface-container-lowest border border-outline-variant/30 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img src={item.avatar} alt={item.user} className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" />
                  <div>
                    <span className="font-bold text-xs text-on-surface block">{item.user}</span>
                    <span className="text-[10px] text-outline flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.city} • {item.time}
                    </span>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {item.karma}
                  </span>
                </div>
                <p className="text-xs font-semibold text-on-surface mb-2">{item.action}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant bg-surface-container-high/60 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>{item.status}</span>
                </div>
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. INTERACTIVE INDIA MAP SECTION */}
      {/* ============================================================ */}
      <section className="py-20 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop border-b border-outline-variant/30">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-container/20 px-3.5 py-1.5 rounded-full border border-primary/20">
            Nationwide Coverage
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-on-surface mt-3">Interactive Impact Map</h2>
          <p className="text-base text-on-surface-variant max-w-xl mx-auto mt-2">
            Click a region to inspect live civic contributions, verified reports, and active volunteers.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-center bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-level-2">
          {/* Interactive State Selector List */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Select State / Region</p>
            <AnimatedGroup preset="scale" delay={0.2} stagger={0.06} className="flex flex-col gap-3">
              {Object.values(INDIA_STATES_DATA).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedState(st.id)}
                  className={`p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                    selectedState === st.id
                      ? 'bg-primary-container/15 border-primary text-primary font-bold shadow-sm'
                      : 'bg-surface border-outline-variant/20 text-on-surface hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedState === st.id ? 'bg-primary animate-ping' : 'bg-outline-variant'}`}></div>
                    <span className="text-sm font-semibold">{st.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold">{st.volunteers} Volunteers</span>
                </button>
              ))}
            </AnimatedGroup>
          </div>

          {/* Active State Impact Statistics Card */}
          <div className="md:col-span-7 bg-surface p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-inner">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Region Snapshot</span>
                <h3 className="text-2xl font-black text-on-surface">{currentStateData.name}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Verified
              </span>
            </div>

            <AnimatedGroup key={selectedState} preset="scale" delay={0.1} stagger={0.06} className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20">
                <p className="text-xs text-on-surface-variant font-medium">Trees Planted</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{currentStateData.treesPlanted}</p>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20">
                <p className="text-xs text-on-surface-variant font-medium">Civic Issues Resolved</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{currentStateData.issuesResolved}</p>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20">
                <p className="text-xs text-on-surface-variant font-medium">Active Volunteers</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{currentStateData.volunteers}</p>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20">
                <p className="text-xs text-on-surface-variant font-medium">Karma Generated</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{currentStateData.karmaGenerated}</p>
              </div>
            </AnimatedGroup>

            <div className="bg-primary-container/10 p-4 rounded-2xl border border-primary/20">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Top Active Initiative</p>
              <p className="text-sm font-bold text-on-surface">{currentStateData.topActivity}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. KARMA SYSTEM & REPUTATION TIERS */}
      {/* ============================================================ */}
      <section className="py-20 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-500/15 px-3.5 py-1.5 rounded-full border border-amber-500/30">
            Reputation & Rewards
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-on-surface mt-3">The KINDRA Karma System</h2>
          <p className="text-base text-on-surface-variant max-w-xl mx-auto mt-2">
            Every verified civic deed earns Karma XP. Unlock prestigious reputation tiers and exclusive community perks.
          </p>
        </div>

        <AnimatedGroup
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
          variants={{
            container: {
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.2,
                },
              },
            },
            item: {
              hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  duration: 1.2,
                  type: 'spring',
                  bounce: 0.3,
                },
              },
            },
          }}
        >
          {/* Bronze */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 hover:border-amber-700/50 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-800/10 text-amber-800 font-black text-sm flex items-center justify-center mb-3">
                🥉
              </div>
              <span className="text-xs font-bold text-outline block">Tier 1</span>
              <h3 className="text-lg font-bold text-on-surface mb-1">Bronze</h3>
              <p className="text-xs font-mono font-bold text-amber-700 mb-3">0 – 500 XP</p>
              <ul className="text-[11px] text-on-surface-variant space-y-1.5">
                <li>• Basic Citizen Badge</li>
                <li>• Report Civic Hazards</li>
                <li>• Join Local Missions</li>
              </ul>
            </div>
          </div>

          {/* Silver */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 hover:border-slate-400/50 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center mb-3">
                🥈
              </div>
              <span className="text-xs font-bold text-outline block">Tier 2</span>
              <h3 className="text-lg font-bold text-on-surface mb-1">Silver</h3>
              <p className="text-xs font-mono font-bold text-slate-600 mb-3">500 – 1,500 XP</p>
              <ul className="text-[11px] text-on-surface-variant space-y-1.5">
                <li>• Contributor Badge</li>
                <li>• 10% Partner Discounts</li>
                <li>• Verified Voter Crest</li>
              </ul>
            </div>
          </div>

          {/* Gold */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-amber-500/40 hover:border-amber-500 transition-all flex flex-col justify-between shadow-sm h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 font-black text-sm flex items-center justify-center mb-3">
                🥇
              </div>
              <span className="text-xs font-bold text-amber-600 block">Tier 3</span>
              <h3 className="text-lg font-bold text-on-surface mb-1">Gold</h3>
              <p className="text-xs font-mono font-bold text-amber-600 mb-3">1,500 – 5,000 XP</p>
              <ul className="text-[11px] text-on-surface-variant space-y-1.5">
                <li>• Civic Champion Badge</li>
                <li>• Priority Officer Queue</li>
                <li>• Free Transit Passes</li>
              </ul>
            </div>
          </div>

          {/* Platinum */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-purple-500/40 hover:border-purple-500 transition-all flex flex-col justify-between shadow-sm h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 font-black text-sm flex items-center justify-center mb-3">
                💎
              </div>
              <span className="text-xs font-bold text-purple-600 block">Tier 4</span>
              <h3 className="text-lg font-bold text-on-surface mb-1">Platinum</h3>
              <p className="text-xs font-mono font-bold text-purple-600 mb-3">5,000 – 10,000 XP</p>
              <ul className="text-[11px] text-on-surface-variant space-y-1.5">
                <li>• Impact Leader Badge</li>
                <li>• Exclusive NGO Grants</li>
                <li>• VIP Civic Summit</li>
              </ul>
            </div>
          </div>

          {/* Diamond */}
          <div className="bg-gradient-to-b from-primary-container/20 to-surface-container-lowest p-5 rounded-3xl border border-primary/50 transition-all flex flex-col justify-between shadow-md h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary font-black text-sm flex items-center justify-center mb-3">
                👑
              </div>
              <span className="text-xs font-bold text-primary block">Top Tier</span>
              <h3 className="text-lg font-bold text-on-surface mb-1">Diamond</h3>
              <p className="text-xs font-mono font-bold text-primary mb-3">10,000+ XP</p>
              <ul className="text-[11px] text-on-surface-variant space-y-1.5">
                <li>• National Honor Crest</li>
                <li>• Direct Mayor Advisory</li>
                <li>• Unlimited Rewards</li>
              </ul>
            </div>
          </div>
        </AnimatedGroup>
      </section>

      {/* ============================================================ */}
      {/* 8. POWERED BY GEMMA AI */}
      {/* ============================================================ */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border-y border-slate-800">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
              Central Intelligence Engine
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-3">Powered by Gemma AI</h2>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto mt-2">
              Autonomous multimodal verification engine preventing fraud, validating photos, and routing civic reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="relative rounded-3xl group">
              <GlowEffect colors={['#10b981', '#065f46', '#34d399', '#059669']} mode="rotate" blur="medium" />
              <div className="relative bg-slate-900/90 p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col gap-3 h-full">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Multimodal Vision Analysis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluates photo evidence against selected mission parameters (e.g. sapling in soil vs road pothole) in under 3 seconds.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative rounded-3xl group">
              <GlowEffect colors={['#3b82f6', '#1d4ed8', '#60a5fa', '#2563eb']} mode="rotate" blur="medium" />
              <div className="relative bg-slate-900/90 p-6 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col gap-3 h-full">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Perceptual Hash Duplicate Detection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Computes SHA-256 and pHash fingerprinting to catch re-uploaded, cropped, or brightness-adjusted duplicate images.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative rounded-3xl group">
              <GlowEffect colors={['#a855f7', '#6b21a8', '#c084fc', '#7e22ce']} mode="rotate" blur="medium" />
              <div className="relative bg-slate-900/90 p-6 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col gap-3 h-full">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Autonomous Fraud Prevention</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Detects EXIF manipulation, GPS spoofing, and AI-generated fake images before awarding Karma points.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FEATURED CAMPAIGNS */}
      {/* ============================================================ */}
      <section className="py-20 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop border-b border-outline-variant/30">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary-container/20 px-3.5 py-1.5 rounded-full border border-primary/20">
            Community Campaigns
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-on-surface mt-3">Active Featured Drives</h2>
          <p className="text-base text-on-surface-variant max-w-xl mx-auto mt-2">
            Participate in high-impact citywide and state drives to earn bonus Karma.
          </p>
        </div>

        <AnimatedGroup preset="scale" delay={0.3} stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Campaign 1 */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-level-1 hover:shadow-level-2 transition-all flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                12 Days Left
              </span>
              <h3 className="text-lg font-bold text-on-surface mt-3 mb-1">🌱 Green Karnataka 2026</h3>
              <p className="text-xs text-on-surface-variant mb-4">Target: 25,000 native saplings planted in urban sectors.</p>

              {/* Progress bar */}
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mb-2">
                <div className="bg-emerald-500 h-full w-[73%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-on-surface mb-4">
                <span>18,400 Planted</span>
                <span>73%</span>
              </div>
            </div>
            <a
              href="/citizen/dashboard"
              className="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl text-center hover:bg-primary-container transition-all mt-auto"
            >
              Join Campaign
            </a>
          </div>

          {/* Campaign 2 */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-level-1 hover:shadow-level-2 transition-all flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                5 Days Left
              </span>
              <h3 className="text-lg font-bold text-on-surface mt-3 mb-1">🩸 Blood Donation Week</h3>
              <p className="text-xs text-on-surface-variant mb-4">Target: 5,000 verified blood units for regional hospitals.</p>

              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mb-2">
                <div className="bg-rose-500 h-full w-[77%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-on-surface mb-4">
                <span>3,850 Units</span>
                <span>77%</span>
              </div>
            </div>
            <a
              href="/citizen/dashboard"
              className="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl text-center hover:bg-primary-container transition-all mt-auto"
            >
              Join Campaign
            </a>
          </div>

          {/* Campaign 3 */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-level-1 hover:shadow-level-2 transition-all flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                8 Days Left
              </span>
              <h3 className="text-lg font-bold text-on-surface mt-3 mb-1">♻️ Plastic-Free City</h3>
              <p className="text-xs text-on-surface-variant mb-4">Target: 50,000 kg waste cleanup across lakefronts.</p>

              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mb-2">
                <div className="bg-amber-500 h-full w-[90%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-on-surface mb-4">
                <span>45,000 kg</span>
                <span>90%</span>
              </div>
            </div>
            <a
              href="/citizen/dashboard"
              className="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl text-center hover:bg-primary-container transition-all mt-auto"
            >
              Join Campaign
            </a>
          </div>

          {/* Campaign 4 */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-level-1 hover:shadow-level-2 transition-all flex flex-col justify-between h-full">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                18 Days Left
              </span>
              <h3 className="text-lg font-bold text-on-surface mt-3 mb-1">📚 Books for Every Child</h3>
              <p className="text-xs text-on-surface-variant mb-4">Target: 15,000 textbooks for rural primary schools.</p>

              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mb-2">
                <div className="bg-blue-500 h-full w-[81%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-on-surface mb-4">
                <span>12,200 Books</span>
                <span>81%</span>
              </div>
            </div>
            <a
              href="/citizen/dashboard"
              className="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl text-center hover:bg-primary-container transition-all mt-auto"
            >
              Join Campaign
            </a>
          </div>
        </AnimatedGroup>
      </section>



      {/* ============================================================ */}
      {/* 11. COMPREHENSIVE FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-surface-container-low w-full pt-16 pb-8 border-t border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-12">
          {/* Col 1 & 2: Brand */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-on-primary font-black flex items-center justify-center text-lg">
                K
              </div>
              <span className="font-extrabold text-xl tracking-tight text-on-surface">KINDRA</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm">
              KINDRA empowers citizens, government officers, NGOs, and corporate partners to complete, verify, and reward civic action using Gemma AI.
            </p>

            {/* Newsletter Form & Waitlist Dialog */}
            <div className="mt-2 flex flex-col gap-2 items-start">
              <p className="text-xs font-bold text-on-surface">Subscribe to Civic Updates</p>
              <DialogCustomVariantsTransition />
            </div>
          </div>

          {/* Col 3: Product */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">Product</h4>
            <a href="/citizen/dashboard" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Citizen Portal
            </a>
            <a href="/officer/dashboard" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Officer Portal
            </a>
            <a href="/partner/dashboard" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Partner Portal
            </a>
            <a href="/admin/dashboard" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Admin Analytics
            </a>
          </div>

          {/* Col 4: Resources */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">Resources</h4>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Gemma AI Vision Docs
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Karma System Rules
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Developer APIs
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Open Data Reports
            </a>
          </div>

          {/* Col 5: Company */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">Company</h4>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              About KINDRA
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Careers (Hiring)
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Press & Media
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Contact Support
            </a>
          </div>

          {/* Col 6: Legal */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">Legal & Privacy</h4>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Security Policy
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
              Cookie Preferences
            </a>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center text-xs text-on-surface-variant gap-4">
          <p>© 2026 KINDRA Civic Action Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
