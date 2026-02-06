'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  ArrowRight,
  Wifi,
  Link2,
  ShoppingBag,
  Check,
  Star,
  BarChart3,
  Palette,
  QrCode,
  Smartphone,
  ChevronRight,
  Menu,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Utensils,
  Scissors,
  Camera,
  Store,
  Dumbbell,
  Building,
  Video,
  Briefcase,
  Heart,
  Share2,
  MapPin,
  Phone,
  Instagram,
  Youtube,
  Mail,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Interactive Phone Mockup Component - NO FAKE INFORMATION
function InteractivePhoneMockup() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const businessTypes = [
    {
      id: 'restaurant',
      name: 'Restaurant',
      handle: '@yourrestaurant',
      category: 'Your Business Here',
      icon: Utensils,
      color: '#D4F935',
      links: [
        { label: 'View Full Menu', icon: Menu, color: 'bg-[#D4F935]', textColor: 'text-[#1A3D1A]' },
        { label: 'Our Instagram', icon: Instagram, color: 'bg-[#E8B4E3]', textColor: 'text-[#1A3D1A]' },
        { label: 'Contact Us', icon: Phone, color: 'bg-[#3B5BFE]', textColor: 'text-white' },
        { label: 'Find Location', icon: MapPin, color: 'bg-[#F5F1E8]', textColor: 'text-[#1A3D1A]' },
      ],
      catalog: [
        { name: 'Your Menu Item 1', price: '₹XXX', image: '🍽️' },
        { name: 'Your Menu Item 2', price: '₹XXX', image: '🥘' },
        { name: 'Your Menu Item 3', price: '₹XXX', image: '🍜' },
        { name: 'Your Menu Item 4', price: '₹XXX', image: '🥗' },
      ],
    },
    {
      id: 'salon',
      name: 'Beauty Salon',
      handle: '@yourbusiness',
      category: 'Your Business Here',
      icon: Scissors,
      color: '#E8B4E3',
      links: [
        { label: 'Book Appointment', icon: Calendar, color: 'bg-[#E8B4E3]', textColor: 'text-[#1A3D1A]' },
        { label: 'View Services', icon: Sparkles, color: 'bg-[#D4F935]', textColor: 'text-[#1A3D1A]' },
        { label: 'Our Work', icon: Camera, color: 'bg-[#3B5BFE]', textColor: 'text-white' },
        { label: 'Contact', icon: Phone, color: 'bg-[#F5F1E8]', textColor: 'text-[#1A3D1A]' },
      ],
      catalog: [
        { name: 'Your Service 1', price: '₹XXX', image: '💇' },
        { name: 'Your Service 2', price: '₹XXX', image: '✨' },
        { name: 'Your Service 3', price: '₹XXX', image: '💅' },
        { name: 'Your Service 4', price: '₹XXX', image: '🧖' },
      ],
    },
    {
      id: 'creator',
      name: 'Creator',
      handle: '@yourhandle',
      category: 'Your Business Here',
      icon: Camera,
      color: '#3B5BFE',
      links: [
        { label: 'My Portfolio', icon: Camera, color: 'bg-[#3B5BFE]', textColor: 'text-white' },
        { label: 'YouTube Channel', icon: Youtube, color: 'bg-[#FF0000]', textColor: 'text-white' },
        { label: 'Instagram', icon: Instagram, color: 'bg-[#E8B4E3]', textColor: 'text-[#1A3D1A]' },
        { label: 'Contact Me', icon: Mail, color: 'bg-[#D4F935]', textColor: 'text-[#1A3D1A]' },
      ],
      catalog: [
        { name: 'Your Offering 1', price: '₹XXX', image: '📸' },
        { name: 'Your Offering 2', price: '₹XXX', image: '🎨' },
        { name: 'Your Offering 3', price: '₹XXX', image: '🎬' },
        { name: 'Your Offering 4', price: '₹XXX', image: '🎉' },
      ],
    },
  ];

  const currentBusiness = businessTypes[activeTab];

  // Auto-cycle through business types
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % businessTypes.length);
      setExpandedItem(null);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleLinkClick = (index: number) => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative hidden lg:block"
    >
      {/* Single Floating Badge */}
      {/* <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute -top-2 -left-12 z-30"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white px-3 py-1.5 rounded-full font-bold text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
        >
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-[#3B5BFE]" />
            Live Demo
          </span>
        </motion.div>
      </motion.div> */}

      {/* Phone Frame - Fixed height, no scroll */}
      <div className="relative mx-auto w-[300px] h-[640px]">
        <motion.div
          className="absolute inset-0 bg-[#1A3D1A] rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute inset-2 bg-white rounded-4xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                {/* Profile Header */}
                <motion.div
                  className="pt-5 pb-3 px-5 flex flex-col items-center bg-[#F5F1E8] relative overflow-hidden shrink-0"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Animated Background Pattern */}
                  <motion.div
                    className="absolute inset-0 opacity-10"
                    animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                      backgroundImage: 'radial-gradient(circle, #1A3D1A 2px, transparent 2px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  <motion.div
                    className="w-16 h-16 rounded-full mb-2 border-3 border-black overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative z-10"
                    style={{ backgroundColor: currentBusiness.color }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <currentBusiness.icon className="w-8 h-8 text-[#1A3D1A]" />
                    </div>
                  </motion.div>

                  <motion.h3
                    className="font-extrabold text-lg font-display text-[#1A3D1A] relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentBusiness.handle}
                  </motion.h3>
                  <motion.p
                    className="text-xs text-[#1A3D1A]/60 font-medium relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentBusiness.category}
                  </motion.p>

                  {/* Social Stats - REMOVED FAKE NUMBERS */}
                  <motion.div
                    className="flex gap-3 mt-2 relative z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-[#1A3D1A]">--</p>
                      <p className="text-[9px] text-[#1A3D1A]/60">followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-[#1A3D1A]">--</p>
                      <p className="text-[9px] text-[#1A3D1A]/60">posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-[#1A3D1A]">--</p>
                      <p className="text-[9px] text-[#1A3D1A]/60">rating</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Interactive Links */}
                <div className="px-3 space-y-2 pt-3 bg-white shrink-0">
                  {currentBusiness.links.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i + 0.3 }}
                      onMouseEnter={() => setHoveredLink(i)}
                      onMouseLeave={() => setHoveredLink(null)}
                      onClick={() => handleLinkClick(i)}
                      className={`w-full h-10 rounded-xl border-2 border-black flex items-center justify-between px-3 cursor-pointer transition-all duration-200 ${link.color} ${hoveredLink === i ? 'shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]' : 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={hoveredLink === i ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <link.icon className={`w-4 h-4 ${link.textColor}`} />
                        </motion.div>
                        <span className={`font-bold text-xs ${link.textColor}`}>{link.label}</span>
                      </div>
                      <motion.div
                        animate={hoveredLink === i ? { x: 3 } : { x: 0 }}
                      >
                        <ChevronRight className={`w-4 h-4 ${link.textColor}`} />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Interactive Catalog Section */}
                <motion.div
                  className="px-3 pt-4 pb-10 flex-1 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-[#1A3D1A]">Your Catalog</p>
                    <motion.button
                      className="text-[9px] font-bold text-[#3B5BFE] flex items-center gap-1"
                      whileHover={{ x: 3 }}
                    >
                      View All <ArrowRight className="w-3 h-3" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {currentBusiness.catalog.map((item, idx) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * idx + 0.7 }}
                        onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
                        className={`bg-[#F5F1E8] rounded-lg p-2 border-2 border-black cursor-pointer transition-all ${expandedItem === idx
                          ? 'shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] col-span-2'
                          : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                          }`}
                      >
                        <div className="flex items-start gap-1.5">
                          <motion.div
                            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl border border-black shrink-0"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            {item.image}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-[#1A3D1A] truncate">{item.name}</p>
                            <p className="text-[11px] font-black text-[#1A3D1A]">{item.price}</p>

                            <AnimatePresence>
                              {expandedItem === idx && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 pt-2 border-t border-black/10"
                                >
                                  <div className="flex items-center justify-between">
                                    <motion.button
                                      onClick={handleLike}
                                      className="flex items-center gap-1 text-[9px] font-bold text-[#1A3D1A]"
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Heart className={`w-3 h-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                      <span>Like</span>
                                    </motion.button>
                                    <motion.button
                                      className="text-[9px] font-bold text-[#3B5BFE]"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      Details →
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Notification Toast */}
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#1A3D1A] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-20"
                >
                  Opening link...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Feature cards data
const features = [
  { icon: Clock, title: 'Easy Setup', desc: 'Ready to use in 5 minutes' },
  { icon: Palette, title: 'Custom Branding', desc: 'Match your colors and style' },
  { icon: BarChart3, title: 'Analytics & Insights', desc: 'Track views and clicks' },
  { icon: QrCode, title: 'QR Codes', desc: 'Generate codes for tables' },
  { icon: Smartphone, title: 'Mobile Optimized', desc: 'Perfect on every device' },
  { icon: RefreshCw, title: 'Always Updated', desc: 'Real-time changes' },
];

// Business types
const businessTypes = [
  { icon: Utensils, name: 'Restaurants & Cafes' },
  { icon: Scissors, name: 'Salons & Spas' },
  { icon: Store, name: 'Retail Stores' },
  { icon: Dumbbell, name: 'Gyms & Fitness' },
  { icon: Building, name: 'Hotels & Hostels' },
  { icon: Video, name: 'Content Creators' },
  { icon: Briefcase, name: 'Freelancers' },
  { icon: Users, name: 'Small Businesses' },
];

// FAQs
const faqs = [
  {
    q: 'What is MarkMorph?',
    a: 'MarkMorph helps businesses and creators build a digital presence with two key features: a WiFi captive portal that greets your guests, and a full link-in-bio page with your catalog. You get both with one account.',
  },
  {
    q: 'What is the difference between the WiFi portal and the link-in-bio page?',
    a: 'The WiFi portal is a simplified view that appears when customers connect to your WiFi - it shows essential info and directs them to your full page. The link-in-bio page (markmorph.in/yourname) is your complete digital storefront with full catalog, all social links, and complete customization. Think of the WiFi portal as a welcome mat, and the link-in-bio as your full shop.',
  },
  {
    q: 'Do I need technical skills?',
    a: 'Not at all. MarkMorph is designed for everyone. Just enter your business details, upload your photos, and you are live in minutes. No coding required.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes! We offer a free forever plan with all essential features. You can upgrade later for advanced customization and analytics if you need them.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most businesses are up and running in under 5 minutes. Just add your business info, upload your catalog images, and connect your WiFi router following our simple guide.',
  },
  {
    q: 'Can I customize everything?',
    a: 'Absolutely. Choose your colors, upload your logo, arrange your sections, and make it match your brand perfectly. Your page, your style.',
  },
];

import { RefreshCw } from 'lucide-react';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Auto-redirect if logged in
  useEffect(() => {
    // Check if we have a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('mm_token') : null;
    if (token) {
      // Direct to dashboard - it now handles all onboarding and business routing
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans">

      {/* ============================================ */}
      {/* NAVBAR */}
      {/* ============================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-7xl bg-white/95 backdrop-blur-xl rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-black/5"
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#D4F935] rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-px group-hover:translate-y-px transition-all">
              <Link2 className="w-5 h-5 text-[#1A3D1A]" />
            </div>
            <span className="text-xl font-display font-black tracking-tight text-[#1A3D1A]">
              Mark<span className="text-[#D4F935]">Morph</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 font-semibold text-[#1A3D1A]/80">
            {['Features', 'How it Works', 'FAQ'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 rounded-full hover:bg-[#F5F1E8] transition-all text-sm"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden sm:flex font-bold text-[#1A3D1A] hover:bg-[#F5F1E8] rounded-full px-4"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              className="bg-[#1A3D1A] text-white hover:bg-black font-bold rounded-full px-5 py-2 transition-all shadow-[3px_3px_0px_0px_rgba(212,249,53,1)] hover:shadow-[1px_1px_0px_0px_rgba(212,249,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] text-sm"
              asChild
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </motion.div>
      </nav>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-screen pt-28 sm:pt-32 pb-20 px-4 sm:px-6 flex items-center bg-[#D4F935] text-[#1A3D1A] overflow-hidden"
      >
        {/* Background Elements */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-[-5%] w-[500px] h-[500px] bg-white/20 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#5B1E5E]/20 rounded-full blur-[100px]"
          />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp}>
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Sparkles className="w-4 h-4 text-[#5B1E5E]" />
                  <span className="font-bold text-sm">WiFi + Link-in-Bio + Catalog</span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black leading-[0.95] tracking-tight"
              >
                One Link.
                <br />
                <span className="relative">
                  Infinite
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <motion.path
                      d="M2 8C40 2 100 2 198 4"
                      stroke="#5B1E5E"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                  </motion.svg>
                </span>
                <br />
                Possibilities.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeInUp}
                className="text-xl sm:text-2xl text-[#1A3D1A]/80 max-w-lg font-medium leading-relaxed"
              >
                Your WiFi, menu, and social links all in one beautiful page. Perfect for restaurants, salons, and creators in India.
              </motion.p>

              {/* CTA Form */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="relative grow">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A3D1A]/50 font-bold text-sm">markmorph.in/</span>
                  <input
                    type="text"
                    placeholder="yourname"
                    className="w-full h-14 sm:h-16 pl-28 pr-4 rounded-2xl bg-white text-[#1A3D1A] font-bold text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-[#1A3D1A]/20 transition-all placeholder:text-[#1A3D1A]/30 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <Button
                  asChild
                  className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl bg-[#1A3D1A] text-white font-black text-base sm:text-lg hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(91,30,94,1)] hover:shadow-[2px_2px_0px_0px_rgba(91,30,94,1)] hover:translate-x-[2px] hover:translate-y-[2px] whitespace-nowrap"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Indicator */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1A3D1A] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#D4F935]" />
                  </div>
                  <span className="text-sm font-semibold text-[#1A3D1A]/70">Free forever plan available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1A3D1A] rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#D4F935]" />
                  </div>
                  <span className="text-sm font-semibold text-[#1A3D1A]/70">Setup in 5 minutes</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Interactive Phone Mockup */}
            <InteractivePhoneMockup />
          </div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* VALUE PROPOSITION */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-[#1A3D1A] mb-6">
              What is <span className="text-[#D4F935] bg-[#1A3D1A] px-4 py-1 rounded-xl">MarkMorph</span>?
            </h2>
            <p className="text-xl text-[#1A3D1A]/70 max-w-3xl mx-auto leading-relaxed">
              It is your digital storefront. When customers connect to your WiFi, they see your menu. When they visit your link-in-bio, they see your catalog. One platform, endless possibilities.
            </p>
          </motion.div>

          {/* Visual representation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: Wifi, title: 'WiFi Portal', desc: 'Auto-redirect guests to your page', color: 'bg-[#3B5BFE]' },
              { icon: Link2, title: 'Link-in-Bio', desc: 'All your links in one place', color: 'bg-[#E8B4E3]' },
              { icon: ShoppingBag, title: 'Digital Catalog', desc: 'Showcase with photos & prices', color: 'bg-[#D4F935]' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${item.color} p-8 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center`}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <item.icon className="w-8 h-8 text-[#1A3D1A]" />
                </div>
                <h3 className="text-2xl font-display font-black text-[#1A3D1A] mb-2">{item.title}</h3>
                <p className="font-medium text-[#1A3D1A]/80">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROBLEM AWARENESS */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 bg-[#F5F1E8]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-display font-black text-[#1A3D1A] mb-4">
              Sound familiar?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: 'Stop sharing WiFi passwords repeatedly. Let customers connect and discover your business automatically.', icon: '😩' },
              { text: 'Show your full menu or catalog with photos without asking customers to download yet another app.', icon: '📱' },
              { text: 'Keep all your social links in one place. One URL that connects everything you do online.', icon: '🔗' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <p className="text-lg font-bold text-[#1A3D1A] leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SOLUTION SHOWCASE */}
      {/* ============================================ */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-[#5B1E5E]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-white">
              Three tools. <span className="text-[#D4F935]">One platform.</span>
            </h2>
          </motion.div>

          {/* Feature 1: WiFi Portal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center mb-20"
          >
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-[#3B5BFE]/20 px-4 py-2 rounded-full mb-6">
                <Wifi className="w-4 h-4 text-[#3B5BFE]" />
                <span className="font-bold text-sm text-white">WiFi Captive Portal</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-display font-black text-white mb-4">
                Turn WiFi connections into marketing opportunities
              </h3>
              <p className="text-lg text-white/80 mb-6">
                When customers connect to your WiFi, they automatically see your MarkMorph page. No password sharing. No hassle. Just a beautiful showcase of your business.
              </p>
              <ul className="space-y-3">
                {['Auto-redirect to your page', 'Capture customer emails', 'Works with any router'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-semibold text-white">
                    <div className="w-6 h-6 bg-[#3B5BFE] rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-[#3B5BFE] p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-white rounded-2xl p-6 border-2 border-black">
                  <div className="flex items-center gap-3 mb-4">
                    <Wifi className="w-6 h-6 text-[#3B5BFE]" />
                    <span className="font-bold text-[#1A3D1A]">WiFi Connected</span>
                  </div>
                  <p className="text-sm text-[#1A3D1A]/70 mb-4">Welcome! Browse your menu while you enjoy your visit.</p>
                  <div className="space-y-2">
                    {['View Menu', 'Special Offers', 'Contact Us'].map((link) => (
                      <div key={link} className="bg-[#F5F1E8] rounded-lg p-3 text-sm font-bold text-[#1A3D1A]">
                        {link}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Digital Catalog */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center mb-20"
          >
            <div>
              <div className="bg-[#E8B4E3] p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="grid grid-cols-2 gap-3">
                  {['Your Service 1', 'Your Service 2', 'Your Service 3', 'Your Service 4'].map((service, i) => (
                    <div key={service} className="bg-white rounded-xl p-4 border-2 border-black">
                      <div className="h-16 bg-[#1A3D1A]/10 rounded-lg mb-2" />
                      <p className="font-bold text-sm text-[#1A3D1A]">{service}</p>
                      <p className="text-xs text-[#1A3D1A]/60">Your Price</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E8B4E3]/20 px-4 py-2 rounded-full mb-6">
                <ShoppingBag className="w-4 h-4 text-[#E8B4E3]" />
                <span className="font-bold text-sm text-white">Digital Menu & Catalog</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-display font-black text-white mb-4">
                Showcase your products beautifully
              </h3>
              <p className="text-lg text-white/80 mb-6">
                Display your menu, services, or products with stunning photos and clear pricing. Organize by categories. Update anytime. Your customers see exactly what you offer.
              </p>
              <ul className="space-y-3">
                {['Upload unlimited photos', 'Organize by categories', 'Show prices clearly'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-semibold text-white">
                    <div className="w-6 h-6 bg-[#E8B4E3] rounded-full flex items-center justify-center border border-black">
                      <Check className="w-3.5 h-3.5 text-[#1A3D1A]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Feature 3: Link-in-Bio */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-[#D4F935]/20 px-4 py-2 rounded-full mb-6">
                <Link2 className="w-4 h-4 text-[#D4F935]" />
                <span className="font-bold text-sm text-white">Link-in-Bio Page</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-display font-black text-white mb-4">
                All your links. One URL.
              </h3>
              <p className="text-lg text-white/80 mb-6">
                Share one simple link: markmorph.in/yourname. Your Instagram bio, WhatsApp status, and business cards all point to the same beautiful page with everything you want to showcase.
              </p>
              <ul className="space-y-3">
                {['Custom URL (markmorph.in/name)', 'Connect all social platforms', 'Custom branding & colors'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-semibold text-white">
                    <div className="w-6 h-6 bg-[#D4F935] rounded-full flex items-center justify-center border border-black">
                      <Check className="w-3.5 h-3.5 text-[#1A3D1A]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-[#D4F935] p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-3">
                  {['Your Instagram', 'Your YouTube', 'Your Portfolio', 'Your Contact'].map((link, i) => (
                    <div key={link} className={`rounded-xl p-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${i % 2 === 0 ? 'bg-white' : 'bg-[#E8B4E3]'}`}>
                      <span className="font-bold text-[#1A3D1A]">{link}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================ */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-[#1A3D1A] mb-4">
              Get started in <span className="text-[#5B1E5E]">5 minutes</span>
            </h2>
            <p className="text-xl text-[#1A3D1A]/70">Seriously. It is that simple.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your page', desc: 'Sign up and choose your custom URL. Upload your logo and pick your colors.', color: '#D4F935' },
              { step: '02', title: 'Add your content', desc: 'Upload photos of your menu or products. Add your social links. Arrange everything.', color: '#E8B4E3' },
              { step: '03', title: 'Connect & share', desc: 'Connect your WiFi router. Share your link everywhere. Watch the magic happen.', color: '#3B5BFE' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-[#F5F1E8] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 h-full">
                  <div className="text-6xl font-display font-black opacity-10 mb-4" style={{ color: item.color }}>
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" style={{ background: item.color }}>
                    <span className="text-[#1A3D1A] font-black text-lg">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-[#1A3D1A] mb-3">{item.title}</h3>
                  <p className="text-[#1A3D1A]/70 leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-full">
                    <ArrowRight className="w-8 h-8 text-[#1A3D1A]/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHO IS IT FOR - REPLACED USE CASES */}
      {/* ============================================ */}
      <section className="py-24 px-4 sm:px-6 bg-[#F5F1E8]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-[#1A3D1A] mb-4">
              Who is it for?
            </h2>
            <p className="text-xl text-[#1A3D1A]/70">MarkMorph works for any business or creator</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {businessTypes.map((type, i) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center hover:bg-[#D4F935] transition-colors group"
              >
                <type.icon className="w-8 h-8 text-[#1A3D1A] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-[#1A3D1A]">{type.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES GRID */}
      {/* ============================================ */}
      <section className="py-24 px-4 sm:px-6 bg-[#D4F935]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-[#1A3D1A] mb-4">
              Everything you need
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 bg-[#E8B4E3] rounded-xl flex items-center justify-center mb-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#1A3D1A]" />
                </div>
                <h3 className="text-xl font-display font-black text-[#1A3D1A] mb-2">{feature.title}</h3>
                <p className="text-[#1A3D1A]/70 font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-24 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-[#1A3D1A] mb-4">
              Questions? Answered.
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#F5F1E8] p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <h3 className="text-lg font-display font-black text-[#1A3D1A] mb-3">{faq.q}</h3>
                <p className="text-[#1A3D1A]/70 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA */}
      {/* ============================================ */}
      <section className="py-24 px-4 sm:px-6 bg-[#5B1E5E] text-white relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-white/5 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-[#D4F935]/10 rounded-full"
        />

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black leading-[1.1]">
              Ready to transform
              <br />
              <span className="text-[#D4F935]">your digital presence?</span>
            </h2>

            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Start building your digital presence today. Perfect for restaurants, salons, creators, and small businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                className="h-16 px-10 rounded-2xl bg-[#D4F935] text-[#1A3D1A] font-black text-lg hover:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            <p className="text-sm text-white/60">
              No credit card required • Free forever plan • Setup in 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="py-12 px-4 sm:px-6 bg-[#1A3D1A] text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#D4F935] rounded-xl flex items-center justify-center border-2 border-black">
                <Link2 className="w-5 h-5 text-[#1A3D1A]" />
              </div>
              <span className="text-2xl font-display font-black">
                Mark<span className="text-[#D4F935]">Morph</span>
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-white/60">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>

            <p className="text-sm text-white/40">
              © 2026 MarkMorph. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
