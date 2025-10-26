import Stripe from "stripe";
export async function POST(req: Request){
  const { amount_cents=0, memo="Veloura$ Test Invoice", payer_email } = await req.json();
  const IS_TEST = process.env.IS_TEST_MODE === "true";
  if (IS_TEST) {
    return new Response(JSON.stringify({ url: "https://example.com/test-invoice" }), {
      headers:{ "Content-Type":"application/json" }
    });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const product = await stripe.products.create({ name: memo });
  const price   = await stripe.prices.create({ unit_amount: amount_cents, currency:"usd", product: product.id });
  const link    = await stripe.paymentLinks.create({ line_items:[{ price: price.id, quantity: 1 }], metadata:{ memo, payer_email }});
  return new Response(JSON.stringify({ url: link.url }), { headers:{ "Content-Type":"application/json" }});
}
