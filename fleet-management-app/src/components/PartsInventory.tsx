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
  Plus,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Wrench,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { maintenanceService, type Part, type PartCreateData, type PartUpdateData } from '@/services/api/maintenanceService';

export function PartsInventory() {
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<Partial<Part>>({
    name: '',
    part_number: '',
    category: '',
    quantity: 0,
    min_quantity: 0,
    unit_cost: 0,
    supplier: '',
    location: '',
    used_in: []
  });

  const fetchParts = async () => {
    setLoading(true);
    try {
      const response = await maintenanceService.getParts(searchQuery);
      if (response.success && response.data) {
        setParts(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch parts',
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
    const timeoutId = setTimeout(() => {
      fetchParts();
    }, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const lowStockParts = parts.filter(part => part.quantity <= part.min_quantity);
  const totalValue = parts.reduce((sum, part) => sum + (part.quantity * part.unit_cost), 0);

  const handleAddPart = async () => {
    if (!formData.name || !formData.part_number || !formData.category) {
        toast({
            title: 'Validation Error',
            description: 'Please fill in all required fields',
            variant: 'destructive',
        });
        return;
    }

    try {
      const createData: PartCreateData = {
        name: formData.name,
        part_number: formData.part_number,
        category: formData.category,
        quantity: formData.quantity || 0,
        min_quantity: formData.min_quantity || 0,
        unit_cost: formData.unit_cost || 0,
        supplier: formData.supplier,
        location: formData.location,
        used_in: formData.used_in || []
      };

      const response = await maintenanceService.createPart(createData);
      
      if (response.success && response.data) {
        setParts([...parts, response.data]);
        setIsAddDialogOpen(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Part added to inventory',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to add part',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add part',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePart = async () => {
    if (!selectedPart) return;

    try {
      const updateData: PartUpdateData = {
        name: formData.name,
        part_number: formData.part_number,
        category: formData.category,
        quantity: formData.quantity,
        min_quantity: formData.min_quantity,
        unit_cost: formData.unit_cost,
        supplier: formData.supplier,
        location: formData.location,
        used_in: formData.used_in
      };

      const response = await maintenanceService.updatePart(selectedPart.id, updateData);
      
      if (response.success && response.data) {
        setParts(parts.map(part => 
          part.id === selectedPart.id ? response.data : part
        ));
        setSelectedPart(null);
        resetForm();
        toast({
          title: 'Success',
          description: 'Part updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update part',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update part',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;
    
    try {
      const response = await maintenanceService.deletePart(partId);
      
      if (response.success) {
        setParts(parts.filter(part => part.id !== partId));
        toast({
          title: 'Success',
          description: 'Part removed from inventory',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete part',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete part',
        variant: 'destructive',
      });
    }
  };

  const handleRestock = async (partId: string, quantityToAdd: number) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;

    try {
      const newQuantity = part.quantity + quantityToAdd;
      const response = await maintenanceService.updatePart(partId, { quantity: newQuantity });
      
      if (response.success && response.data) {
        setParts(parts.map(p => p.id === partId ? response.data : p));
        toast({
          title: 'Success',
          description: `Added ${quantityToAdd} units to stock`,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to restock',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restock',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      part_number: '',
      category: '',
      quantity: 0,
      min_quantity: 0,
      unit_cost: 0,
      supplier: '',
      location: '',
      used_in: []
    });
  };

  const openEditDialog = (part: Part) => {
    setSelectedPart(part);
    setFormData(part);
  };

  const categories = Array.from(new Set(parts.map(p => p.category)));

  if (loading && parts.length === 0) {
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
          <h2 className="text-2xl font-semibold">Parts Inventory</h2>
          <p className="text-muted-foreground">Manage maintenance parts and supplies</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchParts}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Part
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle>Add New Part</DialogTitle>
                <DialogDescription>Add a new part to the inventory</DialogDescription>
                </DialogHeader>
                <PartForm formData={formData} setFormData={setFormData} />
                <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                    Cancel
                </Button>
                <Button 
                  onClick={handleAddPart}
                  disabled={!formData.name || !formData.part_number || !formData.category}
                >
                  Add Part
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
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
            <p className="text-xs text-muted-foreground">{categories.length} categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockParts.length}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Wrench className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parts.reduce((sum, part) => sum + part.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts by name, number, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 mb-4">
              {lowStockParts.length} part(s) are running low and need restocking:
            </p>
            <div className="space-y-2">
              {lowStockParts.map(part => (
                <div key={part.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <span className="font-medium">{part.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({part.quantity} / {part.min_quantity} min)
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleRestock(part.id, part.min_quantity * 2)}
                  >
                    Quick Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parts List */}
      <div className="space-y-4">
        {parts.length === 0 && !loading && (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    No parts found. Add items to your inventory.
                </CardContent>
            </Card>
        )}
        {parts.map(part => (
          <Card key={part.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{part.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {part.part_number} • {part.category}
                    </p>
                  </div>
                  {part.quantity <= part.min_quantity && (
                    <Badge variant="destructive">Low Stock</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-lg">{part.quantity} units</p>
                    <p className="text-sm text-muted-foreground">${part.unit_cost} each</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(part)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeletePart(part.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Supplier:</span>
                  <p className="font-medium">{part.supplier}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{part.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Min Quantity:</span>
                  <p className="font-medium">{part.min_quantity} units</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Restocked:</span>
                  <p className="font-medium">
                    {part.last_restocked ? new Date(part.last_restocked).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              {part.used_in && part.used_in.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Used In:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {part.used_in.map((usage, idx) => (
                      <Badge key={idx} variant="outline">{usage}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stock Value: ${(part.quantity * part.unit_cost).toFixed(2)}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const qty = prompt('Enter quantity to add:', '10');
                      if (qty) handleRestock(part.id, parseInt(qty));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Restock
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={selectedPart !== null} onOpenChange={(open) => !open && setSelectedPart(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
            <DialogDescription>Update part information</DialogDescription>
          </DialogHeader>
          <PartForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedPart(null); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePart}
              disabled={!formData.name || !formData.part_number || !formData.category}
            >
              Update Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PartForm({ 
  formData, 
  setFormData 
}: { 
  formData: Partial<Part>; 
  setFormData: React.Dispatch<React.SetStateAction<Partial<Part>>>; 
}) {
  const [newUsedIn, setNewUsedIn] = useState('');

  const addUsedIn = () => {
    if (!newUsedIn.trim()) return;
    setFormData(prev => ({
      ...prev,
      used_in: [...(prev.used_in || []), newUsedIn.trim()]
    }));
    setNewUsedIn('');
  };

  const removeUsedIn = (index: number) => {
    setFormData(prev => ({
      ...prev,
      used_in: (prev.used_in || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Part Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Engine Oil Filter"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="partNumber">Part Number *</Label>
          <Input
            id="partNumber"
            value={formData.part_number}
            onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
            placeholder="OF-5W30-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Filters, Brakes, Tires, etc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Auto Parts Co."
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minQuantity">Min Quantity *</Label>
          <Input
            id="minQuantity"
            type="number"
            value={formData.min_quantity}
            onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitCost">Unit Cost ($) *</Label>
          <Input
            id="unitCost"
            type="number"
            step="0.01"
            value={formData.unit_cost}
            onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Storage Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Shelf A-12, Warehouse Section C"
        />
      </div>

      <div className="space-y-2">
        <Label>Used In (Maintenance Types)</Label>
        <div className="flex gap-2">
          <Input
            value={newUsedIn}
            onChange={(e) => setNewUsedIn(e.target.value)}
            placeholder="Add maintenance type (e.g. Oil Change)"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUsedIn())}
          />
          <Button type="button" onClick={addUsedIn} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.used_in?.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="gap-1">
              {item}
              <button onClick={() => removeUsedIn(idx)} className="ml-1 hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
