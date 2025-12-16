// Performance optimization: Added useMemo for expensive calculations
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Fuel, 
  DollarSign, 
  BarChart3,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Pencil
} from 'lucide-react';
import { vehicleService } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface FuelVehicle {
  vehicleId: string;
  vehicleIdentifier: string;
  make: string;
  model: string;
  fuelLevel: number;
  fuelType: string;
  currentDriver?: string;
  status: string;
}

export function FuelManagement() {
  const { user } = useAuth();
  const [fuelData, setFuelData] = useState<FuelVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [selectedVehicle, setSelectedVehicle] = useState<FuelVehicle | null>(null);
  const [newFuelLevel, setNewFuelLevel] = useState<number>(0);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchFuelData();
  }, []);

  const fetchFuelData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getFuelData();
      if (response.success && response.data) {
        setFuelData(response.data);
      } else {
        setError(response.error || 'Failed to fetch fuel data');
      }
    } catch (err) {
      setError('An error occurred while fetching fuel data');
      console.error('Error fetching fuel data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (vehicle: FuelVehicle) => {
    setSelectedVehicle(vehicle);
    setNewFuelLevel(vehicle.fuelLevel);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateFuel = async () => {
    if (!selectedVehicle) return;
    
    setIsUpdating(true);
    try {
      const response = await vehicleService.update(selectedVehicle.vehicleId, {
        fuelLevel: newFuelLevel
      });

      if (response.success) {
        setFuelData(prevData => prevData.map(v => 
          v.vehicleId === selectedVehicle.vehicleId 
            ? { ...v, fuelLevel: newFuelLevel } 
            : v
        ));
        setIsUpdateDialogOpen(false);
      } else {
        console.error('Failed to update fuel level:', response.error);
      }
    } catch (error) {
      console.error('Error updating fuel level:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getFuelStatus = (level: number) => {
    if (level < 15) return 'critical';
    if (level < 30) return 'low';
    return 'normal';
  };

  const getStatusBadge = (level: number) => {
    const status = getFuelStatus(level);
    const statusConfig = {
      normal: { label: 'Normal', variant: 'secondary' as const },
      low: { label: 'Low Fuel', variant: 'secondary' as const },
      critical: { label: 'Critical', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Performance optimization: Memoize expensive calculations
  // Only recalculate when fuelData changes
  const averageFuelLevel = useMemo(() => 
    fuelData.length > 0 
      ? fuelData.reduce((sum, vehicle) => sum + vehicle.fuelLevel, 0) / fuelData.length
      : 0,
    [fuelData]
  );
  
  const lowFuelVehicles = useMemo(() => 
    fuelData.filter(vehicle => vehicle.fuelLevel < 30).length,
    [fuelData]
  );

  const criticalFuelVehicles = useMemo(() => 
    fuelData.filter(vehicle => vehicle.fuelLevel < 15).length,
    [fuelData]
  );

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Fuel Management</h2>
          <p className="text-muted-foreground">Monitor fuel levels across your fleet</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={fetchFuelData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Fuel Level</CardTitle>
              <Fuel className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageFuelLevel.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across all vehicles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Fuel Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowFuelVehicles}</div>
              <p className="text-xs text-muted-foreground">Below 30% fuel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalFuelVehicles}</div>
              <p className="text-xs text-muted-foreground">Below 15% fuel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fuelData.length}</div>
              <p className="text-xs text-muted-foreground">Monitored vehicles</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fuel Status Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : fuelData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Fuel className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No fuel data available</p>
          <p className="text-muted-foreground text-sm mt-2">Add vehicles to start monitoring fuel levels</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fuelData.map((vehicle) => (
            <Card key={vehicle.vehicleId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                    <div className="flex flex-col text-sm text-muted-foreground gap-0.5">
                      <span className="font-medium text-foreground/80">ID: {vehicle.vehicleIdentifier || vehicle.vehicleId}</span>
                      <span>Driver: {vehicle.currentDriver || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(vehicle.fuelLevel)}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditClick(vehicle)}
                              disabled={user?.role !== 'admin'}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{user?.role !== 'admin' ? "Admin access required" : "Update fuel level"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <span>Fuel Level</span>
                    </div>
                    <span className="font-medium">{Math.round(vehicle.fuelLevel)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getFuelLevelColor(vehicle.fuelLevel)}`}
                      style={{ width: `${vehicle.fuelLevel}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fuel Type:</span>
                    <p className="font-medium">{vehicle.fuelType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium capitalize">{vehicle.status}</p>
                  </div>
                </div>

                {vehicle.fuelLevel < 30 && (
                  <Alert variant={vehicle.fuelLevel < 15 ? "destructive" : "default"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {vehicle.fuelLevel < 15 
                        ? 'Critical fuel level - Refuel immediately!'
                        : 'Low fuel - Consider refueling soon'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {!isLoading && fuelData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start gap-2" disabled>
                <BarChart3 className="h-4 w-4" />
                Generate Fuel Report
              </Button>
              <Button variant="outline" className="justify-start gap-2" disabled>
                <AlertTriangle className="h-4 w-4" />
                Set Fuel Alerts
              </Button>
              <Button variant="outline" className="justify-start gap-2" disabled>
                <DollarSign className="h-4 w-4" />
                Budget Planning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Fuel Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Fuel Level</DialogTitle>
            <DialogDescription>
              Adjust the fuel level for {selectedVehicle?.vehicleIdentifier}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Current Level</Label>
                <span className={`text-lg font-bold ${
                  newFuelLevel < 15 ? 'text-red-500' : 
                  newFuelLevel < 30 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {newFuelLevel}%
                </span>
              </div>
              
              <Slider
                value={[newFuelLevel]}
                min={0}
                max={100}
                step={1}
                onValueChange={(vals) => setNewFuelLevel(vals[0])}
                className="py-4"
              />

              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">Manual Entry</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={newFuelLevel}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, Number(e.target.value)));
                    setNewFuelLevel(val);
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateFuel} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Fuel Level'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}