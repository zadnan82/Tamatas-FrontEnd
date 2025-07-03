import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Move scrollToBottom function definition BEFORE useEffect
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Stable callbacks to prevent re-renders
  const handleNewMessageChange = useCallback((e) => {
    setNewMessage(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Network status detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionError(false);
      // Retry loading conversations when back online
      if (conversations.length === 0 && !loading) {
        loadConversations();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionError(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [conversations.length, loading]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    // Handle pre-selected conversation from URL params
    const recipientId = searchParams.get('recipient');
    const listingId = searchParams.get('listingId');
    const listingTitle = searchParams.get('listingTitle');
    
    if (recipientId) {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => conv.id === recipientId);
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        // Create a new conversation placeholder for new contact
        const newConversation = {
          id: recipientId,
          participant: {
            id: recipientId,
            name: 'Loading...', // Will be updated when we get user info
            avatar: null,
            location: 'Unknown location',
            online: false,
            lastSeen: new Date()
          },
          lastMessage: null,
          unreadCount: 0,
          listing: listingId && listingTitle ? {
            id: listingId,
            title: decodeURIComponent(listingTitle)
          } : null,
          isNew: true // Flag to indicate this is a new conversation
        };
        
        setSelectedConversation(newConversation);
        
        // Try to get user info for the recipient
        loadUserInfo(recipientId, newConversation);
      }
      
      // Pre-fill message if listing info is available
      if (listingTitle && !newMessage) {
        const decodedTitle = decodeURIComponent(listingTitle);
        setNewMessage(`Hi! I'm interested in your listing: ${decodedTitle}`);
      }
    }
  }, [searchParams, conversations, newMessage]);

  useEffect(() => {
    if (selectedConversation && !selectedConversation.isNew) {
      loadMessages(selectedConversation.participant.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Enhanced error handling function
  const handleApiError = (error, context = '') => {
    console.error(`${context} error:`, error);
    
    if (!isOnline) {
      setConnectionError(true);
      toast.error('No internet connection. Check your network and try again.');
      return;
    }

    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      setConnectionError(true);
      toast.error('Connection failed. The server may be down. Please try again later.');
      return;
    }

    if (error.status === 500) {
      toast.error('Server error occurred. Please try again in a moment.');
      return;
    }

    if (error.status === 404) {
      toast.error('Resource not found. Please refresh the page.');
      return;
    }

    if (error.status === 401) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    // Generic error
    toast.error(error.message || 'Something went wrong. Please try again.');
  };

  // New function to load user info for new conversations
  const loadUserInfo = async (userId, conversation) => {
    try {
      const userInfo = await apiClient.getUserProfile(userId);
      
      // Update the conversation with real user info
      setSelectedConversation(prev => ({
        ...prev,
        participant: {
          ...prev.participant,
          name: userInfo.full_name || userInfo.email?.split('@')[0] || 'User',
          avatar: userInfo.profile_image,
          location: userInfo.address || 'Unknown location'
        }
      }));
    } catch (error) {
      console.error('Error loading user info:', error);
      // Keep the placeholder data if we can't load user info
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      // Get all messages to build conversation list
      const messagesData = await apiClient.getMessages();
      
      // Process messages into conversations
      const conversationsMap = new Map();
      
      messagesData.forEach(message => {
        const isFromCurrentUser = message.sender_id === user.id;
        const participantId = isFromCurrentUser ? message.recipient_id : message.sender_id;
        
        // Extract participant info from message
        let participant;
        if (isFromCurrentUser) {
          // Message sent by current user, participant is recipient
          participant = {
            id: message.recipient_id,
            name: message.recipient?.full_name || message.recipient?.email || 'Unknown User',
            email: message.recipient?.email,
            avatar: message.recipient?.profile_image,
            location: message.recipient?.address || 'Unknown location',
            online: false,
            lastSeen: new Date()
          };
        } else {
          // Message received by current user, participant is sender
          participant = {
            id: message.sender_id,
            name: message.sender?.full_name || message.sender?.email || 'Unknown User',
            email: message.sender?.email,
            avatar: message.sender?.profile_image,
            location: message.sender?.address || 'Unknown location',
            online: false,
            lastSeen: new Date()
          };
        }
        
        if (!conversationsMap.has(participantId)) {
          conversationsMap.set(participantId, {
            id: participantId,
            participant,
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
              image: message.listing.images?.[0]
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
        .sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return b.lastMessage.timestamp - a.lastMessage.timestamp;
        });
      
      setConversations(conversationsArray);
      
      // Select first conversation if available and none is pre-selected
      if (conversationsArray.length > 0 && !searchParams.get('recipient')) {
        setSelectedConversation(conversationsArray[0]);
      }
      
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      handleApiError(error, 'Loading conversations');
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
          unreadMessages.map(msg => 
            apiClient.markMessageRead(msg.id).catch(error => 
              console.error('Failed to mark message as read:', error)
            )
          )
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
      handleApiError(error, 'Loading messages');
    }
  };

  // Enhanced sendMessage with retry logic
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);
    
    // Clear input immediately
    setNewMessage('');
    
    // Add optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      recipient_id: selectedConversation.participant.id,
      content: messageContent,
      created_date: new Date().toISOString(),
      read: false,
      listing_id: selectedConversation.listing?.id || null,
      sending: true,
      failed: false
    };

    setMessages(prev => [...prev, optimisticMessage]);

    const messageData = {
      recipient_id: selectedConversation.participant.id,
      content: messageContent,
      listing_id: selectedConversation.listing?.id || null
    };

    try {
      const sentMessage = await apiClient.sendMessage(messageData);
      
      // Replace optimistic message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? sentMessage : msg
      ));
      
      // Handle conversation updates
      if (selectedConversation.isNew) {
        const newConversation = {
          ...selectedConversation,
          lastMessage: {
            content: sentMessage.content,
            timestamp: new Date(sentMessage.created_date),
            sender: sentMessage.sender_id,
            read: false
          },
          isNew: false
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
      } else {
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
      }

      setConnectionError(false);
      setRetryCount(0);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? { ...msg, sending: false, failed: true, error: 'Failed to send. Tap to retry.' }
          : msg
      ));
      
      // Restore input
      setNewMessage(messageContent);
      
      handleApiError(error, 'Sending message');
    } finally {
      setSending(false);
      // Restore focus to input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Retry failed message
  const retryMessage = async (failedMessage) => {
    if (sending) return;
    
    setSending(true);
    
    // Reset the message status
    setMessages(prev => prev.map(msg => 
      msg.id === failedMessage.id 
        ? { ...msg, sending: true, failed: false, error: null }
        : msg
    ));
    
    const messageData = {
      recipient_id: failedMessage.recipient_id,
      content: failedMessage.content,
      listing_id: failedMessage.listing_id
    };
    
    try {
      const sentMessage = await apiClient.sendMessage(messageData);
      
      // Replace failed message with successful one
      setMessages(prev => prev.map(msg => 
        msg.id === failedMessage.id ? sentMessage : msg
      ));
      
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Retry failed:', error);
      
      // Mark as failed again
      setMessages(prev => prev.map(msg => 
        msg.id === failedMessage.id 
          ? { ...msg, sending: false, failed: true, error: 'Retry failed. Tap to try again.' }
          : msg
      ));
      
      handleApiError(error, 'Retrying message');
    } finally {
      setSending(false);
    }
  };
 

  const ConversationList = () => {
    const filteredConversations = conversations.filter(conv =>
      conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="clay-card bg-white/60 h-full flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 clay-text-soft w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

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
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate">{conversation.participant.name}</h4>
                      {conversation.lastMessage && (
                        <span className="text-xs clay-text-soft">
                          {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <p className="clay-text-soft text-xs flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      {conversation.participant.location}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {conversation.lastMessage ? (
                        <p className="text-sm clay-text-soft truncate flex-1">
                          {conversation.lastMessage.sender === user.id && "You: "}
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm clay-text-soft italic">No messages yet</p>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {conversation.listing && (
                      <div className="clay-card p-2 mt-2 bg-white/60 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-green-600" />
                        </div>
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
  const isSending = message.sending;
  const isFailed = message.failed;
  
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`
      : name.charAt(0);
  };

  const avatarUrl = isOwn 
    ? user?.profile_image 
    : selectedConversation?.participant?.avatar;
  
  const avatarName = isOwn 
    ? user?.full_name || 'You'
    : selectedConversation?.participant?.name || 'User';

  return (
    <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={avatarName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {getInitials(avatarName)}
            </span>
          )}
        </div>
      )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
          <div 
            className={`clay-card p-3 cursor-pointer ${
              isOwn 
                ? `text-white ${
                    isFailed ? 'bg-gradient-to-br from-red-400 to-red-500' : 
                    isSending ? 'bg-gradient-to-br from-green-400 to-emerald-500 opacity-70' : 
                    'bg-gradient-to-br from-green-400 to-emerald-500'
                  }` 
                : 'bg-white/80'
            }`}
            onClick={isFailed ? () => retryMessage(message) : undefined}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
            
            {isSending && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1 h-1 bg-white/70 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-xs text-white/70 ml-1">Sending...</span>
              </div>
            )}
            
            {isFailed && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 text-white/90" />
                <span className="text-xs text-white/90">{message.error}</span>
              </div>
            )}
          </div>
          
          {!isSending && !isFailed && (
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
          )}
        </div>

        {isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 overflow-hidden order-2">
          {user?.profile_image ? (
            <img 
              src={user.profile_image} 
              alt="You"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {getInitials(user?.full_name || 'Y')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Update the ConnectionStatus component
const ConnectionStatus = () => {
  if (!isOnline) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span><strong>No internet connection.</strong> Messages will be sent when you're back online.</span>
      </div>
    );
  }
  
  if (connectionError) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="mb-1"><strong>Connection issues detected.</strong> This might be due to:</p>
          <ul className="list-disc list-inside text-xs mb-2">
            <li>Server maintenance or downtime</li>
            <li>Network restrictions (CORS policy)</li>
            <li>Temporary connectivity problems</li>
          </ul>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setRetryCount(prev => prev + 1);
                loadConversations();
              }}
              className="text-yellow-800 hover:text-yellow-900 underline flex items-center gap-1 text-sm"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
            <a 
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-800 hover:text-yellow-900 underline text-sm"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
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
        {/* Connection Status */}
        <ConnectionStatus />
        
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            
            <div>
              <h3 className="font-semibold text-sm">{selectedConversation.participant.name}</h3>
              <p className="clay-text-soft text-xs flex items-center gap-1">
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    {selectedConversation.isNew ? 'New conversation' : 'Active'}
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    Offline
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Listing Context Banner */}
        {selectedConversation.listing && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">About listing:</p>
                <p className="text-sm text-green-700">{selectedConversation.listing.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-600 mb-2">
                {selectedConversation.isNew ? 'Start the conversation' : 'No messages yet'}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedConversation.isNew ? 
                  'Send your first message to start chatting!' : 
                  'Be the first to send a message'
                }
              </p>
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
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text" 
                value={newMessage}
                onChange={handleNewMessageChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !sending) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                className="w-full py-3 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={sending}
                autoComplete="off"
                autoFocus
              />
            </div>
            
            <button 
              type="submit" 
              disabled={!newMessage.trim() || !selectedConversation || sending}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-all"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
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
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
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