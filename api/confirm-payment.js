module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { paymentKey, orderId, amount } = req.body || {};
  if (!paymentKey || !orderId || !amount) {
    res.status(400).json({ error: "Missing payment confirmation fields" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey || !secretKey) {
    res.status(500).json({ error: "Server is not configured yet (missing Supabase/Toss env vars)" });
    return;
  }

  const supabaseHeaders = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  const lookupRes = await fetch(
    `${supabaseUrl}/rest/v1/orders?toss_order_id=eq.${encodeURIComponent(orderId)}&select=status,amount,package_label,customer_name,preferred_date,preferred_time`,
    { headers: supabaseHeaders }
  );
  const orders = await lookupRes.json();
  const order = orders && orders[0];

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (order.status === "paid") {
    res.status(200).json({
      order: {
        orderName: order.package_label,
        amount: order.amount,
        customerName: order.customer_name,
        preferredDate: order.preferred_date,
        preferredTime: order.preferred_time,
      },
    });
    return;
  }
  if (Number(order.amount) !== Number(amount)) {
    res.status(400).json({ error: "Amount mismatch" });
    return;
  }

  const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");
  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const tossData = await tossRes.json();

  if (!tossRes.ok) {
    await fetch(`${supabaseUrl}/rest/v1/orders?toss_order_id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: supabaseHeaders,
      body: JSON.stringify({ status: "failed" }),
    });
    res.status(400).json({ error: tossData.message || "Payment confirmation failed" });
    return;
  }

  await fetch(`${supabaseUrl}/rest/v1/orders?toss_order_id=eq.${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: supabaseHeaders,
    body: JSON.stringify({
      status: "paid",
      toss_payment_key: paymentKey,
      paid_at: new Date().toISOString(),
    }),
  });

  res.status(200).json({
    order: {
      orderName: order.package_label,
      amount: order.amount,
      customerName: order.customer_name,
      preferredDate: order.preferred_date,
      preferredTime: order.preferred_time,
    },
  });
};
