"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { MemoryLens, MemoryItem } from "@/components/lens/MemoryLens";
import { ChatView } from "@/components/chat/ChatView";
import { ChatMessage } from "@/components/chat/MessageBubble";

export default function ChatPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [advancedTools, setAdvancedTools] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  // Input & Messages
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active memories state
  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      blob_id: "pb3xguNSyKo0zR2kocyatFB592vLUlSZ5vdLBqLsD0w",
      text: "The walrus has two large tusks.",
      category: "identity",
      createdAt: "M0 Smoke Test",
      relevance: 0.525,
      status: "saved",
    },
  ]);

  // Load advanced tools preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tusk_advanced_tools");
      if (stored !== null) {
        setAdvancedTools(stored === "true");
      }
    } catch (e) {
      // localStorage may fail in private mode
    }

    // Automatically collapse panel on small screens
    if (window.innerWidth < 1024) {
      setIsPanelOpen(false);
    }
  }, []);

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

    setMessages((prev) => [...prev, userMsg]);
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
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      // Stream the assistant response
      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        recalledMemories: memoryEnabled
          ? [
              {
                text: "The walrus has two large tusks.",
                relevance: 0.88,
                blob_id: "pb3xguNSyKo0zR2kocyatFB592vLUlSZ5vdLBqLsD0w",
                scope: "personal",
              },
            ]
          : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: accumulated } : msg
          )
        );
      }
    } catch (err: any) {
      console.error("Chat streaming error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ I encountered an error communicating with the model. Please check the API configuration and try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
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
          />
        </div>
      </div>
    </div>
  );
}
