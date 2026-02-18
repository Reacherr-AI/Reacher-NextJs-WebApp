"use client";

import "@livekit/components-styles";
import { useState, useEffect, useRef, useMemo } from "react";
import { MessageSquare, Send, Headphones, User, Bot, PhoneOff } from "lucide-react";
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
  useRoomContext
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

export function TestAgent() {
  const params = useParams();
  const agentId = params.id as string;
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleEndCall = () => {
    setToken(null);
    setDialogOpen(false);
  };

  return (
    <Dialog 
      open={dialogOpen} 
      onOpenChange={(open) => {
        setDialogOpen(open);
        // CRITICAL: If the modal is being closed (open === false), 
        // automatically decline/end the call.
        if (!open) {
          handleEndCall();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button 
          onClick={() => setDialogOpen(true)}
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
            // Ensure the local state stays in sync if LiveKit disconnects internally
            onDisconnected={() => setToken(null)}
          >
            <AgentInterface mode={mode} setMode={setMode} onEndCall={handleEndCall} />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <StartScreen mode={mode} setMode={setMode} onStart={handleStartCall} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function StartScreen({ mode, setMode, onStart }: { mode: "voice" | "chat"; setMode: (m: "voice" | "chat") => void; onStart: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-white/90">Test your agent</h2>
          <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Ready to start</p>
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-full border border-white/10">
          <button 
            onClick={() => setMode("voice")} 
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === 'voice' ? 'bg-white text-black' : 'text-white/40'}`}
          >
            <Headphones size={14} /> Voice
          </button>
          <button 
            onClick={() => setMode("chat")} 
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === 'chat' ? 'bg-white text-black' : 'text-white/40'}`}
          >
            <MessageSquare size={14} /> Chat
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-xl"
        >
          Test your agent
        </Button>
      </div>

      <div className="h-[140px] px-8 border-t border-white/5 bg-black/10" />
    </div>
  );
}

function AgentInterface({ mode, setMode, onEndCall }: { mode: "voice" | "chat"; setMode: (m: "voice" | "chat") => void; onEndCall: () => void }) {
  const { chatMessages, send: sendChat } = useChat();
  const transcriptions = useTranscriptions();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const connectionState = useConnectionState();
  const room = useRoomContext();
  
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-enable mic on start for voice mode
  useEffect(() => {
    if (mode === "voice") {
        localParticipant.setMicrophoneEnabled(true);
    }
  }, [mode, localParticipant]);

  useEffect(() => {
    room.remoteParticipants.forEach((p) => {
      p.getTrackPublications().forEach((pub) => {
        if (pub.kind === Track.Kind.Audio) {
          pub.setEnabled(mode === "voice");
        }
      });
    });
  }, [mode, room]);

  const isAgentActive = remoteParticipants.some(p => p.isSpeaking);

  const messages = useMemo(() => {
    const chat = chatMessages.map((m) => ({
      id: m.id,
      role: m.from?.isLocal ? "user" : "agent",
      text: m.message,
      timestamp: m.timestamp,
    }));

    const trans = transcriptions.map((t) => ({
      id: t.streamInfo.id,
      role: t.participantInfo?.identity?.includes("agent") ? "agent" : "user",
      text: t.text,
      timestamp: t.streamInfo.timestamp
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
            onClick={() => setMode("voice")} 
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === 'voice' ? 'bg-white text-black' : 'text-white/40'}`}
          >
            <Headphones size={14} /> Voice
          </button>
          <button 
            onClick={() => {
              setMode("chat");
              localParticipant.setMicrophoneEnabled(false);
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
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
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
                onClick={onEndCall}
                className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-xl shadow-red-500/20 flex items-center justify-center text-white"
              >
                <PhoneOff size={24} />
              </Button>
              <p className="text-[10px] uppercase font-black tracking-widest text-center text-white/40">
                End Call
              </p>
            </motion.div>
          ) : (
            <div className="flex items-center gap-4">
               <div className="relative flex-1">
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
              <Button
                onClick={onEndCall}
                variant="ghost"
                size="icon"
                className="h-12 w-12 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all shrink-0"
              >
                <PhoneOff size={20} />
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
