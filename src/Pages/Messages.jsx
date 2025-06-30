import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Message, User, Listing } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ArrowLeft, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

// Helper to group messages into conversations
const groupMessagesIntoConversations = (messages, currentUserId) => {
    const conversations = {};
    messages.forEach(msg => {
        const otherUserId = msg.sender_id === currentUserId ? msg.recipient_id : msg.sender_id;
        // A conversation is unique per user AND per listing
        const conversationKey = `${otherUserId}_${msg.listing_id}`;

        if (!conversations[conversationKey]) {
            conversations[conversationKey] = {
                otherUserId: otherUserId,
                listingId: msg.listing_id,
                messages: [],
                lastMessageTime: null,
            };
        }
        conversations[conversationKey].messages.push(msg);
        // Sort messages chronologically within the conversation
        conversations[conversationKey].messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        conversations[conversationKey].lastMessageTime = new Date(conversations[conversationKey].messages.slice(-1)[0].created_date);
    });
    
    // Sort conversations by the most recent message
    return Object.values(conversations).sort((a,b) => b.lastMessageTime - a.lastMessageTime);
};


export default function MessagesPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [usersCache, setUsersCache] = useState({});
    const [listingsCache, setListingsCache] = useState({});
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const user = await User.me();
                setCurrentUser(user);
                
                const sentMessages = await Message.filter({ sender_id: user.id });
                const receivedMessages = await Message.filter({ recipient_id: user.id });
                const allMessages = [...sentMessages, ...receivedMessages];

                const convos = groupMessagesIntoConversations(allMessages, user.id);
                setConversations(convos);
                
                // Handle starting a new conversation from a listing
                const params = new URLSearchParams(location.search);
                const recipientEmail = params.get('recipient');
                const listingId = params.get('listingId');
                
                if (recipientEmail && listingId) {
                    const recipientUsers = await User.filter({ email: recipientEmail });
                    if (recipientUsers.length > 0) {
                        const recipientUser = recipientUsers[0];
                        const recipientId = recipientUser.id; // This is the valid ObjectId

                        // Add new user to cache immediately for UI
                        setUsersCache(prev => ({ ...prev, [recipientId]: recipientUser }));

                        const foundConvo = convos.find(c => c.otherUserId === recipientId && c.listingId === listingId);
                        
                        if (foundConvo) {
                            setSelectedConversation(foundConvo);
                        } else {
                            // Pre-fetch listing details for new conversation header
                             if (!listingsCache[listingId]) {
                                try {
                                    const listing = await Listing.get(listingId);
                                    setListingsCache(prev => ({ ...prev, [listingId]: listing }));
                                } catch (e) { console.error("Could not fetch listing", e); }
                            }
                            // Create a temporary conversation object with the correct ID
                            setSelectedConversation({
                                otherUserId: recipientId, // Use the valid ObjectId
                                listingId: listingId,
                                messages: [],
                                isNew: true,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error initializing messages:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [location.search]);

    useEffect(() => {
        const userIdsToFetch = [];
        const listingIdsToFetch = [];

        conversations.forEach(convo => {
            if (!usersCache[convo.otherUserId]) userIdsToFetch.push(convo.otherUserId);
            if (convo.listingId && !listingsCache[convo.listingId]) listingIdsToFetch.push(convo.listingId);
        });

        const uniqueUserIds = [...new Set(userIdsToFetch)];
        const uniqueListingIds = [...new Set(listingIdsToFetch)];

        const fetchDetails = async () => {
            if (uniqueUserIds.length > 0) {
                const users = await User.filter({ id: { '$in': uniqueUserIds } });
                const newUsersCache = {};
                users.forEach(u => newUsersCache[u.id] = u);
                setUsersCache(prev => ({ ...prev, ...newUsersCache }));
            }
            if (uniqueListingIds.length > 0) {
                const listings = await Listing.filter({ id: { '$in': uniqueListingIds } });
                const newListingsCache = {};
                listings.forEach(l => newListingsCache[l.id] = l);
                setListingsCache(prev => ({ ...prev, ...newListingsCache }));
            }
        };

        if (uniqueUserIds.length > 0 || uniqueListingIds.length > 0) {
            fetchDetails();
        }
    }, [conversations]);


    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !currentUser) return;
        
        try {
            await Message.create({
                sender_id: currentUser.id,
                recipient_id: selectedConversation.otherUserId, // This is now a valid ID
                listing_id: selectedConversation.listingId,
                content: newMessage,
            });
            setNewMessage('');
            
            // Refresh conversation list after sending message
            const sent = await Message.filter({ sender_id: currentUser.id });
            const received = await Message.filter({ recipient_id: currentUser.id });
            const updatedConvos = groupMessagesIntoConversations([...sent, ...received], currentUser.id);
            setConversations(updatedConvos);
            
            // Stay on the current conversation
            const updatedSelected = updatedConvos.find(c => c.otherUserId === selectedConversation.otherUserId && c.listingId === selectedConversation.listingId);
            setSelectedConversation(updatedSelected);

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
        }
    };
    
    if (loading) return <div className="p-4">Loading messages...</div>;

    return (
        <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
            {/* Conversation List */}
            <div className={`w-full md:w-1/3 border-r dark:border-gray-700 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(convo => {
                        const otherUser = usersCache[convo.otherUserId];
                        const listing = listingsCache[convo.listingId];
                        return (
                            <div key={`${convo.otherUserId}-${convo.listingId}`}
                                onClick={() => setSelectedConversation(convo)}
                                className={`p-4 cursor-pointer border-b dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedConversation?.otherUserId === convo.otherUserId && selectedConversation?.listingId === convo.listingId ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={otherUser?.profile_image} />
                                        <AvatarFallback>{otherUser?.full_name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{otherUser?.full_name || 'User'}</p>
                                        <p className="text-sm text-gray-500 truncate">Re: {listing?.title || 'a listing'}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Message Thread */}
            <div className={`w-full md:w-2/3 flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b dark:border-gray-700 flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {usersCache[selectedConversation.otherUserId]?.full_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                   Regarding: {listingsCache[selectedConversation.listingId]?.title}
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {selectedConversation.messages.map(msg => (
                                <div key={msg.id} className={`flex gap-3 ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender_id !== currentUser.id && <Avatar className="w-8 h-8"><AvatarImage src={usersCache[msg.sender_id]?.profile_image}/><AvatarFallback>{usersCache[msg.sender_id]?.full_name?.[0] || 'U'}</AvatarFallback></Avatar>}
                                    <div className={`p-3 rounded-lg max-w-lg ${msg.sender_id === currentUser.id ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <p>{msg.content}</p>
                                        <p className="text-xs opacity-70 mt-1 text-right">{format(new Date(msg.created_date), 'p')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t dark:border-gray-700 flex items-center gap-2">
                            <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}/>
                            <Button onClick={handleSendMessage}><Send className="w-4 h-4" /></Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}