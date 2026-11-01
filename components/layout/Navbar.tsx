"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  Menu, X, Sun, Moon, Monitor, ChevronDown,
  Home, Briefcase, LogOut, Settings, Shield,
  HelpCircle, Heart, User, MessageCircle, Bot,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/Logo";

const PROPERTY_LINKS = [
  { href: "/properties",              label: "All Properties" },
  { href: "/properties?purpose=RENT", label: "🏠 For Rent"    },
  { href: "/properties?purpose=SALE", label: "🔑 For Sale"    },
  { href: "/properties?type=FLAT",    label: "Flats"          },
  { href: "/properties?type=ROOM",    label: "Rooms"          },
  { href: "/properties?type=HOUSE",   label: "Houses"         },
  { href: "/properties?type=SHOP",    label: "Shops"          },
  { href: "/properties?type=LAND",    label: "Land"           },
];

const JOB_LINKS = [
  { href: "/jobs",                    label: "All Jobs"      },
  { href: "/jobs?jobType=FULL_TIME",  label: "Full Time"     },
  { href: "/jobs?jobType=PART_TIME",  label: "Part Time"     },
  { href: "/jobs?jobType=DAILY_WAGE", label: "Daily Wage"    },
  { href: "/jobs?orgType=HOTEL",      label: "Hotel Jobs"    },
  { href: "/jobs?orgType=HOSPITAL",   label: "Hospital Jobs" },
  { href: "/jobs?orgType=SCHOOL",     label: "School Jobs"   },
];

const HELP_LINKS = [
  { href: "/faq",     label: "❓ FAQ"          },
  { href: "/contact", label: "📞 Contact Us"    },
  { href: "/about",   label: "ℹ️ About"         },
  { href: "/pricing", label: "💳 Pricing"        },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10" />;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
      className="gz-iconbtn"
      aria-label={`Switch theme (now ${theme})`}
      title={`Theme: ${theme}`}
    >
      {theme === "dark"
        ? <Moon    className="w-[18px] h-[18px]" />
        : theme === "light"
        ? <Sun     className="w-[18px] h-[18px]" />
        : <Monitor className="w-[18px] h-[18px]" />}
    </button>
  );
}

