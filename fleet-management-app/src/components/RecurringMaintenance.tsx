'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Plus,
  Calendar,
  Repeat,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  Pause,
  Play,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { maintenanceService, type RecurringSchedule, type RecurringScheduleCreateData, type RecurringScheduleUpdateData } from '@/services/api/maintenanceService';

export function RecurringMaintenance() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<RecurringSchedule | null>(null);
  const [formData, setFormData] = useState<Partial<RecurringSchedule>>({
    name: '',
    vehicle_id: '',
    maintenance_type: '',
    description: '',
    frequency: 'monthly',
    frequency_value: 1,
    estimated_cost: 0,
    estimated_duration: 0,
    assigned_to: '',
    is_active: true,
  });

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await maintenanceService.getRecurringSchedules();
      if (response.success && response.data) {
        setSchedules(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch recurring schedules',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to maintenance service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const activeSchedules = schedules.filter(s => s.is_active);
  const pausedSchedules = schedules.filter(s => !s.is_active);
  const upcomingThisMonth = schedules.filter(s => {
    if (!s.next_scheduled || !s.is_active) return false;
    const next = new Date(s.next_scheduled);
    const now = new Date();
    return next.getMonth() === now.getMonth() && next.getFullYear() === now.getFullYear();
  });

  const handleAddSchedule = async () => {
    if (!formData.name || !formData.vehicle_id || !formData.maintenance_type || !formData.frequency) {
        toast({
            title: 'Validation Error',
            description: 'Please fill in all required fields',
            variant: 'destructive',
        });
        return;
    }

    try {
      const createData: RecurringScheduleCreateData = {
        name: formData.name,
        vehicle_id: formData.vehicle_id,
        maintenance_type: formData.maintenance_type,
        description: formData.description,
        frequency: formData.frequency,
        frequency_value: formData.frequency_value || 1,
        estimated_cost: formData.estimated_cost,
        estimated_duration: formData.estimated_duration,
        assigned_to: formData.assigned_to,
        is_active: formData.is_active,
      };

      const response = await maintenanceService.createRecurringSchedule(createData);
      
      if (response.success && response.data) {
        setSchedules([...schedules, response.data]);
        setIsAddDialogOpen(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Recurring schedule created successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create schedule',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create schedule',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      const updateData: RecurringScheduleUpdateData = {
        name: formData.name,
        description: formData.description,
        frequency: formData.frequency,
        frequency_value: formData.frequency_value,
        estimated_cost: formData.estimated_cost,
        estimated_duration: formData.estimated_duration,
        assigned_to: formData.assigned_to,
        is_active: formData.is_active,
      };

      const response = await maintenanceService.updateRecurringSchedule(selectedSchedule.id, updateData);
      
      if (response.success && response.data) {
        setSchedules(schedules.map(schedule => 
          schedule.id === selectedSchedule.id ? response.data : schedule
        ));
        setSelectedSchedule(null);
        resetForm();
        toast({
          title: 'Success',
          description: 'Schedule updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update schedule',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this recurring schedule?')) return;
    
    try {
      const response = await maintenanceService.deleteRecurringSchedule(scheduleId);
      
      if (response.success) {
        setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
        toast({
          title: 'Success',
          description: 'Recurring schedule deleted',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete schedule',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  const toggleScheduleStatus = async (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    try {
      const newStatus = !schedule.is_active;
      const response = await maintenanceService.updateRecurringSchedule(scheduleId, { is_active: newStatus });
      
      if (response.success && response.data) {
        setSchedules(schedules.map(s => s.id === scheduleId ? response.data : s));
        toast({
          title: 'Success',
          description: `Schedule ${newStatus ? 'activated' : 'paused'}`,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      vehicle_id: '',
      maintenance_type: '',
      description: '',
      frequency: 'monthly',
      frequency_value: 1,
      estimated_cost: 0,
      estimated_duration: 0,
      assigned_to: '',
      is_active: true,
    });
  };

  const openEditDialog = (schedule: RecurringSchedule) => {
    setSelectedSchedule(schedule);
    setFormData(schedule);
  };

  const getFrequencyLabel = (schedule: RecurringSchedule) => {
    if (schedule.frequency === 'mileage-based') {
      return `Every ${schedule.frequency_value?.toLocaleString() || 0} km`;
    }
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return schedule.frequency_value === 1 
      ? labels[schedule.frequency]
      : `Every ${schedule.frequency_value} ${schedule.frequency.replace('ly', '')}s`;
  };

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
          <h2 className="text-2xl font-semibold">Recurring Maintenance</h2>
          <p className="text-muted-foreground">Manage automated maintenance schedules</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSchedules}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Schedule
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle>Create Recurring Schedule</DialogTitle>
                <DialogDescription>Set up automated maintenance scheduling</DialogDescription>
                </DialogHeader>
                <RecurringScheduleForm formData={formData} setFormData={setFormData} />
                <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                    Cancel
                </Button>
                <Button 
                  onClick={handleAddSchedule}
                  disabled={!formData.name || !formData.vehicle_id || !formData.maintenance_type || !formData.frequency}
                >
                  Create Schedule
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Repeat className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground">{activeSchedules.length} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{upcomingThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled executions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schedules.reduce((sum, s) => sum + s.total_executions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">All-time completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Monthly Cost</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeSchedules
                .filter(s => s.frequency === 'monthly' || s.frequency === 'weekly')
                .reduce((sum, s) => {
                  const monthlyMultiplier = s.frequency === 'weekly' ? 4 : 1;
                  return sum + (s.estimated_cost * monthlyMultiplier / s.frequency_value);
                }, 0)
                .toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Recurring costs</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.length === 0 && (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    No recurring schedules found. Create one to automate maintenance planning.
                </CardContent>
            </Card>
        )}
        {schedules.map(schedule => (
          <Card key={schedule.id} className={!schedule.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Repeat className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{schedule.name}</CardTitle>
                      {schedule.is_active ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Paused</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {schedule.vehicle_id} • {schedule.id} • {getFrequencyLabel(schedule)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">${schedule.estimated_cost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{schedule.estimated_duration}h duration</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleScheduleStatus(schedule.id)}
                    >
                      {schedule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(schedule)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {schedule.description && (
                <p className="text-sm text-muted-foreground mb-4">{schedule.description}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{schedule.maintenance_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned To:</span>
                  <p className="font-medium">{schedule.assigned_to}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Executed:</span>
                  <p className="font-medium">
                    {schedule.last_executed ? new Date(schedule.last_executed).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Scheduled:</span>
                  <p className="font-medium">
                    {schedule.next_scheduled ? new Date(schedule.next_scheduled).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Executions: </span>
                    <span className="font-medium">{schedule.total_executions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created: </span>
                    <span className="font-medium">{schedule.created_date ? new Date(schedule.created_date).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={selectedSchedule !== null} onOpenChange={(open) => !open && setSelectedSchedule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Recurring Schedule</DialogTitle>
            <DialogDescription>Update schedule details</DialogDescription>
          </DialogHeader>
          <RecurringScheduleForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedSchedule(null); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSchedule}
              disabled={!formData.name || !formData.vehicle_id || !formData.maintenance_type || !formData.frequency}
            >
              Update Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecurringScheduleForm({ 
  formData, 
  setFormData 
}: { 
  formData: Partial<RecurringSchedule>; 
  setFormData: React.Dispatch<React.SetStateAction<Partial<RecurringSchedule>>>; 
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Schedule Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Monthly Oil Change - VH-001"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleId">Vehicle ID *</Label>
          <Input
            id="vehicleId"
            value={formData.vehicle_id}
            onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
            placeholder="VH-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maintenanceType">Maintenance Type *</Label>
          <Input
            id="maintenanceType"
            value={formData.maintenance_type}
            onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
            placeholder="Oil Change"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency *</Label>
          <Select 
            value={formData.frequency} 
            onValueChange={(value: RecurringSchedule['frequency']) => setFormData({ ...formData, frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="mileage-based">Mileage-Based</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequencyValue">
            {formData.frequency === 'mileage-based' ? 'Mileage Interval (km)' : 'Interval'} *
          </Label>
          <Input
            id="frequencyValue"
            type="number"
            value={formData.frequency_value}
            onChange={(e) => setFormData({ ...formData, frequency_value: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Estimated Cost ($) *</Label>
          <Input
            id="estimatedCost"
            type="number"
            step="0.01"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDuration">Duration (hours) *</Label>
          <Input
            id="estimatedDuration"
            type="number"
            step="0.25"
            value={formData.estimated_duration}
            onChange={(e) => setFormData({ ...formData, estimated_duration: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assigned To</Label>
        <Input
          id="assignedTo"
          value={formData.assigned_to}
          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
          placeholder="Service Center A"
        />
      </div>

      {formData.id && (
        <div className="space-y-2">
          <Label htmlFor="nextScheduled">Next Scheduled Date</Label>
          <Input
            id="nextScheduled"
            type="datetime-local"
            value={formData.next_scheduled ? new Date(formData.next_scheduled).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFormData({ ...formData, next_scheduled: new Date(e.target.value).toISOString() })}
          />
          <p className="text-xs text-muted-foreground">Override the automatically calculated next execution date</p>
        </div>
      )}
    </div>
  );
}
