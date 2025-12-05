/**
 * VehicleManagement Component
 * 
 * Refactored to use:
 * - Centralized types
 * - Custom hooks for state management
 * - Reusable shared components
 * - Utility functions for status handling
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, MapPin, Fuel, Calendar, RefreshCw, AlertCircle, Edit } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

// Import types and utilities
import type { Vehicle, VehicleFormState, VehicleStatus } from '@/types';
import { useFormState, useDialogState, useDataFilter } from '@/hooks';
import { StatusBadge, SearchFilter } from '@/components/shared';
import { getVehicleStatusConfig, getFuelLevelColor } from '@/utils';
import { vehicleService } from '@/services/api';

export function VehicleManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use custom hooks for dialog state management
  const addDialog = useDialogState();
  const editDialog = useDialogState<Vehicle>();
  const detailsDialog = useDialogState<Vehicle>();
  
  // Use custom hook for form state management
  const initialFormState: VehicleFormState = {
    make: '',
    model: '',
    year: '',
    license: '',
    color: '',
    fuelType: 'Diesel',
    mileage: '',
  };
  const { formState: newVehicle, updateField, resetForm } = useFormState(initialFormState);
  const { 
    formState: editFormData, 
    updateField: updateEditField, 
    setForm: setEditForm 
  } = useFormState(initialFormState);

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    return Boolean(
      newVehicle.make &&
      newVehicle.model &&
      newVehicle.year &&
      newVehicle.license &&
      newVehicle.color &&
      newVehicle.fuelType &&
      newVehicle.mileage
    );
  }, [newVehicle]);

  const isEditFormValid = useMemo(() => {
    return Boolean(
      editFormData.make &&
      editFormData.model &&
      editFormData.year &&
      editFormData.license &&
      editFormData.color &&
      editFormData.fuelType &&
      editFormData.mileage
    );
  }, [editFormData]);

  // Fetch vehicles on mount and when filter changes
  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getAll(statusFilter !== 'all' ? statusFilter : undefined);
      if (response.success && response.data) {
        setVehicles(response.data);
      } else {
        setError(response.error || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError('An error occurred while fetching vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Performance optimization: Memoize callback to prevent unnecessary re-renders
  const handleAddVehicle = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await vehicleService.create(newVehicle);
      if (response.success) {
        addDialog.closeDialog();
        resetForm();
        // Refresh the vehicle list
        await fetchVehicles();
      } else {
        setError(response.error || 'Failed to create vehicle');
      }
    } catch (err) {
      setError('An error occurred while creating the vehicle');
      console.error('Error creating vehicle:', err);
    } finally {
      setIsLoading(false);
    }
  }, [newVehicle, addDialog, resetForm]);

  // Performance optimization: Memoize callback to prevent unnecessary re-renders
  const handleViewDetails = useCallback((vehicle: Vehicle) => {
    detailsDialog.openDialog(vehicle);
  }, [detailsDialog]);

  const handleEditClick = useCallback((vehicle: Vehicle) => {
    setEditForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      license: vehicle.license,
      color: vehicle.color || '',
      fuelType: vehicle.fuelType || 'Diesel',
      mileage: vehicle.mileage.toString()
    });
    editDialog.openDialog(vehicle);
  }, [editDialog, setEditForm]);

  const handleUpdateVehicle = useCallback(async () => {
    if (!editDialog.data) return;
    setIsLoading(true);
    try {
      const response = await vehicleService.update(editDialog.data.id, {
        ...editFormData,
        year: parseInt(editFormData.year),
        mileage: parseInt(editFormData.mileage)
      });
      
      if (response.success) {
        editDialog.closeDialog();
        // Refresh the vehicle list
        await fetchVehicles();
      } else {
        setError(response.error || 'Failed to update vehicle');
      }
    } catch (err) {
      setError('An error occurred while updating the vehicle');
      console.error('Error updating vehicle:', err);
    } finally {
      setIsLoading(false);
    }
  }, [editFormData, editDialog, fetchVehicles]);

  // Use custom data filter hook with proper typing
  const filteredVehicles = useDataFilter<Vehicle>({
    data: vehicles,
    searchQuery,
    searchFields: ['id', 'make', 'model', 'license'],
    filters: { status: statusFilter }
  });

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Vehicle Management</h2>
          <p className="text-muted-foreground">Monitor and manage your fleet vehicles</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={fetchVehicles}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="gap-2" onClick={() => addDialog.openDialog()} disabled={isLoading}>
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters - Using reusable SearchFilter component */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search vehicles..."
        filters={[
          {
            value: statusFilter,
            onValueChange: setStatusFilter,
            placeholder: 'Filter by status',
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'idle', label: 'Idle' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'offline', label: 'Offline' }
            ]
          }
        ]}
      />

      {/* Vehicle Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground text-lg">No vehicles found</p>
          <p className="text-muted-foreground text-sm mt-2">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Add your first vehicle to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{vehicle.id}</CardTitle>
                <StatusBadge config={getVehicleStatusConfig(vehicle.status as VehicleStatus)} />
              </div>
              <p className="text-sm text-muted-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">License:</span>
                  <p className="font-medium">{vehicle.license}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Driver ID:</span>
                  <p className="font-medium">{vehicle.driverId || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span>{vehicle.location}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span>Fuel Level</span>
                  </div>
                  <span className="font-medium">{vehicle.fuelLevel}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getFuelLevelColor(vehicle.fuelLevel)}`}
                    style={{ width: `${vehicle.fuelLevel}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Next Maintenance:</span>
                <span>{vehicle.nextMaintenance}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewDetails(vehicle)}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditClick(vehicle)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={addDialog.isOpen} onOpenChange={addDialog.toggleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the vehicle details to add it to your fleet
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={newVehicle.make}
                  onChange={(e) => updateField('make', e.target.value)}
                  placeholder="Ford, Mercedes, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="Transit, Sprinter, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => updateField('year', e.target.value)}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Plate</Label>
                <Input
                  id="license"
                  value={newVehicle.license}
                  onChange={(e) => updateField('license', e.target.value)}
                  placeholder="ABC-1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={newVehicle.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  placeholder="White, Blue, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select 
                  value={newVehicle.fuelType} 
                  onValueChange={(value) => updateField('fuelType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Current Mileage (km)</Label>
              <Input
                id="mileage"
                type="number"
                value={newVehicle.mileage}
                onChange={(e) => updateField('mileage', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="flex items-center">
              {!isFormValid && (
                <span className="text-sm text-muted-foreground">Please fill all fields</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addDialog.closeDialog}>Cancel</Button>
              <Button onClick={handleAddVehicle} disabled={!isFormValid || isLoading}>Add Vehicle</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={editDialog.toggleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update the vehicle details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-make">Make</Label>
                <Input
                  id="edit-make"
                  value={editFormData.make}
                  onChange={(e) => updateEditField('make', e.target.value)}
                  placeholder="Ford, Mercedes, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  value={editFormData.model}
                  onChange={(e) => updateEditField('model', e.target.value)}
                  placeholder="Transit, Sprinter, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={editFormData.year}
                  onChange={(e) => updateEditField('year', e.target.value)}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-license">License Plate</Label>
                <Input
                  id="edit-license"
                  value={editFormData.license}
                  onChange={(e) => updateEditField('license', e.target.value)}
                  placeholder="ABC-1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  value={editFormData.color}
                  onChange={(e) => updateEditField('color', e.target.value)}
                  placeholder="White, Blue, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fuelType">Fuel Type</Label>
                <Select 
                  value={editFormData.fuelType} 
                  onValueChange={(value) => updateEditField('fuelType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mileage">Current Mileage (km)</Label>
              <Input
                id="edit-mileage"
                type="number"
                value={editFormData.mileage}
                onChange={(e) => updateEditField('mileage', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="flex items-center">
              {!isEditFormValid && (
                <span className="text-sm text-muted-foreground">Please fill all fields</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={editDialog.closeDialog}>Cancel</Button>
              <Button onClick={handleUpdateVehicle} disabled={!isEditFormValid || isLoading}>Update Vehicle</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Details Dialog */}
      <Dialog open={detailsDialog.isOpen} onOpenChange={detailsDialog.toggleDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Vehicle Details - {detailsDialog.data?.id}</DialogTitle>
            <DialogDescription>
              {detailsDialog.data?.year} {detailsDialog.data?.make} {detailsDialog.data?.model}
            </DialogDescription>
          </DialogHeader>
          {detailsDialog.data && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <span>Status</span>
                <StatusBadge config={getVehicleStatusConfig(detailsDialog.data.status as VehicleStatus)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{detailsDialog.data.license}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{detailsDialog.data.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Type</p>
                  <p className="font-medium">{detailsDialog.data.fuelType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Driver</p>
                  <p className="font-medium">{detailsDialog.data.driverId || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Location</p>
                  <p className="font-medium">{detailsDialog.data.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="font-medium">{detailsDialog.data.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Level</p>
                  <p className="font-medium">{detailsDialog.data.fuelLevel}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Maintenance</p>
                  <p className="font-medium">{detailsDialog.data.lastMaintenance}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Next Maintenance</p>
                  <p className="font-medium">{detailsDialog.data.nextMaintenance}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={detailsDialog.closeDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
