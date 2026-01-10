"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QrCode, Download, Share2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface BookQRDialogProps {
  bookId: string
  bookTitle: string
}

export function BookQRDialog({ bookId, bookTitle }: BookQRDialogProps) {
  const bookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/books/${bookId}`

  const handleDownload = () => {
    const svg = document.getElementById("book-qr-code")
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
      navigator.clipboard.writeText(bookUrl)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12 gap-2 bg-transparent">
          <QrCode className="h-4 w-4" />
          View QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-2 border-[#8B7355] bg-[#FAF6F0]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[#1a365d] text-center">{bookTitle}</DialogTitle>
          <DialogDescription className="text-center font-serif text-[#5C4033]">
            Scan to view book details
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 pt-4">
          <div className="p-6 bg-white border-2 border-[#8B7355] shadow-md rounded-lg">
            <QRCodeSVG
              id="book-qr-code"
              value={bookUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} variant="outline" className="flex-1 border-[#8B7355] text-[#5C4033] hover:text-[#1a365d] hover:bg-[#FFF8DC]">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1 border-[#8B7355] text-[#5C4033] hover:text-[#1a365d] hover:bg-[#FFF8DC]">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
