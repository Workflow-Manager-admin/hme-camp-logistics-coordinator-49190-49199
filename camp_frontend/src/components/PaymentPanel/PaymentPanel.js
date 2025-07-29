import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './PaymentPanel.css';

// PUBLIC_INTERFACE
/**
 * PaymentPanel component for managing camp dues and payments.
 * Displays payment status, Venmo integration, and admin payment confirmation.
 */
const PaymentPanel = () => {
  const { user, userRole } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    unpaid: 0,
    totalAmount: 0
  });

  const DUES_AMOUNT = 500; // Standard dues amount
  const VENMO_USERNAME = '@HME-CampDues'; // Camp Venmo account

  useEffect(() => {
    fetchPayments();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllSubscriptions();
    };
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          member:members(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
      calculateStats(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('payments_channel')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleRealtimeUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setPayments(current => [payload.new, ...current]);
    } else if (payload.eventType === 'DELETE') {
      setPayments(current => 
        current.filter(payment => payment.id !== payload.old.id)
      );
    } else if (payload.eventType === 'UPDATE') {
      setPayments(current =>
        current.map(payment =>
          payment.id === payload.new.id ? { ...payment, ...payload.new } : payment
        )
      );
    }
  };

  const calculateStats = (paymentsList) => {
    const stats = paymentsList.reduce((acc, payment) => {
      acc.total++;
      acc.totalAmount += payment.amount || 0;
      
      if (payment.confirmed) {
        acc.paid++;
      } else if (payment.method && !payment.confirmed) {
        acc.pending++;
      } else {
        acc.unpaid++;
      }
      return acc;
    }, { total: 0, paid: 0, pending: 0, unpaid: 0, totalAmount: 0 });

    setStats(stats);
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(err.message);
    }
  };

  const handleMarkAsPaid = async (memberId) => {
    try {
      const { error: insertError } = await supabase
        .from('payments')
        .insert([{
          member_id: memberId,
          amount: DUES_AMOUNT,
          method: 'venmo',
          confirmed: userRole === 'admin',
          date: new Date().toISOString()
        }]);

      if (insertError) throw insertError;
    } catch (err) {
      console.error('Error marking as paid:', err);
      setError(err.message);
    }
  };

  const generateVenmoLink = (memberName) => {
    const description = `HME Camp Dues - ${memberName}`;
    return `venmo://paycharge?txn=pay&recipients=${VENMO_USERNAME}&amount=${DUES_AMOUNT}&note=${encodeURIComponent(description)}`;
  };

  const generateVenmoQRCode = (memberName) => {
    // In a real implementation, you would generate a QR code for the Venmo payment
    // For now, we'll return a placeholder URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateVenmoLink(memberName))}`;
  };

  if (loading) {
    return <div className="loading-state">Loading payments...</div>;
  }

  return (
    <div className="payment-panel">
      <div className="payment-panel-header">
        <div>
          <h2 className="page-title">Payments & Dues</h2>
          <p className="page-description">
            Track camp dues and manage payments
          </p>
        </div>
      </div>

      <div className="payment-stats">
        <div className="stat-card">
          <div className="stat-value">${stats.totalAmount.toLocaleString()}</div>
          <div className="stat-label">Total Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.paid}</div>
          <div className="stat-label">Paid Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Confirmation</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.unpaid}</div>
          <div className="stat-label">Unpaid</div>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      <div className="payment-grid">
        {payments.map(payment => (
          <div key={payment.id} className="payment-card">
            <div className="payment-card-header">
              <h3 className="payment-card-name">{payment.member.name}</h3>
              <span className={`payment-status status-${payment.confirmed ? 'paid' : payment.method ? 'pending' : 'unpaid'}`}>
                {payment.confirmed ? 'Paid' : payment.method ? 'Pending' : 'Unpaid'}
              </span>
            </div>
            
            <div className="payment-card-details">
              <div className="payment-detail-item">
                <span>Amount:</span>
                <span>${payment.amount?.toLocaleString() || DUES_AMOUNT}</span>
              </div>
              {payment.method && (
                <div className="payment-detail-item">
                  <span>Method:</span>
                  <span>{payment.method}</span>
                </div>
              )}
              {payment.date && (
                <div className="payment-detail-item">
                  <span>Date:</span>
                  <span>{new Date(payment.date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {!payment.confirmed && (
              <div className="payment-actions">
                {userRole === 'admin' && payment.method && (
                  <button
                    className="btn"
                    onClick={() => handleConfirmPayment(payment.id)}
                  >
                    Confirm Payment
                  </button>
                )}
                {!payment.method && (
                  <>
                    <img
                      src={generateVenmoQRCode(payment.member.name)}
                      alt="Venmo QR Code"
                      className="payment-qr"
                    />
                    <a
                      href={generateVenmoLink(payment.member.name)}
                      className="btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pay with Venmo
                    </a>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleMarkAsPaid(payment.member.id)}
                    >
                      Mark as Paid
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentPanel;
