import React from 'react';
import { Badge } from './ui/badge';
import { Shield, ShieldAlert, User } from 'lucide-react';
import { cn } from './ui/utils';

interface RoleBadgeProps {
  role: string;
  className?: string;
  showIcon?: boolean;
}

export function RoleBadge({ role, className, showIcon = true }: RoleBadgeProps) {
  const normalizedRole = role.toLowerCase();
  
  const getRoleConfig = () => {
    switch (normalizedRole) {
      case 'admin':
      case 'fleet-admin':
        return {
          label: 'Admin',
          variant: 'destructive' as const, // Use destructive variant for strong contrast
          icon: ShieldAlert,
          className: '!bg-indigo-600 hover:!bg-indigo-700 !text-white !border-indigo-700'
        };
      case 'employee':
      case 'fleet-employee':
        return {
          label: 'Employee',
          variant: 'secondary' as const,
          icon: User,
          className: 'bg-slate-200 text-slate-800 hover:bg-slate-300'
        };
      default:
        return {
          label: role,
          variant: 'outline' as const,
          icon: Shield,
          className: ''
        };
    }
  };

  const config = getRoleConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn("gap-1.5 px-2 py-0.5 font-medium transition-colors !text-white", config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3 !text-white" />}
      <span className="capitalize !text-white">{config.label}</span>
    </Badge>
  );
}

