"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Check,
  X,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: "google" | "email" | "guest";
  avatarUrl?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
  onLogout: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onLogout,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [googleEmailPrompt, setGoogleEmailPrompt] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSuccessMessage("");
      setGoogleEmailPrompt(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Derive stable namespace ID from email or username
  const sanitizeId = (raw: string) => {
    return raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "_")
      .slice(0, 32);
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = googleEmail.trim() || email.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setErrorMessage("Please enter a valid Google email address.");
      return;
    }

    const username = targetEmail.split("@")[0];
    const formattedName =
      username.charAt(0).toUpperCase() + username.slice(1).replace(/[._-]/g, " ");
    const id = sanitizeId(username);

    const user: UserProfile = {
      id,
      name: formattedName,
      email: targetEmail.toLowerCase(),
      provider: "google",
    };

    onSelectUser(user);
    setSuccessMessage(`Signed in as ${user.email}`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Email / Password Form Submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMessage("Password must be at least 4 characters.");
      return;
    }

    const emailPrefix = email.split("@")[0];
    const derivedName =
      displayName.trim() ||
      emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).replace(/[._-]/g, " ");

    const id = sanitizeId(emailPrefix);

    const user: UserProfile = {
      id,
      name: derivedName,
      email: email.trim().toLowerCase(),
      provider: "email",
    };

    onSelectUser(user);
    setSuccessMessage(
      authMode === "signup"
        ? `Account created! Welcome, ${user.name}`
        : `Signed in as ${user.name}`
    );
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const isGuest = !currentUser || currentUser.provider === "guest" || currentUser.id === "guest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#FAF9F6] dark:bg-[#17191C] border border-[rgba(23,25,28,0.12)] shadow-2xl p-6 flex flex-col gap-5 text-[#17191C] dark:text-[#F7F7F5]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#6F7378]"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C8F5DE]/60 text-[#167A55] text-[11px] font-mono w-fit border border-[#8DE8BF]/50">
            <ShieldCheck className="h-3 w-3" />
            <span>Encrypted Walrus Account</span>
          </div>
          <h2 className="text-xl font-display font-semibold tracking-tight">
            {isGuest ? "Sign In to Tusk" : "Account & Profile"}
          </h2>
          <p className="text-xs text-[#6F7378] leading-relaxed">
            {isGuest
              ? "Sign in with your Google account or email. Your conversations and Walrus long-term memories stay private and cryptographically encrypted to you."
              : "You are currently signed in. Your memories and chat sessions are isolated to your private Walrus namespace."}
          </p>
        </div>

        {/* Current User Status Card */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-[rgba(23,25,28,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 bg-[#167A55]/15 border border-[#167A55]/30 shrink-0">
              <AvatarFallback className="text-[#167A55] font-semibold text-xs">
                {isGuest ? "G" : currentUser?.name?.slice(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold truncate">
                  {isGuest ? "Guest User" : currentUser?.name}
                </span>
                {!isGuest && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-[#167A55]/10 text-[#167A55] border border-[#167A55]/20">
                    {currentUser?.provider === "google" ? "Google" : "Email"}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#6F7378] truncate">
                {isGuest ? "No active account" : currentUser?.email}
              </span>
              <span className="text-[9px] font-mono text-[#8DE8BF] dark:text-[#42C98A] truncate mt-0.5">
                {isGuest ? "namespace: temporary" : `namespace: personal:${currentUser?.id}`}
              </span>
            </div>
          </div>

          {!isGuest && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onLogout();
                setSuccessMessage("Logged out successfully");
              }}
              className="h-8 text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </Button>
          )}
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#C8F5DE]/50 border border-[#8DE8BF] text-[#167A55] text-xs">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Authentication Options (if guest or wanting to switch account) */}
        <div className="flex flex-col gap-3">
          {/* 1. Continue with Google Button */}
          {!googleEmailPrompt ? (
            <button
              type="button"
              onClick={() => setGoogleEmailPrompt(true)}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[rgba(23,25,28,0.15)] bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-xs text-xs font-medium"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          ) : (
            <form
              onSubmit={handleGoogleSignIn}
              className="p-3 rounded-xl bg-white dark:bg-white/5 border border-[#4285F4]/40 flex flex-col gap-2.5 animate-in fade-in-0 duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17191C] dark:text-[#F7F7F5]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign In with Google Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleEmailPrompt(false)}
                  className="text-[11px] text-[#6F7378] hover:text-[#17191C]"
                >
                  Cancel
                </button>
              </div>
              <input
                type="email"
                autoFocus
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="Enter your Google email (e.g. user@gmail.com)"
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-white/10 border border-[rgba(23,25,28,0.15)] outline-none focus:border-[#4285F4]"
              />
              <Button
                type="submit"
                size="sm"
                className="w-full text-xs h-8 bg-[#4285F4] hover:bg-[#3367D6] text-white"
              >
                Sign In with Google
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[rgba(23,25,28,0.1)] dark:bg-white/10" />
            <span className="text-[10px] text-[#6F7378] uppercase tracking-wider font-medium">
              Or with email
            </span>
            <div className="flex-1 h-px bg-[rgba(23,25,28,0.1)] dark:bg-white/10" />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMessage("");
              }}
              className={`py-1.5 rounded-md font-medium transition-all ${
                authMode === "signin"
                  ? "bg-white dark:bg-white/15 text-[#17191C] dark:text-[#F7F7F5] shadow-xs"
                  : "text-[#6F7378] hover:text-[#17191C]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setErrorMessage("");
              }}
              className={`py-1.5 rounded-md font-medium transition-all ${
                authMode === "signup"
                  ? "bg-white dark:bg-white/15 text-[#17191C] dark:text-[#F7F7F5] shadow-xs"
                  : "text-[#6F7378] hover:text-[#17191C]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5">
            {authMode === "signup" && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#6F7378]">Your Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-3.5 w-3.5 text-[#6F7378]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white dark:bg-white/10 border border-[rgba(23,25,28,0.12)] outline-none focus:border-[#167A55]"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6F7378]">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-3.5 w-3.5 text-[#6F7378]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white dark:bg-white/10 border border-[rgba(23,25,28,0.12)] outline-none focus:border-[#167A55]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#6F7378]">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-3.5 w-3.5 text-[#6F7378]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white dark:bg-white/10 border border-[rgba(23,25,28,0.12)] outline-none focus:border-[#167A55]"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-xs h-9 bg-[#17191C] text-[#F7F7F5] hover:bg-[#167A55] gap-2 mt-1 shadow-sm transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{authMode === "signup" ? "Create Account & Sign In" : "Sign In with Email"}</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
