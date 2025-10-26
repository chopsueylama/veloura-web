import "./globals.css";

export const metadata = {
  title: "Veloura$ (Test Mode)",
  description: "Automated platform simulation for testing integration and SEO.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <nav className="bg-black text-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">Veloura$</h1>
          <div className="space-x-6 text-sm">
            <a href="/" className="hover:text-yellow-400">Home</a>
            <a href="/products" className="hover:text-yellow-400">Products</a>
            <a href="/chat" className="hover:text-yellow-400">Chat</a>
            <a href="/invoices" className="hover:text-yellow-400">Invoices</a>
          </div>
        </nav>
        <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-200 min-h-[calc(100vh-64px)] text-gray-900">
          {children}
        </main>
      </body>
    </html>
  );
}
