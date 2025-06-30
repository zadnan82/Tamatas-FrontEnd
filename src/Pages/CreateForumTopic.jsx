import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForumTopic } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft } from 'lucide-react';

const CATEGORIES = ["gardening_tips", "trading_ideas", "general_discussion", "site_feedback"];

export default function CreateForumTopicPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', content: '', category: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSelectChange = (value) => setFormData({ ...formData, category: value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content || !formData.category) {
            alert("Please fill out all fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            await ForumTopic.create(formData);
            navigate('/Forum');
        } catch (error) {
            console.error("Failed to create topic:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /></Button>
                        <CardTitle>Start a New Discussion</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={handleSelectChange} required>
                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="title">Topic Title</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="content">Your Post</Label>
                            <Textarea id="content" name="content" value={formData.content} onChange={handleChange} required rows={10} />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Posting...' : 'Post Topic'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
