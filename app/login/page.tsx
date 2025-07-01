"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Code, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { loginUser, resendVerificationEmail, loginWithGoogle } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const oauthError = searchParams.get("error")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [verificationResent, setVerificationResent] = useState(false)
  const [emailNeedsVerification, setEmailNeedsVerification] = useState(false)

  useEffect(() => {
    if (registered === "true") {
      setShowSuccess(true)
    }
    if (oauthError === "oauth_failed") {
      setError("Failed to sign in with Google. Please try again.")
    }
  }, [registered, oauthError])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "email") {
      setEmailNeedsVerification(false)
      setVerificationResent(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setEmailNeedsVerification(false)

    try {
      const user = await loginUser(formData)
      router.push("/leaderboard")
    } catch (err: any) {
      const errorMessage = err.message || "Invalid email or password"
      
      if (errorMessage.includes("verify your email") || errorMessage.includes("Email not confirmed") || err.message?.includes("email_not_confirmed")) {
        setEmailNeedsVerification(true)
        setError("")
      } else {
        setError(errorMessage)
        setEmailNeedsVerification(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError("")

    try {
      const { url, error } = await loginWithGoogle()
      
      if (error) {
        setError(error)
      } else if (url) {
        window.location.href = url
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError("Please enter your email address first")
      return
    }

    setResendingVerification(true)
    try {
      await resendVerificationEmail(formData.email)
      setVerificationResent(true)
      setEmailNeedsVerification(false)
      setError("")
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email")
    } finally {
      setResendingVerification(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-0 bg-background/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Code className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                CodeMasters
              </span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue your coding journey</CardDescription>
        </CardHeader>
        
        {showSuccess && (
          <div className="mx-6 mb-4 p-3 bg-green-50 text-green-800 rounded-md dark:bg-green-900/20 dark:text-green-400 border border-green-200">
            Account created successfully! Please check your email to verify your account before signing in.
          </div>
        )}
        
        {emailNeedsVerification && (
          <div className="mx-6 mb-4 p-3 bg-amber-50 text-amber-800 rounded-md dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200">
            <p className="mb-2">Please verify your email address before signing in. Check your inbox for the verification link.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
            >
              {resendingVerification ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </div>
        )}
        
        {verificationResent && (
          <div className="mx-6 mb-4 p-3 bg-blue-50 text-blue-800 rounded-md dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200">
            Verification email sent! Please check your inbox and click the verification link.
          </div>
        )}
          
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}
            
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" disabled={loading || googleLoading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary underline hover:no-underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}