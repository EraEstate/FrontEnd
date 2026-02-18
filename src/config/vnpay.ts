/**
 * VNPay server (vnpay_nodejs) chạy riêng - FE gọi trực tiếp để lấy payment URL.
 */
export const VNPAY_SERVER_URL =
  import.meta.env.VITE_VNPAY_SERVER_URL || 'http://localhost:8888';

export async function createVnpayPaymentUrl(params: {
  transactionId: string;
  amount: number;
  returnUrl: string;
}): Promise<string> {
  const res = await fetch(`${VNPAY_SERVER_URL}/order/create_payment_for_transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transactionId: params.transactionId,
      amount: params.amount,
      returnUrl: params.returnUrl,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `VNPay: ${res.status}`);
  }
  const data = (await res.json()) as { paymentUrl: string };
  return data.paymentUrl;
}
