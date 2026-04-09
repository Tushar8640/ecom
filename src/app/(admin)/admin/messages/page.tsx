"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/admin/messages${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, [filter]);

  const handleReply = async () => {
    if (!selected || !reply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/admin/messages/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: reply.trim() }),
      });
      if (res.ok) {
        toast.success("Reply sent");
        setSelected(null);
        setReply("");
        fetchMessages();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send reply");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-gray-500">View and reply to customer messages</p>
      </div>

      <Select value={filter} onValueChange={(v) => setFilter(v ?? "all")}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Messages</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">No messages found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{msg.subject}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      From: {msg.user.name} ({msg.user.email}) · {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={msg.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}
                  >
                    {msg.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{msg.message}</p>
                {msg.adminReply && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Your Reply</p>
                    <p className="text-sm">{msg.adminReply}</p>
                  </div>
                )}
                {msg.status === "OPEN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelected(msg); setReply(msg.adminReply || ""); }}
                  >
                    Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{selected.subject}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selected.message}</p>
              </div>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleReply} disabled={sending}>
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
