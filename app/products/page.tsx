const IS_TEST_MODE = process.env.IS_TEST_MODE === "true";
const items = [
  { id: "ring-001", name: "Veloura$ Test Ring", realPrice: 499 },
  { id: "gem-001",  name: "Veloura$ Test Gem",  realPrice: 1299 }
];
export default function Products(){
  return <div className="max-w-3xl mx-auto p-6">
    <h1 className="text-2xl font-bold">Products (Simulation)</h1>
    <ul className="mt-4 space-y-3">
      {items.map(p=>{
        const price = IS_TEST_MODE ? 0 : p.realPrice;
        return <li key={p.id} className="border p-3 rounded">
          <div className="font-semibold">{p.name}</div>
          <div>${price}</div>
        </li>
      })}
    </ul>
  </div>;
}
