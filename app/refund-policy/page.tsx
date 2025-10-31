import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { RefreshCw, XCircle, RotateCcw, PackageCheck, AlertTriangle, Truck, Clock, CheckCircle, Mail } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 light-shadow">
              <RefreshCw className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4">Refund & Cancellation Policy</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your satisfaction is our priority. Learn about our hassle-free refund and return process
            </p>
            <p className="text-sm text-gray-500 mt-4">Last Updated: January 2025</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* Overview Card */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Overview</h2>
                  <p className="text-gray-700 leading-relaxed">
                    At Silver Line, we want you to be completely satisfied with your purchase. This policy outlines our 
                    refund and cancellation procedures to ensure a transparent and fair process for all customers.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Cancellation Card */}
            <div className="bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Order Cancellation</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white/50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-pink-500" />
                        2.1 Before Shipping
                      </h3>
                      <p className="text-gray-700 mb-3">You may cancel your order before it has been shipped:</p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>Contact us immediately via email or phone</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>Provide your order number and details</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>Full refund will be processed within 5-7 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>No cancellation charges will be applied</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white/50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-500" />
                        2.2 After Shipping
                      </h3>
                      <p className="text-gray-700">
                        Once the order has been shipped, cancellation is not possible. However, you may return the product 
                        as per our return policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Policy Card */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Return Policy</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white/50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1 Return Eligibility</h3>
                      <p className="text-gray-700 mb-3">Products can be returned within 7 days of delivery if:</p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Product is damaged or defective</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Wrong product was delivered</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Product is significantly different from description</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Product has manufacturing defects</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white/50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">3.2 Return Conditions</h3>
                      <p className="text-gray-700 mb-3">To be eligible for a return, products must meet the following conditions:</p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>Item must be unused and in original condition</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>Original packaging and tags must be intact</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>Certificate of authenticity (if provided) must be included</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>Product must not be customized or personalized</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>Return request must be initiated within 7 days of delivery</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white/50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        3.3 Non-Returnable Items
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">✕</span>
                          <span>Customized or personalized jewelry</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">✕</span>
                          <span>Products without original packaging</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">✕</span>
                          <span>Products damaged due to misuse</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">✕</span>
                          <span>Sale or clearance items (unless defective)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Process Card */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <PackageCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Return Process</h2>
                  <p className="text-gray-700 mb-4">To initiate a return, follow these steps:</p>
                  
                  <div className="space-y-4">
                    {[
                      { step: 1, title: "Contact Us", desc: "Email us at ac@silverline925.in or call +91 9512765399 within 7 days of receiving your order" },
                      { step: 2, title: "Provide Details", desc: "Share your order number, reason for return, and photos of the product (if applicable)" },
                      { step: 3, title: "Get Approval", desc: "Wait for our team to review and approve your return request" },
                      { step: 4, title: "Ship the Product", desc: "Pack the item securely in its original packaging and ship it to our address" },
                      { step: 5, title: "Inspection", desc: "Once we receive the product, we will inspect it within 2-3 business days" },
                      { step: 6, title: "Refund", desc: "If approved, refund will be processed to your original payment method" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 bg-white/50 rounded-xl p-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-700">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Policy Card */}
            <div className="bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Policy</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white/50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">5.1 Refund Processing</h3>
                      <p className="text-gray-700 mb-3">Once your return is received and inspected:</p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>You will receive an email confirmation about the approval or rejection of your refund</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>Approved refunds will be processed within 5-7 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>Refund will be credited to the original payment method</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>Bank processing may take additional 5-10 business days</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white/50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">5.2 Partial Refunds</h3>
                      <p className="text-gray-700 mb-3">Partial refunds may be granted in cases where:</p>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Item shows signs of use</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Item is not in original condition</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Packaging is damaged</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Parts or accessories are missing</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Policy Card */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Exchange Policy</h2>
                  <p className="text-gray-700 mb-3">We offer exchanges in the following cases:</p>
                  <ul className="space-y-2 text-gray-700 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Defective or damaged products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Wrong size (if applicable)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Manufacturing defects</span>
                    </li>
                  </ul>
                  <p className="text-gray-700">
                    Exchange requests must be made within 7 days of delivery. The replacement will be shipped once we 
                    receive and inspect the returned product.
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Charges Card */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Shipping Charges</h2>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>If the product is defective or wrong, we will bear the return shipping charges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>For other returns, return shipping charges are the responsibility of the customer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>We recommend using a trackable shipping service</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Damaged Products Card */}
            <div className="bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Damaged or Defective Products</h2>
                  <p className="text-gray-700 mb-3">If you receive a damaged or defective product:</p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>Contact us within 48 hours of delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>Provide clear photos of the damage or defect</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>We will arrange for a replacement or full refund</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>No questions asked for genuine cases</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact for Returns & Refunds</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For any queries regarding returns, cancellations, or refunds, please contact us:
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center gap-2">
                      <span className="text-blue-500">📧</span>
                      <span>Email: ac@silverline925.in</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-blue-500">📱</span>
                      <span>Phone: +91 9512765399</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-blue-500">📍</span>
                      <span>Return Address: A-604 Blossom Aura, Nadiad, Gujarat, India</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Updates Card */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Policy Updates</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify this Refund & Cancellation Policy at any time. Changes will be effective 
                    immediately upon posting on our website. Your continued use of our services constitutes acceptance of 
                    any changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
