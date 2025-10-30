import React from 'react';
import { Home, BarChart3, Users, Map, Upload, Settings, Vote } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../ui/sidebar';
import { Separator } from '../ui/separator';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dasbor', icon: Home },
  { id: 'vote-results', label: 'Hasil Perolehan Suara', icon: Vote },
  { id: 'engagement-form', label: 'Input Engagement', icon: Users },
  { id: 'map-analytics', label: 'Peta & Analitik', icon: Map },
  { id: 'data-import', label: 'Import Data', icon: Upload },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export function DashboardLayout({ children, currentPage, onNavigate }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <div className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg text-gray-900">VoteTrack</h1>
                <p className="text-sm text-gray-500">Sistem Engagement</p>
              </div>
            </div>
          </div>
          <Separator />
          <SidebarGroup>
            <SidebarGroupLabel>Navigasi</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onNavigate(item.id)}
                        isActive={currentPage === item.id}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-gray-900">
            {navigationItems.find((item) => item.id === currentPage)?.label || 'Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
