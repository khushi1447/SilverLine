"use client"

import { useState } from "react"
import { Search, CreditCard, RefreshCw, Download, ChevronLeft, ChevronRight, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { usePayments } from "@/hooks/usePayments"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const { payments, loading, error, pagination } = usePayments({ 
    search: searchTerm,
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter === "all" ? undefined : statusFilter,
    method: methodFilter === "all" ? undefined : methodFilter
  });

  const filteredPayments = payments || [];

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REFUNDED":
        return "bg-red-100 text-red-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle className="h-3 w-3" />
      case "PENDING":
        return <Clock className="h-3 w-3" />
      case "REFUNDED":
        return <RefreshCw className="h-3 w-3" />
      case "FAILED":
        return <XCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return <CreditCard className="h-3 w-3" />
      case "UPI":
      case "NET_BANKING":
      case "BANK_TRANSFER":
        return <CreditCard className="h-3 w-3" />
      case "WALLET":
        return <CreditCard className="h-3 w-3" />
      case "COD":
        return <CreditCard className="h-3 w-3" />
      default:
        return <CreditCard className="h-3 w-3" />
    }
  }

  const formatMethod = (method: string) => {
    switch (method?.toUpperCase()) {
      case "CREDIT_CARD":
        return "Credit Card"
      case "DEBIT_CARD":
        return "Debit Card"
      case "UPI":
        return "UPI"
      case "NET_BANKING":
        return "Net Banking"
      case "WALLET":
        return "Wallet"
      case "COD":
        return "Cash on Delivery"
      case "BANK_TRANSFER":
        return "Bank Transfer"
      default:
        return method || "Unknown"
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleRefund = (paymentId: number) => {
    console.log("Processing refund for payment:", paymentId)
    // Handle refund logic here
  }

  // Calculate stats from actual data
  const totalRevenue = filteredPayments.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = filteredPayments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0)
  const refundedAmount = filteredPayments.filter((p) => p.status === "REFUNDED").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Manage payments and process refunds • {pagination?.totalCount || 0} total payments
          </p>
        </div>
        <Button className="hover:bg-primary/90 shadow-sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded Amount</CardTitle>
            <RefreshCw className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(refundedAmount)}</div>
            <p className="text-xs text-muted-foreground">Total refunds issued</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments by ID, order, customer, or transaction..."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="debit_card">Debit Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="net_banking">Net Banking</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
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

      {/* Payments Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Payments ({pagination?.totalCount || 0})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination?.totalCount || 0)} of {pagination?.totalCount || 0} payments
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading payments...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Failed to load payments</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="min-w-[100px]">Payment ID</TableHead>
                    <TableHead className="min-w-[120px]">Order</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[120px]">Method</TableHead>
                    <TableHead className="text-center min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Transaction ID</TableHead>
                    <TableHead className="text-center min-w-[120px]">Date</TableHead>
                    <TableHead className="text-center w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-muted-foreground">No payments found</div>
                          {searchTerm && (
                            <div className="text-sm text-muted-foreground">
                              Try adjusting your search terms
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="font-medium text-sm">#{payment.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{payment.orderNumber}</div>
                            <div className="text-xs text-muted-foreground">Order #{payment.orderId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{payment.customer.name}</div>
                            <div className="text-xs text-muted-foreground">{payment.customer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                          <div className="text-xs text-muted-foreground">{payment.currency}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getMethodIcon(payment.method)}
                            <span className="text-sm">{formatMethod(payment.method)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`text-xs ${getStatusColor(payment.status)} flex items-center gap-1 w-fit mx-auto`}
                            variant="secondary"
                          >
                            {getStatusIcon(payment.status)}
                            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs">
                            {payment.transactionId || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-xs text-muted-foreground">
                            {formatDate(payment.createdAt)}
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
                              <DropdownMenuItem onClick={() => setSelectedPayment(payment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {payment.refundable && (
                                <DropdownMenuItem onClick={() => handleRefund(payment.id)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Process Refund
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <CreditCard className="mr-2 h-4 w-4" />
                                View Transaction
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

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Payment Details - #{selectedPayment?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Payment Status</div>
                  <Badge className={`${getStatusColor(selectedPayment.status)} flex items-center gap-1 w-fit mt-1`}>
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status?.charAt(0).toUpperCase() + selectedPayment.status?.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="text-lg font-semibold mt-1">{formatCurrency(selectedPayment.amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment Date</div>
                  <div className="text-sm mt-1">{formatDate(selectedPayment.createdAt)}</div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Payment ID:</span>
                      <div className="font-medium">#{selectedPayment.id}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Order Number:</span>
                      <div className="text-sm">{selectedPayment.orderNumber}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Payment Method:</span>
                      <div className="text-sm flex items-center gap-1">
                        {getMethodIcon(selectedPayment.method)}
                        {formatMethod(selectedPayment.method)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Transaction ID:</span>
                      <div className="text-sm font-mono">{selectedPayment.transactionId || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Gateway:</span>
                      <div className="text-sm">{selectedPayment.gateway || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Currency:</span>
                      <div className="text-sm">{selectedPayment.currency}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Customer Name:</span>
                      <div className="font-medium">{selectedPayment.customer.name}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Email:</span>
                      <div className="text-sm">{selectedPayment.customer.email}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Customer ID:</span>
                      <div className="text-sm font-mono">{selectedPayment.customer.id}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                  Close
                </Button>
                {selectedPayment.refundable && (
                  <Button variant="outline" onClick={() => handleRefund(selectedPayment.id)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Process Refund
                  </Button>
                )}
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
