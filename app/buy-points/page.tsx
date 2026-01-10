"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Coins, CreditCard, Check, Zap } from "lucide-react"

const packages = [
  {
    id: "starter",
    name: "STARTER PACKAGE",
    points: 50,
    price: 5.0,
    description: "Best for casual readers",
    bonus: 0,
  },
  {
    id: "popular",
    name: "POPULAR PACKAGE",
    points: 100,
    price: 9.0,
    description: "Most popular choice",
    bonus: 10,
    isPopular: true,
  },
  {
    id: "premium",
    name: "PREMIUM PACKAGE",
    points: 200,
    price: 15.0,
    description: "For serious collectors",
    bonus: 15,
  },
]

export default function BuyPointsPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const currentPackage = packages.find((p) => p.id === selectedPackage)

  const handlePurchase = (packageId: string) => {
    setSelectedPackage(packageId)
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock payment processing
    setShowPaymentModal(false)
    setShowSuccessModal(true)

    // Simulate coin animation
    setTimeout(() => {
      setShowSuccessModal(false)
      setSelectedPackage(null)
      setAgreeToTerms(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header - Bank Teller Window */}
            <div className="text-center mb-12">
              <div className="inline-block border-4 border-navy bg-gold/20 px-12 py-6 rotate-[-1deg] shadow-[0_8px_0_0_#1B3A57]">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Coins className="h-8 w-8 text-navy" />
                  <h1
                    className="text-4xl font-bold text-navy uppercase tracking-[0.3em]"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    Currency Exchange Bureau
                  </h1>
                </div>
                <p className="text-navy font-medium tracking-wider" style={{ fontFamily: "'Spectral', serif" }}>
                  Convert Real Money to Points
                </p>
              </div>
            </div>

            {/* Traveler's Check Packages */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`relative transition-all duration-300 ${pkg.isPopular ? "md:-mt-4 md:scale-105" : ""}`}
                  style={{
                    transform: `rotate(${index === 0 ? "-2deg" : index === 1 ? "0deg" : "2deg"})`,
                  }}
                >
                  {/* Best Value Stamp */}
                  {pkg.isPopular && (
                    <div className="absolute -top-6 -right-6 z-10">
                      <div
                        className="bg-customs-red text-parchment px-4 py-2 rotate-12 border-4 border-customs-red/60 shadow-lg"
                        style={{
                          fontFamily: "'Impact', sans-serif",
                          fontSize: "11px",
                          letterSpacing: "1px",
                        }}
                      >
                        BEST VALUE
                      </div>
                    </div>
                  )}

                  <Card
                    className={`border-4 ${
                      pkg.isPopular ? "border-gold shadow-2xl" : "border-navy"
                    } bg-parchment relative overflow-hidden`}
                  >
                    {/* Watermark */}
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRleHQgeD0iMCIgeT0iMjAiIGZvbnQtc2l6ZT0iMjQiPvCfk5Y8L3RleHQ+PC9zdmc+')] repeat" />
                    </div>

                    <CardContent className="pt-8 pb-8 text-center relative z-10">
                      {/* Package Name */}
                      <div className="border-b-2 border-navy pb-4 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Zap className="h-6 w-6 text-gold" />
                          <h2
                            className="text-xl text-navy uppercase tracking-[0.3em]"
                            style={{ fontFamily: "'Courier Prime', monospace", fontWeight: "bold" }}
                          >
                            {pkg.name}
                          </h2>
                        </div>
                      </div>

                      {/* Points Display */}
                      <div className="mb-6">
                        <div
                          className="text-6xl font-bold text-gold mb-2"
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          {pkg.points + pkg.bonus}
                        </div>
                        <div
                          className="text-sm text-navy uppercase tracking-widest"
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          POINTS
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="mt-2 inline-block bg-visa-green/20 border-2 border-visa-green px-3 py-1 rotate-[-3deg]">
                            <span className="text-visa-green font-bold text-sm">({pkg.bonus}% BONUS!)</span>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t-2 border-dashed border-navy/30 my-6" />

                      {/* Price */}
                      <div className="mb-6">
                        <div
                          className="text-sm text-navy uppercase tracking-widest mb-1"
                          style={{ fontFamily: "'Courier New', monospace" }}
                        >
                          PRICE:
                        </div>
                        <div
                          className="text-3xl font-bold text-navy"
                          style={{ fontFamily: "'Courier Prime', monospace" }}
                        >
                          ${pkg.price.toFixed(2)} USD
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t-2 border-dashed border-navy/30 my-6" />

                      {/* Description */}
                      <p className="text-sm text-navy/70 mb-6" style={{ fontFamily: "'Spectral', serif" }}>
                        {pkg.description}
                      </p>

                      {/* Purchase Button - Cash Check Stamp Style */}
                      <Button
                        onClick={() => handlePurchase(pkg.id)}
                        className={`w-full h-auto py-4 ${
                          pkg.isPopular
                            ? "bg-visa-green hover:bg-visa-green/90 border-4 border-visa-green/60"
                            : "bg-customs-red hover:bg-customs-red/90 border-4 border-customs-red/60"
                        } text-parchment shadow-lg transition-all hover:scale-105 rotate-[-1deg] hover:rotate-0`}
                        style={{
                          fontFamily: "'Impact', sans-serif",
                          fontSize: "14px",
                          letterSpacing: "2px",
                        }}
                      >
                        <Check className="h-5 w-5 mr-2" />
                        PURCHASE CHECK
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Gold Coins Decoration */}
            <div className="flex justify-center items-center gap-4 opacity-40">
              {[...Array(7)].map((_, i) => (
                <Coins
                  key={i}
                  className="h-8 w-8 text-gold"
                  style={{
                    transform: `rotate(${i * 45}deg)`,
                    opacity: 1 - i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-parchment border-4 border-navy max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-2xl text-navy uppercase tracking-[0.2em] text-center border-b-2 border-navy pb-4"
              style={{ fontFamily: "'Courier Prime', monospace", fontWeight: "bold" }}
            >
              Secure Payment Processing
            </DialogTitle>
            <DialogDescription className="text-center text-navy/70 pt-2" style={{ fontFamily: "'Spectral', serif" }}>
              Complete your purchase securely
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePaymentSubmit} className="space-y-6 pt-4">
            {/* Package Summary */}
            <div className="bg-navy/5 border-2 border-navy/20 p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <span
                  className="text-sm uppercase tracking-wider text-navy"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  Package:
                </span>
                <span className="font-bold text-gold text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {currentPackage?.points} Points
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-sm uppercase tracking-wider text-navy"
                  style={{ fontFamily: "'Courier New', monospace" }}
                >
                  Amount:
                </span>
                <span className="font-bold text-navy" style={{ fontFamily: "'Courier Prime', monospace" }}>
                  ${currentPackage?.price.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-navy/30" />

            {/* Payment Method */}
            <div className="space-y-4">
              <Label className="text-navy uppercase tracking-wider" style={{ fontFamily: "'Courier New', monospace" }}>
                Payment Method:
              </Label>

              <div className="border-2 border-navy bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 text-navy font-medium">
                  <CreditCard className="h-5 w-5" />
                  <span>Credit Card</span>
                </div>
                <div className="space-y-2">
                  <Input type="text" placeholder="Card Number" className="border-2 border-navy/30" required />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="text" placeholder="MM / YY" className="border-2 border-navy/30" required />
                    <Input type="text" placeholder="CVV" className="border-2 border-navy/30" required />
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-navy/50" style={{ fontFamily: "'Spectral', serif" }}>
                OR
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-airmail-blue text-airmail-blue hover:bg-airmail-blue/10 bg-transparent"
              >
                🅿️ Pay with PayPal
              </Button>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
                required
              />
              <label
                htmlFor="terms"
                className="text-sm text-navy/70 cursor-pointer"
                style={{ fontFamily: "'Spectral', serif" }}
              >
                I agree to payment terms and conditions
              </label>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-navy/30" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-2 border-navy text-navy bg-transparent"
                onClick={() => setShowPaymentModal(false)}
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={!agreeToTerms}
                className="flex-1 bg-visa-green hover:bg-visa-green/90 text-parchment border-4 border-visa-green/60"
                style={{
                  fontFamily: "'Impact', sans-serif",
                  letterSpacing: "1px",
                }}
              >
                COMPLETE PURCHASE
              </Button>
            </div>

            {/* Secure Checkout */}
            <div className="text-center text-sm text-navy/60 flex items-center justify-center gap-2">
              <span className="text-lg">🔒</span>
              <span>Secure checkout</span>
            </div>

            {/* Note for Hackathon */}
            <div className="bg-warning-yellow/20 border-2 border-warning-yellow p-3 rounded text-center">
              <p className="text-xs text-navy" style={{ fontFamily: "'Spectral', serif" }}>
                Note: This is a simulated payment for demonstration purposes
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-parchment border-4 border-visa-green max-w-md">
          <div className="text-center space-y-6 py-6">
            {/* Transaction Approved Stamp */}
            <div className="relative inline-block">
              <div
                className="border-8 border-visa-green px-12 py-8 rotate-[-15deg] shadow-2xl"
                style={{
                  fontFamily: "'Impact', sans-serif",
                  fontSize: "32px",
                  letterSpacing: "4px",
                }}
              >
                <div className="text-visa-green">TRANSACTION</div>
                <div className="text-visa-green">APPROVED</div>
              </div>
            </div>

            {/* Coins Animation */}
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Coins
                  key={i}
                  className="h-12 w-12 text-gold animate-bounce"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            {/* Receipt */}
            <div className="border-4 border-navy bg-white p-6 max-w-sm mx-auto text-left">
              <div className="border-b-2 border-navy pb-3 mb-3">
                <h3
                  className="text-center text-navy uppercase tracking-[0.2em]"
                  style={{ fontFamily: "'Courier Prime', monospace", fontWeight: "bold" }}
                >
                  Official Receipt
                </h3>
              </div>
              <div className="space-y-2 text-sm" style={{ fontFamily: "'Courier New', monospace" }}>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction:</span>
                  <span>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>${currentPackage?.price.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-dashed border-navy/30 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-gold">
                    <span>Points:</span>
                    <span>+{currentPackage && currentPackage.points + currentPackage.bonus}</span>
                  </div>
                </div>
              </div>
              <div className="border-t-2 border-navy pt-3 mt-3 text-center text-xs text-navy/60">Thank you!</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
