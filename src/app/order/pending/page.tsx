import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import Link from 'next/link';

export default function OrderPendingPage() {
  return (
    <main className="py-16 bg-black min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Clock className="w-20 h-20 text-yellow-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-yellow-600 mb-4">
              Awaiting Restaurant Confirmation
            </h1>
            <p className="text-lg text-gray-300">
              Your order has been received and is being processed by our team.
            </p>
          </div>

          <Card className="mb-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-white">
                <span>Order Number</span>
                <span className="font-mono text-gray-300">#NS-2024-001</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Status</span>
                <span className="text-yellow-600 font-semibold">Payment Authorized</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Total</span>
                <span className="font-bold text-yellow-600">£24.99</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <p className="text-gray-300 text-lg">
              We'll confirm your order within the next few minutes. You'll receive an email 
              once your order is accepted and we start preparing your meal.
            </p>
            
            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
              <p className="text-sm text-yellow-400">
                <strong>Note:</strong> If you don't receive confirmation within 10 minutes, 
                please call us at the number provided in your order email.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/menu">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto">
                  Browse Menu
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto">
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
