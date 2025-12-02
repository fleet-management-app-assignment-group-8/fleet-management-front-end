import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Loader } from './ui/loader';
import { Alert, AlertDescription } from './ui/alert';
import { scheduleService } from '@/services/api';
import type { DriverSchedule, DriverScheduleFormState, ScheduleStatus } from '@/types';
import { 
  Plus, 
  AlertCircle,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle
} from 'lucide-react';

export function DriverScheduleManagement() {
  const [schedules, setSchedules] = useState<DriverSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ScheduleStatus | 'all'>('all');

  const [newSchedule, setNewSchedule] = useState<DriverScheduleFormState>({
    driverId: '',
    route: '',
    status: 'pending',
    vehicleId: undefined,
    startTime: '',
    endTime: ''
  });

  // Fetch all schedules on component mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await scheduleService.getAll();
      if (response.success && response.data) {
        setSchedules(response.data);
      } else {
        setError(response.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching schedules');
      console.error('Error fetching schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await scheduleService.create(newSchedule);
      if (response.success) {
        await fetchSchedules();
        setIsAddDialogOpen(false);
        setNewSchedule({
          driverId: '',
          route: '',
          status: 'pending',
          vehicleId: undefined,
          startTime: '',
          endTime: ''
        });
      } else {
        setError(response.error || 'Failed to create schedule');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating schedule');
      console.error('Error creating schedule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (scheduleId: number, newStatus: ScheduleStatus) => {
    try {
      const response = await scheduleService.update(scheduleId, { status: newStatus });
      if (response.success) {
        await fetchSchedules();
      } else {
        setError(response.error || 'Failed to update schedule status');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating schedule');
      console.error('Error updating schedule:', err);
    }
  };

  const getStatusBadge = (status: ScheduleStatus) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      active: { label: 'Active', variant: 'default' as const, icon: PlayCircle },
      completed: { label: 'Completed', variant: 'outline' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredSchedules = filterStatus === 'all' 
    ? schedules 
    : schedules.filter(s => s.status === filterStatus);

  const stats = scheduleService.getStatistics(schedules);

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Driver Schedules</h2>
          <p className="text-muted-foreground">Manage driver assignments and routes</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Total Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.byStatus.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-green-600" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.byStatus.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.byStatus.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="statusFilter" className="whitespace-nowrap">Filter by Status:</Label>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as ScheduleStatus | 'all')}>
              <SelectTrigger id="statusFilter" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schedules</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredSchedules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
            <p className="text-muted-foreground mb-4">
              {filterStatus === 'all' 
                ? 'Start by creating your first driver schedule' 
                : `No ${filterStatus} schedules found`}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedules Table */}
      {!isLoading && filteredSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schedule ID</TableHead>
                  <TableHead>Driver ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => {
                  const formatDateTime = (dateStr: string | undefined) => {
                    if (!dateStr) return 'Not set';
                    try {
                      const date = new Date(dateStr);
                      return date.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch {
                      return dateStr;
                    }
                  };

                  return (
                  <TableRow key={schedule.scheduleId}>
                    <TableCell className="font-medium">#{schedule.scheduleId}</TableCell>
                    <TableCell>{schedule.driverId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {schedule.route}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(schedule.startTime)}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(schedule.endTime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {schedule.vehicleId || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {schedule.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(schedule.scheduleId!, 'active')}
                          >
                            Start
                          </Button>
                        )}
                        {schedule.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(schedule.scheduleId!, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Assign a driver to a route
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driverId">Driver ID</Label>
              <Input
                id="driverId"
                value={newSchedule.driverId}
                onChange={(e) => setNewSchedule({ ...newSchedule, driverId: e.target.value })}
                placeholder="D001"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Input
                id="route"
                value={newSchedule.route}
                onChange={(e) => setNewSchedule({ ...newSchedule, route: e.target.value })}
                placeholder="Downtown to Airport"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle ID (Optional)</Label>
              <Input
                id="vehicleId"
                value={newSchedule.vehicleId || ''}
                onChange={(e) => setNewSchedule({ ...newSchedule, vehicleId: e.target.value || undefined })}
                placeholder="VH-001"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newSchedule.status} 
                onValueChange={(value) => setNewSchedule({ ...newSchedule, status: value as ScheduleStatus })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSchedule}
              disabled={isSubmitting || !newSchedule.driverId || !newSchedule.route}
            >
              {isSubmitting ? 'Creating...' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

