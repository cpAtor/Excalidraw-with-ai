import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Image as ImageIcon, Sparkles, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image-analysis';
}

interface SidebarProps {
  onAnalyze: (message: string) => Promise<string>;
  isLoading: boolean;
}

export default function Sidebar({ onAnalyze, isLoading }: SidebarProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI collaborator. Draw something on the canvas and I can help you analyze it or suggest improvements.",
    },
  ]);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      // Don't auto-close if the user explicitly opened/closed it, 
      // but a simple check helps initial mobile load
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    // Dismiss keyboard on mobile
    if (window.innerWidth < 768) {
      inputRef.current?.blur();
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    try {
      const response = await onAnalyze(currentInput);
      if (response) {
        setMessages(prev => [...prev, { 
          id: (Date.now()+1).toString(), 
          role: 'assistant', 
          content: response 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: (Date.now()+2).toString(), 
        role: 'assistant', 
        content: "Sorry, I encountered an error while analyzing the canvas." 
      }]);
    }
  };

  const addAIMessage = (content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content }]);
  };

  // Expose addAIMessage to parent via a ref or just use props if it was more complex
  // For simplicity, we'll let the parent pass the response back if needed, but here we'll handle state locally if possible
  // Wait, onAnalyze is async, so we can just wait for it in handleSubmit.
  
  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Chat cleared. How can I help with your drawing now?",
    }]);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-28 md:right-0 md:top-1/2 md:-translate-y-1/2 z-[1001] bg-indigo-600 md:bg-panel border border-indigo-500 md:border-base p-4 md:p-2 rounded-full md:rounded-l-xl md:rounded-r-none shadow-2xl hover:bg-indigo-700 md:hover:bg-panel transition-all active:scale-95 group"
        id="sidebar-toggle"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronRight size={24} className="text-white md:text-main" />
          ) : (
            <div className="flex items-center gap-2">
              <Bot size={24} className="text-white md:text-indigo-600" />
              <ChevronLeft size={20} className="hidden md:block text-muted" />
            </div>
          )}
        </div>
        <span className="md:hidden absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI CHAT
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[1100] w-full md:w-[380px] bg-canvas border-l border-base flex flex-col shadow-2xl overflow-hidden"
            id="ai-sidebar"
          >
        <div className="p-4 border-b border-base flex items-center justify-between bg-panel/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-bold text-main text-sm tracking-tight">Collaborator</h2>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Gemini Vision AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={clearChat}
              className="text-muted hover:text-red-500 transition-colors p-2"
              title="Clear Chat"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-main p-2"
              title="Close Sidebar"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-canvas"
          id="chat-messages"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-panel text-main rounded-tl-none border border-base'
              }`}>
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{msg.role}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-panel text-muted rounded-2xl rounded-tl-none p-4 border border-base flex items-center gap-3 shadow-inner">
                <Loader2 size={18} className="animate-spin text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-tighter">Analyzing canvas...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-base space-y-4 bg-panel/30 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Explain context', icon: Sparkles },
              { label: 'Analyze sketch', icon: ImageIcon },
              { label: 'Any suggestions?', icon: Sparkles }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleQuickAction(btn.label)}
                className="text-[10px] bg-canvas hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-500 border border-indigo-500/30 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-bold uppercase tracking-wider shadow-sm"
              >
                <btn.icon size={11} />
                {btn.label}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="relative group">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your drawing..."
              className="w-full bg-canvas border border-base rounded-2xl py-4 pl-5 pr-14 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg active:scale-90"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[9px] text-center text-muted font-medium opacity-50">
            SECURE AI COLLABORATION • GEMINI 2.5 VISION
          </p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</>
);
}
