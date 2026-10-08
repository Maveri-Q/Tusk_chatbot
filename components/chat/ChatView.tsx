"use client";

import React, { useRef, useEffect, useState } from "react";
import { MessageBubble, ChatMessage } from "./MessageBubble";
import { StarterChips } from "./StarterChips";
import { Composer, ComposerAttachment } from "./Composer";
import { Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatViewProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: (attachments?: ComposerAttachment[]) => void;
  isLoading: boolean;
  memoryEnabled: boolean;
  onToggleMemory: (val: boolean) => void;
  userDisplayName?: string;
  showMemoryBadges?: boolean;
}

export function ChatView({
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  memoryEnabled,
  onToggleMemory,
  userDisplayName = "Explorer",
  showMemoryBadges = false,
}: ChatViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isAutoScrollDisabled = useRef(false);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollBottom(false);
      isAutoScrollDisabled.current = false;
    }
  };

  // Detect user scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

    if (distanceToBottom > 120) {
      setShowScrollBottom(true);
      isAutoScrollDisabled.current = true;
    } else {
      setShowScrollBottom(false);
      isAutoScrollDisabled.current = false;
    }
  };

  // Auto-scroll on new messages unless user scrolled up
  useEffect(() => {
    if (!isAutoScrollDisabled.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 max-w-3xl mx-auto w-full"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12">
            {/* Greeting */}
            <div className="h-12 w-12 rounded-full bg-flare/10 border border-flare/20 flex items-center justify-center text-flare mb-4 shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="font-display font-bold text-2xl text-text tracking-tight sm:text-3xl">
              Hello, {userDisplayName}
            </h1>
            <p className="text-sm text-text-muted mt-2 max-w-md leading-relaxed mb-8">
              I remember who you are across conversations and devices, encrypted on Walrus.
            </p>

            {/* Starter chips */}
            <StarterChips onSelect={(prompt) => onInputChange(prompt)} />
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              showMemoryBadges={showMemoryBadges}
            />
          ))
        )}
      </div>

      {/* Floating Scroll-to-Bottom Pill */}
      {showScrollBottom && (
        <Button
          size="sm"
          variant="secondary"
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 z-20 rounded-full h-8 px-3 text-xs gap-1.5 shadow-lg border border-border glass-panel text-text"
        >
          <ArrowDown className="h-3.5 w-3.5 text-flare" />
          <span>Latest</span>
        </Button>
      )}

      {/* Pinned Composer */}
      <div className="border-t border-border/40 bg-bg/80 backdrop-blur-md z-10 shrink-0">
        <Composer
          input={input}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
          memoryEnabled={memoryEnabled}
          onToggleMemory={onToggleMemory}
        />
      </div>
    </div>
  );
}
