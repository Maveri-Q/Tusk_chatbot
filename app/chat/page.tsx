"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar, ChatSession } from "@/components/shell/Sidebar";
import { MemoryLens, MemoryItem } from "@/components/lens/MemoryLens";
import { ChatView } from "@/components/chat/ChatView";
import { ChatMessage, RecalledMemory } from "@/components/chat/MessageBubble";
import { AuthModal, UserProfile, PRESET_USERS } from "@/components/auth/AuthModal";

interface StoredSession extends ChatSession {
  messages: ChatMessage[];
}

export default function ChatPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [advancedTools, setAdvancedTools] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [relayerStatus, setRelayerStatus] = useState<"ok" | "degraded" | "down">("ok");

  // User Profile & Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS[0]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Persistent Sessions & Active Messages
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active memories state
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  // Fetch memories list for the current user's namespace
  const loadMemories = useCallback(async (userIdToLoad?: string) => {
    const uid = userIdToLoad || currentUser.id;
    try {
      const res = await fetch(`/api/memories?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.memories)) {
          setMemories(data.memories);
        }
      }
    } catch (e) {
      console.error("Failed to load memories:", e);
    }
  }, [currentUser.id]);

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

  // Save sessions to localStorage helper
  const persistSessions = (newSessions: StoredSession[], userId = currentUser.id) => {
    setSessions(newSessions);
    try {
      localStorage.setItem(`tusk_sessions_${userId}`, JSON.stringify(newSessions));
    } catch (e) {
      console.error("Failed to save sessions to localStorage:", e);
    }
  };

  // Load user sessions from localStorage helper
  const loadUserSessions = useCallback((userId: string) => {
    try {
      const raw = localStorage.getItem(`tusk_sessions_${userId}`);
      if (raw) {
        const parsed: StoredSession[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages || []);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load sessions:", e);
    }

    // Default: create an initial session for this user
    const initialSession: StoredSession = {
      id: `sess_${Date.now()}`,
      title: "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    persistSessions([initialSession], userId);
    setActiveSessionId(initialSession.id);
    setMessages([]);
  }, []);

  // Mount effect: load user, sessions, memories, and health
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("tusk_active_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) {
          setCurrentUser(parsed);
          loadUserSessions(parsed.id);
          loadMemories(parsed.id);
        } else {
          loadUserSessions(PRESET_USERS[0].id);
          loadMemories(PRESET_USERS[0].id);
        }
      } else {
        loadUserSessions(PRESET_USERS[0].id);
        loadMemories(PRESET_USERS[0].id);
      }

      const storedTools = localStorage.getItem("tusk_advanced_tools");
      if (storedTools !== null) {
        setAdvancedTools(storedTools === "true");
      }
    } catch (e) {
      loadUserSessions(PRESET_USERS[0].id);
      loadMemories(PRESET_USERS[0].id);
    }

    if (window.innerWidth < 1024) {
      setIsPanelOpen(false);
    }

    checkHealth();
  }, [loadMemories, checkHealth, loadUserSessions]);

  // Handle switching users
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("tusk_active_user", JSON.stringify(user));
    } catch (e) {}

    // Load that user's isolated sessions and memories
    loadUserSessions(user.id);
    loadMemories(user.id);
    setInput("");
  };

  const handleLogout = () => {
    setIsAuthModalOpen(true);
  };

  const handleToggleAdvancedTools = (val: boolean) => {
    setAdvancedTools(val);
    try {
      localStorage.setItem("tusk_advanced_tools", String(val));
    } catch (e) {}
  };

  // Create a brand new chat session
  const handleNewChat = () => {
    const newSession: StoredSession = {
      id: `sess_${Date.now()}`,
      title: "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    const updated = [newSession, ...sessions.filter((s) => s.id !== newSession.id)];
    persistSessions(updated);
    setActiveSessionId(newSession.id);
    setMessages([]);
    setInput("");
  };

  // Switch to an existing session
  const handleSelectSession = (sessionId: string) => {
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      setActiveSessionId(sessionId);
      setMessages(found.messages || []);
      setInput("");
      if (isSidebarMobileOpen) setIsSidebarMobileOpen(false);
    }
  };

  // Delete an existing session
  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    if (updated.length === 0) {
      const fresh: StoredSession = {
        id: `sess_${Date.now()}`,
        title: "New Conversation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      persistSessions([fresh]);
      setActiveSessionId(fresh.id);
      setMessages([]);
    } else {
      persistSessions(updated);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages || []);
      }
    }
  };

  // Submit message in active session
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

    const currentMsgs = [...messages, userMsg];
    const newMessagesList = [...messages, userMsg, assistantPlaceholder];

    setMessages(newMessagesList);
    setInput("");
    setIsLoading(true);

    // Update session title if this is the first message
    let sessionTitle = sessions.find((s) => s.id === activeSessionId)?.title || "Conversation";
    if (sessionTitle === "New Conversation") {
      sessionTitle = userText.length > 28 ? `${userText.slice(0, 28)}...` : userText;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMsgs.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          memoryEnabled,
          userId: currentUser.id,
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

      const finalContent =
        accumulated.replace(/<memory_context>[\s\S]*?<\/memory_context>/gi, "").trimStart() ||
        "I received your message. Let me know what you would like to remember or explore.";

      // Finalize and persist messages in the active session
      const finalMsgList: ChatMessage[] = [
        ...messages,
        userMsg,
        {
          id: assistantId,
          role: "assistant",
          content: finalContent,
          recalledMemories: recalledFromHeader,
        },
      ];

      setMessages(finalMsgList);

      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: new Date().toISOString(),
              messages: finalMsgList,
            }
          : s
      );
      persistSessions(updatedSessions);

      // Refresh memories list to catch any new saves
      setTimeout(() => {
        loadMemories(currentUser.id);
      }, 2500);
    } catch (err: any) {
      console.error("Chat streaming error:", err);
      const errorMsgText = `⚠️ ${err.message || "Failed to communicate with model. Please try again."}`;

      const finalMsgList: ChatMessage[] = [
        ...messages,
        userMsg,
        {
          id: assistantId,
          role: "assistant",
          content: errorMsgText,
        },
      ];

      setMessages(finalMsgList);

      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: new Date().toISOString(),
              messages: finalMsgList,
            }
          : s
      );
      persistSessions(updatedSessions);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* Account & Namespace Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onLogout={() => {
          handleSelectUser(PRESET_USERS[0]);
        }}
      />

      {/* Sidebar with Persistent Sessions and Account Controls */}
      <Sidebar
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        advancedTools={advancedTools}
        onToggleAdvancedTools={handleToggleAdvancedTools}
        userDisplayName={currentUser.name}
        userNamespace={`personal:${currentUser.id}`}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
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
          userDisplayName={currentUser.name}
          onOpenAuth={() => setIsAuthModalOpen(true)}
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
            userDisplayName={currentUser.name}
          />

          {/* Memory Lens Right Panel */}
          <MemoryLens
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            advancedTools={advancedTools}
            memories={memories}
            onRefreshMemories={() => loadMemories(currentUser.id)}
            userId={currentUser.id}
          />
        </div>
      </div>
    </div>
  );
}
