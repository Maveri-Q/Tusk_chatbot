"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brain, ChevronDown, Copy, Check, FileText, Image as ImageIcon, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecalledMemory {
  text: string;
  relevance?: number;
  blob_id?: string;
  scope?: "personal" | "room";
}

export interface AttachmentItem {
  id: string;
  name: string;
  type: "image" | "document";
  size?: number;
  dataUrl?: string; // base64 data for images
  textContent?: string; // extracted text content for docs
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: AttachmentItem[];
  recalledMemories?: RecalledMemory[];
}

interface MessageBubbleProps {
  message: ChatMessage;
  showMemoryBadges?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  isLoading?: boolean;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[rgba(23,25,28,0.15)] dark:border-white/10 bg-[#121417] text-[#F7F7F5] shadow-sm not-prose">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1A1D21] border-b border-white/5 text-[11px] font-mono text-[#8DE8BF]">
        <span className="uppercase font-semibold tracking-wider">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[#42C98A]" />
              <span className="text-[#42C98A] font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed bg-[#121417] text-[#E6EDF3]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MessageBubble({
  message,
  showMemoryBadges = false,
  onEdit,
  isLoading = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [showRecalled, setShowRecalled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const memories = message.recalledMemories || [];
  const attachments = message.attachments || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    const trimmed = editDraft.trim();
    if (!trimmed || trimmed === message.content.trim()) {
      setIsEditing(false);
      setEditDraft(message.content);
      return;
    }
    setIsEditing(false);
    onEdit?.(message.id, trimmed);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditDraft(message.content);
  };

  return (
    <div
      className={cn(
        "group flex flex-col gap-1 w-full max-w-2xl py-2 relative",
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

      {/* Bubble Container */}
      <div
        className={cn(
          "rounded-2xl text-sm leading-relaxed p-4 transition-all shadow-sm",
          isUser
            ? isEditing
              ? "bg-[#17191C] text-[#F7F7F5] font-normal rounded-tr-sm w-full border border-flare/40 shadow-md"
              : "bg-[#17191C] text-[#F7F7F5] font-normal rounded-tr-sm max-w-[85%]"
            : "bg-bg-elev-2 text-text border border-border rounded-tl-sm max-w-full"
        )}
      >
        {/* Render Attachments if user uploaded images/documents */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-white/15">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-white/10 border border-white/10 text-xs"
              >
                {att.type === "image" && att.dataUrl ? (
                  <div className="flex flex-col gap-1">
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="max-h-36 max-w-xs rounded object-cover border border-white/20"
                    />
                    <span className="text-[10px] text-gray-300 truncate max-w-[150px]">
                      {att.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-1">
                    <FileText className="h-4 w-4 text-[#8DE8BF]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium truncate max-w-[160px]">
                        {att.name}
                      </span>
                      {att.size && (
                        <span className="text-[10px] text-gray-300">
                          {Math.round(att.size / 1024)} KB
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isUser ? (
          isEditing ? (
            <div className="flex flex-col gap-2.5 w-full">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#FF854D]">
                <span>Edit your message</span>
                <span className="text-[10px] text-[#A6ABB3]">Esc to cancel · Enter to send</span>
              </div>
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelEdit();
                  }
                }}
                rows={Math.min(8, Math.max(2, editDraft.split("\n").length))}
                className="w-full bg-[#121417] text-[#F7F7F5] border border-white/20 rounded-xl p-3 text-sm focus:outline-none focus:border-flare focus:ring-1 focus:ring-flare resize-none leading-relaxed font-sans placeholder-text-muted"
                autoFocus
                placeholder="Edit your message..."
              />
              <div className="flex items-center justify-end gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A6ABB3] hover:text-[#F7F7F5] bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editDraft.trim() || editDraft.trim() === message.content.trim() || isLoading}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-flare text-white hover:bg-flare-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Save & Resubmit</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )
        ) : !message.content ? (
          <div className="flex items-center gap-1.5 py-1 px-1 text-xs text-text-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-soft animate-pulse" />
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-soft animate-pulse [animation-delay:200ms]" />
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-soft animate-pulse [animation-delay:400ms]" />
            <span className="ml-1.5 font-mono text-[11px] text-text-muted">Thinking...</span>
          </div>
        ) : (
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");
                  if (!inline && (match || codeString.includes("\n"))) {
                    return (
                      <CodeBlock
                        language={match ? match[1] : ""}
                        code={codeString}
                      />
                    );
                  }
                  return (
                    <code
                      className={cn(
                        "bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[12px] font-mono text-[#167A55] dark:text-[#8DE8BF]",
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* User Action Bar (Edit & Copy) */}
      {isUser && !isEditing && (
        <div className="flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity px-1 -mt-0.5">
          <button
            type="button"
            onClick={() => {
              setEditDraft(message.content);
              setIsEditing(true);
            }}
            disabled={isLoading}
            title="Edit this request"
            className="inline-flex items-center gap-1 text-[11px] text-[#A6ABB3] hover:text-[#F7F7F5] px-2 py-0.5 rounded hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            <Pencil className="h-3 w-3 text-[#A6ABB3]" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy message"
            className="inline-flex items-center gap-1 text-[11px] text-[#A6ABB3] hover:text-[#F7F7F5] px-2 py-0.5 rounded hover:bg-white/5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#42C98A]" />
                <span className="text-[#42C98A]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-[#A6ABB3]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Recalled Memories Row: Hidden by default; only shown when showMemoryBadges=true (e.g. dev mode) */}
      {!isUser && showMemoryBadges && memories.length > 0 && (
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
            <div className="rounded-xl bg-bg-elev border border-border p-3 flex flex-col gap-2 w-full animate-in fade-in-0 duration-150">
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
