export default function RefundsPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              We want you to be completely satisfied with your order from Nomad Stop. 
              If you&apos;re not happy, we&apos;ll do our best to make it right.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">When Refunds Are Available</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>If your order is cancelled before preparation begins</li>
              <li>If there&apos;s an error with your order (wrong items, missing items)</li>
              <li>If the food quality is below our standards</li>
              <li>If delivery is significantly delayed beyond our control</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Process</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
              <li>Contact us within 2 hours of receiving your order</li>
              <li>Provide your order number and reason for the refund request</li>
              <li>We&apos;ll review your request and respond within 24 hours</li>
              <li>If approved, refunds will be processed to your original payment method</li>
              <li>Refunds may take 3-5 business days to appear in your account</li>
            </ol>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Partial Refunds</h2>
            <p className="text-gray-700 mb-6">
              We may offer partial refunds for specific items that don&apos;t meet your expectations, 
              while keeping the rest of your order.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">When Refunds Are Not Available</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>If you simply change your mind after the order is prepared</li>
              <li>If the order is not collected within the specified time</li>
              <li>If you don&apos;t like the taste of a dish (subjective preference)</li>
              <li>If you don&apos;t contact us within 2 hours of receiving the order</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Store Credit Alternative</h2>
            <p className="text-gray-700 mb-6">
              In some cases, we may offer store credit instead of a refund. 
              Store credit can be used for future orders and never expires.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us for Refunds</h2>
            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">How to Request a Refund</h3>
              <ul className="list-disc list-inside space-y-2 text-amber-700">
                <li>Call us at the number provided on our contact page</li>
                <li>Email us with your order number and details</li>
                <li>Speak to our staff if you&apos;re picking up in person</li>
              </ul>
              <p className="text-amber-700 mt-4">
                <strong>Important:</strong> Please have your order number ready when contacting us.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Our Commitment</h3>
              <p className="text-gray-700">
                We&apos;re committed to providing excellent food and service. 
                If we fall short, we&apos;ll work with you to make it right.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
