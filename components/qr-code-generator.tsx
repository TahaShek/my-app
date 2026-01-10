"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Download, Share2, BookOpen, History } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

interface QRCodeGeneratorProps {
  bookId: string
  bookTitle: string
  qrCode: string
  onAddAnother: () => void
}

export function QRCodeGenerator({ bookId, bookTitle, qrCode, onAddAnother }: QRCodeGeneratorProps) {
  // QR code links directly to history page
  const bookHistoryUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/books/${bookId}/history`

  const handleDownload = () => {
    const svg = document.getElementById("qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      if (ctx) {
        // White background
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, 512, 512)
        ctx.drawImage(img, 0, 0)
        
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `${bookTitle.toLowerCase().replace(/\s+/g, "-")}-qr.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${bookTitle} - Journey`,
          text: `Check out the journey of "${bookTitle}" on BooksExchange`,
          url: bookHistoryUrl,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      navigator.clipboard.writeText(bookHistoryUrl)
      alert("✅ History link copied to clipboard!")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-foreground font-serif mb-2">Book Registered!</h2>
        <p className="text-muted-foreground">Your unique QR code is ready</p>
      </div>

      <Card className="border-2 border-[#1B3A57]/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif text-[#1B3A57]">{bookTitle}</CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <span>Scan to view book's complete journey</span>
            <span className="font-mono text-xs text-primary font-bold">{qrCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center p-8 bg-white rounded-lg border-2 border-border shadow-inner">
            <div className="text-center">
              <QRCodeSVG
                id="qr-code"
                value={bookHistoryUrl}
                size={256}
                level="H"
                includeMargin={true}
                style={{
                  height: "auto",
                  maxWidth: "100%",
                  width: "100%",
                }}
              />
              <p className="text-xs text-muted-foreground mt-3 font-bold">📖 Scan me to see my journey!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleDownload} className="w-full h-12 gap-2 bg-transparent border-[#1B3A57]/30 hover:bg-[#1B3A57]/5" variant="outline">
              <Download className="h-4 w-4" />
              Download QR Sticker
            </Button>
            <Button onClick={handleShare} className="w-full h-12 gap-2 bg-transparent border-[#1B3A57]/30 hover:bg-[#1B3A57]/5" variant="outline">
              <Share2 className="h-4 w-4" />
              Share Book History
            </Button>
            <Button asChild className="w-full h-12 gap-2 bg-transparent border-[#1B3A57]/30 hover:bg-[#1B3A57]/5" variant="outline">
              <Link href={`/books/${bookId}/history`}>
                <History className="h-4 w-4" />
                View Book Journey
              </Link>
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-5 border-2 border-primary/10">
            <p className="font-bold mb-3 flex items-center gap-2 text-[#1B3A57]">
              <BookOpen className="h-5 w-5 text-primary" />
              How to use your QR code:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Download and print the QR code sticker</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Attach it inside your physical book cover</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Anyone who scans it will see the book's complete journey</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>Each reader can add their story and pass it on</span>
              </li>
            </ul>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={onAddAnother} className="flex-1 h-12 gap-2 bg-[#1B3A57] hover:bg-[#1B3A57]/90 text-white">
              <BookOpen className="h-4 w-4" />
              Add Another Book
            </Button>
            <Button asChild variant="outline" className="flex-1 h-12 bg-transparent border-[#1B3A57]/30 hover:bg-[#1B3A57]/5">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}