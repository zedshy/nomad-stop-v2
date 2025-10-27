'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CheckCircle, XCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';

interface Order {
  id: string;
  createdAt: string;
  status: string;
  fulfilment: string;
  slotStart?: string;
  slotEnd?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  notes?: string;
  items: any[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  total: number;
  payment?: {
    worldpayRef: string;
    status: string;
  };
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert('Invalid password');
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async (worldpayRef: string) => {
    try {
      const response = await fetch('/api/payments/worldpay/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldpayRef }),
      });

      if (response.ok) {
        alert('Payment captured successfully');
        fetchOrders();
      } else {
        alert('Failed to capture payment');
      }
    } catch (error) {
      console.error('Capture error:', error);
      alert('Failed to capture payment');
    }
  };

  const handleVoid = async (worldpayRef: string) => {
    if (!confirm('Are you sure you want to void this payment?')) return;

    try {
      const response = await fetch('/api/payments/worldpay/void', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldpayRef }),
      });

      if (response.ok) {
        alert('Payment voided successfully');
        fetchOrders();
      } else {
        alert('Failed to void payment');
      }
    } catch (error) {
      console.error('Void error:', error);
      alert('Failed to void payment');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      payment_authorized: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      captured: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.payment_authorized;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <main className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Button 
            onClick={fetchOrders} 
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isLoading ? 'Loading...' : 'Refresh Orders'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Orders Table */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-white">Time</th>
                        <th className="text-left py-2 text-white">Customer</th>
                        <th className="text-left py-2 text-white">Type</th>
                        <th className="text-left py-2 text-white">Total</th>
                        <th className="text-left py-2 text-white">Status</th>
                        <th className="text-left py-2 text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-600 hover:bg-gray-700">
                          <td className="py-2 text-sm text-gray-300">
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2 text-sm text-white">{order.customerName}</td>
                          <td className="py-2 text-sm text-white capitalize">{order.fulfilment}</td>
                          <td className="py-2 text-sm font-semibold text-yellow-600">
                            £{(order.total / 100).toFixed(2)}
                          </td>
                          <td className="py-2">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-2">
                            <div className="flex space-x-2">
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                  >
                                    View
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="bg-gray-800 border-gray-700">
                                  <SheetHeader>
                                    <SheetTitle className="text-white">Order Details</SheetTitle>
                                  </SheetHeader>
                                  {selectedOrder && (
                                    <div className="mt-6 space-y-4">
                                      <div>
                                        <h3 className="font-semibold text-white">Customer Info</h3>
                                        <p className="flex items-center text-sm text-gray-300">
                                          <Phone className="w-4 h-4 mr-2" />
                                          {selectedOrder.customerPhone}
                                        </p>
                                        {selectedOrder.customerEmail && (
                                          <p className="flex items-center text-sm text-gray-300">
                                            <Mail className="w-4 h-4 mr-2" />
                                            {selectedOrder.customerEmail}
                                          </p>
                                        )}
                                        {selectedOrder.addressLine1 && (
                                          <p className="flex items-center text-sm text-gray-300">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {selectedOrder.addressLine1}, {selectedOrder.city} {selectedOrder.postcode}
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div>
                                        <h3 className="font-semibold text-white">Items</h3>
                                        {selectedOrder.items.map((item, idx) => (
                                          <div key={idx} className="text-sm text-gray-300">
                                            {item.name} x{item.quantity} - £{(item.price / 100).toFixed(2)}
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                          onClick={() => {
                                            // Accept order logic
                                            alert('Order accepted! Customer will receive confirmation email.');
                                          }}
                                        >
                                          Accept Order
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            // Reject order logic
                                            alert('Order rejected!');
                                          }}
                                        >
                                          Reject Order
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </SheetContent>
                              </Sheet>
                              
                              {order.payment?.status === 'authorized' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleCapture(order.payment!.worldpayRef)}
                                  >
                                    Capture
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleVoid(order.payment!.worldpayRef)}
                                  >
                                    Void
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Orders</span>
                    <span className="font-semibold text-white">{orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending</span>
                    <span className="font-semibold text-yellow-400">
                      {orders.filter(o => o.status === 'payment_authorized').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Captured</span>
                    <span className="font-semibold text-green-400">
                      {orders.filter(o => o.status === 'captured').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Menu Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={() => alert('Add new item functionality coming soon!')}
                  >
                    Add New Item
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => alert('Edit menu functionality coming soon!')}
                  >
                    Edit Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
