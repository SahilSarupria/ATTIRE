"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Save, Settings, Database, Shield, Bell } from "lucide-react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Settings saved",
        description: "Your settings have been successfully updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Admin Settings</h1>
          <p className="text-gray-400">Configure your store settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-orange-500" />
                <CardTitle>Store Settings</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Basic store configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue="DXRKICE" className="bg-gray-800 border-gray-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Store Description</Label>
                <Input
                  id="store-description"
                  defaultValue="Premium fashion and lifestyle products"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  defaultValue="admin@dxrkice.com"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-500" />
                <CardTitle>Database Settings</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Database configuration and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Database Status</Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-400">Connected</span>
                </div>
              </div>
              <Separator className="bg-gray-800" />
              <div className="space-y-2">
                <Button variant="outline" className="w-full border-gray-700">
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full border-gray-700">
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-500" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" className="bg-gray-800 border-gray-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                <Input id="max-login-attempts" type="number" defaultValue="5" className="bg-gray-800 border-gray-700" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-yellow-500" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Configure admin notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  defaultValue="notifications@dxrkice.com"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Notifications</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">New product created</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Product deleted</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Low inventory alerts</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-black">
            {isSubmitting ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
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
      </div>
    </div>
  )
}
