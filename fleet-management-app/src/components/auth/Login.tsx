import React, { useState } from 'react';
import { Eye, EyeOff, Truck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKeycloakLogin = async () => {
    setIsLoading(true);
    try {
      await onLogin();
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">FleetManager</h1>
              <p className="text-sm text-muted-foreground">B2B Fleet Solutions</p>
            </div>
          </div>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in to access the fleet management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleKeycloakLogin} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-xs text-center text-muted-foreground mt-4">
              <p>Use your company credentials to sign in.</p>
              <p className="mt-2">Secure authentication provided by enterprise SSO.</p>
            </div>

            <Separator className="my-4" />
            
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal underline" 
                onClick={handleKeycloakLogin}
                disabled={isLoading}
              >
                Sign up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
