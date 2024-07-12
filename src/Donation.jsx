import React, { useState } from 'react';

const DonationComponent = () => {
  const [amount, setAmount] = useState('');

  const handleInputChange = (e) => {
    setAmount(e.target.value);
  };

  const validateMerchant = async (validationURL) => {
    const response = await fetch('https://donation-api-nr7d.onrender.com/payments/validate-merchant/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ validationURL }),
    });
    return response.json();
  };

  const onApplePayButtonClicked = async () => {
    if (!window.ApplePaySession) {
      alert('Apple Pay is not supported in this browser.');
      return;
    }

    // Ensure amount is a valid number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    const request = {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS'],
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      total: {
        label: 'Demo (Card is not charged)',
        type: 'final',
        amount: parsedAmount.toFixed(2),  // Ensure two decimal places
      },
    };

    const session = new ApplePaySession(3, request);

    session.onvalidatemerchant = async (event) => {
        try {
          const merchantSession = await validateMerchant(event.validationURL);
          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          console.error('Error validating merchant:', error);
          // Handle error, show user-friendly message
          alert('Error validating merchant. Please try again later.:',event.validationURL);
        }
      };
    session.onpaymentmethodselected = (event) => {
      const update = {};
      session.completePaymentMethodSelection(update);
    };

    session.onshippingmethodselected = (event) => {
      const update = {};
      session.completeShippingMethodSelection(update);
    };

    session.onshippingcontactselected = (event) => {
      const update = {};
      session.completeShippingContactSelection(update);
    };

    session.onpaymentauthorized = (event) => {
      const result = {
        status: ApplePaySession.STATUS_SUCCESS,
      };
      session.completePayment(result);
    };

    // session.oncouponcodechanged = (event) => {
    //   const update = {
    //     newTotal: calculateNewTotal(event.couponCode),
    //     newLineItems: calculateNewLineItems(event.couponCode),
    //     newShippingMethods: calculateNewShippingMethods(event.couponCode),
    //     errors: calculateErrors(event.couponCode),
    //   };
    //   session.completeCouponCodeChange(update);
    // };

    session.oncancel = (event) => {
      console.log('Payment canceled:', event);
    };

    session.begin();
  };

  return (
    <div>
      <h1>Donate</h1>
      <input 
        type="number" 
        value={amount} 
        onChange={handleInputChange} 
        placeholder="Enter donation amount"
      />
      <button onClick={onApplePayButtonClicked}>Donate with Apple Pay</button>
    </div>
  );
};

export default DonationComponent;
