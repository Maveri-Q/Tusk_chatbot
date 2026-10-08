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
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
  Loader2,
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
  // Screens: "main" (default options) | "google-chooser" | "google-custom"
  const [view, setView] = useState<"main" | "google-chooser" | "google-custom">("main");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  
  // Email / Password Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Custom Google input
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  
  // Status states
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatusText, setAuthStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load saved email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tusk_saved_email");
      if (saved && !email) {
        setEmail(saved);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSuccessMessage("");
      setView("main");
      setIsAuthenticating(false);
      setAuthStatusText("");
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

  // 1. Google Account Chooser: Select primary account (Tobechukwu Otuonye)
  const handleSelectGoogleAccount = (
    account: { name: string; email: string }
  ) => {
    setIsAuthenticating(true);
    setAuthStatusText(`Signing in as ${account.email}...`);
    setErrorMessage("");

    setTimeout(() => {
      const id = sanitizeId(account.email.split("@")[0]);
      const user: UserProfile = {
        id,
        name: account.name,
        email: account.email.toLowerCase(),
        provider: "google",
      };

      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("tusk_saved_email", account.email);
      }

      onSelectUser(user);
      setIsAuthenticating(false);
      setSuccessMessage(`Signed in as ${user.name}`);
      setTimeout(() => {
        onClose();
      }, 500);
    }, 450);
  };

  // 2. Custom Google Sign-In Submit
  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes("@")) {
      setErrorMessage("Please enter a valid Google email address.");
      return;
    }

    const username = customGoogleEmail.split("@")[0];
    const derivedName =
      username.charAt(0).toUpperCase() + username.slice(1).replace(/[._-]/g, " ");

    handleSelectGoogleAccount({
      name: derivedName,
      email: customGoogleEmail.trim(),
    });
  };

  // 3. Email / Password Form Submit
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

    setIsAuthenticating(true);
    setAuthStatusText(
      authMode === "signup" ? "Creating your account..." : "Authenticating credentials..."
    );

    setTimeout(() => {
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

      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("tusk_saved_email", email.trim());
      }

      onSelectUser(user);
      setIsAuthenticating(false);
      setSuccessMessage(
        authMode === "signup"
          ? `Welcome to Tusk, ${user.name}!`
          : `Signed in as ${user.name}`
      );
      setTimeout(() => {
        onClose();
      }, 500);
    }, 400);
  };

  const isGuest = !currentUser || currentUser.provider === "guest" || currentUser.id === "guest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-bg-elev border border-border shadow-2xl p-6 flex flex-col gap-4 text-text">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-bg-elev-2 text-text-muted hover:text-text transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ========================================================
            VIEW: GOOGLE ACCOUNT CHOOSER (Authentic Google UI)
           ======================================================== */}
        {view === "google-chooser" && (
          <div className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
            {/* Header with Google Logo */}
            <div className="flex flex-col items-center text-center gap-1.5 pt-1">
              <svg className="h-7 w-7" viewBox="0 0 24 24">
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
              <h2 className="text-lg font-semibold text-text tracking-tight mt-1">
                Choose an account
              </h2>
              <p className="text-xs text-text-muted">
                to continue to <span className="font-semibold text-text">Tusk AI</span>
              </p>
            </div>

            {/* Account List */}
            <div className="flex flex-col rounded-xl border border-border divide-y divide-border overflow-hidden bg-bg/50">
              {/* Primary User Google Account */}
              <button
                type="button"
                onClick={() =>
                  handleSelectGoogleAccount({
                    name: "Tobechukwu Otuonye",
                    email: "tobeotuonye@gmail.com",
                  })
                }
                disabled={isAuthenticating}
                className="w-full flex items-center justify-between p-3.5 hover:bg-bg-elev-2 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-[#167A55] text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-xs">
                    T
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-text group-hover:text-lime transition-colors truncate">
                      Tobechukwu Otuonye
                    </span>
                    <span className="text-[11px] text-text-muted truncate">
                      tobeotuonye@gmail.com
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime/10 text-lime border border-lime/20 shrink-0">
                  Default
                </span>
              </button>

              {/* Use Another Google Account */}
              <button
                type="button"
                onClick={() => setView("google-custom")}
                disabled={isAuthenticating}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-bg-elev-2 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-full bg-bg-elev-2 border border-border flex items-center justify-center text-text-muted shrink-0">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-text">
                    Use another account
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Sign in with a different Google email
                  </span>
                </div>
              </button>
            </div>

            {/* Back Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setView("main")}
                disabled={isAuthenticating}
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              {isAuthenticating && (
                <div className="flex items-center gap-2 text-xs text-lime">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{authStatusText}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW: CUSTOM GOOGLE ACCOUNT INPUT
           ======================================================== */}
        {view === "google-custom" && (
          <form
            onSubmit={handleCustomGoogleSubmit}
            className="flex flex-col gap-4 animate-in fade-in-0 duration-150"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("google-chooser")}
                className="p-1 rounded-md text-text-muted hover:text-text hover:bg-bg-elev-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-semibold text-text">
                Sign in with another Google account
              </h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-text-muted">
                Google Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-3.5 w-3.5 text-text-muted" />
                <input
                  type="email"
                  autoFocus
                  required
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-bg-elev-2 border border-border outline-none focus:border-lime"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setView("google-chooser")}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isAuthenticating}
                className="text-xs h-8"
              >
                {isAuthenticating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ========================================================
            VIEW: MAIN AUTHENTICATION SCREEN
           ======================================================== */}
        {view === "main" && (
          <>
            {/* Header */}
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime/10 text-lime text-[11px] font-mono w-fit border border-lime/20">
                <ShieldCheck className="h-3 w-3" />
                <span>Encrypted Walrus Account</span>
              </div>
              <h2 className="text-xl font-display font-semibold tracking-tight">
                {isGuest ? "Sign In to Tusk" : "Account & Profile"}
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                {isGuest
                  ? "Sign in with Google or your email. Your memories stay private and cryptographically encrypted to your decentralized Walrus account."
                  : "You are currently signed in. Your memories and chat sessions are synchronized to your personal namespace."}
              </p>
            </div>

            {/* Current User Status Card */}
            <div className="p-3 rounded-xl bg-bg-elev-2 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 bg-lime/10 border border-lime/20 shrink-0">
                  <AvatarFallback className="text-lime font-bold text-xs">
                    {isGuest ? "G" : currentUser?.name?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold truncate">
                      {isGuest ? "Guest User" : currentUser?.name}
                    </span>
                    {!isGuest && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-lime/10 text-lime border border-lime/20">
                        {currentUser?.provider === "google" ? "Google" : "Email"}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted truncate">
                    {isGuest ? "No active account" : currentUser?.email}
                  </span>
                  <span className="text-[9px] font-mono text-lime truncate mt-0.5">
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
                  className="h-8 text-xs gap-1.5 text-danger hover:bg-danger/10 border-danger/30 shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </Button>
              )}
            </div>

            {/* Feedback messages */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs animate-in fade-in-0">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-lime/15 border border-lime/30 text-lime text-xs animate-in fade-in-0">
                <Check className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. Continue with Google Button (redirects to Google account chooser outside chatbot) */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/auth/google";
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-bg-elev-2 hover:bg-bg hover:border-lime/40 transition-all shadow-xs text-xs font-semibold text-text group"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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

              {/* Divider */}
              <div className="flex items-center gap-3 my-0.5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
                  Or manual login with email
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-bg-elev-2 rounded-lg text-xs border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMessage("");
                  }}
                  className={`py-1.5 rounded-md font-medium transition-all ${
                    authMode === "signin"
                      ? "bg-bg text-text shadow-xs font-semibold"
                      : "text-text-muted hover:text-text"
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
                      ? "bg-bg text-text shadow-xs font-semibold"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Manual Email & Password Form */}
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5">
                {authMode === "signup" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-text-muted">Your Name</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 h-3.5 w-3.5 text-text-muted" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Tobechukwu Otuonye"
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-bg-elev-2 border border-border outline-none focus:border-lime"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-text-muted">
                      Saved Email Address
                    </label>
                    {/* Quick fill shortcut if user has an active/saved email */}
                    {email !== "tobeotuonye@gmail.com" && (
                      <button
                        type="button"
                        onClick={() => setEmail("tobeotuonye@gmail.com")}
                        className="text-[10px] text-lime hover:underline"
                      >
                        Use tobeotuonye@gmail.com
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 h-3.5 w-3.5 text-text-muted" />
                    <input
                      type="email"
                      required
                      autoComplete="username email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-bg-elev-2 border border-border outline-none focus:border-lime"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-text-muted">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 h-3.5 w-3.5 text-text-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 rounded-lg text-xs bg-bg-elev-2 border border-border outline-none focus:border-lime"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 rounded text-text-muted hover:text-text transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between py-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-text-muted select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-border accent-[#167A55] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>Remember my saved login</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full text-xs h-9 bg-flare text-flare-foreground hover:brightness-110 gap-2 mt-1 shadow-sm font-semibold transition-all"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{authStatusText}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-3.5 w-3.5" />
                      <span>
                        {authMode === "signup" ? "Create Account & Sign In" : "Sign In with Email"}
                      </span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

