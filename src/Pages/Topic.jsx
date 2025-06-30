import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ForumTopic, ForumPost, User } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

export default function TopicPage() {
    const [topic, setTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    
    const location = useLocation();
    const topicId = new URLSearchParams(location.search).get('id');

    const fetchData = async () => {
        if (!topicId) {
            setLoading(false);
            return;
        }
        try {
            const [topicData, postsData, userData] = await Promise.all([
                ForumTopic.get(topicId),
                ForumPost.filter({ topic_id: topicId }, 'created_date'),
                User.me()
            ]);

            setTopic(topicData);
            setPosts(postsData);
            setCurrentUser(userData);

            const userIds = [topicData.created_by, ...postsData.map(p => p.created_by)];
            const uniqueUserIds = [...new Set(userIds.map(email => email))]; // simplified for now
            // In a real app, you'd fetch user profiles by email/ID
            // For now, we'll just use emails.

        } catch (error) {
            console.error("Error fetching topic data:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [topicId]);

    const handlePostReply = async () => {
        if (!newPostContent.trim()) return;
        try {
            await ForumPost.create({
                topic_id: topicId,
                content: newPostContent,
            });
            setNewPostContent('');
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to post reply:", error);
        }
    };

    if (loading) return <div>Loading topic...</div>;
    if (!topic) return <div>Topic not found.</div>;

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Original Post */}
                <Card>
                    <CardHeader>
                        <h1 className="text-3xl font-bold">{topic.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                             <Avatar className="w-6 h-6"><AvatarFallback>{topic.created_by[0].toUpperCase()}</AvatarFallback></Avatar>
                            <span>Posted by <span className="font-medium">{topic.created_by.split('@')[0]}</span> on {format(new Date(topic.created_date), 'PPP')}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{topic.content}</p>
                    </CardContent>
                </Card>

                {/* Replies */}
                <h2 className="text-xl font-semibold">Replies ({posts.length})</h2>
                <div className="space-y-4">
                    {posts.map(post => (
                        <Card key={post.id}>
                            <CardContent className="p-4 flex gap-4">
                                <Avatar><AvatarFallback>{post.created_by[0].toUpperCase()}</AvatarFallback></Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{post.created_by.split('@')[0]} <span className="font-normal text-xs text-gray-500">{format(new Date(post.created_date), 'Pp')}</span></p>
                                    <p className="mt-1">{post.content}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Reply Form */}
                <Card>
                    <CardHeader>
                        <h3 className="font-semibold">Post a Reply</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Share your thoughts..." rows={5}/>
                            <Button onClick={handlePostReply}>
                                <Send className="w-4 h-4 mr-2" />
                                Post Reply
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}