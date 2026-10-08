"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brain, ChevronDown, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecalledMemory {
  text: string;
  relevance?: number;
  blob_id?: string;
  scope?: "personal" | "room";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recalledMemories?: RecalledMemory[];
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [showRecalled, setShowRecalled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const memories = message.recalledMemories || [];

  return (
    <div
      className={cn(
        "flex flex-col gap-2 w-full max-w-2xl py-2",
        isUser ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      {/* Sender indicator */}
      {!isUser && (
        <div className="flex items-center gap-2 px-1">
          <div className="h-5 w-5 rounded bg-flare/20 border border-flare/40 flex items-center justify-center text-flare font-display font-bold text-[10px]">
            T
          </div>
          <span className="text-xs font-display font-medium text-text-muted">
            Tusk
          </span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "rounded-sm text-sm leading-relaxed p-3.5 transition-all",
          isUser
            ? "bg-flare text-flare-foreground font-medium rounded-tr-none shadow-sm max-w-[85%]"
            : "bg-bg-elev-2 text-text border border-border rounded-tl-none max-w-full"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : !message.content ? (
          <div className="flex items-center gap-1.5 py-1 px-1 text-xs text-text-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-soft animate-pulse" />
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-soft animate-pulse [animation-delay:200ms]" />
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-soft animate-pulse [animation-delay:400ms]" />
            <span className="ml-1.5 font-mono text-[11px] text-text-muted">Thinking...</span>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-sm leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>pre]:bg-bg [&>pre]:p-3 [&>pre]:rounded-sm [&>pre]:border [&>pre]:border-border [&>code]:font-mono [&>code]:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Recalled Memories Row (Assistant only) */}
      {!isUser && memories.length > 0 && (
        <div className="flex flex-col gap-2 mt-1 w-full pl-1">
          <button
            onClick={() => setShowRecalled(!showRecalled)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-medium hover:bg-lime/20 transition-colors w-fit"
          >
            <Brain className="h-3 w-3" />
            <span>
              Remembered {memories.length} thing{memories.length > 1 ? "s" : ""}
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                showRecalled ? "rotate-180" : ""
              )}
            />
          </button>

          {showRecalled && (
            <div className="rounded-sm bg-bg-elev border border-border p-3 flex flex-col gap-2 w-full animate-in fade-in-0 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-muted">
                  Recalled context used in this answer:
                </span>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-[10px] text-lime hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {memories.map((mem, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-bg-elev-2 border border-border/80 flex flex-col gap-1.5"
                  >
                    <p className="text-xs text-text">{mem.text}</p>

                    {showDetails && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          <span>Relevance:</span>
                          <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full bg-lime"
                              style={{
                                width: `${Math.round((mem.relevance ?? 0.5) * 100)}%`,
                              }}
                            />
                          </div>
                          <span>
                            {Math.round((mem.relevance ?? 0.5) * 100)}%
                          </span>
                        </div>
                        {mem.blob_id && (
                          <span className="truncate max-w-[120px]">
                            {mem.blob_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
