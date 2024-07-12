import React, { useState, useEffect } from 'react';

const DonationComponent = () => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
        amount: parsedAmount.toFixed(2),
      },
    };

    const session = new ApplePaySession(3, request);

    session.onvalidatemerchant = async (event) => {
      try {
        const merchantSession = await validateMerchant(event.validationURL);
        session.completeMerchantValidation(merchantSession);
      } catch (error) {
        console.error('Error validating merchant:', error);
        alert('Error validating merchant. Please try again later.');
      }
    };

    session.onpaymentauthorized = (event) => {
      const result = {
        status: ApplePaySession.STATUS_SUCCESS,
      };
      session.completePayment(result);
    };

    session.oncancel = (event) => {
      console.log('Payment canceled:', event);
    };

    session.begin();
  };

  const onGooglePayButtonClicked = async () => {
    const paymentsClient = new window.google.payments.api.PaymentsClient({ environment: 'TEST' });

    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId',
          },
        },
      }],
    };

    const isReadyToPayResponse = await paymentsClient.isReadyToPay(isReadyToPayRequest);
    if (!isReadyToPayResponse.result) {
      alert('Google Pay is not available in this browser.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    const paymentDataRequest = {
      ...isReadyToPayRequest,
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: parsedAmount.toFixed(2),
        currencyCode: 'USD',
      },
      merchantInfo: {
        merchantName: 'Example Merchant',
      },
    };

    paymentsClient.loadPaymentData(paymentDataRequest).then((paymentData) => {
      console.log('Payment successful:', paymentData);
      // Handle payment data submission to your server here
    }).catch((error) => {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    });
  };

  return (
    <div className='container container-width'>
      <h1>Donate</h1>
      <input 
        type="number" 
        value={amount} 
        onChange={handleInputChange} 
        placeholder="Enter donation amount"
        className='form-control mb-4 w-100'
      />
      <button className='btn btn-outline-dark fw-bold d-block my-3 p-2 w-100' onClick={onApplePayButtonClicked}>Donate with <i className="bi bi-apple text-secondary"></i> Apple Pay</button>
      <button className='btn btn-outline-dark fw-bold d-block p-2 w-100' onClick={onGooglePayButtonClicked}>Donate with <i className="bi bi-google text-danger"></i> Google Pay</button>
    </div>
  );
};

export default DonationComponent;
