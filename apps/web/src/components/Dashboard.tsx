import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BarChart3,
  RefreshCw,
  FileText,
  MoreHorizontal,
  Search,
  HelpCircle,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Separator } from "@/components/ui/separator.js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.js";
import { Badge } from "@/components/ui/badge.js";
import type { AuthStore } from "@/stores/AuthStore.js";

const navMain = [
  { title: "Team", icon: Users },
  { title: "Projects", icon: FolderKanban },
  { title: "Analytics", icon: BarChart3 },
  { title: "Lifecycle", icon: RefreshCw },
  { title: "Dashboard", icon: LayoutDashboard },
];

const navDocuments = [
  { title: "Data Library", icon: FileText },
  { title: "Reports", icon: FileText },
  { title: "Word Assistant", icon: FileText },
  { title: "More", icon: MoreHorizontal },
];

// Example table data
const tableRows = [
  { header: "Cover page", type: "Cover page", status: "In Process", reviewer: "Eddie Lake" },
  { header: "Table of contents", type: "Table of contents", status: "Done", reviewer: "Eddie Lake" },
  { header: "Executive summary", type: "Narrative", status: "Done", reviewer: "Eddie Lake" },
  { header: "Technical approach", type: "Narrative", status: "Done", reviewer: "Jamik Tashpulatov" },
  { header: "Design", type: "Narrative", status: "In Process", reviewer: "Jamik Tashpulatov" },
  { header: "Capabilities", type: "Narrative", status: "In Process", reviewer: "Jamik Tashpulatov" },
  { header: "Integration with existing systems", type: "Narrative", status: "In Process", reviewer: "Jamik Tashpulatov" },
  { header: "Innovation and Advantages", type: "Narrative", status: "Done", reviewer: "Assign reviewer" },
];

export const AppSidebar = observer(function AppSidebar({
  authStore,
}: {
  authStore: AuthStore;
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
          {navMain.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2",
                item.title === "Dashboard" && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline">{item.title}</span>
            </Button>
          ))}
        </div>

        <Separator className="my-2" />

        <div className="space-y-1">
          <p className="hidden px-2 text-xs font-medium text-muted-foreground md:block">Documents</p>
          {navDocuments.map((item) => (
            <Button key={item.title} variant="ghost" size="sm" className="w-full justify-start gap-2">
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline">{item.title}</span>
            </Button>
          ))}
        </div>
      </nav>

      <Separator />

      {/* Bottom: Search, Help, Settings, User */}
      <div className="flex flex-col gap-1 p-2">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden md:inline">Search</span>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span className="hidden md:inline">Get Help</span>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4 shrink-0" />
          <span className="hidden md:inline">Settings</span>
        </Button>

        <div className="relative mt-2">
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

export const DashboardContent = observer(function DashboardContent() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your workspace</p>
      </header>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">-20% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,678</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5%</div>
            <p className="text-xs text-muted-foreground">+4.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Recent documents and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Header</TableHead>
                <TableHead>Section Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={row.header}>
                  <TableCell className="font-medium">{row.header}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "Done" ? "default" : "secondary"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.reviewer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
});
