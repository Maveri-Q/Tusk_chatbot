"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar, ChatSession } from "@/components/shell/Sidebar";
import { ChatView } from "@/components/chat/ChatView";
import { ChatMessage, RecalledMemory } from "@/components/chat/MessageBubble";
import { ComposerAttachment } from "@/components/chat/Composer";
import { AuthModal, UserProfile } from "@/components/auth/AuthModal";
import { SettingsModal, MemoryItem } from "@/components/settings/SettingsModal";

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
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [advancedTools, setAdvancedTools] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [relayerStatus, setRelayerStatus] = useState<"ok" | "degraded" | "down">("ok");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

    // Instant local cache restore so panel never flashes empty on reload
    try {
      const cached = localStorage.getItem(`tusk_memories_${uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMemories((prev) => (prev.length === 0 ? parsed : prev));
        }
      }
    } catch (_) {}

    try {
      const res = await fetch(`/api/memories?userId=${encodeURIComponent(uid)}&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.memories)) {
          setMemories(data.memories);
          try {
            localStorage.setItem(`tusk_memories_${uid}`, JSON.stringify(data.memories));
          } catch (_) {}
        }
      }
    } catch (e) {
      console.error("Failed to load memories:", e);
    }
  }, [currentUser.id]);

  const handleRefreshMemories = useCallback(() => {
    loadMemories(currentUser.id);
  }, [loadMemories, currentUser.id]);

  // Delete a specific memory fact from Walrus store
  const handleDeleteMemory = useCallback(async (blobId: string) => {
    try {
      const res = await fetch("/api/memories/forget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blobId, userId: currentUser.id }),
      });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.blob_id !== blobId));
        try {
          const cached = localStorage.getItem(`tusk_memories_${currentUser.id}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter((m: any) => m.blob_id !== blobId);
              localStorage.setItem(`tusk_memories_${currentUser.id}`, JSON.stringify(filtered));
            }
          }
        } catch (_) {}
      }
    } catch (e) {
      console.error("Failed to delete memory:", e);
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

    // Sync to server for cross-device and cross-chat memory persistence
    if (userId) {
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

    // 1. Check if redirected from Google Auth
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("google_auth") === "success") {
          const authEmail = urlParams.get("email");
          const authName = urlParams.get("name");
          if (authEmail) {
            const username = authEmail.split("@")[0];
            const id = username.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 32);
            const authedUser: UserProfile = {
              id,
              name: authName || username,
              email: authEmail,
              provider: "google",
            };
            localStorage.setItem("tusk_active_user", JSON.stringify(authedUser));
            setCurrentUser(authedUser);
            activeUid = authedUser.id;
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    } catch (_) {}

    // 2. Fallback to existing active user in localStorage if not redirected
    if (activeUid === "guest") {
      try {
        const storedUser = localStorage.getItem("tusk_active_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.id) {
            setCurrentUser(parsed);
            activeUid = parsed.id;
          }
        }
      } catch (e) {}
    }

    try {
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
    loadMemories(currentUser.id);
  };

  // Switch to an existing session
  const handleSelectSession = (sessionId: string) => {
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      setActiveSessionId(sessionId);
      setMessages(found.messages || []);
      setInput("");
      loadMemories(currentUser.id);
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

  // Clear all sessions for this account (ChatGPT style)
  const handleClearAllChats = () => {
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
    setInput("");
  };

  // Stream assistant response for a given message sequence
  const streamAssistantResponse = async (
    currentMsgs: ChatMessage[],
    titleCandidate?: string
  ) => {
    setIsLoading(true);
    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    const newMessagesList = [...currentMsgs, assistantPlaceholder];
    setMessages(newMessagesList);

    // Update session title if this is the first message
    let sessionTitle = sessions.find((s) => s.id === activeSessionId)?.title || "Conversation";
    if (sessionTitle === "New Conversation" && titleCandidate) {
      sessionTitle = titleCandidate.length > 28 ? `${titleCandidate.slice(0, 28)}...` : titleCandidate;
    }

    try {
      // Prepare previous/other chat sessions of this account to sync cross-chat memory
      const otherSessions = sessions
        .filter((s) => s.id !== activeSessionId && Array.isArray(s.messages) && s.messages.length > 0)
        .map((s) => ({
          id: s.id,
          title: s.title,
          updatedAt: s.updatedAt,
          messages: s.messages.slice(-8).map((m) => ({
            role: m.role,
            content: typeof m.content === "string" ? m.content : "",
          })),
        }));

      const requestPayload = {
        messages: currentMsgs.map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        })),
        otherSessions,
        activeSessionId,
        memoryEnabled,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        isLoggedIn: currentUser.id !== "guest",
      };

      const doFetch = async () => {
        return await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });
      };

      let response = await doFetch();

      // Automatic retry once after 800ms for transient 500/502/503/504 serverless timeouts
      if (!response.ok && [500, 502, 503, 504].includes(response.status)) {
        await new Promise((r) => setTimeout(r, 800));
        try {
          const retryRes = await doFetch();
          if (retryRes.ok) {
            response = retryRes;
          }
        } catch (_) {}
      }

      if (!response.ok) {
        let errorDetail = "";
        try {
          const textBody = await response.text();
          try {
            const errJson = JSON.parse(textBody);
            errorDetail = errJson?.error || errJson?.message || "";
          } catch {
            errorDetail = textBody.slice(0, 150);
          }
        } catch (_) {}

        if (response.status === 429) {
          throw new Error("Rate limit reached. Please wait a few seconds before sending another message.");
        }
        if (response.status === 504) {
          throw new Error("Server request timed out. Please try sending your message again.");
        }
        throw new Error(errorDetail || `Request failed with status ${response.status}`);
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
        ...currentMsgs,
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

      // Run separate extraction call after each chat exchange
      const lastUserMsg = currentMsgs.filter((m) => m.role === "user").pop();
      const lastUserMsgContent = typeof lastUserMsg?.content === "string" ? lastUserMsg.content : "";

      if (memoryEnabled && lastUserMsgContent.trim()) {
        (async () => {
          try {
            console.log("[Extraction Client] Running separate extraction call for:", lastUserMsgContent);
            const extRes = await fetch("/api/memories/extract", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userMessage: lastUserMsgContent,
                assistantMessage: finalContent,
                userId: currentUser.id,
              }),
            });

            if (extRes.ok) {
              const extData = await extRes.json();
              console.log("[Extraction Client] Extraction response received:", extData);
              if (Array.isArray(extData.newMemories) && extData.newMemories.length > 0) {
                // Update panel's list cleanly right after saving
                setMemories((prev) => {
                  const newBlobIds = new Set(extData.newMemories.map((m: any) => m.blob_id));
                  const remaining = prev.filter((m) => !newBlobIds.has(m.blob_id));
                  const combined = [...extData.newMemories, ...remaining];
                  try {
                    localStorage.setItem(`tusk_memories_${currentUser.id}`, JSON.stringify(combined));
                  } catch (_) {}
                  return combined;
                });
              }
            }
          } catch (extErr) {
            console.error("[Extraction Client Error] Extraction call failed:", extErr);
          }
        })();
      }
    } catch (err: any) {
      console.error("Chat streaming error:", err);
      const errorMsgText = `⚠️ ${err.message || "Failed to communicate with model. Please try again."}`;

      const finalMsgList: ChatMessage[] = [
        ...currentMsgs,
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

    const currentMsgs = [...messages, userMsg];
    setInput("");

    const titleCandidate =
      userText || (attachments?.[0]?.name ? `File: ${attachments[0].name}` : "Conversation");

    await streamAssistantResponse(currentMsgs, titleCandidate);
  };

  // Edit a previously sent user message, truncate subsequent turns, and regenerate response
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (isLoading || !newContent.trim()) return;

    const targetIdx = messages.findIndex((m) => m.id === messageId);
    if (targetIdx === -1) return;

    const targetMsg = messages[targetIdx];
    if (targetMsg.role !== "user") return;

    const updatedUserMsg: ChatMessage = {
      ...targetMsg,
      content: newContent.trim(),
    };

    // Truncate subsequent history from this turn and resubmit
    const truncatedHistory = [...messages.slice(0, targetIdx), updatedUserMsg];

    await streamAssistantResponse(
      truncatedHistory,
      targetIdx === 0 ? updatedUserMsg.content : undefined
    );
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

      {/* ChatGPT-Style Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        memoryEnabled={memoryEnabled}
        onToggleMemory={setMemoryEnabled}
        memories={memories}
        onDeleteMemory={handleDeleteMemory}
        onRefreshMemories={handleRefreshMemories}
        advancedTools={advancedTools}
        onToggleAdvancedTools={handleToggleAdvancedTools}
        relayerStatus={relayerStatus}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onOpenAuth={() => {
          setIsSettingsModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onClearAllChats={handleClearAllChats}
      />

      {/* Sidebar with Persistent Sessions and ChatGPT-Style Account Controls */}
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
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopBar
          onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
          advancedTools={advancedTools}
          relayerStatus={relayerStatus}
          userDisplayName={isLoggedIn ? currentUser.name : "Sign In"}
          isLoggedIn={isLoggedIn}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
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
            userDisplayName={isLoggedIn ? currentUser.name : "Explorer"}
            showMemoryBadges={true}
            onEditMessage={handleEditMessage}
          />
        </div>
      </div>
    </div>
  );
}
