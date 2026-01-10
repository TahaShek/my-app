"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, Bell, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function NotificationTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")
  const [testTitle, setTestTitle] = useState("Bureau Test Notification")
  const [testBody, setTestBody] = useState("Your book passport has been stamped! ✈️")

  const handleSendTest = async () => {
    setIsLoading(true)
    setStatus('idle')
    setErrorMessage("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Please log in to test notifications")

      const res = await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: testTitle,
          body: testBody,
          targetUserId: user.id
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send notification")
      }

      setStatus('success')
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-serif">Notification Test Bureau</CardTitle>
              <CardDescription>
                Verify your device connection by sending a test signal to yourself.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Notification Title</Label>
                  <Input 
                    id="title" 
                    value={testTitle} 
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="e.g., Journey Update"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message Body</Label>
                  <Input 
                    id="body" 
                    value={testBody} 
                    onChange={(e) => setTestBody(e.target.value)}
                    placeholder="e.g., Your book has arrived at its destination."
                  />
                </div>
              </div>

              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <p className="text-sm">Test signal sent! If you don't see it, ensure notifications are allowed in your browser settings.</p>
                </div>
              )}

              {status === 'error' && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">Dispatch Error: {errorMessage}</p>
                </div>
              )}

              <Button 
                onClick={handleSendTest} 
                className="w-full h-12 text-lg font-bold gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    DISPATCH TEST SIGNAL
                  </>
                )}
              </Button>

              <div className="pt-4 space-y-2 border-t text-xs text-muted-foreground font-mono uppercase tracking-tight">
                <p>• Ensure browser permissions are GRANTED</p>
                <p>• Test works for both background & foreground</p>
                <p>• Multi-device support enabled</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
