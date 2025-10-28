import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your order. We&apos;ll start preparing your delicious meal right away.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Order Number</span>
                <span className="font-mono">#NS-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Time</span>
                <span>20-25 minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">£24.99</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <p className="text-gray-600">
              You&apos;ll receive a confirmation email shortly with your order details and estimated pickup/delivery time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button variant="outline">
                  Order Again
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
