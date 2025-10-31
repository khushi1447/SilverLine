"use client"

import { useState } from "react"
import { Search, Mail, Phone, Calendar, User, Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Edit, Shield } from "lucide-react"
import { useCustomers } from "@/hooks/useCustomers"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const { customers, loading, error, pagination } = useCustomers({ 
    search: searchTerm,
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter === "all" ? undefined : statusFilter
  });

  // Debug logging
  console.log('Customers Page - Filter state:', { 
    searchTerm, 
    statusFilter, 
    currentPage, 
    itemsPerPage,
    customersCount: customers?.length || 0,
    adminCount: customers?.filter(c => c.isAdmin).length || 0,
    customerCount: customers?.filter(c => !c.isAdmin).length || 0
  });

  const filteredCustomers = customers || [];

  const getStatusColor = (customer: any) => {
    if (customer.isAdmin) {
      return "bg-purple-100 text-purple-800"
    }
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (customer: any) => {
    return customer.isAdmin ? "Admin" : "Customer"
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer base • {pagination?.totalCount || 0} total customers
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Customers ({pagination?.totalCount || 0})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination?.totalCount || 0)} of {pagination?.totalCount || 0} customers
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading customers...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Failed to load customers</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="min-w-[200px]">Customer</TableHead>
                    <TableHead className="min-w-[150px]">Contact</TableHead>
                    <TableHead className="text-center min-w-[100px]">Orders</TableHead>
                    <TableHead className="text-center min-w-[100px]">Reviews</TableHead>
                    <TableHead className="text-center min-w-[100px]">Wishlist</TableHead>
                    <TableHead className="text-center min-w-[100px]">Status</TableHead>
                    <TableHead className="text-center min-w-[120px]">Joined</TableHead>
                    <TableHead className="text-center w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-muted-foreground">No customers found</div>
                          {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                              Try adjusting your search terms
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">ID: {customer.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-medium">{customer.stats?.totalOrders || 0}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-medium">0</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-medium">0</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`text-xs ${getStatusColor(customer)}`}
                            variant={customer.isAdmin ? "default" : "secondary"}
                          >
                            {customer.isAdmin && <Shield className="h-3 w-3 mr-1" />}
                            {getStatusText(customer)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-xs text-muted-foreground">
                            {formatDate(customer.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Customer Details - {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Customer Type</div>
                  <Badge className={`${getStatusColor(selectedCustomer)} flex items-center gap-1 w-fit mt-1`}>
                    {selectedCustomer.isAdmin && <Shield className="h-3 w-3" />}
                    {getStatusText(selectedCustomer)}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                  <div className="text-lg font-semibold mt-1">{selectedCustomer.stats?.orders || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                  <div className="text-sm mt-1">{formatDate(selectedCustomer.createdAt)}</div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                      <div className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Email:</span>
                      <div className="text-sm">{selectedCustomer.email}</div>
                    </div>
                    {selectedCustomer.phone && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                        <div className="text-sm">{selectedCustomer.phone}</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Customer ID:</span>
                      <div className="text-sm font-mono">{selectedCustomer.id}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Account Type:</span>
                      <div className="text-sm">{selectedCustomer.isAdmin ? "Administrator" : "Customer"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div>
                <h3 className="font-semibold mb-3">Activity Statistics</h3>
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedCustomer.stats?.orders || 0}</div>
                    <div className="text-sm text-muted-foreground">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedCustomer.stats?.reviews || 0}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedCustomer.stats?.wishlistItems || 0}</div>
                    <div className="text-sm text-muted-foreground">Wishlist Items</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Customer
                </Button>
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}