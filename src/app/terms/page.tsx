export default function TermsPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              These terms and conditions govern your use of Nomad Stop's online ordering service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Ordering and Payment</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>All orders are subject to availability.</li>
              <li>Payment is required at the time of ordering.</li>
              <li>We accept major credit/debit cards through our secure payment processor.</li>
              <li>Prices are inclusive of VAT where applicable.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Delivery and Pickup</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Delivery is available to TW18, TW19, and TW15 postcodes only.</li>
              <li>Free delivery on orders over £25.</li>
              <li>Delivery times are estimates and may vary.</li>
              <li>You must be available to receive your order at the specified time.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cancellations and Refunds</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Orders can be cancelled before preparation begins.</li>
              <li>Refunds will be processed to the original payment method.</li>
              <li>Refunds may take 3-5 business days to appear in your account.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Food Safety and Allergens</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Please inform us of any allergies when ordering.</li>
              <li>We cannot guarantee allergen-free preparation.</li>
              <li>Food should be consumed within 2 hours of delivery/pickup.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              Nomad Stop shall not be liable for any indirect, incidental, special, 
              or consequential damages arising from your use of our service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to modify these terms at any time. 
              Continued use of our service constitutes acceptance of any changes.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
              <p className="text-gray-700">
                For questions about these terms, please contact us at the address 
                or phone number provided on our contact page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
