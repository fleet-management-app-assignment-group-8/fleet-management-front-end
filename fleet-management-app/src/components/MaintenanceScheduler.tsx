'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { maintenanceService } from '@/services/api';
import type { MaintenanceItem, MaintenanceStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DaySchedule {
  date: Date;
  items: MaintenanceItem[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export function MaintenanceScheduler() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allItems, setAllItems] = useState<MaintenanceItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<MaintenanceItem[]>([]);
  const [overdueItems, setOverdueItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchMaintenanceData = async () => {
    setLoading(true);
    try {
      // Fetch all items
      const allResponse = await maintenanceService.getAll({}, 1, 100);
      if (allResponse.success && allResponse.data) {
        setAllItems(allResponse.data.items);
      }

      // Fetch upcoming
      const upcomingResponse = await maintenanceService.getUpcoming();
      if (upcomingResponse.success && upcomingResponse.data) {
        setUpcomingItems(upcomingResponse.data);
      }

      // Fetch overdue
      const overdueResponse = await maintenanceService.getOverdue();
      if (overdueResponse.success && overdueResponse.data) {
        setOverdueItems(overdueResponse.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch maintenance schedule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const getDaysInMonth = (date: Date): DaySchedule[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DaySchedule[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: dayDate,
        items: getItemsForDate(dayDate),
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push({
        date: dayDate,
        items: getItemsForDate(dayDate),
        isToday: dayDate.getTime() === today.getTime(),
        isCurrentMonth: true,
      });
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day);
      days.push({
        date: dayDate,
        items: getItemsForDate(dayDate),
        isToday: false,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getItemsForDate = (date: Date): MaintenanceItem[] => {
    return allItems.filter(item => {
      const itemDate = new Date(item.due_date);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'due_soon': return 'bg-orange-500';
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Maintenance Scheduler</h2>
          <p className="text-muted-foreground">Calendar view of maintenance schedules</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMaintenanceData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueItems.length}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (30 days)</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingItems.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for next month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allItems.filter(item => {
                const itemDate = new Date(item.due_date);
                return itemDate.getMonth() === currentDate.getMonth() &&
                       itemDate.getFullYear() === currentDate.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Items due this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week days header */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                  ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                  ${day.isToday ? 'border-primary border-2' : ''}
                  hover:bg-accent
                `}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className={`text-sm font-medium mb-1 ${day.isToday ? 'text-primary' : day.isCurrentMonth ? '' : 'text-muted-foreground'}`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {day.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(item.status)} text-white`}
                      title={`${item.vehicle_id} - ${item.type}`}
                    >
                      {item.vehicle_id}
                    </div>
                  ))}
                  {day.items.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{day.items.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Schedule for {selectedDate.toLocaleDateString('default', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getItemsForDate(selectedDate).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No maintenance scheduled for this date
                </p>
              ) : (
                getItemsForDate(selectedDate).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{item.type}</h4>
                        <Badge variant="outline">{item.vehicle_id}</Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        {item.assigned_to && (
                          <span className="text-muted-foreground">
                            Assigned: {item.assigned_to}
                          </span>
                        )}
                        {item.estimated_cost && (
                          <span className="text-muted-foreground">
                            Cost: ${item.estimated_cost.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

