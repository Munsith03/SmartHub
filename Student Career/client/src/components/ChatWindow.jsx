import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../utils/socket';
import API from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaperAirplane } from 'react-icons/hi';

export default function ChatWindow({ partnerId, partnerName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!partnerId) return;

    API.get(`/messages/${partnerId}`)
      .then((res) => setMessages(res.data))
      .catch(console.error);

    const handleNewMessage = (msg) => {
      if (msg.senderId === partnerId || msg.receiverId === partnerId) {
        setMessages((prev) => [...prev, msg]);
        socket.emit('mark_read', { senderId: partnerId, receiverId: user._id });
      }
    };

    const handleMessageSent = (msg) => {
      if (msg.receiverId === partnerId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ userId }) => {
      if (userId === partnerId) setTyping(true);
    };

    const handleStopTyping = ({ userId }) => {
      if (userId === partnerId) setTyping(false);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    socket.emit('mark_read', { senderId: partnerId, receiverId: user._id });

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [partnerId, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit('send_message', {
      senderId: user._id,
      receiverId: partnerId,
      messageText: input.trim(),
    });

    socket.emit('stop_typing', { senderId: user._id, receiverId: partnerId });
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit('typing', { senderId: user._id, receiverId: partnerId });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { senderId: user._id, receiverId: partnerId });
    }, 1500);
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!partnerId) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
            <HiPaperAirplane className="w-10 h-10 text-primary-500/30 rotate-45" />
          </div>
          <p className="text-lg font-semibold text-text-primary">Select a conversation</p>
          <p className="text-sm text-text-muted mt-1.5">Choose someone to start chatting with</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--glass-border)] flex items-center gap-3.5 bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary-500/20">
          {partnerName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{partnerName}</h3>
          <AnimatePresence>
            {typing && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-primary-400 font-medium"
              >
                typing...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map((msg, i) => {
          const isMine = msg.senderId === user._id;
          return (
            <motion.div
              key={msg._id || i}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 ${
                  isMine
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl rounded-br-lg shadow-md shadow-primary-500/15'
                    : 'bg-surface-elevated text-text-primary border border-[var(--glass-border)] rounded-2xl rounded-bl-lg'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.messageText}</p>
                <p className={`text-[10px] mt-1.5 ${isMine ? 'text-white/50' : 'text-text-muted'}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3 bg-surface-elevated/50 border border-[var(--glass-border)] rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 transition-all duration-200 input-stripe"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="glow-btn p-3 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <HiPaperAirplane className="w-5 h-5 rotate-90" />
          </button>
        </div>
      </form>
    </div>
  );
}
