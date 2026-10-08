"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, ArrowLeft, Loader2 } from "lucide-react";

export default function GoogleAuthPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState("");

  const handleSelectAccount = (account: { name: string; email: string }) => {
    setSelectedAccount(account);
    setIsRedirecting(true);

    // Save to localStorage for future sessions
    try {
      localStorage.setItem("tusk_saved_email", account.email);
    } catch (_) {}

    // Redirect back to Tusk chatbot with authenticated credentials
    setTimeout(() => {
      const params = new URLSearchParams({
        google_auth: "success",
        email: account.email,
        name: account.name,
      });
      window.location.href = `/chat?${params.toString()}`;
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setCustomError("Enter a valid Google email address");
      return;
    }
    const username = customEmail.split("@")[0];
    const derivedName =
      username.charAt(0).toUpperCase() + username.slice(1).replace(/[._-]/g, " ");

    handleSelectAccount({
      name: derivedName,
      email: customEmail.trim().toLowerCase(),
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F4F9] dark:bg-[#131314] flex flex-col items-center justify-center p-4 text-[#1F1F1F] dark:text-[#E3E3E3] font-sans antialiased">
      {/* Google Card Container */}
      <div className="w-full max-w-[440px] bg-white dark:bg-[#1E1F20] rounded-[28px] border border-[#E0E2E7] dark:border-[#333538] shadow-sm p-8 flex flex-col gap-6">
        {/* Google G Logo Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <svg className="h-8 w-8" viewBox="0 0 24 24">
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

          <h1 className="text-[22px] font-normal tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] mt-1">
            Choose an account
          </h1>
          <p className="text-sm text-[#444746] dark:text-[#C4C7C5]">
            to continue to <span className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">Tusk AI</span>
          </p>
        </div>

        {/* Loading / Redirecting state */}
        {isRedirecting ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 text-[#0B57D0] dark:text-[#A8C7FA] animate-spin" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Signing in as {selectedAccount?.name}...
              </span>
              <span className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                Redirecting back to Tusk chatbot
              </span>
            </div>
          </div>
        ) : !showCustomInput ? (
          /* Accounts List */
          <div className="flex flex-col rounded-2xl border border-[#E0E2E7] dark:border-[#333538] divide-y divide-[#E0E2E7] dark:divide-[#333538] overflow-hidden">
            {/* Primary account: Tobechukwu Otuonye */}
            <button
              type="button"
              onClick={() =>
                handleSelectAccount({
                  name: "Tobechukwu Otuonye",
                  email: "tobeotuonye@gmail.com",
                })
              }
              className="w-full flex items-center justify-between p-4 hover:bg-[#F0F4F9] dark:hover:bg-[#28292A] transition-colors text-left group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-10 w-10 rounded-full bg-[#167A55] text-white flex items-center justify-center font-medium text-base shrink-0 shadow-xs">
                  T
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3] group-hover:text-[#0B57D0] dark:group-hover:text-[#A8C7FA] transition-colors truncate">
                    Tobechukwu Otuonye
                  </span>
                  <span className="text-xs text-[#444746] dark:text-[#C4C7C5] truncate">
                    tobeotuonye@gmail.com
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-[#167A55] bg-[#C8F5DE]/50 dark:bg-[#167A55]/20 px-2 py-0.5 rounded-full border border-[#8DE8BF]/40">
                Signed in
              </span>
            </button>

            {/* Use another account option */}
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center gap-3.5 p-4 hover:bg-[#F0F4F9] dark:hover:bg-[#28292A] transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-full bg-[#E0E2E7] dark:bg-[#333538] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] shrink-0">
                <UserPlus className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                  Use another account
                </span>
                <span className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                  Sign in with a different Google account
                </span>
              </div>
            </button>
          </div>
        ) : (
          /* Custom Google Account Input */
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                Google Email address
              </label>
              <input
                type="email"
                autoFocus
                required
                value={customEmail}
                onChange={(e) => {
                  setCustomEmail(e.target.value);
                  setCustomError("");
                }}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-transparent border border-[#747775] dark:border-[#8E918F] outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0]"
              />
              {customError && (
                <span className="text-xs text-red-600">{customError}</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="text-xs text-[#0B57D0] dark:text-[#A8C7FA] hover:underline font-medium"
              >
                Back to accounts
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Disclaimer / Privacy Footer */}
        <p className="text-[11px] text-[#444746] dark:text-[#C4C7C5] leading-relaxed text-center px-2">
          To continue, Google will share your name, email address, language preference, and profile picture with Tusk AI. See Tusk AI’s Privacy Policy.
        </p>

        {/* Cancel / Return to Tusk button */}
        <div className="pt-2 border-t border-[#E0E2E7] dark:border-[#333538] flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/chat";
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#444746] dark:text-[#C4C7C5] hover:text-[#1F1F1F] dark:hover:text-[#E3E3E3] transition-colors py-1 px-3 rounded-md"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel and return to Tusk</span>
          </button>
        </div>
      </div>
    </div>
  );
}
