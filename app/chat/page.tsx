"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar, ChatSession } from "@/components/shell/Sidebar";
import { MemoryLens, MemoryItem } from "@/components/lens/MemoryLens";
import { ChatView } from "@/components/chat/ChatView";
import { ChatMessage, RecalledMemory } from "@/components/chat/MessageBubble";
import { ComposerAttachment } from "@/components/chat/Composer";
import { AuthModal, UserProfile } from "@/components/auth/AuthModal";

interface StoredSession extends ChatSession {
  messages: ChatMessage[];
}

const GUEST_USER: UserProfile = {
  id: "guest",
  name: "Guest",
  email: "",
  provider: "guest",
};

export default function ChatPage() {
  // Memory Lens panel closed/hidden by default as requested
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [advancedTools, setAdvancedTools] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [relayerStatus, setRelayerStatus] = useState<"ok" | "degraded" | "down">("ok");

  // User Profile & Authentication State (Defaults to Guest or loaded active user)
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
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

  // Save sessions to localStorage & sync to server helper
  const persistSessions = (newSessions: StoredSession[], userId = currentUser.id) => {
    setSessions(newSessions);
    try {
      localStorage.setItem(`tusk_sessions_${userId}`, JSON.stringify(newSessions));
    } catch (e) {
      console.error("Failed to save sessions to localStorage:", e);
    }

    // Sync to server for cross-device persistence
    if (userId && userId !== "guest") {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sessions: newSessions }),
      }).catch(() => {});
    }
  };

  // Load user sessions from localStorage & server helper
  const loadUserSessions = useCallback(async (userId: string) => {
    let loaded = false;
    try {
      const raw = localStorage.getItem(`tusk_sessions_${userId}`);
      if (raw) {
        const parsed: StoredSession[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages || []);
          loaded = true;
        }
      }
    } catch (e) {
      console.error("Failed to load sessions:", e);
    }

    // Also fetch from server to sync sessions across devices
    if (userId && userId !== "guest") {
      try {
        const res = await fetch(`/api/sessions?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sessions) && data.sessions.length > 0) {
            setSessions(data.sessions);
            setActiveSessionId(data.sessions[0].id);
            setMessages(data.sessions[0].messages || []);
            try {
              localStorage.setItem(`tusk_sessions_${userId}`, JSON.stringify(data.sessions));
            } catch (_) {}
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load sessions from server:", e);
      }
    }

    if (!loaded) {
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
    }
  }, []);

  // Mount effect: load user, sessions, memories, and health
  useEffect(() => {
    let activeUid = "guest";
    try {
      const storedUser = localStorage.getItem("tusk_active_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) {
          setCurrentUser(parsed);
          activeUid = parsed.id;
        }
      }

      const storedTools = localStorage.getItem("tusk_advanced_tools");
      if (storedTools !== null) {
        setAdvancedTools(storedTools === "true");
      }
    } catch (e) {}

    loadUserSessions(activeUid);
    loadMemories(activeUid);
    checkHealth();
  }, [loadMemories, checkHealth, loadUserSessions]);

  // Handle switching/logging in user
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

  // Log out: clear active user, reset to Guest
  const handleLogout = () => {
    try {
      localStorage.removeItem("tusk_active_user");
    } catch (e) {}
    setCurrentUser(GUEST_USER);
    loadUserSessions("guest");
    loadMemories("guest");
    setMessages([]);
    setInput("");
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

  // Submit message in active session (supports text and multimodal attachments)
  const handleSubmit = async (attachments?: ComposerAttachment[]) => {
    if ((!input.trim() && (!attachments || attachments.length === 0)) || isLoading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content:
        userText ||
        (attachments && attachments.length > 0
          ? `Uploaded ${attachments.length} file(s)`
          : ""),
      attachments: attachments?.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        size: a.size,
        dataUrl: a.dataUrl,
        textContent: a.textContent,
      })),
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
      const titleCandidate =
        userText || (attachments?.[0]?.name ? `File: ${attachments[0].name}` : "Conversation");
      sessionTitle = titleCandidate.length > 28 ? `${titleCandidate.slice(0, 28)}...` : titleCandidate;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMsgs.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          memoryEnabled,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          isLoggedIn: currentUser.id !== "guest",
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

      const cleanAccumulated = accumulated.replace(/<memory_context>[\s\S]*?<\/memory_context>/gi, "").trimStart();
      const finalContent =
        cleanAccumulated ||
        "⚠️ No response received from the AI model. Please verify your Gemini API key and model quota in your Vercel deployment settings.";

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

  const isLoggedIn = currentUser.id !== "guest";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* Account & Namespace Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
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
        userDisplayName={isLoggedIn ? currentUser.name : "Guest"}
        userNamespace={isLoggedIn ? `personal:${currentUser.id}` : "guest"}
        userEmail={currentUser.email}
        isLoggedIn={isLoggedIn}
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
          onToggleAdvancedTools={() => handleToggleAdvancedTools(!advancedTools)}
          relayerStatus={relayerStatus}
          userDisplayName={isLoggedIn ? currentUser.name : "Sign In"}
          isLoggedIn={isLoggedIn}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Center Chat View: Memory badges hidden by default */}
          <ChatView
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            memoryEnabled={memoryEnabled}
            onToggleMemory={setMemoryEnabled}
            userDisplayName={isLoggedIn ? currentUser.name : "Explorer"}
            showMemoryBadges={advancedTools}
          />

          {/* Memory Lens Right Panel: Hidden by default */}
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
