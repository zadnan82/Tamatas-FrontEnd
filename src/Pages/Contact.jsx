import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import Button from '../Components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Send, Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ 
    name: user?.full_name || '', 
    email: user?.email || '', 
    subject: '', 
    message: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };
      
      console.log('Sending contact form:', contactData);
      
      await apiClient.sendContact(contactData);
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form (but keep user info if logged in)
      setFormData({ 
        name: user?.full_name || '', 
        email: user?.email || '', 
        subject: '', 
        message: '' 
      });
    } catch (error) {
      console.error("Failed to send contact message:", error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      if (error.message && error.message !== '[object Object]') {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have a question, suggestion, or need help? We'd love to hear from you. 
              Our team is here to support the Tamatas community.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          placeholder="Your full name"
                          required 
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          placeholder="your.email@example.com"
                          required 
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange} 
                        placeholder="What's this about?"
                        required 
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <Textarea 
                        name="message" 
                        value={formData.message} 
                        onChange={handleChange} 
                        placeholder="Tell us more about your question or feedback..."
                        required 
                        rows={6}
                        disabled={isSubmitting}
                        maxLength={1000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.message.length}/1000 characters
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600 text-sm">support@tamatas.com</p>
                      <p className="text-gray-500 text-xs">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
                      <p className="text-gray-500 text-xs">Mon-Fri, 9AM-5PM EST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Address</h3>
                      <p className="text-gray-600 text-sm">
                        123 Fresh Farm Lane<br />
                        Green Valley, CA 90210
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Response Time</h3>
                      <p className="text-gray-600 text-sm">
                        • Email: Within 24 hours<br />
                        • Phone: Same day<br />
                        • Urgent issues: Within 2 hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Common Questions</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• How do I create a listing?</li>
                        <li>• How do I contact sellers?</li>
                        <li>• Is Tamatas free to use?</li>
                        <li>• How do I report a problem?</li>
                      </ul>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100">
                      <h4 className="font-medium text-gray-900 mb-2">Need immediate help?</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Check our community forum for quick answers from other users.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Visit Forum
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Support Hours */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Support Hours</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST</p>
                    <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM EST</p>
                    <p><strong>Sunday:</strong> Closed</p>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Outside these hours? Send us a message and we'll get back to you first thing!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;