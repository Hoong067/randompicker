// Lightweight IAP service that tries to use either `react-native-iap` or
// `expo-in-app-purchases` if available. If neither is installed it falls
// back to a mock implementation so the app can remain functional for dev.

let provider = null;
let lib = null;
let rniapUpdateSub = null;
let rniapErrorSub = null;

async function init(productIds = [], handlers = {}) {
  // handlers: { onPurchase, onError, onProducts }
  // Try react-native-iap (Nitro) first, preferring the compiled module to avoid Metro resolving TS sources
  console.log('[IAP] init called with productIds:', productIds);
  try {
    try {
      lib = require('react-native-iap/lib/module');
    } catch (e) {
      // fall back to package root which should also point to compiled module in most installs
      lib = require('react-native-iap');
    }
    provider = 'rniap';

    // Initialize connection
    if (typeof lib.initConnection === 'function') {
      await lib.initConnection();
    }

    // Fetch products using the Nitro API
    let products = [];
    if (productIds && productIds.length && typeof lib.fetchProducts === 'function') {
      try {
        const fetched = await lib.fetchProducts({ skus: productIds });
        products = fetched || [];
        console.log('[IAP] fetched products from rniap:', products);
      } catch (e) {
        console.warn('rniap.fetchProducts failed', e);
        products = [];
      }
    }
    console.log('[IAP] init result provider:', provider, 'products:', products);
    handlers.onProducts && handlers.onProducts(products);

    // Register listeners
    if (typeof lib.purchaseUpdatedListener === 'function') {
      rniapUpdateSub = lib.purchaseUpdatedListener(async (purchase) => {
        handlers.onPurchase && handlers.onPurchase(purchase);
        try {
          // finishTransaction expects an object { purchase, isConsumable? }
          if (typeof lib.finishTransaction === 'function') {
            await lib.finishTransaction({ purchase, isConsumable: false });
          }
        } catch (e) {
          console.warn('finishTransaction error', e);
        }
      });
    }

    if (typeof lib.purchaseErrorListener === 'function') {
      rniapErrorSub = lib.purchaseErrorListener((err) => handlers.onError && handlers.onError(err));
    }

    return { provider, products };
  } catch (err) {
    console.log('react-native-iap not available or failed to init:', err && err.message ? err.message : err);
  }

  // Try expo-in-app-purchases next
  try {
    lib = require('expo-in-app-purchases');
    provider = 'expo';
    if (typeof lib.connectAsync === 'function') await lib.connectAsync();
    const res = typeof lib.getProductsAsync === 'function' ? await lib.getProductsAsync(productIds) : null;
    const products = (res && res.results) || [];
    handlers.onProducts && handlers.onProducts(products);

    if (typeof lib.setPurchaseListener === 'function') {
      lib.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
        if (responseCode === (lib.IAPResponseCode || {}).OK) {
          for (const p of results) {
            handlers.onPurchase && handlers.onPurchase(p);
            try {
              if (typeof lib.finishTransactionAsync === 'function') {
                await lib.finishTransactionAsync(p, false);
              } else if (typeof lib.finishTransaction === 'function') {
                await lib.finishTransaction(p, false);
              }
            } catch (e) {
              console.warn('finishTransactionAsync error', e);
            }
          }
        } else {
          handlers.onError && handlers.onError({ responseCode, errorCode });
        }
      });
    }

    return { provider, products };
  } catch (err) {
    console.log('expo-in-app-purchases not available:', err && err.message ? err.message : err);
  }

  // Fallback mock provider (development only)
  provider = 'mock';
  const products = productIds.map((id) => ({ productId: id, title: 'Premium', description: 'Unlock premium themes', price: '$1.99' }));
  handlers.onProducts && handlers.onProducts(products);
  return { provider, products };
}

async function purchase(productId) {
  console.log('[IAP] purchase called with productId:', productId, 'provider:', provider);
  if (!provider) throw new Error('IAP not initialized');
  if (provider === 'rniap') {
    if (typeof lib.requestPurchase === 'function') {
      // Nitro API expects a structured request object. Use platform-specific request payload.
      try {
        const { Platform } = require('react-native');
        if (Platform.OS === 'android') {
          console.log('[IAP] rniap.requestPurchase android skus:', [productId]);
          return await lib.requestPurchase({ request: { google: { skus: [productId] } } });
        }
        console.log('[IAP] rniap.requestPurchase ios sku:', productId);
        return await lib.requestPurchase({ request: { apple: { sku: productId } } });
      } catch (e) {
        console.error('[IAP] rniap.requestPurchase threw:', e);
        // still try a naive call if structured call fails
        return lib.requestPurchase(productId);
      }
    }
    if (typeof lib.requestSubscription === 'function') {
      return lib.requestSubscription(productId);
    }
    throw new Error('requestPurchase not available on react-native-iap');
  }

  if (provider === 'expo') {
    if (typeof lib.purchaseItemAsync === 'function') {
      return lib.purchaseItemAsync(productId);
    }
    if (typeof lib.purchaseAsync === 'function') {
      return lib.purchaseAsync({ sku: productId });
    }
    throw new Error('purchase API not available on expo-in-app-purchases');
  }

  // mock
  return new Promise((resolve) => setTimeout(() => resolve({ productId, transactionReceipt: 'MOCK_RECEIPT' }), 900));
}

async function restore() {
  if (!provider) return [];
  if (provider === 'rniap') {
    if (typeof lib.getAvailablePurchases === 'function') {
      return lib.getAvailablePurchases();
    }
    return [];
  }

  if (provider === 'expo') {
    if (typeof lib.getPurchaseHistoryAsync === 'function') {
      const res = await lib.getPurchaseHistoryAsync();
      return (res && res.results) || [];
    }
    return [];
  }

  return [];
}

async function end() {
  try {
    if (provider === 'rniap') {
      if (rniapUpdateSub && typeof rniapUpdateSub.remove === 'function') rniapUpdateSub.remove();
      if (rniapErrorSub && typeof rniapErrorSub.remove === 'function') rniapErrorSub.remove();
      if (lib && typeof lib.endConnection === 'function') await lib.endConnection();
    }
    if (provider === 'expo') {
      if (lib && typeof lib.disconnectAsync === 'function') await lib.disconnectAsync();
    }
  } catch (e) {
    console.warn('IAP end error', e);
  }
  provider = null;
  lib = null;
}

function setMockProvider(productIds = [], handlers = {}) {
  provider = 'mock';
  lib = null;
  rniapUpdateSub = null;
  rniapErrorSub = null;
  const products = productIds.map((id) => ({ productId: id, title: 'Premium', description: 'Unlock premium themes', price: '$1.99' }));
  if (handlers && typeof handlers.onProducts === 'function') handlers.onProducts(products);
  return { provider, products };
}

export { init, purchase, restore, end, setMockProvider };
