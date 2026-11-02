# Good Example — Adapter Pattern cho No-Go Zone

## Context
- No-Go Zone: `routes/payment.js` (PCI compliance — 🔴 Strict)
- Task: T-006 cần lấy payment status để hiển thị trên product page
- Problem: Cần gọi payment nhưng KHÔNG ĐƯỢC sửa payment module

## Workaround: Adapter Pattern

```javascript
// ✅ MỚI: adapters/payment-adapter.js (file mới — OK)
const paymentService = require('../routes/payment'); // import OK, không sửa

/**
 * Adapter cho payment module (No-Go Zone)
 * KHÔNG modify behavior — chỉ wrap interface cần thiết
 * Ref: T-006, No-Go: routes/payment.js
 */
module.exports = {
  // Wrap method hiện có — pass through, không modify
  getStatus: async (orderId) => {
    return paymentService.checkPaymentStatus(orderId);
  },
  
  // Format output cho product page — logic MỚI ở adapter, KHÔNG ở payment
  getStatusForDisplay: async (orderId) => {
    const status = await paymentService.checkPaymentStatus(orderId);
    return {
      isPaid: status.code === 'COMPLETED',
      label: STATUS_LABELS[status.code] || 'Unknown',
    };
  },
};

const STATUS_LABELS = {
  COMPLETED: 'Đã thanh toán',
  PENDING: 'Đang xử lý',
  FAILED: 'Thất bại',
};
```

## Rules Applied
- ✅ `routes/payment.js` KHÔNG bị sửa
- ✅ Adapter chỉ WRAP — không modify return value của original
- ✅ Logic mới (getStatusForDisplay) nằm ở adapter, không ở payment
- ✅ Comment ghi rõ: No-Go reference + Task ID
