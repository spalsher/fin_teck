'use client';

import { useState, useEffect } from 'react';
import { Save, Building2, User, Bell, Shield, Globe, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

export default function SettingsPage() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Organization Settings
  const [orgSettings, setOrgSettings] = useState({
    name: 'iTecknologi Tracking Services',
    legalName: 'iTecknologi Tracking Services Private Limited',
    taxId: 'TIN-123456789',
    registrationNumber: 'REG-2024-001',
    email: 'info@iteck.pk',
    phone: '+92-300-1234567',
    address: 'Karachi, Pakistan',
    website: 'https://iteck.pk',
    fiscalYearStart: '01',
    fiscalYearEnd: '12',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
  });

  // User Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // System Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    numberFormat: 'en-US',
    pageSize: '10',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    invoiceReminders: true,
    paymentReceived: true,
    lowStockAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
    ipWhitelist: '',
  });

  const handleOrgSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Organization settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save organization settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      if (profileSettings.newPassword && profileSettings.newPassword !== profileSettings.confirmPassword) {
        toast({
          title: 'Error',
          description: 'New passwords do not match',
          variant: 'destructive',
        });
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      // Clear password fields
      setProfileSettings({
        ...profileSettings,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Preferences saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Security settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save security settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization, profile, and system preferences
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>
                Manage your company details and business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={orgSettings.name}
                    onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Legal Name</label>
                  <Input
                    value={orgSettings.legalName}
                    onChange={(e) => setOrgSettings({ ...orgSettings, legalName: e.target.value })}
                    placeholder="Enter legal name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax ID</label>
                  <Input
                    value={orgSettings.taxId}
                    onChange={(e) => setOrgSettings({ ...orgSettings, taxId: e.target.value })}
                    placeholder="Enter tax ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Number</label>
                  <Input
                    value={orgSettings.registrationNumber}
                    onChange={(e) => setOrgSettings({ ...orgSettings, registrationNumber: e.target.value })}
                    placeholder="Enter registration number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={orgSettings.email}
                    onChange={(e) => setOrgSettings({ ...orgSettings, email: e.target.value })}
                    placeholder="company@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={orgSettings.phone}
                    onChange={(e) => setOrgSettings({ ...orgSettings, phone: e.target.value })}
                    placeholder="+92-XXX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={orgSettings.address}
                    onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
                    placeholder="Enter company address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={orgSettings.website}
                    onChange={(e) => setOrgSettings({ ...orgSettings, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Input
                    value={orgSettings.currency}
                    onChange={(e) => setOrgSettings({ ...orgSettings, currency: e.target.value })}
                    placeholder="PKR"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fiscal Year Start (Month)</label>
                  <Input
                    value={orgSettings.fiscalYearStart}
                    onChange={(e) => setOrgSettings({ ...orgSettings, fiscalYearStart: e.target.value })}
                    placeholder="01"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fiscal Year End (Month)</label>
                  <Input
                    value={orgSettings.fiscalYearEnd}
                    onChange={(e) => setOrgSettings({ ...orgSettings, fiscalYearEnd: e.target.value })}
                    placeholder="12"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleOrgSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={profileSettings.lastName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                    placeholder="+92-XXX-XXXXXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={profileSettings.currentPassword}
                    onChange={(e) => setProfileSettings({ ...profileSettings, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={profileSettings.newPassword}
                    onChange={(e) => setProfileSettings({ ...profileSettings, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={profileSettings.confirmPassword}
                    onChange={(e) => setProfileSettings({ ...profileSettings, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Customize your system experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Input
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    placeholder="English"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <Input
                    value={orgSettings.timezone}
                    onChange={(e) => setOrgSettings({ ...orgSettings, timezone: e.target.value })}
                    placeholder="Asia/Karachi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Input
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Format</label>
                  <Input
                    value={preferences.timeFormat}
                    onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                    placeholder="24h"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number Format</label>
                  <Input
                    value={preferences.numberFormat}
                    onChange={(e) => setPreferences({ ...preferences, numberFormat: e.target.value })}
                    placeholder="en-US"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Page Size (Records per page)</label>
                  <Input
                    value={preferences.pageSize}
                    onChange={(e) => setPreferences({ ...preferences, pageSize: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handlePreferencesSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Invoice Reminders</label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming invoice due dates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.invoiceReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, invoiceReminders: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Payment Received</label>
                    <p className="text-sm text-muted-foreground">
                      Notify when a payment is received
                    </p>
                  </div>
                  <Switch
                    checked={notifications.paymentReceived}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, paymentReceived: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Low Stock Alerts</label>
                    <p className="text-sm text-muted-foreground">
                      Alert when inventory is running low
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, lowStockAlerts: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">System Updates</label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, systemUpdates: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Marketing Emails</label>
                    <p className="text-sm text-muted-foreground">
                      Receive newsletters and promotional content
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketingEmails: checked })
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleNotificationsSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Two-Factor Authentication</label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecurity({ ...security, twoFactorAuth: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Timeout (minutes)</label>
                    <Input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                      placeholder="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto logout after inactivity
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password Expiry (days)</label>
                    <Input
                      type="number"
                      value={security.passwordExpiry}
                      onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value })}
                      placeholder="90"
                    />
                    <p className="text-xs text-muted-foreground">
                      Force password change after this period
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Login Attempts</label>
                    <Input
                      type="number"
                      value={security.loginAttempts}
                      onChange={(e) => setSecurity({ ...security, loginAttempts: e.target.value })}
                      placeholder="5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lock account after failed attempts
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">IP Whitelist</label>
                    <Input
                      value={security.ipWhitelist}
                      onChange={(e) => setSecurity({ ...security, ipWhitelist: e.target.value })}
                      placeholder="192.168.1.1, 10.0.0.1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated IP addresses
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSecuritySave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Security Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
