import React, { useState } from 'react';
import { SendEmail } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        try {
            await SendEmail({
                to: 'admin@freshtrade.app', // Replace with your admin email
                from_name: formData.name,
                subject: `Contact Form: ${formData.subject}`,
                body: `Message from: ${formData.email}\n\n${formData.message}`,
            });
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error("Failed to send email", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-lg bg-white dark:bg-gray-800">
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                    <CardDescription>Have a question or feedback? Let us know.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                         <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                         <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                        </div>
                         <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            <Send className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                    </form>
                    {submitStatus === 'success' && <p className="mt-4 text-green-600">Message sent successfully!</p>}
                    {submitStatus === 'error' && <p className="mt-4 text-red-600">Failed to send message. Please try again later.</p>}
                </CardContent>
            </Card>
        </div>
    );
}