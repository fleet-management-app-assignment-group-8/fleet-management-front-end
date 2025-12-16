import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RoleBadge } from './RoleBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
  onLogout: () => void;
  onProfileClick: () => void;
}

export function Header({ user, onLogout, onProfileClick }: HeaderProps) {
  const [notifications] = useState([
    { id: 0, message: 'Notification feature is not implemented yet', time: 'N/A', unread: false },
    { id: 1, message: 'Vehicle VH-0123 maintenance due', time: '5m ago', unread: true },
    { id: 2, message: 'New driver registration: Sarah Wilson', time: '1h ago', unread: true },
    { id: 3, message: 'Fuel alert for VH-0456', time: '2h ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4">
      {/* Global Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vehicles, drivers, or routes..."
            className="pl-9 bg-input-background"
          />
        </div>
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
              <div className="flex items-start gap-2 w-full">
                {notification.unread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Profile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium">{user.name}</p>
              <div className="flex justify-end mt-0.5">
                <RoleBadge role={user.role} className="text-[10px] h-5 px-1.5" />
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onProfileClick}>
            <User className="mr-2 h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
