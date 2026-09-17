import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarCheck,
  BookOpen,
  MessagesSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/" as const,
    icon: LayoutDashboard,
    description: "Overview of every assistant in one place.",
  },
  {
    title: "Email Generator",
    url: "/email" as const,
    icon: Mail,
    description: "Turn a few notes into a ready-to-send email in your chosen tone.",
  },
  {
    title: "Meeting Summarizer",
    url: "/meetings" as const,
    icon: FileText,
    description: "Paste rough notes and get a summary, actions, decisions and deadlines.",
  },
  {
    title: "Task Planner",
    url: "/planner" as const,
    icon: CalendarCheck,
    description: "Build a prioritised daily or weekly schedule from your task list.",
  },
  {
    title: "Research Assistant",
    url: "/research" as const,
    icon: BookOpen,
    description: "Structure a topic or link into insights and recommendations.",
  },
  {
    title: "AI Chat",
    url: "/chat" as const,
    icon: MessagesSquare,
    description: "Think out loud with a conversational assistant.",
  },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            AI
          </span>
          <span className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              Workplace Assistant
            </span>
            <span className="truncate text-xs text-muted-foreground">Prototype demo</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <p className="px-1 py-1 text-xs leading-relaxed text-muted-foreground group-data-[collapsible=icon]:hidden">
          Demo only. Nothing you type is saved or sent anywhere.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
