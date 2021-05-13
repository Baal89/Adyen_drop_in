// 0. Get clientKey
getClientKey().then(clientKey => {
    getPaymentMethods().then(paymentMethodsResponse => {
        // 1. Create an instance of AdyenCheckout
        const checkout = new AdyenCheckout({
            environment: 'test',
            clientKey: clientKey, 
            paymentMethodsResponse,
            removePaymentMethods: ['paysafecard', 'c_cash'],
            
            onSubmit: (state, dropin) => {
                // Global configuration for onSubmit
                // Your function calling your server to make the `/payments` request
                makePayment(state.data)
                .then(response => {
                  if (response.action) {
                    dropin.handleAction(response.action);
                  } else {
                    
                    if (response.resultCode == 'Authorised') {
                      dropin.setStatus('success');
                      dropin.setStatus('success', { message: `Payment successful! your reference number is: ${response.pspReference}` });
                      } else if (response.resultCode == 'Refused') {
                        dropin.setStatus('error');
                        dropin.setStatus('error', { message: 'Something went wrong.'});
                      }
                    }
                  })
                  .catch(error => {
                    throw Error(error);
                  });
              },
              paymentMethodsConfiguration: {
                card: { 
                  hasHolderName: true,        
                  holderNameRequired: true,
                  enableStoreDetails: true,
                  hideCVC: false, // Change this to true to hide the CVC field for stored cards
                  name: 'Credit or debit card',
                  billingAddressRequired: true,
                  positionHolderNameOnTop: true,
                  billingAddressAllowedCountries: true,
                  data : {
                    holderName: 'S. Hopper'
                  },
                  installmentOptions: {
                    mc: {
                        values: [1, 2, 3, 4]
                    }
                },
                },
              }
        });
        

        // 2. Create and mount the Component
        const dropin = checkout
            .create('dropin', {
                showStoredPaymentMethods: true
            })
            .mount('#dropin-container');
    })
});
