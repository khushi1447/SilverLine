import axios from 'axios'

// Delhivery API Configuration
const DELHIVERY_BASE_URL = process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com'
const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY!
const DELHIVERY_CLIENT_NAME = process.env.DELHIVERY_CLIENT_NAME || 'ElegantJewelry'

// Delhivery API Endpoints
const DELHIVERY_ENDPOINTS = {
  CREATE_PACKAGE: '/api/cmu/create.json',
  TRACK_PACKAGE: '/api/v1/packages/json/',
  CANCEL_PACKAGE: '/api/p/edit',
  GET_SERVICES: '/api/kinko/v1/invoice/services',
  CREATE_PICKUP: '/api/backend/createpickup',
}

// Types for Delhivery API
export interface DelhiveryAddress {
  name: string
  address: string
  city: string
  state: string
  pin: string
  country: string
  phone: string
  email?: string
}

export interface DelhiveryPackage {
  name: string
  weight: string // in grams
  dimensions?: {
    length: string // in cm
    width: string // in cm
    height: string // in cm
  }
  price: string // in INR
  quantity: number
  description?: string
  sku?: string
}

export interface DelhiveryShipmentRequest {
  pickup_location: DelhiveryAddress
  shipments: Array<{
    name: string
    add: string
    city: string
    state: string
    country: string
    pin: string
    phone: string
    email?: string
    order: string // order number
    products_desc: string
    weight: string
    payment_mode: 'Pre-paid' | 'COD'
    collectable_amount?: string // for COD
    return_name?: string
    return_add?: string
    return_city?: string
    return_state?: string
    return_country?: string
    return_pin?: string
    return_phone?: string
    return_email?: string
  }>
}

export interface DelhiveryShipmentResponse {
  success: boolean
  packages: Array<{
    waybill: string // tracking number
    refnum: string // reference number
    cod_amount?: string
    payment_mode: string
    serviceable: boolean
    status: string
    message?: string
  }>
  error?: string
}

export interface DelhiveryTrackingResponse {
  success: boolean
  tracking_data: {
    shipment_data: Array<{
      waybill: string
      current_status: string
      current_status_type: string
      current_status_location: string
      current_status_time: string
      expected_delivery_date?: string
      delivered_at?: string
      origin?: string
      destination?: string
      weight?: string
      volume_weight?: string
      payment_mode?: string
      cod_amount?: string
      customer_name?: string
      customer_phone?: string
      customer_address?: string
      origin_pin?: string
      destination_pin?: string
      origin_city?: string
      destination_city?: string
      origin_state?: string
      destination_state?: string
      origin_country?: string
      destination_country?: string
      return_pin?: string
      return_city?: string
      return_state?: string
      return_country?: string
      return_address?: string
      return_name?: string
      return_phone?: string
      return_email?: string
      pieces?: string
      product?: string
      product_amount?: string
      origin_address?: string
      destination_address?: string
      origin_country_code?: string
      destination_country_code?: string
      origin_lat?: string
      origin_lng?: string
      destination_lat?: string
      destination_lng?: string
      origin_zone?: string
      destination_zone?: string
      origin_hub?: string
      destination_hub?: string
      origin_area?: string
      destination_area?: string
      origin_branch?: string
      destination_branch?: string
      origin_branch_code?: string
      destination_branch_code?: string
      origin_branch_contact?: string
      destination_branch_contact?: string
      origin_branch_email?: string
      destination_branch_email?: string
      origin_branch_address?: string
      destination_branch_address?: string
      origin_branch_city?: string
      destination_branch_city?: string
      origin_branch_state?: string
      destination_branch_state?: string
      origin_branch_pin?: string
      destination_branch_pin?: string
      origin_branch_country?: string
      destination_branch_country?: string
      origin_branch_lat?: string
      destination_branch_lat?: string
      origin_branch_lng?: string
      destination_branch_lng?: string
      origin_branch_zone?: string
      destination_branch_zone?: string
      origin_branch_hub?: string
      destination_branch_hub?: string
      origin_branch_area?: string
      destination_branch_area?: string
      scans?: Array<{
        status: string
        status_type: string
        status_location: string
        status_time: string
        instruction: string
      }>
    }>
  }
}

// Delhivery Service Class
export class DelhiveryService {
  private apiKey: string
  private clientName: string
  private baseURL: string

