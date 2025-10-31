"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Save, Mail, Phone, MapPin, Calendar, ArrowLeft, Edit, X, Loader2, User, Package, Users, DollarSign } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { profile, loading, error, updateProfile } = useProfile()
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [originalData, setOriginalData] = useState(profileData)

  // Update profile data when profile is loaded
  useEffect(() => {
    if (profile) {
      const newData = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
      }
      setProfileData(newData)
      setOriginalData(newData)
    }
  }, [profile])

  const handleSave = async () => {
    try {
      const result = await updateProfile(profileData)
      
      if (result.success) {
        setIsEditing(false)
        setOriginalData(profileData)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setProfileData(originalData)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const stats = profile?.adminStats ? [
    { 
      label: "Total Orders", 
      value: profile.adminStats.totalOrders.toLocaleString(), 
      color: "text-blue-600",
      icon: Package
    },
    { 
      label: "Products Managed", 
      value: profile.adminStats.totalProducts.toLocaleString(), 
      color: "text-green-600",
      icon: Package
    },
    { 
      label: "Customers", 
      value: profile.adminStats.totalCustomers.toLocaleString(), 
      color: "text-purple-600",
      icon: Users
    },
    { 
      label: "Revenue Generated", 
      value: formatCurrency(profile.adminStats.totalRevenue), 
      color: "text-orange-600",
      icon: DollarSign
    },
  ] : [
    { 
      label: "My Orders", 
      value: profile?.stats?.orders?.toLocaleString() || "0", 
      color: "text-blue-600",
      icon: Package
    },
    { 
      label: "Reviews Written", 
      value: profile?.stats?.reviews?.toLocaleString() || "0", 
      color: "text-green-600",
      icon: User
    },
    { 
      label: "Wishlist Items", 
      value: profile?.stats?.wishlistItems?.toLocaleString() || "0", 
      color: "text-purple-600",
      icon: User
    },
    { 
      label: "Member Since", 
      value: profile ? formatDate(profile.createdAt) : "N/A", 
      color: "text-orange-600",
      icon: Calendar
    },
  ]

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load profile</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No profile data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading} className="hover:bg-primary/90">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="hover:bg-primary/90">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src="/placeholder.svg" alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {`${profile.firstName} ${profile.lastName}`
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary bg-white shadow-md"
                  onClick={() => alert("Image upload functionality would be implemented here")}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">{`${profile.firstName} ${profile.lastName}`}</CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {profile.isAdmin ? "Administrator" : "Customer"}
              </Badge>
              <p className="text-sm text-muted-foreground">User ID: {profile.id}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {formatDate(profile.createdAt)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Last Updated:</strong> {formatDate(profile.updatedAt)}
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="focus:ring-primary focus:border-primary"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{profile.firstName}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="focus:ring-primary focus:border-primary"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{profile.lastName}</div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="focus:ring-primary focus:border-primary"
                    placeholder="Enter your email address"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{profile.email}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="focus:ring-primary focus:border-primary"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">{profile.phone || "Not provided"}</div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <div className="p-3 bg-muted rounded-md">
                  {profile.isAdmin ? "Administrator" : "Customer"}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <div className="p-3 bg-muted rounded-md">{profile.id}</div>
              </div>
            </div>

            {isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Changes will be saved to your profile. Make sure all information is accurate
                  before saving.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{profile.isAdmin ? "Admin Performance Stats" : "Account Statistics"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div key={index} className="text-center p-6 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
