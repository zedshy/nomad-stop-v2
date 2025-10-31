'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, MapPin, Phone, Mail, RefreshCw, LogOut, TrendingUp, Package, DollarSign, Users, ShoppingCart, Plus, Edit, Trash2, Tag, UtensilsCrossed } from 'lucide-react';

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
  items: Array<{name: string; quantity: number; price: number}>;
  subtotal: number;
  deliveryFee: number;
  tip: number;
  total: number;
  payment?: {
    worldpayRef: string;
    status: string;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  popular: boolean;
  allergens: string;
  variants: Array<{ id: string; name: string; price: number }>;
  addons: Array<{ id: string; name: string; price: number }>;
}

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  startDate: string;
  endDate: string; // Required in DB, far future date (2099-12-31) represents "no expiration"
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

export default function AdminDashboard() {
  // All hooks must be declared at the top before any conditional returns
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isPromoCodesLoading, setIsPromoCodesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  
  // Menu Management Form State
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    category: '',
    popular: false,
    allergens: '',
    variants: [] as Array<{ id?: string; name: string; price: string }>,
    addons: [] as Array<{ id?: string; name: string; price: string }>,
  });
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Promo Code Form State
  const [promoForm, setPromoForm] = useState({
    id: '',
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: '',
    active: true,
  });
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

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
      fetchProducts();
      fetchPromoCodes();
    } else {
      alert('Invalid password');
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]); // Ensure it's always an array
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
        alert('Payment captured successfully! Customer will receive confirmation email.');
        fetchOrders();
      } else {
        alert('Failed to capture payment');
      }
    } catch (error) {
      console.error('Capture error:', error);
      alert('Failed to capture payment');
    }
  };

  const handleCapturePayment = async (orderId: string) => {
    // Find the order to get the payment worldpayRef
    const order = orders.find(o => o.id === orderId);
    if (order?.payment?.worldpayRef) {
      await handleCapture(order.payment.worldpayRef);
    } else {
      // If no payment record, accept the order directly
      await handleAcceptOrder(orderId);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('Order accepted! Customer will receive confirmation email.');
        fetchOrders();
        setSelectedOrder(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Accept order error:', error);
      alert('Failed to accept order');
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

  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]); // Ensure it's always an array
      alert('Failed to fetch products');
    } finally {
      setIsProductsLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    setIsPromoCodesLoading(true);
    try {
      const response = await fetch('/api/admin/promotions');
      if (!response.ok) {
        throw new Error('Failed to fetch promo codes');
      }
      const data = await response.json();
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
      setPromoCodes([]); // Ensure it's always an array
      alert('Failed to fetch promo codes');
    } finally {
      setIsPromoCodesLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully');
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Promo code deleted successfully');
        fetchPromoCodes();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete promo code');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete promo code');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      payment_authorized: { 
        bgColor: 'bg-amber-600/20', 
        textColor: 'text-amber-400', 
        borderColor: 'border-amber-600/50',
        icon: Clock 
      },
      captured: { 
        bgColor: 'bg-green-600/20', 
        textColor: 'text-green-400', 
        borderColor: 'border-green-600/50',
        icon: CheckCircle 
      },
      rejected: { 
        bgColor: 'bg-red-600/20', 
        textColor: 'text-red-400', 
        borderColor: 'border-red-600/50',
        icon: XCircle 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.payment_authorized;
    const Icon = config.icon;

    return (
      <Badge className={`${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-800/95 border-gray-700 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">Admin Dashboard</CardTitle>
                <p className="text-gray-400 mt-2">Enter your password to access</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="password" className="text-white mb-2 block">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white focus:border-amber-600 focus:ring-amber-600"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold py-6 text-lg"
                    style={{backgroundColor: '#FFD500'}}
                  >
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        slug: productForm.slug,
        description: productForm.description || null,
        category: productForm.category,
        popular: productForm.popular,
        allergens: productForm.allergens || '',
        variants: productForm.variants.map(v => ({
          name: v.name,
          price: Math.round(parseFloat(v.price) * 100), // Convert to pence
        })),
        addons: productForm.addons.map(a => ({
          name: a.name,
          price: Math.round(parseFloat(a.price) * 100), // Convert to pence
        })),
      };

      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        setProductDialogOpen(false);
        resetProductForm();
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save product');
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: promoForm.code,
        description: promoForm.description || null,
        discountType: promoForm.discountType,
        discountValue: promoForm.discountType === 'percentage' 
          ? parseFloat(promoForm.discountValue)
          : Math.round(parseFloat(promoForm.discountValue) * 100), // Convert to pence for fixed
        minOrderAmount: promoForm.minOrderAmount ? Math.round(parseFloat(promoForm.minOrderAmount) * 100) : null,
        maxDiscount: promoForm.maxDiscount ? Math.round(parseFloat(promoForm.maxDiscount) * 100) : null,
        validFrom: promoForm.validFrom,
        validUntil: promoForm.validUntil || null,
        usageLimit: promoForm.usageLimit ? parseInt(promoForm.usageLimit) : null,
        active: promoForm.active,
      };

      const url = editingPromo 
        ? `/api/admin/promotions/${editingPromo.id}`
        : '/api/admin/promotions';
      const method = editingPromo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingPromo ? 'Promo code updated successfully' : 'Promo code created successfully');
        setPromoDialogOpen(false);
        resetPromoForm();
        fetchPromoCodes();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save promo code');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save promo code');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      id: '',
      name: '',
      slug: '',
      description: '',
      category: '',
      popular: false,
      allergens: '',
      variants: [],
      addons: [],
    });
    setEditingProduct(null);
  };

  const resetPromoForm = () => {
    setPromoForm({
      id: '',
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      usageLimit: '',
      active: true,
    });
    setEditingPromo(null);
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category: product.category,
        popular: product.popular,
        allergens: product.allergens || '',
        variants: product.variants.map(v => ({ id: v.id, name: v.name, price: (v.price / 100).toFixed(2) })),
        addons: product.addons.map(a => ({ id: a.id, name: a.name, price: (a.price / 100).toFixed(2) })),
      });
    } else {
      resetProductForm();
    }
    setProductDialogOpen(true);
  };

  const openPromoDialog = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      // Check if endDate is the far future date we use as "no expiration"
      const endDate = promo.endDate && promo.endDate < '2099-01-01' 
        ? promo.endDate.split('T')[0] 
        : '';
      
      const minOrderAmount = promo.minOrderAmount > 0 ? (promo.minOrderAmount / 100).toFixed(2) : '';
      
      setPromoForm({
        id: promo.id,
        code: promo.code,
        description: promo.description || '',
        discountType: promo.discountType,
        discountValue: promo.discountType === 'percentage' 
          ? promo.discountValue.toString()
          : (promo.discountValue / 100).toFixed(2),
        minOrderAmount: minOrderAmount,
        maxDiscount: promo.maxDiscount ? (promo.maxDiscount / 100).toFixed(2) : '',
        validFrom: promo.startDate.split('T')[0],
        validUntil: endDate,
        usageLimit: promo.usageLimit ? promo.usageLimit.toString() : '',
        active: promo.isActive,
      });
    } else {
      resetPromoForm();
    }
    setPromoDialogOpen(true);
  };

  const stats = {
    total: orders.length,
    // Pending includes all orders that are not completed or rejected
    pending: orders.filter(o => 
      o.status === 'payment_authorized' || 
      o.status === 'captured' || 
      o.status === 'preparing' || 
      o.status === 'ready'
    ).length,
    // Completed only includes orders with 'completed' status
    completed: orders.filter(o => o.status === 'completed').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
    // Revenue includes all orders that have been accepted (captured, preparing, ready, completed) - not just captured
    totalRevenue: orders.filter(o => 
      o.status === 'captured' || 
      o.status === 'preparing' || 
      o.status === 'ready' || 
      o.status === 'completed'
    ).reduce((sum, o) => sum + (o.total || 0), 0),
  };

  const categories = ['Doner & Grill', 'Pizza', 'Karahi', 'Drinks'];

  return (
    <main className="min-h-screen bg-black py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm md:text-base">Manage orders and restaurant operations</p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
          <Button 
              onClick={() => {
                if (activeTab === 'orders') fetchOrders();
                else if (activeTab === 'menu') fetchProducts();
                else if (activeTab === 'promos') fetchPromoCodes();
              }}
              disabled={isLoading || isProductsLoading || isPromoCodesLoading}
              className="bg-amber-600 hover:bg-amber-700 text-black font-semibold flex-1 md:flex-initial text-sm sm:text-base px-3 sm:px-4"
              style={{backgroundColor: '#FFD500'}}
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 ${isLoading || isProductsLoading || isPromoCodesLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsAuthenticated(false)}
              className="border-gray-600 text-black hover:bg-gray-700 hover:text-black font-semibold bg-white text-sm sm:text-base px-3 sm:px-4"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
          </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
          <Card className="bg-gray-800 border-gray-700 hover:border-amber-600 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">Total Orders</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-amber-600 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">Pending</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" style={{color: '#FFD500'}} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-amber-600 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">Completed</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.completed}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-amber-600 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">Revenue</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">£{(stats.totalRevenue / 100).toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800 border-gray-700 mb-4 md:mb-6 flex flex-wrap gap-2 h-auto">
            <TabsTrigger value="orders" className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden xs:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4">
              <UtensilsCrossed className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden">Menu</span>
              <span className="hidden sm:inline">Menu Management</span>
            </TabsTrigger>
            <TabsTrigger value="promos" className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden">Promos</span>
              <span className="hidden sm:inline">Promo Codes</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Orders Table */}
          <div className="lg:col-span-3">
                <Card className="bg-gray-800 border-gray-700 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" style={{color: '#FFD500'}} />
                        Recent Orders
                      </CardTitle>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                      </Badge>
                    </div>
              </CardHeader>
              <CardContent>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {orders.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">No orders yet</p>
                        <p className="text-gray-500 text-sm mt-1">Orders will appear here when customers place them</p>
                      </div>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id} className="bg-gray-700/30 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{order.customerName}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            <div>
                              <span className="text-gray-400">Type:</span>
                              <Badge variant="outline" className={`ml-1 text-xs capitalize border-gray-600 ${
                                order.fulfilment === 'delivery' ? 'text-blue-400' : 'text-green-400'
                              }`}>
                                {order.fulfilment}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-400">Total:</span>
                              <span className="ml-1 text-sm font-bold" style={{color: '#FFD500'}}>
                                £{(order.total / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                                className="border-gray-600 text-black hover:bg-gray-700 hover:text-black bg-white font-semibold w-full text-xs"
                              >
                                View Details
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg overflow-y-auto">
                              <SheetHeader className="border-b border-gray-700 pb-4 mb-6">
                                <SheetTitle className="text-xl sm:text-2xl font-bold text-white">Order Details</SheetTitle>
                              </SheetHeader>
                              {selectedOrder && (
                                <div className="space-y-4 sm:space-y-6 text-sm sm:text-base">
                                  {/* Order Status & Info */}
                                  <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                      <div>
                                        <p className="text-xs text-gray-400 mb-1">Order ID</p>
                                        <p className="text-xs sm:text-sm font-mono text-white">{selectedOrder.id.slice(0, 8)}...</p>
                                      </div>
                                      {getStatusBadge(selectedOrder.status)}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                                      <div>
                                        <p className="text-xs text-gray-400 mb-1">Order Date</p>
                                        <p className="text-xs sm:text-sm text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-400 mb-1">Fulfilment</p>
                                        <Badge variant="outline" className={`text-xs capitalize border-gray-600 ${
                                          selectedOrder.fulfilment === 'delivery' ? 'text-blue-400' : 'text-green-400'
                                        }`}>
                                          {selectedOrder.fulfilment}
                                        </Badge>
                                      </div>
                                      {selectedOrder.slotStart && selectedOrder.slotEnd && (
                                        <div className="col-span-1 sm:col-span-2">
                                          <p className="text-xs text-gray-400 mb-1">Time Slot</p>
                                          <p className="text-xs sm:text-sm text-white">{selectedOrder.slotStart} - {selectedOrder.slotEnd}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Customer Info */}
                                  <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      Customer Information
                                    </h3>
                                    <div className="space-y-2 sm:space-y-3">
                                      <div className="flex items-start gap-2">
                                        <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-xs text-gray-400">Name</p>
                                          <p className="text-xs sm:text-sm text-white">{selectedOrder.customerName}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-xs text-gray-400">Phone</p>
                                          <p className="text-xs sm:text-sm text-white">{selectedOrder.customerPhone}</p>
                                        </div>
                                      </div>
                                      {selectedOrder.customerEmail && (
                                        <div className="flex items-start gap-2">
                                          <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-xs text-gray-400">Email</p>
                                            <p className="text-xs sm:text-sm text-white">{selectedOrder.customerEmail}</p>
                                          </div>
                                        </div>
                                      )}
                                      {selectedOrder.fulfilment === 'delivery' && (
                                        <div className="flex items-start gap-2">
                                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-xs text-gray-400">Address</p>
                                            <p className="text-xs sm:text-sm text-white">
                                              {selectedOrder.addressLine1}
                                              {selectedOrder.city && `, ${selectedOrder.city}`}
                                              {selectedOrder.postcode && ` ${selectedOrder.postcode}`}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Order Items */}
                                  <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Order Items</h3>
                                    <div className="space-y-2">
                                      {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start py-2 border-b border-gray-600/50 last:border-0">
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-white">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                                          </div>
                                          <p className="text-xs sm:text-sm font-semibold text-white ml-2">
                                            £{((item.price * item.quantity) / 100).toFixed(2)}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Pricing Summary */}
                                  <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Pricing Summary</h3>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="text-white">£{(selectedOrder.subtotal / 100).toFixed(2)}</span>
                                      </div>
                                      {selectedOrder.deliveryFee > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Delivery Fee</span>
                                          <span className="text-white">£{(selectedOrder.deliveryFee / 100).toFixed(2)}</span>
                                        </div>
                                      )}
                                      {selectedOrder.tip > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Tip</span>
                                          <span className="text-white">£{(selectedOrder.tip / 100).toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between pt-2 border-t border-gray-600">
                                        <span className="font-semibold text-white">Total</span>
                                        <span className="font-bold text-lg" style={{color: '#FFD500'}}>
                                          £{(selectedOrder.total / 100).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Payment Actions */}
                                  {selectedOrder.status === 'payment_authorized' && (
                                    <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-3 sm:p-4">
                                      <p className="text-xs sm:text-sm text-amber-400 mb-3">
                                        Payment has been authorized. Click below to capture payment and complete the order.
                                      </p>
                                      <Button
                                        onClick={() => handleCapturePayment(selectedOrder.id)}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold text-sm sm:text-base"
                                        style={{backgroundColor: '#FFD500'}}
                                      >
                                        Capture Payment
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Package className="w-12 h-12 text-gray-600 mb-4" />
                              <p className="text-gray-400 text-lg">No orders yet</p>
                              <p className="text-gray-500 text-sm mt-1">Orders will appear here when customers place them</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                            <td className="py-4 px-4 text-sm text-gray-300">
                              <div className="flex flex-col">
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">{order.customerName}</span>
                                {order.customerEmail && (
                                  <span className="text-xs text-gray-400">{order.customerEmail}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={`text-xs capitalize border-gray-600 ${
                                order.fulfilment === 'delivery' ? 'text-blue-400' : 'text-green-400'
                              }`}>
                                {order.fulfilment}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm font-bold" style={{color: '#FFD500'}}>
                            £{(order.total / 100).toFixed(2)}
                              </span>
                          </td>
                            <td className="py-4 px-4">
                            {getStatusBadge(order.status)}
                          </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                    className="border-gray-600 text-black hover:bg-gray-700 hover:text-black hover:border-gray-500 bg-white font-semibold"
                                  >
                                    View Details
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg overflow-y-auto">
                                  <SheetHeader className="border-b border-gray-700 pb-4 mb-6">
                                    <SheetTitle className="text-2xl font-bold text-white">Order Details</SheetTitle>
                                  </SheetHeader>
                                  {selectedOrder && (
                                    <div className="space-y-6">
                                      {/* Order Status & Info */}
                                      <div className="bg-gray-700/50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                      <div>
                                            <p className="text-xs text-gray-400 mb-1">Order ID</p>
                                            <p className="text-sm font-mono text-white">{selectedOrder.id.slice(0, 8)}...</p>
                                          </div>
                                          {getStatusBadge(selectedOrder.status)}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                          <div>
                                            <p className="text-xs text-gray-400 mb-1">Order Date</p>
                                            <p className="text-sm text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-400 mb-1">Fulfilment</p>
                                            <Badge variant="outline" className={`text-xs capitalize border-gray-600 ${
                                              selectedOrder.fulfilment === 'delivery' ? 'text-blue-400' : 'text-green-400'
                                            }`}>
                                              {selectedOrder.fulfilment}
                                            </Badge>
                                          </div>
                                          {selectedOrder.slotStart && selectedOrder.slotEnd && (
                                            <div className="col-span-2">
                                              <p className="text-xs text-gray-400 mb-1">Time Slot</p>
                                              <p className="text-sm text-white">{selectedOrder.slotStart} - {selectedOrder.slotEnd}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Customer Info */}
                                      <div>
                                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                          <Users className="w-4 h-4" style={{color: '#FFD500'}} />
                                          Customer Information
                                        </h3>
                                        <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                                          <p className="text-lg font-semibold text-white">{selectedOrder.customerName}</p>
                                          <div className="flex items-center text-sm text-gray-300">
                                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                          {selectedOrder.customerPhone}
                                          </div>
                                        {selectedOrder.customerEmail && (
                                            <div className="flex items-center text-sm text-gray-300">
                                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            {selectedOrder.customerEmail}
                                            </div>
                                        )}
                                        {selectedOrder.addressLine1 && (
                                            <div className="flex items-start text-sm text-gray-300">
                                              <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                              <div>
                                                <p>{selectedOrder.addressLine1}</p>
                                                {selectedOrder.city && (
                                                  <p>{selectedOrder.city}, {selectedOrder.postcode}</p>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Order Items */}
                                      <div>
                                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                          <ShoppingCart className="w-4 h-4" style={{color: '#FFD500'}} />
                                          Order Items
                                        </h3>
                                        <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-600 last:border-0 last:pb-0">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{item.name}</p>
                                                <p className="text-xs text-gray-400 mt-1">Quantity: {item.quantity}</p>
                                              </div>
                                              <p className="text-sm font-semibold text-white ml-4">
                                                £{((item.price * item.quantity) / 100).toFixed(2)}
                                              </p>
                                          </div>
                                        ))}
                                        </div>
                                      </div>
                                      
                                      {/* Pricing Breakdown */}
                                      <div>
                                        <h3 className="font-semibold text-white mb-3">Pricing Breakdown</h3>
                                        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-300">Subtotal</span>
                                            <span className="text-white">£{(selectedOrder.subtotal / 100).toFixed(2)}</span>
                                          </div>
                                          {selectedOrder.deliveryFee > 0 && (
                                            <div className="flex justify-between text-sm">
                                              <span className="text-gray-300">Delivery Fee</span>
                                              <span className="text-white">£{(selectedOrder.deliveryFee / 100).toFixed(2)}</span>
                                            </div>
                                          )}
                                          {selectedOrder.tip > 0 && (
                                            <div className="flex justify-between text-sm">
                                              <span className="text-gray-300">Tip</span>
                                              <span className="text-white">£{(selectedOrder.tip / 100).toFixed(2)}</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                                            <span className="text-white">Total</span>
                                            <span style={{color: '#FFD500'}}>£{(selectedOrder.total / 100).toFixed(2)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Payment Actions */}
                                      {selectedOrder.payment?.status === 'authorized' && (
                                        <div>
                                          <h3 className="font-semibold text-white mb-3">Payment Actions</h3>
                                          <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
                                            <p className="text-xs text-gray-400 mb-3">Payment Status: <span className="text-amber-400 font-semibold">AUTHORIZED</span></p>
                                            <p className="text-xs text-gray-400 mb-3">Reference: <span className="text-white font-mono">{selectedOrder.payment.worldpayRef}</span></p>
                                            <div className="flex gap-2">
                                        <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleCapture(selectedOrder.payment!.worldpayRef)}
                                              >
                                                Capture Payment
                                              </Button>
                                              <Button
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => handleVoid(selectedOrder.payment!.worldpayRef)}
                                              >
                                                Void Payment
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Order Actions */}
                                      <div className="flex gap-3 pt-4 border-t border-gray-700">
                                        <Button
                                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                          onClick={() => handleAcceptOrder(selectedOrder.id)}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Accept Order
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          className="flex-1"
                                          onClick={() => {
                                            alert('Order rejected!');
                                          }}
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
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
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                    onClick={() => handleCapture(order.payment!.worldpayRef)}
                                  >
                                    Capture
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs"
                                    onClick={() => handleVoid(order.payment!.worldpayRef)}
                                  >
                                    Void
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{color: '#FFD500'}} />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <span className="text-gray-400 text-sm">Total Orders</span>
                    <span className="font-bold text-xl text-white">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{color: '#FFD500'}} />
                      <span className="text-gray-400 text-sm">Pending</span>
                    </div>
                    <span className="font-semibold text-lg" style={{color: '#FFE033'}}>
                      {stats.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400 text-sm">Completed</span>
                    </div>
                    <span className="font-semibold text-lg text-green-400">
                      {stats.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400 text-sm">Revenue</span>
                    </div>
                    <span className="font-bold text-xl text-green-400">
                      £{(stats.totalRevenue / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-1">
                      <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" style={{color: '#FFD500'}} />
                      <span className="truncate">Menu Management</span>
                    </CardTitle>
                    <p className="text-gray-400 text-xs sm:text-sm sm:ml-8">Add, edit, or remove items from your menu</p>
                  </div>
                  <Button
                    onClick={() => openProductDialog()}
                    style={{backgroundColor: '#FFD500'}}
                    className="text-black font-semibold px-4 sm:px-6 h-10 sm:h-11 w-full sm:w-auto flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Add Menu Item</span>
                    <span className="sm:hidden">Add Item</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isProductsLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{color: '#FFD500'}} />
                    <p className="text-gray-400">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UtensilsCrossed className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Your menu is empty</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Start building your menu by adding your first item. You can add descriptions, prices, and mark popular items.
                    </p>
                  <Button 
                      onClick={() => openProductDialog()}
                      style={{backgroundColor: '#FFD500'}}
                      className="text-black font-semibold px-8 h-12 text-base"
                  >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Menu Item
                  </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-gray-700">
                    <div className="min-w-full inline-block align-middle">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-700/30">
                          <tr>
                            <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-300 min-w-[180px]">Menu Item</th>
                            <th className="text-left py-3 px-2 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">Category</th>
                            <th className="text-left py-3 px-2 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">Prices</th>
                            <th className="text-left py-3 px-2 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">Status</th>
                            <th className="text-left py-3 px-2 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-700/20 transition-colors">
                              <td className="py-4 px-3 sm:py-5 sm:px-6 min-w-[180px]">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm sm:text-base font-semibold text-white mb-1 truncate" title={product.name}>{product.name}</span>
                                  {product.description && (
                                    <span className="text-xs sm:text-sm text-gray-400 line-clamp-1 truncate" title={product.description}>{product.description}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-2 sm:py-5 sm:px-6 whitespace-nowrap">
                                <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize text-xs sm:text-sm">
                                  {product.category}
                                </Badge>
                              </td>
                              <td className="py-4 px-2 sm:py-5 sm:px-6 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  {product.variants.slice(0, 2).map((variant, idx) => (
                                    <span key={idx} className="text-xs sm:text-sm text-white">
                                      <span className="hidden sm:inline">{variant.name}: </span>
                                      <span className="font-semibold" style={{color: '#FFD500'}}>£{(variant.price / 100).toFixed(2)}</span>
                                    </span>
                                  ))}
                                  {product.variants.length > 2 && (
                                    <span className="text-xs text-gray-400">+{product.variants.length - 2} more</span>
                                  )}
                                  {product.variants.length === 0 && (
                                    <span className="text-xs sm:text-sm text-gray-500 italic">No prices</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-2 sm:py-5 sm:px-6 whitespace-nowrap">
                                {product.popular && (
                                  <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/50 text-xs sm:text-sm">
                                    <span className="hidden sm:inline">⭐ Popular</span>
                                    <span className="sm:hidden">⭐</span>
                                  </Badge>
                                )}
                                {!product.popular && (
                                  <span className="text-gray-500 text-xs sm:text-sm">—</span>
                                )}
                              </td>
                              <td className="py-4 px-2 sm:py-5 sm:px-6 whitespace-nowrap">
                                <div className="flex gap-1 sm:gap-2">
                  <Button 
                    variant="outline"
                                    size="sm"
                                    onClick={() => openProductDialog(product)}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                                  >
                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="border-red-600 text-red-400 hover:bg-red-600/20 px-2 sm:px-3 h-8 sm:h-9"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promo Codes Tab */}
          <TabsContent value="promos">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-1">
                      <Tag className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" style={{color: '#FFD500'}} />
                      <span className="truncate">Promo Code Management</span>
                    </CardTitle>
                    <p className="text-gray-400 text-xs sm:text-sm sm:ml-8">Create discount codes for your customers</p>
          </div>
                  <Button
                    onClick={() => openPromoDialog()}
                    style={{backgroundColor: '#FFD500'}}
                    className="text-black font-semibold px-4 sm:px-6 h-10 sm:h-11 w-full sm:w-auto flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Create Promo Code</span>
                    <span className="sm:hidden">Create Code</span>
                  </Button>
        </div>
              </CardHeader>
              <CardContent>
                {isPromoCodesLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{color: '#FFD500'}} />
                    <p className="text-gray-400">Loading promo codes...</p>
                  </div>
                ) : !Array.isArray(promoCodes) || promoCodes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Tag className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No promo codes created yet</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Create discount codes to reward your customers. Set percentage or fixed discounts, usage limits, and expiration dates.
                    </p>
                    <Button
                      onClick={() => openPromoDialog()}
                      style={{backgroundColor: '#FFD500'}}
                      className="text-black font-semibold px-8 h-12 text-base"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Promo Code
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-gray-700">
                    <div className="min-w-full inline-block align-middle">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-3 sm:py-3 sm:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[120px]">Code</th>
                            <th className="text-left py-3 px-2 sm:py-3 sm:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Type</th>
                            <th className="text-left py-3 px-2 sm:py-3 sm:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Value</th>
                            <th className="text-left py-3 px-2 sm:py-3 sm:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Usage</th>
                            <th className="text-left py-3 px-2 sm:py-3 sm:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                            <th className="text-left py-3 px-2 sm:py-3 sm:px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(promoCodes) ? promoCodes : []).map((promo) => (
                            <tr key={promo.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                              <td className="py-4 px-3 sm:py-4 sm:px-4 min-w-[120px]">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs sm:text-sm font-medium text-white font-mono truncate" title={promo.code}>{promo.code}</span>
                                  {promo.description && (
                                    <span className="text-xs text-gray-400 mt-1 line-clamp-1 truncate" title={promo.description}>{promo.description}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-2 sm:py-4 sm:px-4 whitespace-nowrap">
                                <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize text-xs sm:text-sm">
                                  {promo.discountType}
                                </Badge>
                              </td>
                              <td className="py-4 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm text-white whitespace-nowrap">
                                {promo.discountType === 'percentage' 
                                  ? `${promo.discountValue}%`
                                  : `£${(promo.discountValue / 100).toFixed(2)}`}
                              </td>
                              <td className="py-4 px-2 sm:py-4 sm:px-4 text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                                {promo.usedCount} / {promo.usageLimit || '∞'}
                              </td>
                              <td className="py-4 px-2 sm:py-4 sm:px-4 whitespace-nowrap">
                                <Badge className={`text-xs sm:text-sm ${promo.isActive 
                                  ? 'bg-green-600/20 text-green-400 border-green-600/50'
                                  : 'bg-red-600/20 text-red-400 border-red-600/50'
                                }`}>
                                  {promo.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="py-4 px-2 sm:py-4 sm:px-4 whitespace-nowrap">
                                <div className="flex gap-1 sm:gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPromoDialog(promo)}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                                  >
                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePromoCode(promo.id)}
                                    className="border-red-600 text-red-400 hover:bg-red-600/20 px-2 sm:px-3 h-8 sm:h-9"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Form Dialog */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-gray-700">
              <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                <UtensilsCrossed className="w-7 h-7" style={{color: '#FFD500'}} />
                {editingProduct ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
              <p className="text-gray-400 text-sm mt-2">
                {editingProduct ? 'Update the details of your menu item' : 'Fill in the details below to add a new item to your menu'}
              </p>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-6 mt-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                </div>
                
                <div>
                  <Label htmlFor="name" className="text-white text-base font-medium mb-2 block">
                    Item Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})}
                    className="bg-gray-700 border-gray-600 text-white h-11 text-base"
                    placeholder="e.g., Chicken Doner Kebab"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1.5">Enter the name of the dish as customers will see it</p>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white text-base font-medium mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white min-h-[80px] text-base"
                    placeholder="Describe the dish... (e.g., Tender chicken pieces marinated in special spices, served with fresh salad and homemade sauces)"
                    rows={3}
                  />
                  <p className="text-gray-500 text-xs mt-1.5">A brief description helps customers understand what they're ordering</p>
                </div>
              </div>

              {/* Category & Settings Section */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-lg font-semibold text-white">Category & Settings</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-white text-base font-medium mb-2 block">
                      Menu Category <span className="text-red-400">*</span>
                    </Label>
                    <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-11 text-base">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-white">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.popular}
                          onChange={(e) => setProductForm({...productForm, popular: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 checked:bg-amber-600"
                        />
                        <div>
                          <span className="text-white font-medium block">⭐ Popular Item</span>
                          <span className="text-gray-400 text-xs">Show a "Popular" badge on this item</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="allergens" className="text-white text-base font-medium mb-2 block">
                    Allergen Information
                  </Label>
                  <Input
                    id="allergens"
                    value={productForm.allergens}
                    onChange={(e) => setProductForm({...productForm, allergens: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white h-11 text-base"
                    placeholder="e.g., Contains gluten, dairy, nuts"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">Important: List any allergens customers need to know about</p>
                </div>
              </div>
              
              {/* Pricing Section */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                    <h3 className="text-lg font-semibold text-white">Pricing & Sizes</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProductForm({...productForm, variants: [...productForm.variants, {name: '', price: ''}]})}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    style={productForm.variants.length === 0 ? {borderColor: '#FFD500', color: '#FFD500'} : {}}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Size/Price Option
                  </Button>
                </div>
                {productForm.variants.length === 0 && (
                  <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 mb-4">
                    <p className="text-amber-300 text-sm flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>Add at least one size or price option for this item (e.g., Small £8.99, Large £12.99)</span>
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {productForm.variants.map((variant, idx) => (
                    <div key={idx} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                      <div className="flex gap-3 items-center">
                        <div className="flex-1">
                          <Label className="text-gray-400 text-xs mb-1.5 block">Size Name</Label>
                          <Input
                            placeholder="e.g., Small, Medium, Large, Regular, Family Size"
                            value={variant.name}
                            onChange={(e) => {
                              const newVariants = [...productForm.variants];
                              newVariants[idx].name = e.target.value;
                              setProductForm({...productForm, variants: newVariants});
                            }}
                            className="bg-gray-700 border-gray-600 text-white h-10"
                          />
                        </div>
                        <div className="w-36">
                          <Label className="text-gray-400 text-xs mb-1.5 block">Price (£)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={variant.price}
                            onChange={(e) => {
                              const newVariants = [...productForm.variants];
                              newVariants[idx].price = e.target.value;
                              setProductForm({...productForm, variants: newVariants});
                            }}
                            className="bg-gray-700 border-gray-600 text-white h-10"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setProductForm({...productForm, variants: productForm.variants.filter((_, i) => i !== idx)})}
                          className="border-red-600 text-red-400 hover:bg-red-600/20 h-10 mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons Section */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                    <h3 className="text-lg font-semibold text-white">Extra Add-ons (Optional)</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProductForm({...productForm, addons: [...productForm.addons, {name: '', price: ''}]})}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Extra
                  </Button>
                </div>
                <p className="text-gray-400 text-sm mb-4">Optional extras customers can add (e.g., Extra cheese, Extra sauce, etc.)</p>
                <div className="space-y-3">
                  {productForm.addons.map((addon, idx) => (
                    <div key={idx} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                      <div className="flex gap-3 items-center">
                        <div className="flex-1">
                          <Label className="text-gray-400 text-xs mb-1.5 block">Add-on Name</Label>
                          <Input
                            placeholder="e.g., Extra Cheese, Extra Sauce, Extra Meat"
                            value={addon.name}
                            onChange={(e) => {
                              const newAddons = [...productForm.addons];
                              newAddons[idx].name = e.target.value;
                              setProductForm({...productForm, addons: newAddons});
                            }}
                            className="bg-gray-700 border-gray-600 text-white h-10"
                          />
                        </div>
                        <div className="w-36">
                          <Label className="text-gray-400 text-xs mb-1.5 block">Price (£)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={addon.price}
                            onChange={(e) => {
                              const newAddons = [...productForm.addons];
                              newAddons[idx].price = e.target.value;
                              setProductForm({...productForm, addons: newAddons});
                            }}
                            className="bg-gray-700 border-gray-600 text-white h-10"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setProductForm({...productForm, addons: productForm.addons.filter((_, i) => i !== idx)})}
                          className="border-red-600 text-red-400 hover:bg-red-600/20 h-10 mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {productForm.addons.length === 0 && (
                    <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-6 text-center">
                      <p className="text-gray-500 text-sm">No add-ons added yet. Click "Add Extra" above if you want to offer optional extras.</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProductDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{backgroundColor: '#FFD500'}}
                  className="text-black font-semibold px-8 h-11 text-base hover:opacity-90"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Menu'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Promo Code Form Dialog */}
        <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-gray-700">
              <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                <Tag className="w-7 h-7" style={{color: '#FFD500'}} />
                {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
              </DialogTitle>
              <p className="text-gray-400 text-sm mt-2">
                {editingPromo ? 'Update your promotional code settings' : 'Create a discount code your customers can use at checkout'}
              </p>
            </DialogHeader>
            <form onSubmit={handlePromoSubmit} className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-lg font-semibold text-white">Code Information</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code" className="text-white text-base font-medium mb-2 block">
                      Promo Code <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="code"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                      className="bg-gray-700 border-gray-600 text-white font-mono h-11 text-base font-semibold"
                      placeholder="SAVE10"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1.5">Enter the code customers will type at checkout (e.g., SAVE10, WELCOME20)</p>
                  </div>
                  <div>
                    <Label htmlFor="discountType" className="text-white text-base font-medium mb-2 block">
                      Discount Type <span className="text-red-400">*</span>
                    </Label>
                    <Select 
                      value={promoForm.discountType} 
                      onValueChange={(value: 'percentage' | 'fixed') => setPromoForm({...promoForm, discountType: value})}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-11 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="percentage" className="text-white">Percentage Off (%)</SelectItem>
                        <SelectItem value="fixed" className="text-white">Fixed Amount Off (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-gray-500 text-xs mt-1.5">
                      {promoForm.discountType === 'percentage' 
                        ? 'Percentage: Take X% off the order (e.g., 10% off)'
                        : 'Fixed: Take a fixed amount off (e.g., £5 off)'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white text-base font-medium mb-2 block">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white min-h-[70px] text-base"
                    rows={2}
                    placeholder="e.g., Welcome discount for new customers"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">This description is for your reference only (won't be shown to customers)</p>
                </div>
              </div>

              {/* Discount Settings */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-lg font-semibold text-white">Discount Settings</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountValue" className="text-white text-base font-medium mb-2 block">
                      Discount Value <span className="text-red-400">*</span>
                      <span className="text-gray-400 text-sm font-normal ml-2">
                        {promoForm.discountType === 'percentage' ? '(%)' : '(£)'}
                      </span>
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      step={promoForm.discountType === 'percentage' ? '1' : '0.01'}
                      value={promoForm.discountValue}
                      onChange={(e) => setPromoForm({...promoForm, discountValue: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white h-11 text-base"
                      placeholder={promoForm.discountType === 'percentage' ? '10' : '5.00'}
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1.5">
                      {promoForm.discountType === 'percentage' 
                        ? 'Enter the percentage (e.g., 10 for 10% off)'
                        : 'Enter the amount in pounds (e.g., 5.00 for £5 off)'}
                    </p>
                  </div>
                  {promoForm.discountType === 'percentage' && (
                    <div>
                      <Label htmlFor="maxDiscount" className="text-white text-base font-medium mb-2 block">
                        Maximum Discount (£)
                        <span className="text-gray-400 text-xs font-normal ml-2">Optional</span>
                      </Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        step="0.01"
                        value={promoForm.maxDiscount}
                        onChange={(e) => setPromoForm({...promoForm, maxDiscount: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white h-11 text-base"
                        placeholder="No limit"
                      />
                      <p className="text-gray-500 text-xs mt-1.5">Limit the maximum discount amount (e.g., cap at £20 even if 25% would be more)</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="minOrderAmount" className="text-white text-base font-medium mb-2 block">
                    Minimum Order Amount (£)
                    <span className="text-gray-400 text-xs font-normal ml-2">Optional</span>
                  </Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    step="0.01"
                    value={promoForm.minOrderAmount}
                    onChange={(e) => setPromoForm({...promoForm, minOrderAmount: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white h-11 text-base"
                    placeholder="No minimum"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">Require a minimum order value to use this code (e.g., must order at least £15)</p>
                </div>
              </div>

              {/* Usage & Validity */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-lg font-semibold text-white">Usage & Validity</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usageLimit" className="text-white text-base font-medium mb-2 block">
                      Usage Limit
                      <span className="text-gray-400 text-xs font-normal ml-2">Optional</span>
                    </Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={promoForm.usageLimit}
                      onChange={(e) => setPromoForm({...promoForm, usageLimit: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white h-11 text-base"
                      placeholder="Unlimited"
                    />
                    <p className="text-gray-500 text-xs mt-1.5">How many times this code can be used total (leave empty for unlimited)</p>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          id="active"
                          checked={promoForm.active}
                          onChange={(e) => setPromoForm({...promoForm, active: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 checked:bg-green-600"
                        />
                        <div>
                          <span className="text-white font-medium block">✓ Active Now</span>
                          <span className="text-gray-400 text-xs">Customers can use this code right away</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom" className="text-white text-base font-medium mb-2 block">
                      Start Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={promoForm.validFrom}
                      onChange={(e) => setPromoForm({...promoForm, validFrom: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white h-11 text-base"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1.5">When customers can start using this code</p>
                  </div>
                  <div>
                    <Label htmlFor="validUntil" className="text-white text-base font-medium mb-2 block">
                      End Date
                      <span className="text-gray-400 text-xs font-normal ml-2">Optional</span>
                    </Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={promoForm.validUntil}
                      onChange={(e) => setPromoForm({...promoForm, validUntil: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white h-11 text-base"
                    />
                    <p className="text-gray-500 text-xs mt-1.5">When this code expires (leave empty for no expiration)</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPromoDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{backgroundColor: '#FFD500'}}
                  className="text-black font-semibold px-8 h-11 text-base hover:opacity-90"
                >
                  {editingPromo ? 'Save Changes' : 'Create Promo Code'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
