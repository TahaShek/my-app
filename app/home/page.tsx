"use client"

import { useState } from "react"
import { Search, Megaphone, Users, Star, ArrowRight, Menu, X, Calendar, MapPin } from "lucide-react"

const CATEGORIES = [
  { id: "startup", label: "STARTUP", color: "#1E3A8A" },
  { id: "project", label: "PROJECT", color: "#F59E0B" },
  { id: "part-time", label: "PART-TIME", color: "#FF6B6B" },
  { id: "internship", label: "INTERNSHIP", color: "#1E3A8A" },
  { id: "freelance", label: "FREELANCE", color: "#F59E0B" },
]

const OPPORTUNITIES = [
  {
    id: 1,
    title: "React Developer Needed",
    company: "TechStart Inc.",
    category: "startup",
    rate: "$25/hr",
    type: "Remote",
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Graphic Designer for App",
    company: "Creative Studio",
    category: "project",
    rate: "$500",
    type: "One-time",
    posted: "1 day ago",
  },
  {
    id: 3,
    title: "Content Writer",
    company: "Marketing Hub",
    category: "part-time",
    rate: "$18/hr",
    type: "10hrs/wk",
    posted: "3 hours ago",
  },
  {
    id: 4,
    title: "UX Research Assistant",
    company: "Design Lab",
    category: "internship",
    rate: "$15/hr",
    type: "Campus",
    posted: "5 days ago",
  },
]

// Deterministic rotations for testimonials to avoid hydration errors
const TESTIMONIAL_ROTATIONS = [-1.5, 0.5, 1.2]

