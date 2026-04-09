"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCart, Package, MessageSquare } from "lucide-react";

interface AdminNotification {
  type: string;
  title: string;
  message: string;
  priority: string;
}

const iconMap: Record<string, typeof Bell> = {
  order: ShoppingCart,
  stock: Package,
  message: MessageSquare,
};

export default function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.notifications) setNotifications(data.notifications); })
      .catch(() => {});
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/10">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">All clear</div>
        ) : (
          notifications.map((n, i) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <DropdownMenuItem key={i} className="flex items-start gap-3 py-3">
                <div className={`mt-0.5 rounded-full p-1.5 ${n.priority === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
