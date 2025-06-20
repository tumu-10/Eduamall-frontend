
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Clock, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { GuestCheckout } from '@/components/checkout/GuestCheckout';
import { PaymentOptions } from '@/components/checkout/PaymentOptions';
import { DeliveryFormWithMaps } from '@/components/checkout/DeliveryFormWithMaps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { OrderTracking } from '@/components/checkout/OrderTracking';
import { PreLoader } from '@/components/ui/PreLoader';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation' | 'tracking'>('details');
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { items, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleDetailsSubmit = (details: any) => {
    setDeliveryDetails(details);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (paymentData: any) => {
    setIsProcessing(true);
    setPaymentDetails(paymentData);
    
    // Simulate payment processing
    setTimeout(() => {
      const newOrderId = `EDU${Date.now()}`;
      setOrderId(newOrderId);
      setCurrentStep('confirmation');
      setIsProcessing(false);
      
      // Activate floating chat by setting order status
      localStorage.setItem('hasActiveOrder', 'true');
      
      // Clear cart after successful payment
      setTimeout(() => {
        clearCart();
        setCurrentStep('tracking');
      }, 3000);
    }, 2000);
  };

  const handleTrackOrder = () => {
    setCurrentStep('tracking');
  };

  if (items.length === 0 && currentStep !== 'tracking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <CustomCursor />
        <Navbar />
        
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl">
              <Package size={64} className="mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some items to your cart before proceeding to checkout.</p>
              <Link to="/categories">
                <EdumallButton variant="primary" size="lg" className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white">
                  Continue Shopping
                </EdumallButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      <PreLoader isLoading={isProcessing} message="Processing your order..." />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-teal-600 transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link to="/cart" className="hover:text-teal-600 transition-colors">Cart</Link></li>
              <li>/</li>
              <li className="text-teal-600 font-medium">Checkout</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Checkout
            </h1>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4 mb-6">
              {[
                { step: 'details', label: 'Details' },
                { step: 'payment', label: 'Payment' },
                { step: 'confirmation', label: 'Confirmation' },
                { step: 'tracking', label: 'Tracking' }
              ].map((item, index) => (
                <div key={item.step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    currentStep === item.step || 
                    (currentStep === 'payment' && item.step === 'details') ||
                    (currentStep === 'confirmation' && (item.step === 'details' || item.step === 'payment')) ||
                    (currentStep === 'tracking' && item.step !== 'tracking')
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-white border-2 border-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium transition-colors ${
                    currentStep === item.step ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                  {index < 3 && <div className="w-8 h-px bg-gray-300 ml-4" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {isAuthenticated ? (
                    <DeliveryFormWithMaps 
                      user={user} 
                      onDetailsSubmit={handleDetailsSubmit} 
                    />
                  ) : (
                    <GuestCheckout onDetailsSubmit={handleDetailsSubmit} />
                  )}
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl mb-6">
                    <button
                      onClick={() => setCurrentStep('details')}
                      className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                      <ArrowLeft size={20} className="mr-2" />
                      Back to Details
                    </button>
                    
                    <h2 className="text-2xl font-bold text-blue-600 mb-6">Payment Method</h2>
                    <p className="text-gray-900 mb-6">Choose your preferred payment method below:</p>
                  </div>
                  
                  <PaymentOptions 
                    onPaymentComplete={handlePaymentComplete} 
                    total={getCartTotal()}
                  />
                </motion.div>
              )}

              {currentStep === 'confirmation' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 text-center border border-gray-200/50 shadow-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl text-white">✅</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Order Confirmed!
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    Your order #{orderId} has been successfully placed and payment confirmed.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center text-blue-700">
                      <Clock size={20} className="mr-2" />
                      <span className="font-medium">
                        Estimated delivery: 2-3 business days
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <EdumallButton 
                      variant="primary" 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
                      onClick={handleTrackOrder}
                    >
                      Track Your Order
                    </EdumallButton>
                    
                    <Link to="/categories" className="block">
                      <EdumallButton variant="ghost" size="lg" className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                        Continue Shopping
                      </EdumallButton>
                    </Link>
                  </div>
                </motion.div>
              )}

              {currentStep === 'tracking' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <OrderTracking 
                    orderId={orderId} 
                    deliveryDetails={deliveryDetails}
                  />
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {currentStep !== 'tracking' && (
              <div className="lg:col-span-1">
                <OrderSummary 
                  items={items} 
                  total={getCartTotal()}
                  deliveryDetails={deliveryDetails}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
