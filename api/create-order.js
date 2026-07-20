const crypto = require("crypto");
const PRICES = require("./_prices");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const { service, packageKey, customerName, phone, email, preferredDate, preferredTime } = body;

  const serviceEntry = PRICES[service];
  const packageEntry = serviceEntry && serviceEntry.packages[packageKey];

  if (!serviceEntry || !packageEntry) {
    res.status(400).json({ error: "Invalid service or package selection" });
    return;
  }
  if (!customerName || !phone || !email || !preferredDate || !preferredTime) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    res.status(500).json({ error: "Server is not configured yet (missing Supabase env vars)" });
    return;
  }

  const orderId = `order_${crypto.randomUUID()}`;
  const orderName = `${serviceEntry.label} - ${packageEntry.label}`;
  const amount = packageEntry.amount;

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      toss_order_id: orderId,
      service,
      package_key: packageKey,
      package_label: orderName,
      amount,
      customer_name: customerName,
      phone,
      email,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      status: "pending",
    }),
  });

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    console.error("Supabase insert failed:", errText);
    res.status(502).json({ error: "Could not create order" });
    return;
  }

  res.status(200).json({ orderId, orderName, amount });
};
