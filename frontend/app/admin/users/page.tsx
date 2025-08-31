"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Clock,
} from "lucide-react"
import { adminService, type AdminUser } from "@/lib/api-admin"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all") // Updated default value to "all"
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getUsers({
        page: currentPage,
        search: searchTerm,
        role: roleFilter,
      })

      setUsers(data.results)
      setTotalCount(data.count)
      setTotalPages(Math.ceil(data.count / usersPerPage))
    } catch (error) {
      console.error("Error fetching users:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load users"
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      await adminService.updateUser(editingUser.id, {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
        role: editingUser.role,
        is_active: editingUser.is_active,
        is_staff: editingUser.is_staff,
      })

      toast({
        title: "User updated",
        description: `${editingUser.first_name} ${editingUser.last_name} has been updated`,
      })

      setIsEditDialogOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await adminService.deleteUser(id)
      toast({
        title: "User deleted",
        description: `"${name}" has been successfully deleted`,
      })
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getRoleBadge = (role: string, isStaff: boolean) => {
    if (role === "admin" || isStaff) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      )
    }
    if (role === "employee") {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Employee
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-gray-800 border-gray-700">
        User
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
          <h2 className="text-xl font-bold">Failed to Load Users</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchUsers} className="bg-orange-500 hover:bg-orange-600 text-black">
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
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-400">Manage user accounts and permissions</p>
          </div>

          <Button
            onClick={() => router.push("/admin/users/new")}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader className="pb-3">
            <CardTitle>User Search & Filters</CardTitle>
            <CardDescription className="text-gray-400">Find users by name, email, or role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
                <Button type="submit" variant="secondary" disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle>Users</CardTitle>
            <CardDescription className="text-gray-400">
              {loading ? "Loading..." : `${totalCount} users found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No users found</p>
                <Button
                  onClick={() => router.push("/admin/users/new")}
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First User
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-800/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-800/50">
                          <TableCell className="font-medium">
                            {user.first_name} {user.last_name}
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role, user.is_staff)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={user.is_active ? "default" : "secondary"}
                              className={
                                user.is_active
                                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                                  : "bg-gray-500/20 text-gray-400 border-gray-500/40"
                              }
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {formatDate(user.date_joined)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.last_login ? (
                              <div className="text-sm">{formatDate(user.last_login)}</div>
                            ) : (
                              <div className="text-sm text-gray-500">Never</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gray-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription className="text-gray-400">Update user information and permissions</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={editingUser.first_name}
                      onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={editingUser.last_name}
                      onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={editingUser.is_active}
                      onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_active: checked === true })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_staff"
                      checked={editingUser.is_staff}
                      onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_staff: checked === true })}
                    />
                    <Label htmlFor="is_staff">Staff</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black">
                    Update User
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
