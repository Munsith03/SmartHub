import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from '../../components/ChatWindow';
import LoadingSpinner from '../../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { HiChat } from 'react-icons/hi';

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const partnerId = searchParams.get('partner');
    if (partnerId && !selectedPartner) {
      API.get(`/users/${partnerId}`)
        .then((res) => setSelectedPartner(res.data))
        .catch(console.error);
    }
  }, [searchParams]);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/messages/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !searchParams.get('partner')) {
        setSelectedPartner(res.data[0].partner);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading conversations..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden h-[calc(100vh-10rem)]">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r border-[var(--glass-border)] flex flex-col">
            <div className="px-5 py-4 border-b border-[var(--glass-border)]">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <HiChat className="w-4 h-4 text-white" />
                </div>
                Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && !selectedPartner ? (
                <p className="text-xs text-text-muted text-center py-10 px-4 leading-relaxed">No conversations yet. Visit a company profile to start chatting.</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partner?._id}
                    onClick={() => setSelectedPartner(conv.partner)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200 ${
                      selectedPartner?._id === conv.partner?._id
                        ? 'bg-primary-500/5 border-l-[3px] border-l-primary-500'
                        : 'hover:bg-surface-hover/50 border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/25 to-accent-500/25 flex items-center justify-center ring-2 ring-[var(--glass-border)]">
                        <span className="text-sm font-bold text-primary-400">{conv.partner?.fullName?.charAt(0)}</span>
                      </div>
                      {conv.partner?.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-[var(--color-surface-card)] shadow-sm shadow-success/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-text-primary truncate">{conv.partner?.fullName}</p>
                        <span className="text-[10px] text-text-muted flex-shrink-0">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-text-muted truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-[10px] flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-500/20">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ChatWindow
              partnerId={selectedPartner?._id}
              partnerName={selectedPartner?.fullName}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
