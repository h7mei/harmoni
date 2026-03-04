import { useState } from "react";
import { observer } from "mobx-react-lite";
import { LogOut, ChevronUp, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils.js";
import { Button } from "@/components/ui/button.js";
import { Separator } from "@/components/ui/separator.js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.js";
import type { AuthStore } from "@/stores/AuthStore.js";

const navMain = [{ title: "Todos", icon: ListTodo }];

export const AppSidebar = observer(function AppSidebar({
  authStore,
  view,
  onViewChange,
}: {
  authStore: AuthStore;
  view: "todos";
  onViewChange: (v: "todos") => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const user = authStore.user;
  const initial = user?.name?.slice(0, 2).toUpperCase() ?? "U";
  const email = user?.email ?? "";

  return (
    <aside className="flex h-svh w-16 flex-col border-r border-border bg-card md:w-64">
      {/* Logo / brand */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
          H
        </div>
        <span className="hidden font-semibold md:inline">Harmoni</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-auto p-2">
        <div className="space-y-1">
          {navMain.map((item) => {
            const navView = item.title === "Todos" ? "todos" : null;
            const isActive = navView !== null && view === navView;
            return (
              <Button
                key={item.title}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-accent text-accent-foreground"
                )}
                onClick={() => navView && onViewChange(navView)}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">{item.title}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      <Separator />

      {/* User & sign out */}
      <div className="flex flex-col gap-1 p-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setUserMenuOpen((o) => !o)}
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{initial}</AvatarFallback>
            </Avatar>
            <span className="hidden flex-1 truncate text-left md:inline">{email}</span>
            <ChevronUp className={cn("h-4 w-4 shrink-0 transition-transform", userMenuOpen && "rotate-180")} />
          </Button>
          {userMenuOpen && (
            <>
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-md border border-border bg-popover p-1 shadow-md">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    authStore.clearAuth();
                    setUserMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
              <div
                className="fixed inset-0 z-[-1]"
                aria-hidden
                onClick={() => setUserMenuOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
});

