import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { scheduleService } from '@/services/api';
import type { DriverSchedule } from '@/types';
import { AlertTriangle, Search, Calendar, Clock, MapPin, CheckCircle, Loader2 } from 'lucide-react';

export function ScheduleConflictChecker() {
  const [driverId, setDriverId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [excludeScheduleId, setExcludeScheduleId] = useState('');
  const [conflicts, setConflicts] = useState<DriverSchedule[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckConflicts = async () => {
    if (!driverId || !startTime || !endTime) {
      setError('Please fill in all required fields');
      return;
    }

    setIsChecking(true);
    setError(null);
    setHasChecked(false);

    try {
      const excludeId = excludeScheduleId ? parseInt(excludeScheduleId) : undefined;
      const response = await scheduleService.checkConflicts(
        driverId,
        startTime,
        endTime,
        excludeId
      );

      if (response.success && response.data) {
        setConflicts(response.data);
        setHasChecked(true);
      } else {
        setError(response.error || 'Failed to check conflicts');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error checking conflicts:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return 'Not set';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Schedule Conflict Checker
        </CardTitle>
        <CardDescription>
          Check if a driver has conflicting schedules for a specific time period
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="driverId">Driver ID *</Label>
            <Input
              id="driverId"
              placeholder="Enter driver ID"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excludeScheduleId">Exclude Schedule ID (Optional)</Label>
            <Input
              id="excludeScheduleId"
              type="number"
              placeholder="Schedule to exclude"
              value={excludeScheduleId}
              onChange={(e) => setExcludeScheduleId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleCheckConflicts} 
          disabled={isChecking || !driverId || !startTime || !endTime}
          className="w-full gap-2"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Check for Conflicts
            </>
          )}
        </Button>

        {hasChecked && !isChecking && (
          <>
            {conflicts.length === 0 ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>No conflicts found!</strong> The driver is available for the selected time period.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Found {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}!</strong>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Conflicting Schedules:</h4>
                  {conflicts.map((schedule) => (
                    <Card key={schedule.scheduleId} className="border-red-200 bg-red-50">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-xs">
                                Schedule #{schedule.scheduleId}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {schedule.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{schedule.route}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDateTime(schedule.startTime)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{formatDateTime(schedule.endTime)}</span>
                            </div>

                            {schedule.vehicleId && (
                              <div className="text-sm text-muted-foreground">
                                Vehicle ID: {schedule.vehicleId}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

