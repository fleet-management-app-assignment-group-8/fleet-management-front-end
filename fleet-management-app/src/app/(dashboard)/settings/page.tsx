'use client';

import { DeveloperTesting } from '@/components/DeveloperTesting';

export default function SettingsPage() {
  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your application settings and preferences.</p>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <p className="text-muted-foreground">Additional settings coming soon...</p>
          </div>

          <div className="border-t pt-6">
            <DeveloperTesting />
          </div>
        </div>
      </div>
    </div>
  );
}

