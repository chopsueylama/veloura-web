"use client";
import { useState } from "react";
export default function Invoices(){
  const [amount,setAmount]=useState(0);
  const [email,setEmail]=useState("");
  const [url,setUrl]=useState("");
  async function create(){
    const r = await fetch("/api/invoice",{
      method:"POST", headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ amount_cents: Math.round(amount*100), memo:"Veloura Test", payer_email: email })
    });
    const j = await r.json(); setUrl(j.url);
  }
  return <div className="max-w-xl mx-auto p-6">
    <h1 className="text-2xl font-bold">Create Test Invoice</h1>
    <input className="border p-2 w-full" type="number" value={amount} onChange={e=>setAmount(+e.target.value)} placeholder="Amount (USD)"/>
    <input className="border p-2 w-full mt-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Payer email (optional)"/>
    <button onClick={create} className="mt-3 bg-black text-white px-4 py-2 rounded">Generate</button>
    {url && <p className="mt-4">Share this link: <a className="text-blue-600 underline" href={url} target="_blank">{url}</a></p>}
  </div>;
}
