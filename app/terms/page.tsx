import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { FileText, ShieldCheck, ShoppingCart, Truck, CreditCard, AlertCircle, Scale, Mail } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 light-shadow">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using our services
            </p>
            <p className="text-sm text-gray-500 mt-4">Last Updated: January 2025</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* Introduction Card */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to Silver Line. By accessing and using our website, you agree to comply with and be bound by the 
                    following terms and conditions. Please read these terms carefully before using our services.
                  </p>
                </div>
              </div>
            </div>

            {/* Use of Website Card */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Use of Website</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You agree to use this website only for lawful purposes and in a way that does not infringe the rights of, 
                    restrict, or inhibit anyone else's use and enjoyment of the website.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>You must be at least 18 years old to make a purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>You are responsible for maintaining the confidentiality of your account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>You agree to provide accurate and complete information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>You will not use the website for any fraudulent or illegal purpose</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Information Card */}
            <div className="bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Product Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We strive to provide accurate product descriptions and images. However, we do not warrant that product 
                    descriptions or other content is accurate, complete, reliable, current, or error-free.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>Colors may vary slightly due to screen settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>Product specifications are subject to change without notice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>We reserve the right to limit quantities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>Prices are subject to change without prior notice</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Orders and Payment Card */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Orders and Payment</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All orders are subject to acceptance and availability. We reserve the right to refuse any order at our discretion.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Payment must be received before dispatch of goods</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>We accept various payment methods as displayed on our website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>All payments are processed securely</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>You will receive an order confirmation via email</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Shipping Card */}
            <div className="bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Shipping and Delivery</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Delivery times are estimates and may vary. We are not responsible for delays caused by courier services 
                    or circumstances beyond our control.
                  </p>
                </div>
              </div>
            </div>

            {/* Intellectual Property Card */}
            <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Intellectual Property</h2>
                  <p className="text-gray-700 leading-relaxed">
                    All content on this website, including text, graphics, logos, images, and software, is the property of 
                    Silver Line and is protected by copyright and intellectual property laws.
                  </p>
                </div>
              </div>
            </div>

            {/* Limitation Card */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Silver Line shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                    resulting from your use of or inability to use the website or products.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Terms Card */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting 
                    to the website. Your continued use of the website constitutes acceptance of the modified terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 rounded-2xl p-8 shadow-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact Information</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have any questions about these Terms & Conditions, please contact us:
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center gap-2">
                      <span className="text-pink-500">📧</span>
                      <span>Email: ac@silverline925.in</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-pink-500">📱</span>
                      <span>Phone: +91 9512765399</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-pink-500">📍</span>
                      <span>Address: A-604 Blossom Aura, Nadiad, Gujarat, India</span>
                    </p>
                  </div>
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