  constructor() {
    this.apiKey = DELHIVERY_API_KEY
    this.clientName = DELHIVERY_CLIENT_NAME
    this.baseURL = DELHIVERY_BASE_URL

    if (!this.apiKey) {
      throw new Error('Delhivery API key is required')
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config: any = {
        method,
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      }

      if (method === 'POST' && data) {
        config.data = data
      }

      const response = await axios(url, config)
      return response.data
    } catch (error: any) {
      console.error('Delhivery API Error:', error.response?.data || error.message)
      throw new Error(`Delhivery API Error: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Create a shipment with Delhivery
   */
  async createShipment(shipmentData: DelhiveryShipmentRequest): Promise<DelhiveryShipmentResponse> {
    try {
      const response = await this.makeRequest<any>(
        DELHIVERY_ENDPOINTS.CREATE_PACKAGE,
        'POST',
        shipmentData
      )

      // Parse Delhivery response
      if (response && response.packages && response.packages.length > 0) {
        return {
          success: true,
          packages: response.packages.map((pkg: any) => ({
            waybill: pkg.waybill,
            refnum: pkg.refnum,
            cod_amount: pkg.cod_amount,
            payment_mode: pkg.payment_mode,
            serviceable: pkg.serviceable === 'true' || pkg.serviceable === true,
            status: pkg.status,
            message: pkg.message,
          })),
        }
      } else if (response && response.error) {
        return {
          success: false,
          packages: [],
          error: response.error,
        }
      } else {
        throw new Error('Invalid response format from Delhivery')
      }
    } catch (error) {
      console.error('Error creating Delhivery shipment:', error)
      return {
        success: false,
        packages: [],
        error: error instanceof Error ? error.message : 'Failed to create shipment',
      }
    }
  }

  /**
   * Track a shipment
   */
  async trackShipment(waybill: string): Promise<DelhiveryTrackingResponse> {
    try {
      const response = await this.makeRequest<any>(
        `${DELHIVERY_ENDPOINTS.TRACK_PACKAGE}${waybill}`,
        'GET'
      )

      if (response && response.ShipmentData && response.ShipmentData.length > 0) {
        return {
          success: true,
          tracking_data: {
            shipment_data: response.ShipmentData.map((shipment: any) => ({
              waybill: shipment.Waybill,
              current_status: shipment.CurrentStatus,
              current_status_type: shipment.CurrentStatusType,
              current_status_location: shipment.CurrentStatusLocation,
              current_status_time: shipment.CurrentStatusTime,
              expected_delivery_date: shipment.ExpectedDeliveryDate,
              delivered_at: shipment.DeliveredAt,
              origin: shipment.Origin,
              destination: shipment.Destination,
              weight: shipment.Weight,
              volume_weight: shipment.VolumetricWeight,
              payment_mode: shipment.PaymentMode,
              cod_amount: shipment.CODAmount,
              customer_name: shipment.Consignee,
              customer_phone: shipment.ConsigneeContact,
              customer_address: shipment.ConsigneeAddress,
              origin_pin: shipment.OriginPinCode,
              destination_pin: shipment.DestinationPinCode,
              origin_city: shipment.OriginCity,
              destination_city: shipment.DestinationCity,
              origin_state: shipment.OriginState,
              destination_state: shipment.DestinationState,
              origin_country: shipment.OriginCountry,
              destination_country: shipment.DestinationCountry,
              return_pin: shipment.ReturnPinCode,
              return_city: shipment.ReturnCity,
              return_state: shipment.ReturnState,
              return_country: shipment.ReturnCountry,
              return_address: shipment.ReturnAddress,
              return_name: shipment.ReturnName,
              return_phone: shipment.ReturnContact,
              return_email: shipment.ReturnEmail,
              pieces: shipment.Pieces,
              product: shipment.Product,
              product_amount: shipment.ProductAmount,
              origin_address: shipment.OriginAddress,
              destination_address: shipment.DestinationAddress,
              scans: shipment.Scans?.ScanDetails?.map((scan: any) => ({
                status: scan.ScanStatus,
                status_type: scan.ScanType,
                status_location: scan.ScanLocation,
                status_time: scan.ScanDateTime,
                instruction: scan.Instruction,
              })) || [],
            })),
          },
        }
      } else {
        return {
          success: false,
          tracking_data: { shipment_data: [] },
          error: 'No tracking data found',
        }
      }
    } catch (error) {
      console.error('Error tracking Delhivery shipment:', error)
      return {
        success: false,
        tracking_data: { shipment_data: [] },
        error: error instanceof Error ? error.message : 'Failed to track shipment',
      }
    }
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(waybill: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await this.makeRequest<any>(
        `${DELHIVERY_ENDPOINTS.CANCEL_PACKAGE}`,
        'POST',
        {
          waybill,
          cancellation_reason: 'Order cancelled by customer',
        }
      )

      if (response && response.success) {
        return {
          success: true,
          message: response.message || 'Shipment cancelled successfully',
        }
      } else {
        return {
          success: false,
          error: response.error || 'Failed to cancel shipment',
        }
      }
    } catch (error) {
      console.error('Error cancelling Delhivery shipment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel shipment',
      }
    }
  }
}

// Singleton instance
let delhiveryServiceInstance: DelhiveryService | null = null

export function getDelhiveryService(): DelhiveryService {
  if (!delhiveryServiceInstance) {
    delhiveryServiceInstance = new DelhiveryService()
  }
  return delhiveryServiceInstance
}

export default DelhiveryService