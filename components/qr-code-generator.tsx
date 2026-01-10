"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Download, Share2, BookOpen } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

interface QRCodeGeneratorProps {
  bookId: string
  bookTitle: string
  onAddAnother: () => void
}

export function QRCodeGenerator({ bookId, bookTitle, onAddAnother }: QRCodeGeneratorProps) {
  const bookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/books/${bookId}`

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
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `${bookTitle.toLowerCase().replace(/\s+/g, "-")}-qr.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookTitle,
          text: `Check out "${bookTitle}" on BooksExchange`,
          url: bookUrl,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(bookUrl)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-foreground font-serif mb-2">Book Added Successfully!</h2>
        <p className="text-muted-foreground">Your QR code is ready to use</p>
      </div>

      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">{bookTitle}</CardTitle>
          <CardDescription>Scan this QR code to view book details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center p-8 bg-white rounded-lg border-2 border-border">
            <QRCodeSVG
              id="qr-code"
              value={bookUrl}
              size={256}
              level="H"
              includeMargin={true}
              style={{
                height: "auto",
                maxWidth: "100%",
                width: "100%",
              }}
            />
          </div>

          <div className="space-y-3">
            <Button onClick={handleDownload} className="w-full h-12 gap-2 bg-transparent" variant="outline">
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
            <Button onClick={handleShare} className="w-full h-12 gap-2 bg-transparent" variant="outline">
              <Share2 className="h-4 w-4" />
              Share Book
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">How to use your QR code:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Download and print the QR code</li>
              <li>Attach it to your physical book</li>
              <li>Others can scan it to view details and request an exchange</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={onAddAnother} className="flex-1 h-12 gap-2 bg-primary hover:bg-primary/90">
              <BookOpen className="h-4 w-4" />
              Add Another Book
            </Button>
            <Button asChild variant="outline" className="flex-1 h-12 bg-transparent">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
