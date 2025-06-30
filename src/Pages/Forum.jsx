import React, { useState, useEffect } from 'react';
import { ForumTopic } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Plus, Eye, ThumbsUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function ForumPage() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const topicData = await ForumTopic.list('-created_date');
                setTopics(topicData);
            } catch (error) {
                console.error("Failed to fetch forum topics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Community Forum</h1>
                        <p className="text-gray-500">Discuss, ask questions, and share ideas with the community.</p>
                    </div>
                    <Button onClick={() => navigate(createPageUrl('CreateForumTopic'))}>
                        <Plus className="w-4 h-4 mr-2" />
                        Start a New Topic
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Discussions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && <p>Loading topics...</p>}
                        <div className="space-y-4">
                            {topics.map(topic => (
                                <Link to={createPageUrl(`Topic?id=${topic.id}`)} key={topic.id} className="block p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{topic.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                By <span className="font-medium text-green-600">{topic.created_by.split('@')[0]}</span> in <span className="capitalize font-medium">{topic.category.replace(/_/g, ' ')}</span> &bull; {format(new Date(topic.created_date), 'MMM d')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Eye className="w-4 h-4"/>{topic.view_count || 0}</span>
                                            {/* Reply count would require another query */}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {!loading && topics.length === 0 && <p className="text-center py-8">No topics yet. Be the first to start a discussion!</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}