import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader } from './ui/loader';
import { Alert, AlertDescription } from './ui/alert';
import { formService, driverService } from '@/services/api';
import type { DriverForm, DriverFormFormState, Driver } from '@/types';
import { 
  Plus, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  Clock,
  FileText
} from 'lucide-react';

export function DriverForms() {
  const [forms, setForms] = useState<DriverForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [driverForms, setDriverForms] = useState<DriverForm[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [newForm, setNewForm] = useState<DriverFormFormState>({
    driverId: 0,
    driverName: '',
    vehicleNumber: '',
    score: 0,
    fuelEfficiency: 0,
    onTimeRate: 0,
    vehicleId: undefined
  });

  // Fetch all forms and drivers on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchForms(), fetchDrivers()]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Fetch forms for selected driver
  useEffect(() => {
    if (selectedDriverId) {
      fetchDriverForms(selectedDriverId);
    }
  }, [selectedDriverId]);

  const fetchForms = async () => {
    setError(null);
    try {
      const response = await formService.getAll();
      if (response.success && response.data) {
        setForms(response.data);
      } else {
        setError(response.error || 'Failed to fetch forms');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching forms');
      console.error('Error fetching forms:', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await driverService.getAll();
      if (response.success && response.data) {
        setDrivers(driverService.transformDrivers(response.data));
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const fetchDriverForms = async (driverId: number) => {
    try {
      const response = await formService.getByDriverId(driverId);
      if (response.success && response.data) {
        setDriverForms(response.data);
      }
    } catch (err) {
      console.error('Error fetching driver forms:', err);
    }
  };

  const handleAddForm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await formService.create(newForm);
      if (response.success) {
        await fetchForms();
        setIsAddDialogOpen(false);
        setNewForm({
          driverId: 0,
          driverName: '',
          vehicleNumber: '',
          score: 0,
          fuelEfficiency: 0,
          onTimeRate: 0,
          vehicleId: undefined
        });
      } else {
        setError(response.error || 'Failed to create form');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating form');
      console.error('Error creating form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDriverSelect = (driverIdString: string) => {
    const driverId = parseInt(driverIdString);
    const selectedDriver = drivers.find(d => d.id === driverIdString || d.driverId === driverId);
    
    if (selectedDriver) {
      setNewForm(prev => ({
        ...prev,
        driverId: driverId,
        driverName: selectedDriver.name || selectedDriver.fullName || '',
        vehicleNumber: selectedDriver.vehicle !== 'Unassigned' ? selectedDriver.vehicle || '' : ''
      }));
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-blue-600">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-600">Average</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const calculateAverages = () => {
    if (forms.length === 0) {
      return { avgScore: 0, avgFuelEfficiency: 0, avgOnTimeRate: 0 };
    }
    return formService.calculateAverageMetrics(forms);
  };

  const averages = calculateAverages();

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Driver Performance Forms</h2>
          <p className="text-muted-foreground">Track and manage driver performance metrics</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Performance Form
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averages.avgScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4 text-green-600" />
              Fuel Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averages.avgFuelEfficiency.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">MPG Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              On-Time Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averages.avgOnTimeRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average punctuality</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && forms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No performance forms found</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking driver performance by adding your first form
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Performance Form
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Forms Table */}
      {!isLoading && forms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form ID</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Fuel Efficiency</TableHead>
                  <TableHead>On-Time Rate</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.formId}>
                    <TableCell className="font-medium">#{form.formId}</TableCell>
                    <TableCell>{form.driverName}</TableCell>
                    <TableCell>{form.vehicleNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {form.score}
                        {form.score >= 75 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{form.fuelEfficiency.toFixed(1)} MPG</TableCell>
                    <TableCell>{form.onTimeRate.toFixed(1)}%</TableCell>
                    <TableCell>{getScoreBadge(form.score)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Form Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Performance Form</DialogTitle>
            <DialogDescription>
              Record driver performance metrics
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driverId">Select Driver</Label>
              <Select 
                value={newForm.driverId ? newForm.driverId.toString() : ''} 
                onValueChange={handleDriverSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id || ''}>
                      {driver.name} (ID: {driver.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name</Label>
              <Input
                id="driverName"
                value={newForm.driverName}
                onChange={(e) => setNewForm({ ...newForm, driverName: e.target.value })}
                placeholder="Driver Name"
                disabled={true} 
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                value={newForm.vehicleNumber}
                onChange={(e) => setNewForm({ ...newForm, vehicleNumber: e.target.value })}
                placeholder="VH-0123"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Performance Score (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={newForm.score || ''}
                onChange={(e) => setNewForm({ ...newForm, score: parseFloat(e.target.value) || 0 })}
                placeholder="85"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelEfficiency">Fuel Efficiency (MPG)</Label>
              <Input
                id="fuelEfficiency"
                type="number"
                step="0.1"
                value={newForm.fuelEfficiency || ''}
                onChange={(e) => setNewForm({ ...newForm, fuelEfficiency: parseFloat(e.target.value) || 0 })}
                placeholder="28.5"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onTimeRate">On-Time Rate (%)</Label>
              <Input
                id="onTimeRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newForm.onTimeRate || ''}
                onChange={(e) => setNewForm({ ...newForm, onTimeRate: parseFloat(e.target.value) || 0 })}
                placeholder="95.5"
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
              onClick={handleAddForm}
              disabled={isSubmitting || !newForm.driverId || !newForm.driverName || !newForm.vehicleNumber}
            >
              {isSubmitting ? 'Adding...' : 'Add Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

