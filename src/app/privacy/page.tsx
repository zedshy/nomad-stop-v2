export default function PrivacyPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              This privacy policy explains how Nomad Stop collects, uses, and protects your personal information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li><strong>Contact Information:</strong> Name, phone number, email address</li>
              <li><strong>Delivery Information:</strong> Address details for delivery orders</li>
              <li><strong>Order Information:</strong> Items ordered, preferences, special instructions</li>
              <li><strong>Payment Information:</strong> Processed securely through our payment provider</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>To process and fulfill your orders</li>
              <li>To communicate about your orders</li>
              <li>To improve our service and menu</li>
              <li>To comply with legal requirements</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-700 mb-6">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share information only with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Payment processors for transaction processing</li>
              <li>Delivery partners for order fulfillment</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 mb-6">
              We use cookies to improve your browsing experience and analyze website traffic. 
              You can disable cookies in your browser settings.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this privacy policy from time to time. 
              We will notify you of any changes by posting the new policy on this page.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Contact Us</h3>
              <p className="text-gray-700">
                If you have questions about this privacy policy, please contact us 
                at the address or phone number provided on our contact page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
