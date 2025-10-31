"use client"

import { useState } from "react"
import { Search, Eye, RefreshCw, CreditCard, Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { useOrders } from "@/hooks/useOrders"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  
  const { orders, loading, error, pagination } = useOrders({ 
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter === "all" ? undefined : statusFilter
  })

  const allOrders = orders || [];
  
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "REFUNDED":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return <Package className="h-3 w-3" />
      case "CONFIRMED":
        return <Package className="h-3 w-3" />
      case "PROCESSING":
        return <Package className="h-3 w-3" />
      case "SHIPPED":
        return <Truck className="h-3 w-3" />
      case "DELIVERED":
        return <CheckCircle className="h-3 w-3" />
      case "CANCELLED":
        return <XCircle className="h-3 w-3" />
      case "REFUNDED":
        return <RefreshCw className="h-3 w-3" />
      default:
        return <Package className="h-3 w-3" />
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRefund = (orderId: string) => {
    // Handle refund logic
    console.log("Processing refund for order:", orderId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer orders and payments • {pagination?.totalCount || 0} total orders
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, customers..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
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

      {/* Orders Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Orders ({pagination?.totalCount || 0})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination?.totalCount || 0)} of {pagination?.totalCount || 0} orders
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading orders...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Failed to load orders</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
          <Table>
            <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="min-w-[120px]">Order</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="text-right min-w-[100px]">Total</TableHead>
                    <TableHead className="text-center min-w-[120px]">Status</TableHead>
                    <TableHead className="text-center min-w-[120px]">Payment</TableHead>
                    <TableHead className="text-center min-w-[140px]">Date</TableHead>
                    <TableHead className="text-center w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-muted-foreground">No orders found</div>
                          {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                              Try adjusting your search terms
                            </div>
                          )}
                    </div>
                  </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">#{order.orderNumber || order.id}</div>
                            <div className="text-xs text-muted-foreground">ID: {order.id}</div>
                          </div>
                  </TableCell>
                  <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {order.user?.name || `User ${order.user?.id || 'N/A'}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.user?.email || 'No email'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold">{formatPrice(order.pricing?.totalAmount || 0)}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`text-xs ${getStatusColor(order.status)} flex items-center gap-1 w-fit mx-auto`}
                            variant="secondary"
                          >
                            {getStatusIcon(order.status)}
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase()}
                          </Badge>
                  </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`text-xs ${getPaymentStatusColor(order.payment?.status || 'pending')}`}
                            variant={order.payment?.status === 'paid' ? "default" : "secondary"}
                          >
                            {order.payment?.status ? order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1) : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
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
                              <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                Update Status
                              </DropdownMenuItem>
                              {order.payment?.status === "paid" && (
                                <DropdownMenuItem onClick={() => handleRefund(order.id)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Issue Refund
                                </DropdownMenuItem>
                              )}
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

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Order Details - #{selectedOrder?.orderNumber || selectedOrder?.id}
            </DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Order Status</div>
                  <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1 w-fit mt-1`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment Status</div>
                  <Badge className={`${getPaymentStatusColor(selectedOrder.payment?.status || 'pending')} w-fit mt-1`}>
                    {selectedOrder.payment?.status?.charAt(0).toUpperCase() + selectedOrder.payment?.status?.slice(1) || 'Pending'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-lg font-semibold mt-1">{formatPrice(selectedOrder.pricing?.totalAmount || 0)}</div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Customer:</span>
                      <div className="font-medium">{selectedOrder.user?.name || `User ${selectedOrder.user?.id || 'N/A'}`}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Email:</span>
                      <div className="text-sm">{selectedOrder.user?.email || 'No email'}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Order Date:</span>
                      <div className="text-sm">{formatDate(selectedOrder.createdAt)}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                              <div>
                      <span className="text-sm font-medium text-muted-foreground">Payment Method:</span>
                      <div className="text-sm">{selectedOrder.payment?.method || 'N/A'}</div>
                    </div>
                                  <div>
                      <span className="text-sm font-medium text-muted-foreground">Transaction ID:</span>
                      <div className="text-sm">{selectedOrder.payment?.transactionId || 'N/A'}</div>
                                  </div>
                                  <div>
                      <span className="text-sm font-medium text-muted-foreground">Order Number:</span>
                      <div className="text-sm">#{selectedOrder.orderNumber || selectedOrder.id}</div>
                    </div>
                                  </div>
                                </div>
                              </div>

              {/* Order Items */}
                              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                      {selectedOrder.items?.map((item: any, index: number) => (
                                      <TableRow key={index}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{item.productName || 'Product'}</div>
                              <div className="text-xs text-muted-foreground">SKU: {item.productSku || item.productId}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                          <TableCell className="text-right font-medium">{formatPrice(item.totalPrice)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                {/* Order Totals */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.pricing?.subtotal || 0)}</span>
                  </div>
                  {selectedOrder.pricing?.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>{formatPrice(selectedOrder.pricing.shippingCost)}</span>
                    </div>
                  )}
                  {selectedOrder.pricing?.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(selectedOrder.pricing.discountAmount)}</span>
                    </div>
                  )}
                              <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.pricing?.totalAmount || 0)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
                {selectedOrder.payment?.status === "paid" && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRefund(selectedOrder.id)}
                                    className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Issue Refund
                                  </Button>
                                )}
                <Button>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  View Payment Details
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
    </div>
  )
}
