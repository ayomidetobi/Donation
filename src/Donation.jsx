import  { useState } from 'react';

const Donation= () => {
  const [amount, setAmount] = useState('');

  const handleInputChange = (e) => {
    setAmount(e.target.value);
  };

  const validateMerchant = async () => {
    // This function should make a call to your server to get a valid merchant session.
    // Here we are just simulating the response.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          merchantSessionIdentifier: 'mock-session-id',
        });
      }, 1000);
    });
  };

  const onDonateButtonClicked = async () => {
    if (!PaymentRequest) {
      alert('Payment Request API not supported in this browser.');
      return;
    }

    try {
      const paymentMethodData = [{
        supportedMethods: 'https://apple.com/apple-pay',
        data: {
          version: 3,
          merchantIdentifier: 'merchant.com.apdemo',
          merchantCapabilities: ['supports3DS'],
          supportedNetworks: ['amex', 'discover', 'masterCard', 'visa'],
          countryCode: 'US'
        }
      }];

      const paymentDetails = {
        total: {
          label: 'Donation (Card is not charged)',
          amount: {
            value: amount,
            currency: 'USD'
          }
        }
      };

      const paymentOptions = {
        requestPayerName :false,
        requestBillingAddress: false,
        requestPayerEmail: false,
        requestPayerPhone: false
      };

      const request = new PaymentRequest(paymentMethodData, paymentDetails, paymentOptions);

      request.onmerchantvalidation = async (event) => {
        const merchantSession = await validateMerchant();
        event.complete(merchantSession);
      };

      request.onpaymentmethodchange = (event) => {
        const paymentDetailsUpdate = { total: paymentDetails.total };
        event.updateWith(paymentDetailsUpdate);
      };

      request.onshippingoptionchange = (event) => {
        const paymentDetailsUpdate = { total: paymentDetails.total };
        event.updateWith(paymentDetailsUpdate);
      };

      request.onshippingaddresschange = (event) => {
        const paymentDetailsUpdate = {};
        event.updateWith(paymentDetailsUpdate);
      };

      const response = await request.show();
      const status = 'success';
      await response.complete(status);

      alert('Donation successful! Thank you.');
    } catch (e) {
      console.error('Payment Request API error:', e);
      alert('Payment failed.');
    }
  };

  return (
    <div>
      <h1>Donate</h1>
      <input 
        type="number" 
        value={amount} 
        onChange={handleInputChange} 
        placeholder="Enter donation amount"
        className='m-lr-20'
      />
      <button onClick={onDonateButtonClicked}>Donate with Apple Pay</button>
    </div>
  );
};

export default Donation;
