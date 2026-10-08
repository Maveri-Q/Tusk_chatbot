"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { MemoryLens, MemoryItem } from "@/components/lens/MemoryLens";
import { ChatView } from "@/components/chat/ChatView";
import { ChatMessage, RecalledMemory } from "@/components/chat/MessageBubble";

export default function ChatPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [advancedTools, setAdvancedTools] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [relayerStatus, setRelayerStatus] = useState<"ok" | "degraded" | "down">("ok");

  // Input & Messages
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active memories state
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  // Fetch memories list
  const loadMemories = useCallback(async () => {
    try {
      const res = await fetch("/api/memories");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.memories)) {
          setMemories(data.memories);
        }
      }
    } catch (e) {
      console.error("Failed to load memories:", e);
    }
  }, []);

  // Fetch relayer health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        setRelayerStatus("ok");
      } else {
        setRelayerStatus("degraded");
      }
    } catch (e) {
      setRelayerStatus("down");
    }
  }, []);

  // Load preferences and initial data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tusk_advanced_tools");
      if (stored !== null) {
        setAdvancedTools(stored === "true");
      }
    } catch (e) {}

    if (window.innerWidth < 1024) {
      setIsPanelOpen(false);
    }

    loadMemories();
    checkHealth();
  }, [loadMemories, checkHealth]);

  const handleToggleAdvancedTools = (val: boolean) => {
    setAdvancedTools(val);
    try {
      localStorage.setItem("tusk_advanced_tools", String(val));
    } catch (e) {}
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          memoryEnabled,
        }),
      });

      if (!response.ok) {
        let errorDetail = response.statusText;
        try {
          const errJson = await response.json();
          if (errJson?.error) errorDetail = errJson.error;
        } catch (_) {}
        throw new Error(errorDetail || "Chat request failed");
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      // Parse recalled memories from custom header
      let recalledFromHeader: RecalledMemory[] = [];
      const headerVal = response.headers.get("x-recalled-memories");
      if (headerVal) {
        try {
          recalledFromHeader = JSON.parse(decodeURIComponent(headerVal));
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, recalledMemories: recalledFromHeader } : msg
            )
          );
        } catch (e) {
          console.error("Failed to parse recalled memories header:", e);
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        const cleanContent = accumulated
          .replace(/<memory_context>[\s\S]*?<\/memory_context>/gi, "")
          .trimStart();

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: cleanContent } : msg
          )
        );
      }

      if (!accumulated.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: "I received your message, but the model did not generate any text. Please try again.",
                }
              : msg
          )
        );
      }

      // After chat completes, reload memories list to catch any new saves
      setTimeout(() => {
        loadMemories();
      }, 3500);
    } catch (err: any) {
      console.error("Chat streaming error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: `⚠️ ${err.message || "Failed to communicate with model. Please try again."}`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        advancedTools={advancedTools}
        onToggleAdvancedTools={handleToggleAdvancedTools}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopBar
          isPanelOpen={isPanelOpen}
          onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
          onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
          advancedTools={advancedTools}
          relayerStatus={relayerStatus}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Center Chat View */}
          <ChatView
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            memoryEnabled={memoryEnabled}
            onToggleMemory={setMemoryEnabled}
          />

          {/* Memory Lens Right Panel */}
          <MemoryLens
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            advancedTools={advancedTools}
            memories={memories}
            onRefreshMemories={loadMemories}
          />
        </div>
      </div>
    </div>
  );
}
