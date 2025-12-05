// Performance optimization: Added useMemo and useCallback for expensive operations
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader } from './ui/loader';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { driverService } from '@/services/api';
import type { Driver, DriverFormState } from '@/types';
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle,
  Clock,
  UserX,
  Star,
  AlertCircle,
  Edit
} from 'lucide-react';

export function DriverManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
  const [driverToAssign, setDriverToAssign] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newDriver, setNewDriver] = useState<DriverFormState>({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    expiryDate: '',
  });

  const [editDriverForm, setEditDriverForm] = useState<DriverFormState>({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    expiryDate: '',
  });

  const [drivers, setDrivers] = useState<Driver[]>([]);

  const availableVehicles = ['VH-0123', 'VH-0456', 'VH-0789', 'VH-0321', 'VH-0555', 'VH-0666'];
  const [selectedVehicle, setSelectedVehicle] = useState('');

  // Fetch drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await driverService.getAll();
      if (response.success && response.data) {
        // Transform backend data to frontend format
        const transformedDrivers = driverService.transformDrivers(response.data);
        setDrivers(transformedDrivers);
      } else {
        setError(response.error || 'Failed to fetch drivers');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching drivers');
      console.error('Error fetching drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDriver = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await driverService.create(newDriver);
      if (response.success) {
        toast({
          title: "Success",
          description: "Driver added successfully",
        });
        // Refresh driver list
        await fetchDrivers();
        setIsAddDialogOpen(false);
        setNewDriver({
          fullName: '',
          email: '',
          phone: '',
          licenseNumber: '',
          expiryDate: '',
        });
      } else {
        const errorMessage = response.error || 'Failed to create driver';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while creating driver';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('Error creating driver:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (driver: Driver) => {
    setDriverToEdit(driver);
    setEditDriverForm({
      fullName: driver.name || '',
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      expiryDate: driver.licenseExpiry || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDriver = async () => {
    if (!driverToEdit || !driverToEdit.id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await driverService.update(driverToEdit.id, editDriverForm);
      if (response.success) {
        toast({
          title: "Success",
          description: "Driver updated successfully",
        });
        await fetchDrivers();
        setIsEditDialogOpen(false);
        setDriverToEdit(null);
      } else {
        const errorMessage = response.error || 'Failed to update driver';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating driver';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('Error updating driver:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProfile = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDetailsDialogOpen(true);
  };

  const handleAssignVehicle = (driver: Driver) => {
    setDriverToAssign(driver);
    setSelectedVehicle(driver.vehicle && driver.vehicle !== 'Unassigned' ? driver.vehicle : '');
    setIsAssignDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (driverToAssign && selectedVehicle) {
      setDrivers(drivers.map(driver => 
        driver.id === driverToAssign.id 
          ? { ...driver, vehicle: selectedVehicle, status: 'active' }
          : driver
      ));
      setIsAssignDialogOpen(false);
      setDriverToAssign(null);
      setSelectedVehicle('');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const, icon: CheckCircle },
      'off-duty': { label: 'Off Duty', variant: 'secondary' as const, icon: Clock },
      unavailable: { label: 'Unavailable', variant: 'destructive' as const, icon: UserX }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unavailable;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Performance optimization: Memoize filtered drivers
  // Only recalculate when dependencies change
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => 
      (driver.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [drivers, searchQuery]);

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Driver Management</h2>
          <p className="text-muted-foreground">Manage your fleet drivers and assignments</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Driver
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
      {!isLoading && filteredDrivers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first driver'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Driver List */}
      {!isLoading && filteredDrivers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(driver.name || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{driver.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {driver.id}</p>
                  </div>
                </div>
                {getStatusBadge(driver.status || 'unavailable')}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 ml-2"
                  onClick={() => handleEditClick(driver)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="truncate">{driver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">License Expiry:</span>
                  <span>{driver.licenseExpiry}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{driver.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{driver.totalTrips}</p>
                  <p className="text-xs text-muted-foreground">Total Trips</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Current Vehicle:</span>
                  <p className="font-medium">{driver.vehicle}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Hours This Week:</span>
                  <p className="font-medium">{driver.hoursThisWeek}h</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewProfile(driver)}
                >
                  View Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAssignVehicle(driver)}
                >
                  Assign Vehicle
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Add Driver Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>
              Enter the driver details to add them to your fleet
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newDriver.fullName}
                onChange={(e) => setNewDriver({ ...newDriver, fullName: e.target.value })}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newDriver.email}
                onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                placeholder="john.doe@company.com"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={newDriver.licenseNumber}
                onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                placeholder="DL123456789"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">License Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={newDriver.expiryDate}
                onChange={(e) => setNewDriver({ ...newDriver, expiryDate: e.target.value })}
                disabled={isSubmitting}
              />
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
              onClick={handleAddDriver}
              disabled={isSubmitting || !newDriver.fullName || !newDriver.email || !newDriver.phone || !newDriver.licenseNumber || !newDriver.expiryDate}
            >
              {isSubmitting ? 'Adding...' : 'Add Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>
              Update driver details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editDriverForm.fullName}
                onChange={(e) => setEditDriverForm({ ...editDriverForm, fullName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editDriverForm.email}
                onChange={(e) => setEditDriverForm({ ...editDriverForm, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editDriverForm.phone}
                onChange={(e) => setEditDriverForm({ ...editDriverForm, phone: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-licenseNumber">License Number</Label>
              <Input
                id="edit-licenseNumber"
                value={editDriverForm.licenseNumber}
                onChange={(e) => setEditDriverForm({ ...editDriverForm, licenseNumber: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate">License Expiry Date</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={editDriverForm.expiryDate}
                onChange={(e) => setEditDriverForm({ ...editDriverForm, expiryDate: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateDriver}
              disabled={isSubmitting || !editDriverForm.fullName || !editDriverForm.email || !editDriverForm.phone || !editDriverForm.licenseNumber || !editDriverForm.expiryDate}
            >
              {isSubmitting ? 'Updating...' : 'Update Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver Profile Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Driver Profile - {selectedDriver?.id}</DialogTitle>
            <DialogDescription>
              {selectedDriver?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 pb-2 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{getInitials(selectedDriver.name || '')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedDriver.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDriver.email}</p>
                </div>
                {getStatusBadge(selectedDriver.status || 'unavailable')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Driver ID</p>
                  <p className="font-medium">{selectedDriver.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{selectedDriver.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{selectedDriver.licenseNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Expiry</p>
                  <p className="font-medium">{selectedDriver.licenseExpiry}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Vehicle</p>
                  <p className="font-medium">{selectedDriver.vehicle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{selectedDriver.joinDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <p className="font-medium">{selectedDriver.rating}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Trips</p>
                  <p className="font-medium">{selectedDriver.totalTrips}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Hours This Week</p>
                  <p className="font-medium">{selectedDriver.hoursThisWeek} hours</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Vehicle Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Vehicle</DialogTitle>
            <DialogDescription>
              Assign a vehicle to {driverToAssign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Select Vehicle</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle} value={vehicle}>
                      {vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {driverToAssign && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Driver</p>
                <p className="font-medium">{driverToAssign.name}</p>
                <p className="text-sm text-muted-foreground mt-2">Current Assignment</p>
                <p className="font-medium">{driverToAssign.vehicle}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmAssignment} disabled={!selectedVehicle}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
