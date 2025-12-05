'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  User,
  Wrench,
  Star,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Phone,
  Mail,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { maintenanceService, type Technician, type TechnicianCreateData, type TechnicianUpdateData } from '@/services/api/maintenanceService';

export function TechnicianManagement() {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [formData, setFormData] = useState<Partial<Technician>>({
    name: '',
    email: '',
    phone: '',
    specialization: [],
    status: 'available',
    rating: 5.0,
    completed_jobs: 0,
    active_jobs: 0,
    certifications: [],
    hourly_rate: 0,
  });

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const response = await maintenanceService.getTechnicians();
      if (response.success && response.data) {
        setTechnicians(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch technicians',
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
    fetchTechnicians();
  }, []);

  const availableTechs = technicians.filter(t => t.status === 'available');
  const busyTechs = technicians.filter(t => t.status === 'busy');
  const avgRating = technicians.length > 0 
    ? technicians.reduce((sum, t) => sum + (t.rating || 0), 0) / technicians.length 
    : 0;

  const handleAddTechnician = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.hourly_rate) {
        toast({
            title: 'Validation Error',
            description: 'Please fill in all required fields',
            variant: 'destructive',
        });
        return;
    }

    try {
      const createData: TechnicianCreateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        status: formData.status,
        certifications: formData.certifications,
        hourly_rate: formData.hourly_rate,
        join_date: new Date().toISOString().split('T')[0]
      };

      const response = await maintenanceService.createTechnician(createData);
      
      if (response.success && response.data) {
        setTechnicians([...technicians, response.data]);
        setIsAddDialogOpen(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Technician added successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create technician',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create technician',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTechnician = async () => {
    if (!selectedTech) return;

    try {
      const updateData: TechnicianUpdateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        status: formData.status,
        rating: formData.rating,
        completed_jobs: formData.completed_jobs,
        active_jobs: formData.active_jobs,
        certifications: formData.certifications,
        hourly_rate: formData.hourly_rate,
      };

      const response = await maintenanceService.updateTechnician(selectedTech.id, updateData);
      
      if (response.success && response.data) {
        setTechnicians(technicians.map(tech => 
          tech.id === selectedTech.id ? response.data : tech
        ));
        setSelectedTech(null);
        resetForm();
        toast({
          title: 'Success',
          description: 'Technician updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update technician',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update technician',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTechnician = async (techId: string) => {
    if (!confirm('Are you sure you want to remove this technician?')) return;
    
    try {
      const response = await maintenanceService.deleteTechnician(techId);
      
      if (response.success) {
        setTechnicians(technicians.filter(tech => tech.id !== techId));
        toast({
          title: 'Success',
          description: 'Technician removed from system',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete technician',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete technician',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: [],
      status: 'available',
      rating: 5.0,
      completed_jobs: 0,
      active_jobs: 0,
      certifications: [],
      hourly_rate: 0,
    });
  };

  const openEditDialog = (tech: Technician) => {
    setSelectedTech(tech);
    setFormData(tech);
  };

  const getStatusBadge = (status: Technician['status']) => {
    const config = {
      available: { label: 'Available', variant: 'default' as const, className: 'bg-green-500' },
      busy: { label: 'Busy', variant: 'secondary' as const, className: 'bg-yellow-500' },
      'off-duty': { label: 'Off Duty', variant: 'outline' as const, className: '' }
    };
    return config[status] || config['available'];
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
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
          <h2 className="text-2xl font-semibold">Technician Management</h2>
          <p className="text-muted-foreground">Manage service technicians and their assignments</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchTechnicians}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Technician
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle>Add New Technician</DialogTitle>
                <DialogDescription>Add a new technician to the team</DialogDescription>
                </DialogHeader>
                <TechnicianForm formData={formData} setFormData={setFormData} />
                <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                    Cancel
                </Button>
                <Button 
                  onClick={handleAddTechnician}
                  disabled={!formData.name || !formData.email || !formData.phone || !formData.hourly_rate}
                >
                  Add Technician
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
            <CardTitle className="text-sm font-medium">Total Technicians</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicians.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableTechs.length}</div>
            <p className="text-xs text-muted-foreground">Ready for assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {technicians.reduce((sum, t) => sum + (t.active_jobs || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Team performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Technicians List */}
      <div className="space-y-4">
        {technicians.length === 0 && (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    No technicians found. Add one to get started.
                </CardContent>
            </Card>
        )}
        {technicians.map(tech => {
          const statusBadge = getStatusBadge(tech.status);
          return (
            <Card key={tech.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{tech.name}</CardTitle>
                        <Badge variant={statusBadge.variant} className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{tech.id}</p>
                      {renderStars(tech.rating)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${tech.hourly_rate}/hr</p>
                      <p className="text-sm text-muted-foreground">{tech.completed_jobs} completed</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(tech)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTechnician(tech.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{tech.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{tech.phone}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Specializations:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tech.specialization?.map((spec, idx) => (
                        <Badge key={idx} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Certifications:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tech.certifications?.map((cert, idx) => (
                        <Badge key={idx} variant="secondary">{cert}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-6 text-sm pt-2 border-t">
                    <div>
                      <span className="text-muted-foreground">Active Jobs: </span>
                      <span className="font-medium">{tech.active_jobs}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed: </span>
                      <span className="font-medium">{tech.completed_jobs}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Join Date: </span>
                      <span className="font-medium">{new Date(tech.join_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={selectedTech !== null} onOpenChange={(open) => !open && setSelectedTech(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
            <DialogDescription>Update technician information</DialogDescription>
          </DialogHeader>
          <TechnicianForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedTech(null); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTechnician}
              disabled={!formData.name || !formData.email || !formData.phone || !formData.hourly_rate}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TechnicianForm({ 
  formData, 
  setFormData 
}: { 
  formData: Partial<Technician>; 
  setFormData: React.Dispatch<React.SetStateAction<Partial<Technician>>>; 
}) {
  const [newSpec, setNewSpec] = useState('');
  const [newCert, setNewCert] = useState('');

  const addSpec = () => {
    if (!newSpec.trim()) return;
    setFormData(prev => ({
      ...prev,
      specialization: [...(prev.specialization || []), newSpec.trim()]
    }));
    setNewSpec('');
  };

  const removeSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialization: (prev.specialization || []).filter((_, i) => i !== index)
    }));
  };

  const addCert = () => {
    if (!newCert.trim()) return;
    setFormData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert.trim()]
    }));
    setNewCert('');
  };

  const removeCert = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: Technician['status']) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="off-duty">Off Duty</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john.smith@fleetservice.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="555-0101"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Specializations</Label>
        <div className="flex gap-2">
          <Input
            value={newSpec}
            onChange={(e) => setNewSpec(e.target.value)}
            placeholder="Add specialization (e.g. Engines)"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())}
          />
          <Button type="button" onClick={addSpec} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.specialization?.map((spec, idx) => (
            <Badge key={idx} variant="secondary" className="gap-1">
              {spec}
              <button onClick={() => removeSpec(idx)} className="ml-1 hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Certifications</Label>
        <div className="flex gap-2">
          <Input
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            placeholder="Add certification (e.g. ASE Master)"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
          />
          <Button type="button" onClick={addCert} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.certifications?.map((cert, idx) => (
            <Badge key={idx} variant="outline" className="gap-1">
              {cert}
              <button onClick={() => removeCert(idx)} className="ml-1 hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
        <Input
          id="hourly_rate"
          type="number"
          value={formData.hourly_rate}
          onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
          placeholder="75"
        />
      </div>
    </div>
  );
}
