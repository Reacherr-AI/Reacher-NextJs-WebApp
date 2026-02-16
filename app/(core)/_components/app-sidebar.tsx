'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, BookOpen, LayoutDashboard, Phone } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavUser } from './nav-user';

const navItems = [
  {
    href: '/agents',
    label: 'Agents',
    icon: LayoutDashboard,
  },
  {
    href: '/knowledge-base',
    label: 'Knowledge Base',
    icon: BookOpen,
  },
  {
    href: '/phone-numbers',
    label: 'Phone Numbers',
    icon: Phone,
  },
] as const;

type SidebarUser = {
  username?: string;
  email?: string;
  userId?: string;
};

export function AppSidebar({ user }: { user?: SidebarUser }) {
  const pathname = usePathname();

  const name = user?.username || user?.email || 'Account';
  const email = user?.email || (user?.userId ? `ID: ${user.userId}` : 'Signed in');

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Bot className="size-4" />
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-tight">Reacherr</p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              Agent Console
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mx-0 w-full" />
        <NavUser user={{ name, email }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
