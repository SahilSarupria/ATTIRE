"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Send, Loader2, AlertCircle, RefreshCw, Bell, Mail, MessageSquare } from "lucide-react"
import { adminService, type NotificationTemplate } from "@/lib/api-admin"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminNotificationsPage() {
  const { toast } = useToast()

  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    message: "",
    type: "email",
  })

  const [sendNotification, setSendNotification] = useState({
    template_id: "",
    recipients: [] as string[],
    recipientInput: "",
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getNotificationTemplates()
      setTemplates(data)
    } catch (error) {
      console.error("Error fetching notification templates:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load notification templates"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminService.createNotificationTemplate(newTemplate)
      toast({
        title: "Template created",
        description: "Notification template has been created successfully",
      })
      setIsCreateDialogOpen(false)
      setNewTemplate({ name: "", subject: "", message: "", type: "email" })
      fetchTemplates()
    } catch (error) {
      console.error("Error creating notification template:", error)
      toast({
        title: "Error",
        description: "Failed to create notification template",
        variant: "destructive",
      })
    }
  }

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setIsEditDialogOpen(true)
  }

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return

    try {
      await adminService.updateNotificationTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        message: editingTemplate.message,
        type: editingTemplate.type,
        is_active: editingTemplate.is_active,
      })

      toast({
        title: "Template updated",
        description: "Notification template has been updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingTemplate(null)
      fetchTemplates()
    } catch (error) {
      console.error("Error updating notification template:", error)
      toast({
        title: "Error",
        description: "Failed to update notification template",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await adminService.deleteNotificationTemplate(id)
      toast({
        title: "Template deleted",
        description: `"${name}" has been successfully deleted`,
      })
      fetchTemplates()
    } catch (error) {
      console.error("Error deleting notification template:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete notification template"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleSendNotification = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
    setSendNotification({
      template_id: template.id,
      recipients: [],
      recipientInput: "",
    })
    setIsSendDialogOpen(true)
  }

  const handleSendNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    const recipients = sendNotification.recipientInput
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    if (recipients.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one recipient email",
        variant: "destructive",
      })
      return
    }

    try {
      await adminService.sendNotification({
        template_id: selectedTemplate.id,
        recipients,
      })

      toast({
        title: "Notification sent",
        description: `Notification sent to ${recipients.length} recipients`,
      })

      setIsSendDialogOpen(false)
      setSelectedTemplate(null)
      setSendNotification({ template_id: "", recipients: [], recipientInput: "" })
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      email: { color: "bg-blue-500/20 text-blue-400 border-blue-500/40", icon: Mail, label: "Email" },
      sms: { color: "bg-green-500/20 text-green-400 border-green-500/40", icon: MessageSquare, label: "SMS" },
      push: { color: "bg-purple-500/20 text-purple-400 border-purple-500/40", icon: Bell, label: "Push" },
    }

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.email
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Failed to Load Notification Templates</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchTemplates} className="bg-orange-500 hover:bg-orange-600 text-black">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Notification Management</h1>
            <p className="text-gray-400">Manage notification templates and send campaigns</p>
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-black">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle>Notification Templates</CardTitle>
            <CardDescription className="text-gray-400">
              {loading ? "Loading..." : `${templates.length} templates found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No notification templates found</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-800/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-gray-800/50">
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{template.subject}</div>
                        </TableCell>
                        <TableCell>{getTypeBadge(template.type)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={template.is_active ? "default" : "secondary"}
                            className={
                              template.is_active
                                ? "bg-green-500/20 text-green-400 border-green-500/40"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/40"
                            }
                          >
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(template.created_at)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendNotification(template)}
                              disabled={!template.is_active}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTemplate(template.id, template.name)}
                              className="hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Template Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Notification Template</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new notification template for email campaigns
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Welcome Email"
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="Welcome to DXRKICE!"
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                  placeholder="Enter your notification message here..."
                  className="bg-gray-800 border-gray-700 min-h-[120px]"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black">
                  Create Template
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Notification Template</DialogTitle>
              <DialogDescription className="text-gray-400">Update notification template details</DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <form onSubmit={handleUpdateTemplate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Template Name</Label>
                  <Input
                    id="edit_name"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_type">Type</Label>
                  <Select
                    value={editingTemplate.type}
                    onValueChange={(value) => setEditingTemplate({ ...editingTemplate, type: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_subject">Subject</Label>
                  <Input
                    id="edit_subject"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_message">Message</Label>
                  <Textarea
                    id="edit_message"
                    value={editingTemplate.message}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                    className="bg-gray-800 border-gray-700 min-h-[120px]"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_is_active"
                    checked={editingTemplate.is_active}
                    onCheckedChange={(checked) =>
                      setEditingTemplate({ ...editingTemplate, is_active: checked === true })
                    }
                  />
                  <Label htmlFor="edit_is_active">Active Template</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black">
                    Update Template
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Notification Dialog */}
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedTemplate && `Send "${selectedTemplate.name}" to recipients`}
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <form onSubmit={handleSendNotificationSubmit} className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Template Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Subject:</span> {selectedTemplate.subject}
                    </div>
                    <div>
                      <span className="text-gray-400">Message:</span> {selectedTemplate.message}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Input
                    id="recipients"
                    value={sendNotification.recipientInput}
                    onChange={(e) => setSendNotification({ ...sendNotification, recipientInput: e.target.value })}
                    placeholder="Enter recipient emails separated by commas"
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black">
                    Send Notification
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
