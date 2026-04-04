"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { setUser } from "./authSlice";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        dispatch(setUser(data.user));
      })
      .catch(() => {
        // Not logged in — nothing to do
      });
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthInitializer>
    </Provider>
  );
}
