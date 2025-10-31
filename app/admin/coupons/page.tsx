"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Calendar, Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Percent, DollarSign, Truck } from "lucide-react"
import { useCoupons } from "@/hooks/useCoupons"
import { createCouponAction, updateCouponAction, deleteCouponAction } from "@/lib/actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const { coupons, loading, error, refetch, pagination } = useCoupons({ 
    search: searchTerm,
    page: currentPage,
    limit: itemsPerPage,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active"
  });

  const filteredCoupons = coupons || [];

  const getStatusColor = (coupon: any) => {
    if (!coupon.isActive) {
      return "bg-gray-100 text-gray-800"
    }
    
    const now = new Date()
    const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : null
    const startsAt = coupon.startsAt ? new Date(coupon.startsAt) : null
    
    if (expiresAt && expiresAt < now) {
      return "bg-red-100 text-red-800"
    }
    
    if (startsAt && startsAt > now) {
      return "bg-yellow-100 text-yellow-800"
    }
    
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (coupon: any) => {
    if (!coupon.isActive) {
      return "Inactive"
    }
    
    const now = new Date()
    const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : null
    const startsAt = coupon.startsAt ? new Date(coupon.startsAt) : null
    
    if (expiresAt && expiresAt < now) {
      return "Expired"
    }
    
    if (startsAt && startsAt > now) {
      return "Scheduled"
    }
    
    return "Active"
  }

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="h-3 w-3" />
      case "FIXED_AMOUNT":
        return <DollarSign className="h-3 w-3" />
      case "FREE_SHIPPING":
        return <Truck className="h-3 w-3" />
      default:
        return <Percent className="h-3 w-3" />
    }
  }

  const formatDiscountValue = (coupon: any) => {
    switch (coupon.discountType) {
      case "PERCENTAGE":
        return `${coupon.discountValue}%`
      case "FIXED_AMOUNT":
        return `$${coupon.discountValue}`
      case "FREE_SHIPPING":
        return "Free Shipping"
      default:
        return `${coupon.discountValue}%`
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons & Discounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage promotional codes and discounts • {pagination?.totalCount || 0} total coupons
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hover:bg-primary/90 shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon-code">Coupon Code</Label>
                  <Input id="coupon-code" placeholder="Enter coupon code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount-type">Discount Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount-value">Discount Value</Label>
                  <Input id="discount-value" placeholder="Enter value" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-order">Minimum Order Amount</Label>
                  <Input id="min-order" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usage-limit">Usage Limit</Label>
                  <Input id="usage-limit" type="number" placeholder="Enter limit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Input id="expiry-date" type="date" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active-status" />
                <Label htmlFor="active-status">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)} className="hover:bg-primary/90">
                  Create Coupon
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupons by code or name..."
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
              <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
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

      {/* Coupons Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Coupons ({pagination?.totalCount || 0})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination?.totalCount || 0)} of {pagination?.totalCount || 0} coupons
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading coupons...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Failed to load coupons</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="min-w-[120px]">Code</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="text-right min-w-[100px]">Value</TableHead>
                    <TableHead className="text-right min-w-[100px]">Min Order</TableHead>
                    <TableHead className="text-center min-w-[120px]">Usage</TableHead>
                    <TableHead className="text-center min-w-[100px]">Status</TableHead>
                    <TableHead className="text-center min-w-[120px]">Expiry</TableHead>
                    <TableHead className="text-center w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-muted-foreground">No coupons found</div>
                          {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                              Try adjusting your search terms
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <TableRow key={coupon.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium font-mono text-sm">{coupon.code}</div>
                            <div className="text-xs text-muted-foreground">ID: {coupon.id}</div>
                            {coupon.name && (
                              <div className="text-xs text-muted-foreground">{coupon.name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getDiscountIcon(coupon.discountType)}
                            <span className="text-sm">
                              {coupon.discountType === 'PERCENTAGE' ? 'Percentage' : 
                               coupon.discountType === 'FIXED_AMOUNT' ? 'Fixed' : 'Free Shipping'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold">{formatDiscountValue(coupon)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">${coupon.minOrderValue || 0}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className="text-sm">
                              {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                            </div>
                            {coupon.usageLimit && (
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{ 
                                    width: `${Math.min(((coupon.usageCount || 0) / coupon.usageLimit) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`text-xs ${getStatusColor(coupon)}`}
                            variant="secondary"
                          >
                            {getStatusText(coupon)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-xs text-muted-foreground">
                            {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
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
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Coupon
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                View Usage
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Coupon
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
    </div>
  )
}
