"use client"

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Pencil, CheckCircle2, Mail, ShieldCheck } from "lucide-react"

interface FinalizeStepProps {
  email: string
  onEmailChange: (email: string) => void
  onOtpChange: (otp: string) => void
  onSendOtp: (email: string) => Promise<void>
  otpError?: string | null
  isVerifying?: boolean
  isSendingOtp?: boolean
  otpSent?: boolean
  isEmailVerified?: boolean
}

export function FinalizeStep({
  email,
  onEmailChange,
  onOtpChange,
  onSendOtp,
  otpError,
  isVerifying = false,
  isSendingOtp = false,
  otpSent = false,
  isEmailVerified = false,
}: FinalizeStepProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [isEditingEmail, setIsEditingEmail] = useState(!email)
  const [draftEmail, setDraftEmail] = useState(email)
  const [emailError, setEmailError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [devCode, setDevCode] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isEditingEmail) setDraftEmail(email)
  }, [email, isEditingEmail])

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const startCountdown = (seconds: number) => {
    setCountdown(seconds)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const validateEmail = (value: string) => {
    if (!value) return "Email is required."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address."
    return ""
  }

  const handleSaveEmail = () => {
    const err = validateEmail(draftEmail)
    if (err) { setEmailError(err); return }
    setEmailError("")
    onEmailChange(draftEmail)
    setIsEditingEmail(false)
  }

  const handleSendCode = async () => {
    const currentEmail = isEditingEmail ? draftEmail : email
    const err = validateEmail(currentEmail)
    if (err) { setEmailError(err); setIsEditingEmail(true); return }
    if (isEditingEmail) { onEmailChange(draftEmail); setIsEditingEmail(false) }
    try {
      await onSendOtp(isEditingEmail ? draftEmail : email)
      startCountdown(60)
      const blank = ["", "", "", "", "", ""]
      setOtp(blank)
      onOtpChange("")
    } catch { /* errors surfaced via otpError prop */ }
  }

  useEffect(() => {
    const handler = (e: CustomEvent<{ code: string }>) => { setDevCode(e.detail.code) }
    window.addEventListener("otp:devCode" as never, handler as EventListener)
    return () => window.removeEventListener("otp:devCode" as never, handler as EventListener)
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    onOtpChange(newOtp.join(""))
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return
    const newOtp = [...otp]
    pasted.split("").forEach((digit, i) => { if (i < 6) newOtp[i] = digit })
    setOtp(newOtp)
    const nextEmpty = newOtp.findIndex((d) => d === "")
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus()
    onOtpChange(newOtp.join(""))
  }

  const canResend = countdown === 0 && !isSendingOtp

  // ── Already-verified view ────────────────────────────────────────────────
  if (isEmailVerified) {
    return (
      <div className="w-full max-w-2xl px-4 sm:px-0">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-syne text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[--text-primary] mb-2 sm:mb-3">
            Email already verified
          </h2>
          <p className="font-poppins text-sm sm:text-base text-[#666666]">
            You have already verified your email. Click <strong>Next</strong> to proceed to payment.
          </p>
        </div>

        <div className="flex items-start gap-4 bg-[#f0faf4] border border-[#3BAB6B] rounded-xl p-5">
          <ShieldCheck className="w-8 h-8 text-[#3BAB6B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-poppins text-base font-semibold text-[#1a7a45] mb-1">Verified</p>
            <p className="font-poppins text-sm text-[#444444] break-all">{email}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── OTP verification view ─────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h2 className="font-syne text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[--text-primary] mb-2 sm:mb-3">
          Verify your email to continue
        </h2>
        <p className="font-poppins text-sm sm:text-base text-[#666666]">
          {`We'll send a 6-digit verification code to confirm your identity before proceeding to payment.`}
        </p>
      </div>

      <div className="mb-6 sm:mb-8 bg-[#f8fffe] border border-[#d4edda] rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-[#3BAB6B] flex-shrink-0" />
          <span className="font-poppins text-sm font-semibold text-[--text-primary]">Recipient email</span>
        </div>
        {isEditingEmail ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                type="email"
                value={draftEmail}
                onChange={(e) => { setDraftEmail(e.target.value); if (emailError) setEmailError("") }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEmail()}
                placeholder="your@email.com"
                className={`font-poppins text-sm h-10 ${emailError ? "border-red-400 focus:border-red-400" : "border-[#3BAB6B] focus:border-[#3BAB6B]"}`}
                autoFocus
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500 font-poppins flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{emailError}
                </p>
              )}
            </div>
            <Button type="button" onClick={handleSaveEmail}
              className="h-10 px-5 bg-[#3BAB6B] hover:bg-[#2d8f58] text-white font-poppins text-sm font-medium rounded-lg">
              Save
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="font-poppins text-base sm:text-lg font-semibold text-[#3BAB6B] break-all">{email}</span>
            <button type="button"
              onClick={() => { setDraftEmail(email); setIsEditingEmail(true) }}
              className="flex-shrink-0 flex items-center gap-1 text-xs text-[#666666] hover:text-[--text-primary] font-poppins transition-colors"
              title="Edit email">
              <Pencil className="w-3.5 h-3.5" />Edit
            </button>
          </div>
        )}
      </div>

      {!otpSent ? (
        <div className="mb-6 sm:mb-8">
          <Button type="button" onClick={handleSendCode} disabled={isSendingOtp || isEditingEmail}
            className="w-full sm:w-auto px-8 h-11 btn-gradient-green text-white font-poppins text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-60">
            {isSendingOtp ? "Sending\u2026" : "Send Verification Code"}
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3BAB6B] flex-shrink-0" />
            <p className="font-poppins text-sm text-[#3BAB6B] font-medium">Code sent! Check your inbox.</p>
          </div>

          {devCode && (
            <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3">
              <p className="font-poppins text-xs font-semibold text-yellow-800 mb-1 uppercase tracking-wide">Development Mode</p>
              <p className="font-poppins text-sm text-yellow-700">
                SMTP not configured &mdash; your OTP is:{" "}
                <strong className="font-mono text-base tracking-widest">{devCode}</strong>
              </p>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <label className="font-poppins text-sm sm:text-base font-medium text-[--text-primary] mb-3 sm:mb-4 block">
              Enter Code
            </label>
            <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center sm:justify-start">
              {otp.map((digit, index) => (
                <Input key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center text-lg sm:text-xl font-semibold font-poppins border-2 border-[#E0E0E0] rounded-lg focus:border-[--brand-primary] focus:ring-2 focus:ring-[--brand-primary]/20 transition-all disabled:opacity-60"
                />
              ))}
            </div>
          </div>

          {otpError && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="font-poppins text-sm text-red-600">{otpError}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <p className="font-poppins text-sm text-[#666666]">{"Didn't receive the code?"}</p>
            {countdown > 0 ? (
              <span className="font-poppins text-sm text-[#999999]">Resend in {countdown}s</span>
            ) : (
              <button type="button" onClick={handleSendCode} disabled={!canResend}
                className="font-poppins text-sm text-[--brand-primary] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                {isSendingOtp ? "Sending\u2026" : "Resend Code"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