export default function CampusConnectLanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mode, setMode] = useState<"post" | "find">("find")

  return (
    <div className="min-h-screen bg-[#FFF8E7] text-[#2D3748]">
      {/* Newspaper Masthead Header */}
      <header className="border-b-4 border-[#2D3748] bg-[#FFF8E7]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Top banner */}
          <div className="text-center mb-4">
            <div className="text-xs uppercase tracking-[0.3em] mb-2 text-[#2D3748]">
              University Talent Network • Est. 2025
            </div>
            <h1
              className="text-6xl md:text-7xl font-black uppercase tracking-tight text-[#1E3A8A]"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              CampusConnect
            </h1>
            <div className="text-sm uppercase tracking-[0.2em] mt-2 text-[#2D3748]">
              The Student Marketplace for Opportunities
            </div>
          </div>

          {/* Navigation */}
          <nav className="border-t-2 border-b-2 border-[#2D3748] py-3">
            <div className="flex items-center justify-between">
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="hidden md:flex items-center justify-center gap-8 w-full">
                <a
                  href="#opportunities"
                  className="text-sm uppercase tracking-widest font-bold hover:text-[#FF6B6B] transition-colors"
                >
                  Browse
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm uppercase tracking-widest font-bold hover:text-[#FF6B6B] transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#categories"
                  className="text-sm uppercase tracking-widest font-bold hover:text-[#FF6B6B] transition-colors"
                >
                  Categories
                </a>
                <a
                  href="#testimonials"
                  className="text-sm uppercase tracking-widest font-bold hover:text-[#FF6B6B] transition-colors"
                >
                  Success Stories
                </a>
                <button className="px-6 py-2 bg-[#FF6B6B] text-white font-bold uppercase text-sm tracking-widest hover:bg-[#F59E0B] transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Dual-Hero Split Section */}
      <section className="relative">
        <div className="grid md:grid-cols-2">
          {/* LEFT: Post Opportunities */}
          <div className="relative bg-[#FF6B6B] text-white p-12 md:p-16 flex flex-col items-center justify-center min-h-[500px]">
            <div className="text-center">
              <Megaphone className="w-24 h-24 mb-8 mx-auto" strokeWidth={2.5} />
              <h2
                className="text-5xl md:text-6xl font-black uppercase mb-6 tracking-tight"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
              >
                Post
                <br />
                Opportunities
              </h2>
              <p className="text-xl font-semibold mb-8 max-w-md">
                Find talented students for your projects, startups, and part-time positions
              </p>
              <button className="px-8 py-4 bg-white text-[#FF6B6B] font-black uppercase tracking-widest text-lg hover:bg-[#2D3748] hover:text-white transition-all">
                Post Now
              </button>
            </div>

            {/* NEW badge */}
            <div className="absolute top-6 right-6 bg-[#F59E0B] text-white px-4 py-2 font-black uppercase text-sm transform rotate-12 border-2 border-white">
              NEW!
            </div>
          </div>

          {/* RIGHT: Find Gigs */}
          <div className="relative bg-[#F59E0B] text-white p-12 md:p-16 flex flex-col items-center justify-center min-h-[500px]">
            <div className="text-center">
              <Search className="w-24 h-24 mb-8 mx-auto" strokeWidth={2.5} />
              <h2
                className="text-5xl md:text-6xl font-black uppercase mb-6 tracking-tight"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
              >
                Find
                <br />
                Gigs
              </h2>
              <p className="text-xl font-semibold mb-8 max-w-md">
                Discover paid opportunities that match your skills and schedule
              </p>
              <button className="px-8 py-4 bg-white text-[#F59E0B] font-black uppercase tracking-widest text-lg hover:bg-[#2D3748] hover:text-white transition-all">
                Browse Jobs
              </button>
            </div>

            {/* HOT badge */}
            <div className="absolute top-6 right-6 bg-[#1E3A8A] text-white px-4 py-2 font-black uppercase text-sm transform -rotate-12 border-2 border-white">
              HOT!
            </div>
          </div>
        </div>

        {/* Mode Switcher Toggle (Physical Switch Style) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white border-4 border-[#2D3748] p-2 flex rounded-full shadow-2xl">
            <button
              onClick={() => setMode("post")}
              className={`px-6 py-3 rounded-full font-black uppercase text-sm transition-all ${
                mode === "post" ? "bg-[#FF6B6B] text-white" : "bg-transparent text-[#2D3748]"
              }`}
            >
              Post
            </button>
            <button
              onClick={() => setMode("find")}
              className={`px-6 py-3 rounded-full font-black uppercase text-sm transition-all ${
                mode === "find" ? "bg-[#F59E0B] text-white" : "bg-transparent text-[#2D3748]"
              }`}
            >
              Find
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#FFF8E7] border-t-4 border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-5xl md:text-6xl font-black uppercase text-center mb-4 text-[#1E3A8A]"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            How It Works
          </h2>
          <div className="text-center text-sm uppercase tracking-[0.3em] mb-16 text-[#2D3748]">
            Simple. Fast. Effective.
          </div>

          {/* Steps with hand-drawn arrows */}
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-24 h-24 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#2D3748]">
                <span className="text-5xl font-black">1</span>
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 tracking-wide">Create Profile</h3>
              <p className="text-lg leading-relaxed">
                Sign up with your university email and showcase your skills or post your opportunity
              </p>

              {/* Arrow to next step (hidden on mobile) */}
              <div className="hidden md:block absolute top-12 -right-12">
                <svg width="100" height="40" viewBox="0 0 100 40" className="text-[#2D3748]">
                  <path
                    d="M 5 20 Q 50 5, 95 20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                  <polygon points="95,20 85,15 85,25" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-24 h-24 bg-[#F59E0B] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#2D3748]">
                <span className="text-5xl font-black">2</span>
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 tracking-wide">Browse & Connect</h3>
              <p className="text-lg leading-relaxed">
                Explore opportunities or review applications. Direct messaging makes connecting easy
              </p>

              {/* Arrow to next step */}
              <div className="hidden md:block absolute top-12 -right-12">
                <svg width="100" height="40" viewBox="0 0 100 40" className="text-[#2D3748]">
                  <path
                    d="M 5 20 Q 50 35, 95 20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                  <polygon points="95,20 85,15 85,25" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-24 h-24 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#2D3748]">
                <span className="text-5xl font-black">3</span>
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 tracking-wide">Start Working</h3>
              <p className="text-lg leading-relaxed">
                Finalize details and begin your collaboration. Build your portfolio and earn money
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Stamped Boxes */}
      <section id="categories" className="py-20 bg-white border-t-4 border-b-4 border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-5xl md:text-6xl font-black uppercase text-center mb-16 text-[#1E3A8A]"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            Opportunity Categories
          </h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {CATEGORIES.map((category, index) => {
              // Use deterministic rotation based on index to avoid hydration errors
              const rotation = (index * 2.5) - 5;

              return (
                <button
                  key={category.id}
                  className="relative p-8 border-4 border-dashed hover:border-solid transition-all group"
                  style={{ borderColor: category.color }}
                >
                  <div
                    className="text-4xl font-black uppercase tracking-tight text-center transform group-hover:rotate-0 transition-transform"
                    style={{
                      color: category.color,
                      transform: `rotate(${rotation}deg)`,
                      fontFamily: 'Impact, "Arial Black", sans-serif',
                    }}
                  >
                    {category.label}
                  </div>
                  <div
                    className="absolute inset-2 border-2 rounded-full opacity-30"
                    style={{ borderColor: category.color }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Opportunities - Classified Ad Boxes */}
      <section id="opportunities" className="py-20 bg-[#FFF8E7]">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-5xl md:text-6xl font-black uppercase text-center mb-4 text-[#1E3A8A]"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            Latest Opportunities
          </h2>
          <div className="text-center text-sm uppercase tracking-[0.3em] mb-16 text-[#2D3748]">
            Updated Daily • Verified Listings
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {OPPORTUNITIES.map((opp) => (
              <div
                key={opp.id}
                className="border-4 border-dotted border-[#2D3748] bg-white p-6 hover:border-solid transition-all group relative"
              >
                {/* Category stamp */}
                <div
                  className="absolute -top-4 -right-4 px-4 py-2 text-white font-black uppercase text-xs transform rotate-12 border-2 border-white"
                  style={{ backgroundColor: CATEGORIES.find((c) => c.id === opp.category)?.color }}
                >
                  {opp.category}
                </div>

                <h3 className="text-3xl font-black uppercase mb-3 leading-tight text-[#2D3748]">{opp.title}</h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="w-5 h-5" />
                    <span>{opp.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="w-5 h-5" />
                    <span>{opp.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="w-5 h-5" />
                    <span>{opp.posted}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t-2 border-dashed border-[#2D3748]">
                  <div className="text-3xl font-black text-[#FF6B6B]">{opp.rate}</div>
                  <button className="px-6 py-2 bg-[#1E3A8A] text-white font-bold uppercase text-sm tracking-widest hover:bg-[#FF6B6B] transition-colors">
                    Apply Now
                  </button>
                </div>

                {/* Tear-off tabs at bottom */}
                <div className="absolute -bottom-3 left-0 right-0 flex justify-center gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-6 h-3 bg-white border-x border-t border-[#2D3748]" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-10 py-4 bg-[#FF6B6B] text-white font-black uppercase tracking-widest text-lg hover:bg-[#1E3A8A] transition-colors inline-flex items-center gap-3">
              View All Opportunities
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Success Stories - Polaroid Style */}
      <section id="testimonials" className="py-20 bg-white border-t-4 border-[#2D3748]">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-5xl md:text-6xl font-black uppercase text-center mb-16 text-[#1E3A8A]"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            Success Stories
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah K.",
                role: "CS Major",
                story: "Found a remote dev position that fits perfectly with my class schedule. Earning $25/hr!",
                rating: 5,
              },
              {
                name: "Mike L.",
                role: "Design Student",
                story: "Landed 3 freelance projects through CampusConnect. Built my portfolio and made $2000!",
                rating: 5,
              },
              {
                name: "Emma T.",
                role: "Marketing Major",
                story: "Connected with a startup that turned into a full-time offer after graduation.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white p-6 border-8 border-[#2D3748] transform hover:-rotate-1 transition-transform"
                style={{
                  boxShadow: "8px 8px 0 rgba(0,0,0,0.1)",
                  transform: `rotate(${TESTIMONIAL_ROTATIONS[i]}deg)`,
                }}
              >
                {/* Photo placeholder */}
                <div className="w-full aspect-square bg-gradient-to-br from-[#F59E0B] to-[#FF6B6B] mb-4" />

                <div className="space-y-2">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  <p className="text-lg leading-relaxed mb-4">"{testimonial.story}"</p>
                  <div className="font-black uppercase text-sm tracking-wide">— {testimonial.name}</div>
                  <div className="text-sm uppercase tracking-widest text-[#2D3748]/60">{testimonial.role}</div>
                </div>

                {/* Pin effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FF6B6B] rounded-full border-2 border-[#2D3748]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Torn Paper Effect */}
      <section className="relative py-20 bg-[#1E3A8A] text-white overflow-hidden">
        {/* Torn paper edge effect */}
        <div
          className="absolute top-0 left-0 right-0 h-8 bg-[#FFF8E7]"
          style={{
            clipPath:
              "polygon(0 0, 5% 50%, 10% 20%, 15% 80%, 20% 30%, 25% 70%, 30% 40%, 35% 60%, 40% 20%, 45% 80%, 50% 30%, 55% 90%, 60% 40%, 65% 60%, 70% 20%, 75% 70%, 80% 30%, 85% 80%, 90% 40%, 95% 60%, 100% 20%, 100% 0)",
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2
            className="text-6xl md:text-7xl font-black uppercase mb-8 leading-tight"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            Ready to Start
            <br />
            Your Journey?
          </h2>

          <p className="text-2xl font-semibold mb-12 max-w-2xl mx-auto">
            Join thousands of students already earning and building their careers through CampusConnect
          </p>

          {/* Stats in circular badges */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {[
              { label: "Active Users", value: "12K+" },
              { label: "Posted Jobs", value: "3.5K+" },
              { label: "Success Rate", value: "94%" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[#FF6B6B] border-4 border-white flex items-center justify-center mb-2">
                  <span className="text-3xl font-black">{stat.value}</span>
                </div>
                <div className="text-sm uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>

          <button className="px-12 py-5 bg-[#F59E0B] text-white font-black uppercase tracking-widest text-xl hover:bg-[#FF6B6B] transition-colors inline-flex items-center gap-3 border-4 border-white">
            Get Started Free
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D3748] text-white py-12 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-black uppercase mb-4 tracking-wide">About</h3>
              <p className="leading-relaxed text-sm">
                CampusConnect bridges the gap between students and opportunities, creating a thriving campus economy.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase mb-4 tracking-wide">For Students</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    Browse Jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    Create Profile
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    Success Tips
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase mb-4 tracking-wide">For Employers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    Post Jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    Find Talent
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase mb-4 tracking-wide">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F59E0B] transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t-2 border-white/20 text-center">
            <p className="text-sm uppercase tracking-widest">© 2025 CampusConnect • Empowering Student Success</p>
          </div>
        </div>
      </footer>
    </div>
  )
}