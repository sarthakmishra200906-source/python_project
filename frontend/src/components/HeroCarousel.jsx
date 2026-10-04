import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ── Slide definitions (CSS gradient + inline SVG, no external images) ──────
const slides = [
  {
    id: 1,
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    accentColor: '#c4b5fd',
    tag: '⚡ 5G Ready',
    title: 'Blazing Fast',
    titleAccent: '5G Speeds',
    subtitle: 'Experience next-generation connectivity with RechargeX. Lightning-fast speeds, zero interruptions — recharge your future today.',
    cta: 'Explore Plans',
    ctaTo: '/plans',
    ctaStyle: 'bg-white text-violet-700 hover:bg-violet-50',
    secondaryCta: 'Learn More',
    secondaryTo: '/',
    svg: (
      <svg viewBox="0 0 420 320" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Pulsing signal rings */}
        <circle cx="210" cy="160" r="40" fill="rgba(255,255,255,0.15)" />
        <circle cx="210" cy="160" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
          <animate attributeName="r" values="40;100;40" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="210" cy="160" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
          <animate attributeName="r" values="40;130;40" dur="3s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" begin="0.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="210" cy="160" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
          <animate attributeName="r" values="40;160;40" dur="3s" begin="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" begin="1.6s" repeatCount="indefinite" />
        </circle>
        {/* Phone body */}
        <rect x="188" y="128" width="44" height="75" rx="8" fill="white" opacity="0.95" />
        <rect x="193" y="133" width="34" height="56" rx="4" fill="#6366f1" opacity="0.9" />
        {/* Screen content */}
        <rect x="197" y="138" width="26" height="3" rx="1.5" fill="rgba(255,255,255,0.7)" />
        <rect x="197" y="144" width="18" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
        <rect x="197" y="149" width="22" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
        {/* 5G badge */}
        <rect x="200" y="155" width="20" height="10" rx="3" fill="rgba(255,255,255,0.9)" />
        <text x="210" y="163" textAnchor="middle" fontSize="6" fill="#6366f1" fontWeight="bold">5G</text>
        {/* Home indicator */}
        <rect x="204" y="197" width="12" height="2" rx="1" fill="rgba(255,255,255,0.6)" />
        {/* Floating data nodes */}
        <circle cx="130" cy="100" r="6" fill="rgba(255,255,255,0.6)">
          <animate attributeName="cy" values="100;90;100" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="130" r="4" fill="rgba(255,255,255,0.4)">
          <animate attributeName="cy" values="130;120;130" dur="2.5s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="220" r="8" fill="rgba(255,255,255,0.3)">
          <animate attributeName="cy" values="220;210;220" dur="3s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="310" cy="200" r="5" fill="rgba(255,255,255,0.5)">
          <animate attributeName="cy" values="200;190;200" dur="2.2s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        {/* Connection lines */}
        <line x1="130" y1="100" x2="188" y2="145" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="300" y1="130" x2="232" y2="148" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="150" y1="220" x2="188" y2="192" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="310" y1="200" x2="232" y2="190" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
      </svg>
    ),
  },
  {
    id: 2,
    gradient: 'from-orange-500 via-rose-500 to-pink-600',
    accentColor: '#fcd34d',
    tag: '🔥 Unlimited Plans',
    title: 'No Limits,',
    titleAccent: 'Pure Freedom',
    subtitle: 'Unlimited calls, data and SMS — all month long. Choose your perfect plan and stay connected without worrying about usage caps.',
    cta: 'View Unlimited Plans',
    ctaTo: '/plans',
    ctaStyle: 'bg-white text-rose-600 hover:bg-rose-50',
    secondaryCta: 'See All Plans',
    secondaryTo: '/plans',
    svg: (
      <svg viewBox="0 0 420 320" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Infinity symbol */}
        <path
          d="M135,160 C135,130 155,115 180,115 C210,115 225,145 210,160 C225,175 210,205 180,205 C155,205 135,190 135,160 Z
             M285,160 C285,130 265,115 240,115 C210,115 195,145 210,160 C195,175 210,205 240,205 C265,205 285,190 285,160 Z"
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="12" strokeLinecap="round"
        >
          <animate attributeName="stroke-dasharray" values="0,1000;500,500" dur="2s" fill="freeze" />
          <animate attributeName="stroke" values="rgba(255,255,255,0.3);rgba(255,255,255,0.8);rgba(255,255,255,0.3)" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Data waves */}
        <path d="M60,240 Q90,215 120,240 Q150,265 180,240 Q210,215 240,240 Q270,265 300,240 Q330,215 360,240"
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5">
          <animate attributeName="d"
            values="M60,240 Q90,215 120,240 Q150,265 180,240 Q210,215 240,240 Q270,265 300,240 Q330,215 360,240;
                    M60,230 Q90,255 120,230 Q150,205 180,230 Q210,255 240,230 Q270,205 300,230 Q330,255 360,230;
                    M60,240 Q90,215 120,240 Q150,265 180,240 Q210,215 240,240 Q270,265 300,240 Q330,215 360,240"
            dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M60,255 Q90,230 120,255 Q150,280 180,255 Q210,230 240,255 Q270,280 300,255 Q330,230 360,255"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
          <animate attributeName="d"
            values="M60,255 Q90,230 120,255 Q150,280 180,255 Q210,230 240,255 Q270,280 300,255 Q330,230 360,255;
                    M60,245 Q90,270 120,245 Q150,220 180,245 Q210,270 240,245 Q270,220 300,245 Q330,270 360,245;
                    M60,255 Q90,230 120,255 Q150,280 180,255 Q210,230 240,255 Q270,280 300,255 Q330,230 360,255"
            dur="2s" begin="0.5s" repeatCount="indefinite" />
        </path>
        {/* Stars/sparkles */}
        {[[80,80],[340,90],[100,200],[360,210],[210,70]].map(([x,y],i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="rgba(255,255,255,0.7)">
              <animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.5+i*0.3}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="2;4;2" dur={`${1.5+i*0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {/* Lightning bolt */}
        <polygon points="210,90 198,140 208,140 196,190 222,130 212,130 224,90" fill="rgba(255,255,255,0.8)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
        </polygon>
      </svg>
    ),
  },
  {
    id: 3,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    accentColor: '#6ee7b7',
    tag: '💰 Best Value',
    title: 'Plans Starting',
    titleAccent: 'at ₹179',
    subtitle: 'Premium recharge plans at prices that won\'t break the bank. Fast top-ups, instant activation, and 24/7 customer support.',
    cta: 'Recharge Now',
    ctaTo: '/plans',
    ctaStyle: 'bg-white text-teal-700 hover:bg-teal-50',
    secondaryCta: 'Sign Up Free',
    secondaryTo: '/login',
    svg: (
      <svg viewBox="0 0 420 320" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Shield / savings icon */}
        <path d="M210,75 L260,100 L260,165 C260,195 235,215 210,230 C185,215 160,195 160,165 L160,100 Z"
          fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Rupee symbol inside shield */}
        <text x="210" y="168" textAnchor="middle" fontSize="42" fill="rgba(255,255,255,0.9)" fontWeight="bold">₹</text>
        {/* Orbiting value badges */}
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 210 160" to="360 210 160" dur="12s" repeatCount="indefinite" />
          <circle cx="280" cy="110" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <text x="280" y="115" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">4G/5G</text>
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="120 210 160" to="480 210 160" dur="12s" repeatCount="indefinite" />
          <circle cx="280" cy="110" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <text x="280" y="113" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">UNLIMITED</text>
          <text x="280" y="122" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">CALLS</text>
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="240 210 160" to="600 210 160" dur="12s" repeatCount="indefinite" />
          <circle cx="280" cy="110" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <text x="280" y="113" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">84</text>
          <text x="280" y="122" textAnchor="middle" fontSize="7" fill="white">DAYS</text>
        </g>
        {/* Checkmarks */}
        {[['Fast Activation',80,258],['Instant Top-up',210,275],['24/7 Support',340,258]].map(([label,x,y],i) => (
          <g key={i}>
            <circle cx={x} cy={y-8} r="9" fill="rgba(255,255,255,0.2)" />
            <path d={`M${x-4},${y-8} L${x-1},${y-4} L${x+5},${y-14}`}
              fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x={x} y={y+5} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">{label}</text>
          </g>
        ))}
      </svg>
    ),
  },
];

// ── Chevron icons ──────────────────────────────────────────────
const ChevronLeft  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>;

const INTERVAL_MS = 4500;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section
      id="hero-carousel"
      className={`relative overflow-hidden bg-gradient-to-br ${slide.gradient} transition-all duration-700`}
      style={{ minHeight: '520px' }}
      aria-label="Hero carousel"
    >
      {/* Background geometric pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Grid dots pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-16 gap-10 min-h-[480px]">

          {/* ── Text content ──────────────────────────────── */}
          <div
            key={`text-${current}`}
            className="flex-1 text-white animate-slide-in"
          >
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-white/20 backdrop-blur-sm border border-white/30 mb-5">
              <span className="text-sm font-semibold">{slide.tag}</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
              {slide.title}
              <br />
              <span style={{ color: slide.accentColor }}>{slide.titleAccent}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/80 text-lg max-w-lg mb-8 leading-relaxed">
              {slide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                to={slide.ctaTo}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                  font-bold text-sm shadow-lg shadow-black/20
                  transition-all duration-200 hover:scale-105 active:scale-95
                  ${slide.ctaStyle}`}
                id={`hero-cta-${current}`}
              >
                {slide.cta}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to={slide.secondaryTo}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                  font-bold text-sm border-2 border-white/50 text-white
                  hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
                id={`hero-secondary-cta-${current}`}
              >
                {slide.secondaryCta}
              </Link>
            </div>
          </div>

          {/* ── SVG illustration ──────────────────────────── */}
          <div
            key={`svg-${current}`}
            className="flex-1 max-w-sm lg:max-w-md w-full animate-pop"
          >
            {slide.svg}
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ──────────────────────────────── */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20
          p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm
          text-white border border-white/30 transition-all duration-200
          hover:scale-110 active:scale-95"
        aria-label="Previous slide"
        id="carousel-prev"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20
          p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm
          text-white border border-white/30 transition-all duration-200
          hover:scale-110 active:scale-95"
        aria-label="Next slide"
        id="carousel-next"
      >
        <ChevronRight />
      </button>

      {/* ── Slide dots ──────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300
              ${i === current
                ? 'bg-white w-7 h-2.5'
                : 'bg-white/40 hover:bg-white/60 w-2.5 h-2.5'
              }`}
            aria-label={`Go to slide ${i + 1}`}
            id={`carousel-dot-${i}`}
          />
        ))}
      </div>

      {/* ── Auto-progress bar ──────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <div
          key={current}
          className="h-full bg-white/60 rounded-full"
          style={{
            animation: `carousel-progress ${INTERVAL_MS}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes carousel-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
