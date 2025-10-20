import React from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PLAN_PRICING = {
  pro: 49900, // ₹499.00 in paise
  plus: 549900, // ₹5,499.00 in paise
};

export default function UpgradePlan() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async (plan: 'pro' | 'plus') => {
    setLoading(true);
    setError(null);

    // Check authentication before proceeding
    if (!isAuthenticated) {
      setError('Please log in to upgrade your plan');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('forensicx_token');
      if (!token) {
        setError('Please log in to upgrade your plan');
        navigate('/login');
        setLoading(false);
        return;
      }
      const order = await createRazorpayOrder(PLAN_PRICING[plan], plan, token);
      const options = {
        key: 'rzp_test_RKCU4kkAe3HIkw', // Your actual Razorpay test key
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'ForensicX',
        description: `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        handler: async function (response: any) {
          try {
            await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              token
            );
            // Refresh user data to update plan in UI
            await refreshUser();
            // Redirect to dashboard after successful payment
            window.location.href = '/dashboard';
          } catch (e) {
            setError('Payment verification failed');
          }
        },
        prefill: {},
        theme: { color: '#6366f1' },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error('Payment error:', e);
      let errorMessage = 'Payment failed. Please try again.';
      
      if (e.response?.data?.detail) {
        errorMessage = `Payment failed: ${e.response.data.detail}`;
      } else if (e.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        navigate('/login');
      } else if (e.response?.status === 404) {
        errorMessage = 'Payment service unavailable. Please contact support.';
      } else if (e.message) {
        errorMessage = `Payment Error: ${e.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div className="border rounded p-4 flex flex-col gap-2">
          <div className="font-semibold text-lg">Pro Plan</div>
          <div>₹499/month</div>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
            onClick={() => handleUpgrade('pro')}
          >
            Pay Now
          </button>
        </div>
        <div className="border rounded p-4 flex flex-col gap-2">
          <div className="font-semibold text-lg">Plus Plan</div>
          <div>₹5,499/month</div>
          <button
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            disabled={loading}
            onClick={() => handleUpgrade('plus')}
          >
            Pay Now
          </button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
      </div>
    </div>
  );
}
