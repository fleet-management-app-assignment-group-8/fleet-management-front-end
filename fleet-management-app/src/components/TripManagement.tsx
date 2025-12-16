// Performance optimization: Added useMemo for expensive filtering
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  Route, 
  CheckCircle,
  AlertCircle,
  Navigation,
  Calendar
} from 'lucide-react';

export function TripManagement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const trips = [
    {
      id: 'T001',
      vehicle: 'VH-0123',
      driver: 'John Smith',
      status: 'in_progress',
      startLocation: 'Warehouse A, Downtown',
      endLocation: 'Customer Site, Uptown',
      startTime: '08:30 AM',
      estimatedArrival: '10:45 AM',
      actualDistance: '24.5 km',
      estimatedDistance: '26.2 km',
      progress: 75,
      priority: 'high'
    },
    {
      id: 'T002',
      vehicle: 'VH-0456',
      driver: 'Sarah Johnson',
      status: 'completed',
      startLocation: 'Depot B, West Side',
      endLocation: 'Distribution Center',
      startTime: '06:00 AM',
      estimatedArrival: '08:15 AM',
      actualDistance: '45.8 km',
      estimatedDistance: '47.1 km',
      progress: 100,
      priority: 'normal'
    },
    {
      id: 'T003',
      vehicle: 'VH-0789',
      driver: 'Mike Wilson',
      status: 'scheduled',
      startLocation: 'Service Center',
      endLocation: 'Client Office, North',
      startTime: '02:00 PM',
      estimatedArrival: '04:30 PM',
      actualDistance: '0 km',
      estimatedDistance: '38.7 km',
      progress: 0,
      priority: 'normal'
    },
    {
      id: 'T004',
      vehicle: 'VH-0321',
      driver: 'Emma Davis',
      status: 'delayed',
      startLocation: 'Factory, Industrial',
      endLocation: 'Port Terminal',
      startTime: '11:00 AM',
      estimatedArrival: '01:15 PM',
      actualDistance: '18.2 km',
      estimatedDistance: '32.4 km',
      progress: 45,
      priority: 'urgent'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_progress: { label: 'In Progress', variant: 'default' as const, icon: Navigation },
      completed: { label: 'Completed', variant: 'secondary' as const, icon: CheckCircle },
      scheduled: { label: 'Scheduled', variant: 'outline' as const, icon: Clock },
      delayed: { label: 'Delayed', variant: 'destructive' as const, icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      urgent: { label: 'Urgent', className: 'bg-red-100 text-red-800 border-red-200' },
      high: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      normal: { label: 'Normal', className: 'bg-green-100 text-green-800 border-green-200' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Performance optimization: Memoize filtered trips
  // Only recalculate when dependencies change
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const matchesSearch = trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trip.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trip.driver.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [trips, searchQuery, statusFilter]);

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Trip Management ( ToDo )</h2>
          <p className="text-muted-foreground">Monitor and manage fleet trips and routes</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button 
                  className="gap-2"
                  disabled={user?.role !== 'admin'}
                >
                  <Plus className="h-4 w-4" />
                  Schedule Trip
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user?.role !== 'admin' ? "Admin access required" : "Schedule new trip"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trip List */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">{trip.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {trip.vehicle} • {trip.driver}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(trip.status)}
                    {getPriorityBadge(trip.priority)}
                  </div>
                </div>
                {/* <Button variant="outline" size="sm" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Track Live
                </Button> */}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">From</p>
                      <p className="text-sm text-muted-foreground">{trip.startLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">To</p>
                      <p className="text-sm text-muted-foreground">{trip.endLocation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start Time:</span>
                    <p className="font-medium">{trip.startTime}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ETA:</span>
                    <p className="font-medium">{trip.estimatedArrival}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Distance:</span>
                    <p className="font-medium">{trip.actualDistance || trip.estimatedDistance}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progress:</span>
                    <p className="font-medium">{trip.progress}%</p>
                  </div>
                </div>
              </div>

              {trip.status === 'in_progress' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Trip Progress</span>
                    <span>{trip.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trip.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="gap-2">
                  <Route className="h-4 w-4" />
                  View Route
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Trip Details
                </Button>
                {trip.status === 'scheduled' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={user?.role !== 'admin'}
                          >
                            Edit Trip
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user?.role !== 'admin' ? "Admin access required" : "Edit trip"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}