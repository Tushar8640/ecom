"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.status === 401) {
        router.push("/login?callbackUrl=/messages");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send message");
        return;
      }
      toast.success("Message sent!");
      setSubject("");
      setMessage("");
      setDialogOpen(false);
      fetchMessages();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-24" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> New Message</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send a Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msg">Message</Label>
                <Textarea
                  id="msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Message
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 space-y-4">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages"
            description="Send a message to contact our support team."
          />
        ) : (
          messages.map((msg) => (
            <Card key={msg.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{msg.subject}</CardTitle>
                  <Badge
                    variant="secondary"
                    className={
                      msg.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  >
                    {msg.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{msg.message}</p>
                {msg.adminReply && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Admin Reply</p>
                    <p className="text-sm">{msg.adminReply}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
