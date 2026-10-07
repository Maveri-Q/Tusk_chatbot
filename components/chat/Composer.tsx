"use client";

import React, { useRef, useEffect } from "react";
import { SendHorizontal, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface ComposerProps {
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  memoryEnabled: boolean;
  onToggleMemory: (val: boolean) => void;
}

export function Composer({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  memoryEnabled,
  onToggleMemory,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="relative rounded bg-bg-elev-2 border border-border focus-within:border-border-strong focus-within:ring-1 focus-within:ring-flare/50 transition-all p-3 flex flex-col gap-2 shadow-lg">
        {/* Input Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Tusk anything, or share something to remember..."
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent text-sm text-text placeholder:text-text-muted outline-none resize-none max-h-48 leading-relaxed"
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          {/* Memory ON/OFF Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer select-none">
                  <Switch
                    id="composer-memory-toggle"
                    checked={memoryEnabled}
                    onCheckedChange={onToggleMemory}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="composer-memory-toggle"
                    className="text-xs font-medium text-text flex items-center gap-1.5 cursor-pointer"
                  >
                    <Brain
                      className={`h-3.5 w-3.5 transition-colors ${
                        memoryEnabled ? "text-lime" : "text-text-muted"
                      }`}
                    />
                    <span className={memoryEnabled ? "text-text" : "text-text-muted"}>
                      Remember me
                    </span>
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {memoryEnabled
                    ? "Active: Recalls past context and remembers facts from this conversation."
                    : "Disabled: No memories recalled and nothing saved to Walrus."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Send Button */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted hidden sm:inline">
              Return to send
            </span>
            <Button
              size="icon"
              disabled={!input.trim() || isLoading}
              onClick={onSubmit}
              className="h-8 w-8 rounded-sm bg-flare hover:brightness-110 text-flare-foreground"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
