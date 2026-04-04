"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Have a question or feedback? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: "Email",
              detail: "support@shopnest.com",
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: Phone,
              title: "Phone",
              detail: "+1 (555) 123-4567",
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              icon: MapPin,
              title: "Address",
              detail: "123 Commerce St, San Francisco, CA 94102",
              color: "bg-violet-50 text-violet-600",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className={`rounded-lg p-2.5 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="How can we help?" required />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Tell us more..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
