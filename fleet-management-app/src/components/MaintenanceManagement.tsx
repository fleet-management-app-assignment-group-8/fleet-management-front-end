'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench,
  DollarSign,
  Loader2,
  RefreshCw,
  Edit,
  Trash2,
  Filter,
  X
} from 'lucide-react';
import { maintenanceService } from '@/services/api';
import type { MaintenanceItem, MaintenanceStatus, Priority, MaintenancePart } from '@/types';
import type { MaintenanceCreateData, MaintenanceUpdateData } from '@/services/api/maintenanceService';
import { useToast } from '@/hooks/use-toast';

export function MaintenanceManagement() {
  const { toast } = useToast();
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<any>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<MaintenanceCreateData>>({
    id: '',
    vehicle_id: '',
    type: '',
    description: '',
    status: 'scheduled',
    priority: 'medium',
    due_date: '',
    current_mileage: 0,
    due_mileage: 0,
    estimated_cost: 0,
    assigned_to: '',
    assigned_technician: '',
    notes: '',
    parts_needed: [],
  });

  // Fetch maintenance items
  const fetchMaintenanceItems = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;

      const response = await maintenanceService.getAll(filters, currentPage, 10);
      
      if (response.success && response.data) {
        setMaintenanceItems(response.data.items);
        setTotalPages(response.data.pages);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch maintenance items',
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

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await maintenanceService.getSummary();
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  useEffect(() => {
    fetchMaintenanceItems();
    fetchSummary();
  }, [currentPage, statusFilter, priorityFilter]);

  // Handle form submission for creating new item
  const handleCreate = async () => {
    try {
      if (!formData.id || !formData.vehicle_id || !formData.type || !formData.due_date) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const response = await maintenanceService.create(formData as MaintenanceCreateData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Maintenance item created successfully',
        });
        setIsAddDialogOpen(false);
        resetForm();
        fetchMaintenanceItems();
        fetchSummary();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create maintenance item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create maintenance item',
        variant: 'destructive',
      });
    }
  };

  // Handle form submission for updating item
  const handleUpdate = async () => {
    if (!selectedItem) return;

    try {
      const updateData: MaintenanceUpdateData = {
        type: formData.type,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date,
        current_mileage: formData.current_mileage,
        due_mileage: formData.due_mileage,
        estimated_cost: formData.estimated_cost,
        assigned_to: formData.assigned_to,
        assigned_technician: formData.assigned_technician,
        notes: formData.notes,
        parts_needed: formData.parts_needed,
      };

      const response = await maintenanceService.update(selectedItem.id, updateData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Maintenance item updated successfully',
        });
        setIsEditDialogOpen(false);
        setSelectedItem(null);
        resetForm();
        fetchMaintenanceItems();
        fetchSummary();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update maintenance item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update maintenance item',
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance item?')) return;

    try {
      const response = await maintenanceService.delete(itemId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Maintenance item deleted successfully',
        });
        fetchMaintenanceItems();
        fetchSummary();
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete maintenance item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete maintenance item',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      vehicle_id: '',
      type: '',
      description: '',
      status: 'scheduled',
      priority: 'medium',
      due_date: '',
      current_mileage: 0,
      due_mileage: 0,
      estimated_cost: 0,
      assigned_to: '',
      assigned_technician: '',
      notes: '',
      parts_needed: [],
    });
  };

  const openEditDialog = (item: MaintenanceItem) => {
    setSelectedItem(item);
    setFormData({
      id: item.id,
      vehicle_id: item.vehicle_id,
      type: item.type,
      description: item.description || '',
      status: item.status,
      priority: item.priority,
      due_date: item.due_date,
      current_mileage: item.current_mileage,
      due_mileage: item.due_mileage,
      estimated_cost: item.estimated_cost || 0,
      assigned_to: item.assigned_to || '',
      assigned_technician: item.assigned_technician || '',
      notes: item.notes || '',
      parts_needed: item.parts_needed || [],
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const statusConfig = {
      overdue: { label: 'Overdue', variant: 'destructive' as const, icon: AlertTriangle },
      due_soon: { label: 'Due Soon', variant: 'secondary' as const, icon: Clock },
      scheduled: { label: 'Scheduled', variant: 'outline' as const, icon: Calendar },
      in_progress: { label: 'In Progress', variant: 'default' as const, icon: Wrench },
      completed: { label: 'Completed', variant: 'secondary' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelled', variant: 'outline' as const, icon: X }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical': return 'text-red-700 font-bold';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getMileageProgress = (current: number, due: number) => {
    return Math.min((current / due) * 100, 100);
  };

  const upcomingCount = summary?.overdue_count + summary?.due_soon_count || 0;
  const inProgressCount = summary?.by_status?.in_progress || 0;
  const totalCost = summary?.total_estimated_cost || 0;

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Maintenance Management</h2>
          <p className="text-muted-foreground">Track and manage vehicle maintenance schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchMaintenanceItems(); fetchSummary(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Maintenance</DialogTitle>
                <DialogDescription>
                  Add a new maintenance item to the schedule
                </DialogDescription>
              </DialogHeader>
              <MaintenanceForm formData={formData} setFormData={setFormData} />
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={!formData.id || !formData.vehicle_id || !formData.type || !formData.due_date || loading}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingCount}</div>
              <p className="text-xs text-muted-foreground">Items due soon or overdue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Wrench className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground">Currently being serviced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Costs</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total estimated budget</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="due_soon">Due Soon</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Priority</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Maintenance Items */}
      {!loading && maintenanceItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No maintenance items found. Create one to get started.
          </CardContent>
        </Card>
      )}

      {!loading && maintenanceItems.length > 0 && (
        <div className="space-y-4">
          {maintenanceItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-lg">{item.type}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {item.vehicle_id} • {item.id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(item.status)}
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority} Priority
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${item.estimated_cost?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <p className="font-medium">{new Date(item.due_date).toLocaleDateString()}</p>
                  </div>
                  {item.assigned_to && (
                    <div>
                      <span className="text-muted-foreground">Assigned To:</span>
                      <p className="font-medium">{item.assigned_to}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Current Mileage:</span>
                    <p className="font-medium">{item.current_mileage.toLocaleString()} km</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Mileage Progress</span>
                    <span>{item.current_mileage.toLocaleString()} / {item.due_mileage.toLocaleString()} km</span>
                  </div>
                  <Progress 
                    value={getMileageProgress(item.current_mileage, item.due_mileage)} 
                    className="h-2"
                  />
                </div>

                {item.parts_needed && item.parts_needed.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground block mb-2">Parts Needed:</span>
                    <div className="grid gap-2">
                      {item.parts_needed.map((part, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-muted/50 p-2 rounded text-sm">
                          <span>{part.name}</span>
                          <Badge variant="secondary">Qty: {part.quantity}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Notes:</span>
                    <p className="text-sm mt-1">{item.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Item</DialogTitle>
            <DialogDescription>
              Update maintenance item details
            </DialogDescription>
          </DialogHeader>
          <MaintenanceForm formData={formData} setFormData={setFormData} isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedItem(null); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={!formData.id || !formData.vehicle_id || !formData.type || !formData.due_date || loading}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Separate form component for reusability
function MaintenanceForm({ 
  formData, 
  setFormData, 
  isEdit = false 
}: { 
  formData: Partial<MaintenanceCreateData>; 
  setFormData: React.Dispatch<React.SetStateAction<Partial<MaintenanceCreateData>>>; 
  isEdit?: boolean;
}) {
  const addPart = () => {
    const newPart: MaintenancePart = { part_id: `NEW-${Date.now()}`, name: '', quantity: 1 };
    setFormData({
      ...formData,
      parts_needed: [...(formData.parts_needed || []), newPart]
    });
  };

  const removePart = (index: number) => {
    const newParts = [...(formData.parts_needed || [])];
    newParts.splice(index, 1);
    setFormData({ ...formData, parts_needed: newParts });
  };

  const updatePart = (index: number, field: keyof MaintenancePart, value: any) => {
    const newParts = [...(formData.parts_needed || [])];
    newParts[index] = { ...newParts[index], [field]: value };
    setFormData({ ...formData, parts_needed: newParts });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id">Maintenance ID *</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="M001"
            disabled={isEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicle_id">Vehicle ID *</Label>
          <Input
            id="vehicle_id"
            value={formData.vehicle_id}
            onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
            placeholder="VH-001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Maintenance Type *</Label>
        <Input
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          placeholder="Oil Change, Brake Inspection, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the maintenance work"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="due_soon">Due Soon</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date *</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current_mileage">Current Mileage (km) *</Label>
          <Input
            id="current_mileage"
            type="number"
            value={formData.current_mileage}
            onChange={(e) => setFormData({ ...formData, current_mileage: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_mileage">Due Mileage (km) *</Label>
          <Input
            id="due_mileage"
            type="number"
            value={formData.due_mileage}
            onChange={(e) => setFormData({ ...formData, due_mileage: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
        <Input
          id="estimated_cost"
          type="number"
          step="0.01"
          value={formData.estimated_cost}
          onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assigned To</Label>
          <Input
            id="assigned_to"
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            placeholder="Service Center A"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigned_technician">Assigned Technician</Label>
          <Input
            id="assigned_technician"
            value={formData.assigned_technician}
            onChange={(e) => setFormData({ ...formData, assigned_technician: e.target.value })}
            placeholder="John Doe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Parts Needed</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addPart}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Part
          </Button>
        </div>
        
        <div className="space-y-2 border rounded-md p-4 bg-muted/10">
          {formData.parts_needed?.map((part, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs mb-1 block">Part Name</Label>
                <Input 
                  value={part.name} 
                  onChange={(e) => updatePart(index, 'name', e.target.value)}
                  placeholder="Part Name"
                />
              </div>
              <div className="w-24">
                <Label className="text-xs mb-1 block">Quantity</Label>
                <Input 
                  type="number" 
                  value={part.quantity} 
                  onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 mb-[2px]"
                onClick={() => removePart(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {(!formData.parts_needed || formData.parts_needed.length === 0) && (
            <p className="text-sm text-muted-foreground italic text-center py-2">No parts added yet.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or special instructions"
          rows={3}
        />
      </div>
    </div>
  );
}
