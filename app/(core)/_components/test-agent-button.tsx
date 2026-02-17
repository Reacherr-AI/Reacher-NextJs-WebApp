"use client";

import "@livekit/components-styles";
import { useState, useEffect, useRef, useMemo } from "react";
import { Mic, MessageSquare, Send, X, Headphones, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useParams } from "next/navigation";
import { createWebCallAction } from "../actions";

import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  useChat, 
  useTranscriptions, 
  useLocalParticipant, 
  useConnectionState,
  useRemoteParticipants,
  useRoomContext // Added to control global audio
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

export function TestAgent() {
  const params = useParams();
  const agentId = params.id as string;
  const [token, setToken] = useState<string | null>(null);
  const [mode, setMode] = useState<"voice" | "chat">("voice");

  const handleStartCall = async () => {
    if (!agentId) return;
    try {
      const data = await createWebCallAction(agentId);
      if (data.accessToken) setToken(data.accessToken);
    } catch (e) {
      console.error("Token error:", e);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setToken(null)}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleStartCall}
          className="rounded-full px-8 py-2 bg-white text-black hover:bg-white/90 transition-all text-sm font-semibold shadow-xl"
        >
          Test Agent
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] min-h-[720px] p-0 bg-[#0A0A0B]/98 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden [&>button]:hidden">
        <VisuallyHidden.Root>
          <DialogTitle>LiveKit AI Agent Test Session</DialogTitle>
        </VisuallyHidden.Root>

        {token ? (
          <LiveKitRoom
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            token={token}
            connect={true}
            audio={true} 
            // options={{ 
            //     adaptiveStream: true, 
            //     dynacast: true,
            // }}
            onDisconnected={() => setToken(null)}
          >
            <AgentInterface mode={mode} setMode={setMode} />
            {/* The Audio Renderer is now conditional based on mode */}
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 italic">
            Connecting...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AgentInterface({ mode, setMode }: { mode: "voice" | "chat", setMode: (m: "voice" | "chat") => void }) {
  const { chatMessages, send: sendChat } = useChat();
  const transcriptions = useTranscriptions();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const connectionState = useConnectionState();
  const room = useRoomContext();
  
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // FIX: STOP VOICE IN CHAT MODE
  useEffect(() => {
    room.remoteParticipants.forEach((p) => {
      p.getTrackPublications().forEach((pub) => {
        if (pub.kind === Track.Kind.Audio) {
          if (mode === "chat") {
            pub.setEnabled(false); // Mute Agent
          } else {
            pub.setEnabled(true); // Unmute Agent
          }
        }
      });
    });
  }, [mode, room]);

  const isAgentActive = remoteParticipants.some(p => p.isSpeaking);

  const messages = useMemo(() => {
    // 1. Process Chat
    const chat = chatMessages.map((m) => ({
      id: m.id,
      role: m.from?.isLocal ? "user" : "agent",
      text: m.message,
      timestamp: m.timestamp,
    }));

    // 2. Process Transcriptions (Voice)
    const trans = transcriptions.map((t) => ({
      id: t.id,
      role: t.participant?.isLocal ? "user" : "agent",
      text: t.text,
      timestamp: t.firstReceivedTime,
    }));

    return [...chat, ...trans].sort((a, b) => a.timestamp - b.timestamp);
  }, [chatMessages, transcriptions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isAgentActive]);

  return (
    <>
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-white/90">Test your agent</h2>
          <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">
            {connectionState === ConnectionState.Connected ? "Online" : "Connecting..."}
          </p>
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-full border border-white/10">
          <button 
            onClick={() => {
              setMode("voice");
              localParticipant.setMicrophoneEnabled(true);
            }} 
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === 'voice' ? 'bg-white text-black' : 'text-white/40'}`}
          >
            <Headphones size={14} /> Voice
          </button>
          <button 
            onClick={() => {
              setMode("chat");
              localParticipant.setMicrophoneEnabled(false); // Auto-mute mic in chat
            }} 
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === 'chat' ? 'bg-white text-black' : 'text-white/40'}`}
          >
            <MessageSquare size={14} /> Chat
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="h-[460px] overflow-y-auto p-8 flex flex-col gap-6 scrollbar-hide">
        {messages.map((msg) => {
          const isAgent = msg.role === 'agent';
          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: isAgent ? -10 : 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className={`flex w-full ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${
                  isAgent ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {isAgent ? <Bot size={16} /> : <User size={16} />}
                </div>
                
                <div className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                  <div className={`px-4 py-2.5 rounded-[20px] text-[14px] leading-relaxed shadow-lg ${
                    isAgent 
                      ? 'bg-blue-600 text-white rounded-tl-none' 
                      : 'bg-white text-black rounded-tr-none font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {isAgentActive && mode === "voice" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border border-white/5">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-blue-600/20 px-4 py-3 rounded-[20px] rounded-tl-none flex gap-1 items-center">
              {[0, 0.2, 0.4].map((d) => (
                <motion.span key={d} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: d }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="h-[140px] px-8 flex flex-col justify-center border-t border-white/5 bg-black/10">
        <AnimatePresence mode="wait">
          {mode === 'voice' ? (
            <motion.div key="voice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
              <Button 
                onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                className={`h-14 w-14 rounded-full transition-all duration-300 shadow-xl ${isMicrophoneEnabled ? "bg-red-500 scale-110 shadow-red-500/30" : "bg-white text-black"}`}
              >
                {isMicrophoneEnabled ? <X size={24} /> : <Mic size={24} />}
              </Button>
              <p className="text-[10px] uppercase font-black tracking-widest text-center text-white/40">
                {isMicrophoneEnabled ? "Agent is listening..." : "Mic Off"}
              </p>
            </motion.div>
          ) : (
            <div className="relative">
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && chatInput.trim()) {
                    sendChat(chatInput);
                    setChatInput("");
                  }
                }}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-blue-500/40 outline-none pr-14"
                placeholder="Type your message..."
              />
              <Button 
                onClick={() => { if(chatInput.trim()) { sendChat(chatInput); setChatInput(""); } }} 
                className="absolute right-2 top-2 h-10 w-10 bg-white text-black rounded-full"
              >
                <Send size={16} />
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
export default TestAgent;