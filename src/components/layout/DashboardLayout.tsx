import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart3, Users, Map, Upload, Settings, Vote, AlertTriangle, LogOut } from 'lucide-react';
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
  SidebarFooter,
} from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dasbor', icon: Home },
  { id: 'vote-results', label: 'Hasil Perolehan Suara', icon: Vote },
  { id: 'engagement-form', label: 'Input Engagement', icon: Users },
  { id: 'activity-master', label: 'Master Kegiatan', icon: Settings }, // Using Settings icon for now or List
  { id: 'map-analytics', label: 'Peta & Analitik', icon: Map },
  { id: 'prioritization', label: 'Rekomendasi', icon: AlertTriangle },
  { id: 'data-import', label: 'Import Data', icon: Upload },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current page from path (e.g., "/dashboard" -> "dashboard")
  const currentPage = location.pathname.substring(1) || 'dashboard';

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

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
                        onClick={() => navigate(`/${item.id}`)}
                        isActive={currentPage === item.id}
                        className={currentPage === item.id 
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2 font-medium" 
                          : "pl-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"}
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
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-gray-900 font-medium">
            {navigationItems.find((item) => item.id === currentPage)?.label || 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                   <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.role || 'user'}</p>
                   </div>
                   <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
