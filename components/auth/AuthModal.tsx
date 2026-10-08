"use client";

import React, { useState } from "react";
import { User, LogIn, LogOut, ShieldCheck, Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export const PRESET_USERS: UserProfile[] = [
  { id: "alice", name: "Alice", email: "alice@tusk.xyz" },
  { id: "bob", name: "Bob", email: "bob@tusk.xyz" },
];

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
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const id = customName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    onSelectUser({
      id,
      name: customName.trim(),
      email: customEmail.trim() || `${id}@tusk.xyz`,
    });
    setCustomName("");
    setCustomEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#FAF9F6] dark:bg-[#17191C] border border-[rgba(23,25,28,0.1)] shadow-2xl p-6 flex flex-col gap-5 text-[#17191C] dark:text-[#F7F7F5]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#6F7378]"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#C8F5DE]/60 text-[#167A55] text-[10px] font-mono w-fit border border-[#8DE8BF]/40">
            <ShieldCheck className="h-3 w-3" />
            <span>Cryptographic Namespace Isolation</span>
          </div>
          <h2 className="text-xl font-display font-semibold tracking-tight">
            Account & Memory Namespace
          </h2>
          <p className="text-xs text-[#6F7378] leading-relaxed">
            Switch between users to verify that Walrus memories and chat sessions remain strictly isolated between accounts.
          </p>
        </div>

        {/* Current status */}
        <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[rgba(23,25,28,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-[#167A55]/15 border border-[#167A55]/30">
              <AvatarFallback className="text-[#167A55] font-semibold text-xs">
                {currentUser?.name.slice(0, 2).toUpperCase() || "GU"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">
                {currentUser ? currentUser.name : "Guest (Logged Out)"}
              </span>
              <span className="text-[10px] font-mono text-[#6F7378]">
                {currentUser ? `Namespace: personal:${currentUser.id}` : "No active session"}
              </span>
            </div>
          </div>

          {currentUser && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="h-8 text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </Button>
          )}
        </div>

        {/* Preset accounts */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#6F7378] uppercase tracking-wider">
            Quick Switch Profiles
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESET_USERS.map((user) => {
              const isSelected = currentUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 relative ${
                    isSelected
                      ? "bg-[#167A55]/10 border-[#167A55] ring-1 ring-[#167A55]/40"
                      : "bg-white/60 dark:bg-white/5 border-[rgba(23,25,28,0.08)] hover:border-[rgba(23,25,28,0.2)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{user.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#167A55]" />}
                  </div>
                  <span className="text-[10px] font-mono text-[#6F7378] truncate">
                    personal:{user.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom login form */}
        <form onSubmit={handleCustomLogin} className="flex flex-col gap-2.5 pt-2 border-t border-[rgba(23,25,28,0.07)]">
          <span className="text-xs font-semibold text-[#6F7378] uppercase tracking-wider">
            Or Sign In With Custom Account
          </span>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Username / Name (e.g. Carol)"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-white/10 border border-[rgba(23,25,28,0.1)] outline-none focus:border-[#42C98A]"
            />
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="Email (optional)"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-white/10 border border-[rgba(23,25,28,0.1)] outline-none focus:border-[#42C98A]"
            />
          </div>
          <Button
            type="submit"
            disabled={!customName.trim()}
            className="w-full text-xs h-9 bg-[#17191C] text-[#F7F7F5] hover:bg-[#167A55] gap-2 mt-1"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In as {customName.trim() || "User"}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
