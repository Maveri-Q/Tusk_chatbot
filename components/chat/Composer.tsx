"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  SendHorizontal,
  Loader2,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export interface ComposerAttachment {
  id: string;
  name: string;
  type: "image" | "document";
  size: number;
  dataUrl?: string; // base64 for images
  textContent?: string; // extracted text content for docs
}

interface ComposerProps {
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: (attachments?: ComposerAttachment[]) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const isListeningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef("");
  const recognizedTextAccumulatorRef = useRef("");

  // Sync base input ref when not recording
  useEffect(() => {
    if (!isListening && !isTranscribing) {
      baseInputRef.current = input;
    }
  }, [input, isListening, isTranscribing]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      if (isListening) {
        stopVoiceRecording();
      }
      onSubmit(attachments);
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ComposerAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith("image/");
      const isTextDoc =
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".csv");

      if (isImage) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: `att_${Date.now()}_${i}`,
          name: file.name,
          type: "image",
          size: file.size,
          dataUrl,
        });
      } else if (isTextDoc) {
        const textContent = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(file);
        });

        newAttachments.push({
          id: `att_${Date.now()}_${i}`,
          name: file.name,
          type: "document",
          size: file.size,
          textContent,
        });
      } else {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: `att_${Date.now()}_${i}`,
          name: file.name,
          type: "document",
          size: file.size,
          dataUrl,
        });
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Stop recording & execute fallback transcription if needed
  const stopVoiceRecording = useCallback(async () => {
    if (!isListeningRef.current && !isListening) return;

    isListeningRef.current = false;
    setIsListening(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    // Stop media recorder and wait for final audio chunk to flush
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        try {
          recorder.stop();
        } catch (_) {
          resolve();
        }
      });
    }

    // Release audio device tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Check if Web Speech API captured text
    const capturedText = recognizedTextAccumulatorRef.current.trim();

    // If Web Speech API captured nothing or failed to transcribe, transcribe via Gemini Audio
    if (!capturedText && audioChunksRef.current.length > 0) {
      setIsTranscribing(true);
      try {
        const mimeType = recorder?.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();

        const base64Audio = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64Audio,
            mimeType: "audio/webm",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            const combined = baseInputRef.current
              ? `${baseInputRef.current.trim()} ${data.text.trim()}`
              : data.text.trim();
            onInputChange(combined);
          }
        }
      } catch (err) {
        console.error("Audio fallback transcription error:", err);
      } finally {
        setIsTranscribing(false);
      }
    }

    audioChunksRef.current = [];
  }, [isListening, onInputChange]);

  // Start recording
  const startVoiceRecording = async () => {
    setSpeechError(null);
    audioChunksRef.current = [];
    recognizedTextAccumulatorRef.current = "";
    baseInputRef.current = input ? (input.endsWith(" ") ? input : input + " ") : "";

    // 1. Acquire live microphone stream
    let stream: MediaStream;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone API not supported");
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      setSpeechError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Microphone permission denied. Please allow microphone access in your browser."
          : "Could not access microphone."
      );
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    isListeningRef.current = true;
    setIsListening(true);

    // 2. Start MediaRecorder on the active stream
    try {
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(200);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn("MediaRecorder start warning:", err);
    }

    // 3. Start Web Speech API for live transcription
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang =
          typeof navigator !== "undefined" && navigator.language
            ? navigator.language
            : "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              finalTranscript += item[0].transcript;
            } else {
              interimTranscript += item[0].transcript;
            }
          }

          if (finalTranscript) {
            recognizedTextAccumulatorRef.current += finalTranscript + " ";
          }

          const combined = (
            baseInputRef.current +
            recognizedTextAccumulatorRef.current +
            interimTranscript
          ).trimStart();
          onInputChange(combined);
        };

        recognition.onerror = (event: any) => {
          if (event.error === "no-speech") return;
          console.warn("Speech recognition notice:", event.error);
        };

        recognition.onend = () => {
          // If user is still recording, restart recognition
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.warn("Web Speech recognition init error:", e);
      }
    }
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {/* Speech Error Banner */}
      {speechError && (
        <div className="mb-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between animate-in fade-in-0 shadow-xs">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="p-0.5 hover:bg-amber-500/20 rounded">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Voice Listening Active Soundwave Indicator */}
      {isListening && (
        <div className="mb-2.5 px-3 py-1.5 rounded-full bg-[#167A55]/15 border border-[#167A55]/30 text-[#167A55] dark:text-[#8DE8BF] text-xs flex items-center gap-2.5 w-fit animate-in fade-in-0 shadow-xs">
          <div className="flex items-center gap-0.5">
            <span className="h-3 w-1 bg-[#167A55] dark:bg-[#42C98A] rounded-full animate-bounce" />
            <span className="h-4 w-1 bg-[#167A55] dark:bg-[#42C98A] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="h-2 w-1 bg-[#167A55] dark:bg-[#42C98A] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="font-medium text-[11px]">Listening... speak into your microphone</span>
          <button
            type="button"
            onClick={stopVoiceRecording}
            className="ml-1 px-2.5 py-0.5 rounded-full bg-[#167A55] text-white text-[11px] font-semibold hover:bg-[#167A55]/90 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      )}

      {/* Transcribing Indicator */}
      {isTranscribing && (
        <div className="mb-2.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-2 w-fit animate-pulse shadow-xs">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
          <span className="font-medium text-[11px]">Transcribing your voice into text...</span>
        </div>
      )}

      <div className="relative rounded-2xl bg-bg-elev-2 border border-border focus-within:border-border-strong focus-within:ring-1 focus-within:ring-flare/50 transition-all p-3 flex flex-col gap-2 shadow-lg">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,.pdf,.txt,.md,.json,.csv,.doc,.docx"
          className="hidden"
        />

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 border-b border-border/50">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/70 dark:bg-white/10 border border-border text-xs shadow-xs"
              >
                {att.type === "image" && att.dataUrl ? (
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    className="h-8 w-8 rounded object-cover border border-border"
                  />
                ) : (
                  <FileText className="h-4 w-4 text-[#167A55]" />
                )}
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium truncate max-w-[140px]">
                    {att.name}
                  </span>
                  <span className="text-[9px] text-text-muted">
                    {Math.round(att.size / 1024)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-muted hover:text-red-500 transition-colors ml-1"
                  title="Remove attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Tusk anything, attach files, or speak into your mic..."
          rows={1}
          disabled={isLoading || isTranscribing}
          className="w-full bg-transparent text-sm text-text placeholder:text-text-muted outline-none resize-none max-h-48 leading-relaxed"
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoading || isTranscribing}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-elev transition-colors"
                    aria-label="Upload document or image"
                  >
                    <Paperclip className="h-4 w-4 text-[#167A55]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach image or document (PDF, TXT, MD, CSV)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Voice Dictation Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoading || isTranscribing}
                    onClick={toggleVoiceRecording}
                    className={`p-1.5 rounded-lg transition-all ${
                      isListening
                        ? "bg-[#167A55] text-white ring-2 ring-[#42C98A]/50 animate-pulse shadow-xs"
                        : "text-text-muted hover:text-text hover:bg-bg-elev"
                    }`}
                    aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4 text-[#167A55]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListening ? "Click to stop listening" : "Voice dictation (speech to text)"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>

          {/* Send Button */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted hidden sm:inline">
              Return to send
            </span>
            <Button
              size="icon"
              disabled={(!input.trim() && attachments.length === 0) || isLoading || isTranscribing}
              onClick={handleSend}
              className="h-8 w-8 rounded-lg bg-flare hover:brightness-110 text-flare-foreground shadow-sm"
              aria-label="Send message"
            >
              {isLoading || isTranscribing ? (
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
