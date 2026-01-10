import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { PassportStamp } from "@/components/passport-stamp"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative py-20 md:py-32 wooden-desk-texture overflow-hidden">
          <div className="container mx-auto px-4">
            {/* Scattered desk items */}
            <div className="relative max-w-6xl mx-auto">
              {/* Vintage globe - top right */}
              <div className="absolute -top-8 right-0 hidden lg:block opacity-60">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#5B8FA3] to-[#1B3A57] opacity-50 blur-sm" />
                <div className="absolute top-4 left-4 w-24 h-24 rounded-full border-4 border-[#1B3A57] flex items-center justify-center">
                  <span className="text-4xl">🌍</span>
                </div>
              </div>

              {/* Coffee cup - animated steam */}
              <div className="absolute top-0 left-8 hidden md:block">
                <div className="relative">
                  <div className="w-16 h-20 bg-[#8B5A2B] rounded-b-full border-4 border-[#1A1613]" />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-6 bg-gradient-to-t from-gray-400 to-transparent opacity-40 absolute animate-float"
                        style={{
                          left: `${i * 6}px`,
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: "2s",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: Large open book showing two pages */}
              <div className="relative">
                <div className="grid md:grid-cols-2 gap-0 max-w-4xl mx-auto">
                  {/* Left page */}
                  <div
                    className="bg-[#FBF8F3] p-8 md:p-12 border-3 border-[#1B3A57] passport-watermark relative shadow-2xl"
                    style={{
                      borderRight: "none",
                      transform: "perspective(1200px) rotateY(2deg)",
                    }}
                  >
                    <div className="font-mono text-[10px] text-[#6B5E4F] uppercase tracking-widest mb-6">
                      Departures • Gate A
                    </div>

                    <h2
                      className="font-serif italic text-3xl md:text-4xl text-[#1A1613] mb-6 leading-tight"
                      style={{ letterSpacing: "-0.3px" }}
                    >
                      Send Your Books on Adventures
                    </h2>

                    <div className="space-y-3 mb-8">
                      {["✈️ Register Book", "🚂 Generate Passport", "🚢 Track Journey"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 font-sans text-sm text-[#1A1613]">
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-[#C1403D] hover:bg-[#C1403D]/90 text-[#F4ECD8] font-mono text-sm uppercase tracking-widest border-2 border-[#1A1613] relative perforated-edge"
                      asChild
                    >
                      <Link href="/add-book">
                        <span className="relative">
                          Departure Ticket
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#B8956A] rounded-r-full" />
                        </span>
                      </Link>
                    </Button>

                    <div className="absolute top-4 right-4">
                      <PassportStamp text="START" variant="circular" city="HERE" rotation={-5} />
                    </div>
                  </div>

                  {/* Right page */}
                  <div
                    className="bg-[#FBF8F3] p-8 md:p-12 border-3 border-[#1B3A57] passport-watermark relative shadow-2xl"
                    style={{
                      borderLeft: "none",
                      transform: "perspective(1200px) rotateY(-2deg)",
                    }}
                  >
                    <div className="font-mono text-[10px] text-[#6B5E4F] uppercase tracking-widest mb-6">
                      Arrivals • Baggage Claim
                    </div>

                    <h2
                      className="font-serif italic text-3xl md:text-4xl text-[#1A1613] mb-6 leading-tight"
                      style={{ letterSpacing: "-0.3px" }}
                    >
                      Discover Traveling Books
                    </h2>

                    {/* Mini map with pins */}
                    <div className="bg-[#5B8FA3]/10 border-2 border-[#5B8FA3] p-4 mb-6 relative h-32">
                      {[
                        { top: "20%", left: "25%", city: "NYC" },
                        { top: "50%", left: "60%", city: "LA" },
                        { top: "70%", left: "40%", city: "CHI" },
                      ].map((pin, i) => (
                        <div key={i} className="absolute" style={{ top: pin.top, left: pin.left }}>
                          <div className="w-3 h-3 bg-[#C1403D] rounded-full border-2 border-[#1A1613]" />
                          <div className="font-mono text-[8px] mt-1">{pin.city}</div>
                        </div>
                      ))}
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-[#4A7C59] hover:bg-[#4A7C59]/90 text-[#F4ECD8] font-mono text-sm uppercase tracking-widest border-2 border-[#1A1613] relative perforated-edge"
                      asChild
                    >
                      <Link href="/browse">
                        <span className="relative">
                          Arrival Ticket
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#B8956A] rounded-r-full" />
                        </span>
                      </Link>
                    </Button>

                    <div className="absolute bottom-4 right-4">
                      <PassportStamp text="CLAIM" variant="circular" city="BOOK" rotation={3} />
                    </div>
                  </div>
                </div>

                {/* Book spine in center */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-gradient-to-r from-[#8B5A2B] via-[#6B4423] to-[#8B5A2B] hidden md:block z-10"
                  style={{
                    boxShadow: "inset 2px 0 4px rgba(0,0,0,0.3), inset -2px 0 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>

              {/* Rubber stamp with stats */}
              <div className="mt-12 flex justify-center">
                <div className="relative" style={{ transform: "rotate(-2deg)" }}>
                  <div className="border-4 border-[#C1403D] p-6 bg-[#C1403D]/5 relative">
                    <div className="absolute inset-2 border-2 border-[#C1403D]" />
                    <div className="relative z-10 font-mono text-center space-y-1">
                      <div className="text-2xl font-bold text-[#C1403D] tracking-tight tabular-nums">2,847</div>
                      <div className="text-[9px] uppercase tracking-widest text-[#1A1613]">Books Traveling</div>
                      <div className="text-xs text-[#6B5E4F]">• • •</div>
                      <div className="text-2xl font-bold text-[#C1403D] tracking-tight tabular-nums">89</div>
                      <div className="text-[9px] uppercase tracking-widest text-[#1A1613]">Cities Reached</div>
                      <div className="text-xs text-[#6B5E4F]">• • •</div>
                      <div className="text-2xl font-bold text-[#C1403D] tracking-tight tabular-nums">1,203</div>
                      <div className="text-[9px] uppercase tracking-widest text-[#1A1613]">Readers Connected</div>
                    </div>
                  </div>
                  {/* Ink smudge effect */}
                  <div className="absolute -bottom-2 right-4 w-32 h-3 bg-[#C1403D]/10 blur-md" />
                </div>
              </div>

              {/* Scattered postage stamps */}
              <div className="absolute bottom-8 left-0 hidden lg:block">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute w-12 h-16 border-2 border-[#1B3A57] bg-[#5B8FA3] postage-stamp-perforation"
                    style={{
                      transform: `rotate(${i * 15 - 15}deg) translate(${i * 30}px, ${i * 20}px)`,
                      opacity: 0.4,
                    }}
                  />
                ))}
              </div>

              {/* Fountain pen */}
              <div className="absolute bottom-4 right-12 hidden lg:block opacity-40 transform rotate-45">
                <div className="w-32 h-2 bg-gradient-to-r from-[#1A1613] to-[#C5A572]" />
              </div>
            </div>
          </div>
        </section>

        {/* How it works - Travel itinerary style */}
        <section className="py-20 bg-[#FBF8F3]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="font-mono text-xs uppercase tracking-widest text-[#6B5E4F] mb-2">
                ═══ Travel Guide ═══
              </div>
              <h2
                className="font-mono text-4xl font-bold uppercase tracking-wider text-[#1A1613]"
                style={{ letterSpacing: "3px" }}
              >
                How It Works
              </h2>
              <div className="flex justify-center gap-4 mt-6 flex-wrap">
                <PassportStamp text="SIMPLE" variant="diagonal" rotation={-2} />
                <PassportStamp text="FAST" variant="rectangular" city="PROCESS" rotation={1} />
                <PassportStamp text="SECURE" variant="diagonal" rotation={2} />
              </div>
            </div>

            {/* Connected ticket stubs */}
            <div className="max-w-2xl mx-auto space-y-0">
              {[
                {
                  step: "01",
                  title: "Register Your Book",
                  desc: "Create a book passport with photo and details",
                  icon: "📖",
                },
                {
                  step: "02",
                  title: "Generate QR Passport",
                  desc: "Receive unique tracking code and visa stamps",
                  icon: "🔖",
                },
                {
                  step: "03",
                  title: "Arrange Exchange",
                  desc: "Meet at designated customs checkpoints",
                  icon: "🤝",
                },
              ].map((item, i) => (
                <div key={i}>
                  <div
                    className="bg-gradient-to-r from-[#F4ECD8] to-[#FBF8F3] border-3 border-[#1B3A57] p-6 relative"
                    style={{
                      marginLeft: i % 2 === 0 ? "0" : "auto",
                      marginRight: i % 2 === 0 ? "auto" : "0",
                      width: "85%",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{item.icon}</div>
                      <div className="flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#6B5E4F] mb-1">
                          Step {item.step}
                        </div>
                        <h3 className="font-serif italic text-xl text-[#1A1613] mb-2">{item.title}</h3>
                        <p className="font-sans text-sm text-[#6B5E4F] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    {/* Ticket number in corner */}
                    <div className="absolute top-2 right-2 font-mono text-[8px] text-[#6B5E4F]">
                      NO. {String(i + 1).padStart(4, "0")}
                    </div>
                  </div>
                  {i < 2 && (
                    <div
                      className="ticket-stub-tear h-6 w-full"
                      style={{ marginLeft: i % 2 === 0 ? "42.5%" : "0", width: "15%" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Customs clearance */}
        <section className="py-20 bg-[#1B3A57] relative overflow-hidden">
          {/* Diagonal stripes like airmail */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 20px, #C1403D 20px, #C1403D 40px, #F4ECD8 40px, #F4ECD8 60px)",
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-block border-4 border-[#C5A572] p-8 bg-[#1B3A57]">
                <div className="font-mono text-xs uppercase tracking-widest text-[#C5A572] mb-4">
                  ║ Passport Control ║
                </div>
                <h2
                  className="font-mono text-4xl font-bold uppercase text-[#F4ECD8] tracking-wider mb-6"
                  style={{ letterSpacing: "3px" }}
                >
                  Begin Your Journey
                </h2>
                <p className="font-sans text-base text-[#F4ECD8]/80 leading-relaxed">
                  Join our international community of readers.
                  <br />
                  Every book exchange is a new stamp in your passport.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-[#C1403D] hover:bg-[#C1403D]/90 text-[#F4ECD8] font-mono uppercase text-sm tracking-widest border-2 border-[#F4ECD8] px-8"
                  asChild
                >
                  <Link href="/signup">Apply for Passport</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent hover:bg-[#F4ECD8]/10 text-[#F4ECD8] border-2 border-[#F4ECD8] font-mono uppercase text-sm tracking-widest px-8"
                  asChild
                >
                  <Link href="/browse">Browse Travelers</Link>
                </Button>
              </div>

              {/* Approved stamp */}
              <div className="pt-8">
                <div className="inline-block transform -rotate-6">
                  <div className="border-4 border-[#4A7C59] px-6 py-3 bg-[#4A7C59]/20 relative">
                    <div className="absolute inset-2 border-2 border-[#4A7C59]" />
                    <div className="relative font-mono text-2xl font-bold uppercase text-[#4A7C59] tracking-widest">
                      Approved
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
