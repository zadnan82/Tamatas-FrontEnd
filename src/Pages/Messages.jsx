import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile,
  Check,
  CheckCheck,
  Circle,
  User,
  MapPin,
  ShoppingBag,
  Clock,
  Star
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      // Mock conversations data
      const mockConversations = [
        {
          id: 1,
          participant: {
            id: 2,
            name: 'Jane Gardener',
            avatar: '/placeholder-avatar.jpg',
            location: 'Madison, WI',
            online: true,
            lastSeen: new Date()
          },
          lastMessage: {
            content: "Hi! Are the tomatoes still available?",
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            sender: 2,
            read: false
          },
          unreadCount: 2,
          listing: {
            id: 1,
            title: 'Fresh Organic Tomatoes',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100'
          }
        },
        {
          id: 2,
          participant: {
            id: 3,
            name: 'Chef Mike',
            avatar: '/placeholder-avatar.jpg',
            location: 'Chicago, IL',
            online: false,
            lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2)
          },
          lastMessage: {
            content: "Thanks for the great strawberries!",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            sender: 1,
            read: true
          },
          unreadCount: 0,
          rating: 5
        },
        {
          id: 3,
          participant: {
            id: 4,
            name: 'Sarah Green',
            avatar: '/placeholder-avatar.jpg',
            location: 'Portland, OR',
            online: true,
            lastSeen: new Date()
          },
          lastMessage: {
            content: "When would be a good time to pick up the herbs?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
            sender: 4,
            read: true
          },
          unreadCount: 0,
          listing: {
            id: 3,
            title: 'Fresh Basil & Herbs',
            image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf5ecf?w=100'
          }
        }
      ];
      
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      // Mock messages data
      const mockMessages = [
        {
          id: 1,
          conversationId: 1,
          sender: 2,
          content: "Hi! I saw your listing for organic tomatoes. Are they still available?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          read: true,
          type: 'text'
        },
        {
          id: 2,
          conversationId: 1,
          sender: 1,
          content: "Yes, they are! I have about 15 lbs left. They're vine-ripened and completely organic.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
          read: true,
          type: 'text'
        },
        {
          id: 3,
          conversationId: 1,
          sender: 2,
          content: "Perfect! What's your price per lb? And when would be good for pickup?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
          read: true,
          type: 'text'
        },
        {
          id: 4,
          conversationId: 1,
          sender: 1,
          content: "$4.50 per lb. I'm usually available afternoons after 3 PM. Tomorrow work for you?",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: true,
          type: 'text'
        },
        {
          id: 5,
          conversationId: 1,
          sender: 2,
          content: "Hi! Are the tomatoes still available?",
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          read: false,
          type: 'text'
        }
      ];
      
      const conversationMessages = mockMessages.filter(m => m.conversationId === conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now(),
      conversationId: selectedConversation.id,
      sender: user.id || 1,
      content: newMessage.trim(),
      timestamp: new Date(),
      read: false,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Update last message in conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            lastMessage: {
              content: message.content,
              timestamp: message.timestamp,
              sender: message.sender,
              read: false
            }
          }
        : conv
    ));

    toast.success('Message sent!');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markAsRead = async (conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const ConversationList = () => {
    const filteredConversations = conversations.filter(conv =>
      conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="clay-card bg-white/60 h-full flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 clay-text-soft w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="clay-input pl-10 w-full text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                markAsRead(conversation.id);
              }}
              className={`w-full p-4 text-left hover:bg-white/80 transition-colors border-b border-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-white/80' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 clay-card rounded-2xl overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {conversation.participant.name.charAt(0)}
                    </span>
                  </div>
                  {conversation.participant.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm truncate">{conversation.participant.name}</h4>
                    <div className="flex items-center gap-1">
                      {conversation.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs clay-text-soft">{conversation.rating}</span>
                        </div>
                      )}
                      <span className="text-xs clay-text-soft">
                        {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <p className="clay-text-soft text-xs flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" />
                    {conversation.participant.location}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm clay-text-soft truncate flex-1">
                      {conversation.lastMessage.sender === (user.id || 1) && "You: "}
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <div className="clay-badge clay-badge-green text-xs px-2 py-1 ml-2">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  {conversation.listing && (
                    <div className="clay-card p-2 mt-2 bg-white/60 flex items-center gap-2">
                      <img 
                        src={conversation.listing.image} 
                        alt={conversation.listing.title}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span className="text-xs clay-text-soft truncate">{conversation.listing.title}</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const MessageBubble = ({ message, isOwn }) => {
    return (
      <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {!isOwn && (
          <div className="w-8 h-8 clay-card rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {selectedConversation?.participant.name.charAt(0)}
            </span>
          </div>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
          <div className={`clay-card p-3 ${
            isOwn 
              ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
              : 'bg-white/80'
          }`}>
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          
          <div className={`flex items-center gap-1 mt-1 text-xs clay-text-soft ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span>{format(message.timestamp, 'HH:mm')}</span>
            {isOwn && (
              <div className="flex items-center">
                {message.read ? (
                  <CheckCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>

        {isOwn && (
          <div className="w-8 h-8 clay-card rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 order-2">
            <span className="text-white font-semibold text-sm">
              {user?.full_name?.charAt(0) || 'Y'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const ChatArea = () => {
    if (!selectedConversation) {
      return (
        <div className="clay-card bg-white/40 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 clay-card rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h3 className="clay-text-title text-xl font-semibold mb-2">Select a conversation</h3>
            <p className="clay-text-soft">Choose a conversation to start messaging</p>
          </div>
        </div>
      );
    }

    return (
      <div className="clay-card bg-white/60 h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 clay-card rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {selectedConversation.participant.name.charAt(0)}
                </span>
              </div>
              {selectedConversation.participant.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">{selectedConversation.participant.name}</h3>
              <p className="clay-text-soft text-xs flex items-center gap-1">
                {selectedConversation.participant.online ? (
                  <>
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    Online
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    Last seen {formatDistanceToNow(selectedConversation.participant.lastSeen, { addSuffix: true })}
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="clay-button p-2 rounded-xl">
              <Phone className="w-4 h-4" />
            </button>
            <button className="clay-button p-2 rounded-xl">
              <Video className="w-4 h-4" />
            </button>
            <button className="clay-button p-2 rounded-xl">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map(message => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isOwn={message.sender === (user.id || 1)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button type="button" className="clay-button p-2 rounded-xl flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="clay-input w-full pr-12"
              />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Smile className="w-4 h-4 clay-text-soft" />
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="clay-button-primary p-3 rounded-xl flex-shrink-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="clay-card p-8 text-center">
          <div className="clay-loading w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="clay-card p-6 mb-6 bg-gradient-to-br from-white/80 to-white/60">
        <h1 className="clay-text-title text-3xl font-bold mb-2">Messages</h1>
        <p className="clay-text-subtitle">Stay connected with your local food community</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        <div className="lg:col-span-1">
          <ConversationList />
        </div>
        <div className="lg:col-span-2">
          <ChatArea />
        </div>
      </div>
    </div>
  );
};

export default Messages;