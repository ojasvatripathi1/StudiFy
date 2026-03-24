"use client";

import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link href="/" className="inline-flex items-center text-primary hover:underline font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Contact Us</h1>
          <p className="text-xl text-muted-foreground">We'd love to hear from you. Please fill out this form or shoot us an email.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 pt-8">
          <div className="space-y-8 text-muted-foreground">
            <p>
              Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Email</h3>
                  <p>support@studify.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Live Chat</h3>
                  <p>Available for Premium Users</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Location</h3>
                  <p>Global (Remote First)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-3xl border border-white/5 shadow-2xl">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for your message! \n(This is a demo contact form)"); }}>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold">Your Name</label>
                <Input id="name" placeholder="John Doe" className="bg-background/50 border-white/10" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold">Email Address</label>
                <Input id="email" type="email" placeholder="john@example.com" className="bg-background/50 border-white/10" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold">Message</label>
                <Textarea id="message" placeholder="How can we help?" className="min-h-[120px] bg-background/50 border-white/10 resize-none" required />
              </div>
              
              <Button type="submit" className="w-full btn-primary h-12 text-lg rounded-xl font-bold">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