function Dropdown({ label, links, icon: Icon }: {
  label: string;
  links: { href: string; label: string }[];
  icon: any;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="gz-navlink"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Icon className="w-4 h-4" />
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="gz-menu absolute top-full left-0 mt-2 w-52 animate-slide-up">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [chatOpen, setChatOpen]   = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const role = (session?.user as any)?.role;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Expose chatOpen state globally so Chatbot component can listen
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ym-chat-toggle", { detail: { open: chatOpen } }));
  }, [chatOpen]);

  return (
    <nav className="gz-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="Your Mithila — Home">
          <Logo size="md" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          <Dropdown label="Properties" links={PROPERTY_LINKS} icon={Home} />
          <Dropdown label="Jobs"       links={JOB_LINKS}      icon={Briefcase} />
          <Link href="/pricing" className="gz-navlink">
            Pricing
          </Link>
          <Dropdown label="Help" links={HELP_LINKS} icon={HelpCircle} />

          {/* WhatsApp quick-contact button */}
          <a
            href="https://wa.me/917033669971?text=Hi%2C%20I%20need%20help%20with%20Your%20Mithila%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="gz-chip ml-2 hidden xl:inline-flex"
            style={{ background: "var(--wa)", color: "#1D1410", borderColor: "var(--line)" }}
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>

          {/* AI Chat button */}
          <button
            onClick={() => setChatOpen(o => !o)}
            className="gz-chip"
            style={chatOpen ? { background: "var(--gulabi)", color: "#1D1410" } : undefined}
            aria-pressed={chatOpen}
            title="How can I help you?"
          >
            <Bot className="w-4 h-4" />
            Help Chat
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session ? (
            <div ref={userRef} className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="gz-chip !py-1 !pl-3 !pr-1"
                aria-label="User menu"
                aria-expanded={userOpen}
              >
                <Menu className="w-4 h-4" />
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold select-none border-2" style={{ background: "var(--haldi)", color: "#1D1410", borderColor: "var(--line)" }}>
                  {session.user?.name?.[0]?.toUpperCase()}
                </div>
              </button>

              {userOpen && (
                <div className="gz-menu absolute right-0 mt-2 w-60 animate-slide-up">
                  {/* User info */}
                  <div className="px-3 py-2 mb-1 border-b-2 border-dashed" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {session.user?.name}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {session.user?.email}
                    </p>
                  </div>

                  {(role === "OWNER" || role === "ADMIN") && (
                    <Link href="/dashboard" onClick={() => setUserOpen(false)}>
                      <Settings className="w-4 h-4" /> Dashboard
                    </Link>
                  )}
                  {role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setUserOpen(false)}>
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  {role === "SEEKER" && (
                    <Link href="/saved" onClick={() => setUserOpen(false)}>
                      <Heart className="w-4 h-4" /> Saved Properties
                    </Link>
                  )}
                  <Link href="/dashboard/profile" onClick={() => setUserOpen(false)}>
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login" className="gz-navlink">
                Log in
              </Link>
              <Link href="/auth/register" className="btn-primary !py-2 !px-5 text-[15px]">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="lg:hidden gz-iconbtn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}>
            {menuOpen
              ? <X    className="w-5 h-5" />
              : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-5 animate-slide-up border-t-2" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
          {[
            { href: "/properties", label: "Properties", hi: "संपत्ति", subs: [["/properties?purpose=RENT", "For rent"], ["/properties?purpose=SALE", "For sale"], ["/properties?type=ROOM", "Rooms"], ["/properties?type=SHOP", "Shops"]] },
            { href: "/jobs",       label: "Jobs",       hi: "नौकरी",  subs: [["/jobs?jobType=FULL_TIME", "Full time"], ["/jobs?jobType=PART_TIME", "Part time"], ["/jobs?jobType=DAILY_WAGE", "Daily wage"]] },
          ].map(group => (
            <div key={group.href} className="py-3 border-b-2 border-dashed" style={{ borderColor: "var(--border)" }}>
              <Link href={group.href} onClick={() => setMenuOpen(false)}
                className="font-heading text-[32px] font-extrabold tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>
                {group.label} <span className="text-base font-semibold font-sans" style={{ color: "var(--text-tertiary)" }} lang="hi">{group.hi}</span>
              </Link>
              <div className="flex flex-wrap gap-2 mt-3">
                {group.subs.map(([href, label]) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="gz-chip !text-[13px] !py-1">{label}</Link>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-5 gap-y-2 py-4 text-[15px] font-bold">
            {[["/pricing", "Pricing"], ["/about", "About"], ["/contact", "Contact"], ["/faq", "FAQ"]].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="underline decoration-2 underline-offset-4" style={{ color: "var(--text-primary)" }}>{label}</Link>
            ))}
          </div>

          {/* WhatsApp + Chat in mobile menu */}
          <div className="flex gap-3">
            <a
              href="https://wa.me/917033669971?text=Hi%2C%20I%20need%20help%20with%20Your%20Mithila%20website"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="gz-btn-sm gz-btn-wa !py-3"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button
              onClick={() => { setChatOpen(o => !o); setMenuOpen(false); }}
              className="gz-btn-sm gz-btn-ghost !py-3"
            >
              <Bot className="w-4 h-4" /> Help chat
            </button>
          </div>

          {!session ? (
            <div className="flex gap-3 pt-3">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="btn-outline flex-1 !py-3">
                Log in
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 !py-3">
                Sign up
              </Link>
            </div>
          ) : (
            <div className="pt-3 mt-3 space-y-0.5 border-t-2 border-dashed" style={{ borderColor: "var(--border)" }}>
              {(role === "OWNER" || role === "ADMIN") && (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 text-[15px] font-bold" style={{ color: "var(--primary)" }}>
                  <Settings className="w-4 h-4" /> Dashboard
                </Link>
              )}
              {role === "SEEKER" && (
                <Link href="/saved" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                  <Heart className="w-4 h-4" /> Saved properties
                </Link>
              )}
              <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                <User className="w-4 h-4" /> My profile
              </Link>
              <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                className="flex items-center gap-2 py-2.5 text-[15px] font-bold w-full text-left" style={{ color: "var(--text-primary)" }}>
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
