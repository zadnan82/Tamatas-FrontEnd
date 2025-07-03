import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
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
  Star,
  MessageSquare
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
      loadMessages(selectedConversation.participant.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Get all messages to build conversation list
      const messagesData = await apiClient.getMessages();
      
      // Process messages into conversations
      const conversationsMap = new Map();
      
      messagesData.forEach(message => {
        const isFromCurrentUser = message.sender_id === user.id;
        const participantId = isFromCurrentUser ? message.recipient_id : message.sender_id;
        const participant = isFromCurrentUser ? message.recipient : message.sender;
        
        if (!conversationsMap.has(participantId)) {
          conversationsMap.set(participantId, {
            id: participantId,
            participant: {
              id: participantId,
              name: participant?.full_name || participant?.email || 'Unknown User',
              avatar: participant?.profile_image,
              location: participant?.address || 'Unknown location',
              online: false,
              lastSeen: new Date()
            },
            lastMessage: {
              content: message.content,
              timestamp: new Date(message.created_date),
              sender: message.sender_id,
              read: message.read
            },
            unreadCount: message.recipient_id === user.id && !message.read ? 1 : 0,
            listing: message.listing ? {
              id: message.listing.id,
              title: message.listing.title,
              image: message.listing.images?.[0]?.url
            } : null
          });
        } else {
          const conversation = conversationsMap.get(participantId);
          
          // Update last message if newer
          if (new Date(message.created_date) > conversation.lastMessage.timestamp) {
            conversation.lastMessage = {
              content: message.content,
              timestamp: new Date(message.created_date),
              sender: message.sender_id,
              read: message.read
            };
          }
          
          // Update unread count
          if (message.recipient_id === user.id && !message.read) {
            conversation.unreadCount += 1;
          }
        }
      });
      
      const conversationsArray = Array.from(conversationsMap.values())
        .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
      
      setConversations(conversationsArray);
      
      // Select first conversation if available
      if (conversationsArray.length > 0) {
        setSelectedConversation(conversationsArray[0]);
      }
     } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    toast.error(error.message || 'Failed to load conversations');
    setConversations([]);
  } finally {
    setLoading(false);
  }
};

  const loadMessages = async (participantId) => {
    try {
      const conversationMessages = await apiClient.getConversation(participantId);
      
      // Mark messages as read when loading the conversation
      const unreadMessages = conversationMessages.filter(
        msg => msg.recipient_id === user.id && !msg.read
      );
      
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(msg => apiClient.markMessageRead(msg.id))
        );
        
        // Update conversation unread count
        setConversations(prev => prev.map(conv => 
          conv.id === participantId ? { ...conv, unreadCount: 0 } : conv
        ));
      }
      
      setMessages(conversationMessages.sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      ));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        recipient_id: selectedConversation.participant.id,
        content: newMessage.trim()
      };

      const sentMessage = await apiClient.sendMessage(messageData);
      
      // Update messages list
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update conversation list
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.participant.id 
          ? { 
              ...conv, 
              lastMessage: {
                content: sentMessage.content,
                timestamp: new Date(sentMessage.created_date),
                sender: sentMessage.sender_id,
                read: false
              }
            }
          : conv
      ));

      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-600 mb-2">No conversations</h3>
              <p className="text-sm text-gray-500">Start by contacting sellers from listings</p>
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 text-left hover:bg-white/80 transition-colors border-b border-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-white/80' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 clay-card rounded-2xl overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      {conversation.participant.avatar ? (
                        <img 
                          src={conversation.participant.avatar} 
                          alt={conversation.participant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {conversation.participant.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {conversation.participant.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate">{conversation.participant.name}</h4>
                      <span className="text-xs clay-text-soft">
                        {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="clay-text-soft text-xs flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {conversation.participant.location}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm clay-text-soft truncate flex-1">
                        {conversation.lastMessage.sender === user.id && "You: "}
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
                        {conversation.listing.image ? (
                          <img 
                            src={conversation.listing.image} 
                            alt={conversation.listing.title}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                        <span className="text-xs clay-text-soft truncate">{conversation.listing.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
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
            <span>{format(new Date(message.created_date), 'HH:mm')}</span>
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
                {selectedConversation.participant.avatar ? (
                  <img 
                    src={selectedConversation.participant.avatar} 
                    alt={selectedConversation.participant.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {selectedConversation.participant.name.charAt(0)}
                  </span>
                )}
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
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-600 mb-2">No messages yet</h3>
              <p className="text-sm text-gray-500">Start the conversation by sending a message</p>
            </div>
          ) : (
            messages.map(message => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isOwn={message.sender_id === user.id}
              />
            ))
          )}
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