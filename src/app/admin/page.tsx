'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, MapPin, Phone, Mail, RefreshCw, LogOut, TrendingUp, Package, DollarSign, Users, ShoppingCart, Plus, Edit, Trash2, Tag, UtensilsCrossed, Lock, Eye, EyeOff, ChefHat, Settings, UserPlus, Key } from 'lucide-react';

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
  serviceFee?: number;
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

interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: 'super_admin' | 'admin' | 'staff';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  // All hooks must be declared at the top before any conditional returns
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isPromoCodesLoading, setIsPromoCodesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isAdminsLoading, setIsAdminsLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  
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
  
  // Admin User Form State
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminForm, setAdminForm] = useState({
    email: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'super_admin' | 'admin' | 'staff',
    isActive: true,
  });
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormSuccess, setAdminFormSuccess] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

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

  // Check if user was previously authenticated on mount
  useEffect(() => {
    const authToken = localStorage.getItem('nomadAdminAuth');
    const authExpiry = localStorage.getItem('nomadAdminAuthExpiry');
    
    if (authToken && authExpiry) {
      const expiryTime = parseInt(authExpiry, 10);
      const now = Date.now();
      
      // Check if token is still valid (7 days expiry)
      if (now < expiryTime) {
        setIsAuthenticated(true);
        // Restore admin info from session if available
        const storedAdmin = sessionStorage.getItem('currentAdmin');
        if (storedAdmin) {
          try {
            const admin = JSON.parse(storedAdmin);
            setCurrentAdmin(admin);
          } catch {
            // Invalid stored admin, ignore
          }
        }
      } else {
        // Token expired, clear it
        localStorage.removeItem('nomadAdminAuth');
        localStorage.removeItem('nomadAdminAuthExpiry');
        sessionStorage.removeItem('currentAdmin');
        setIsAuthenticated(false);
      }
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchProducts();
      fetchPromoCodes();
      fetchAdminUsers();
    }
  }, [isAuthenticated]);

  // Auto-refresh orders every 10 seconds when authenticated and on orders tab
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'orders') return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
        const result = await response.json();
        
        // Generate auth token
        const authToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        
        // Store auth token and expiry
        localStorage.setItem('nomadAdminAuth', authToken);
        localStorage.setItem('nomadAdminAuthExpiry', expiryTime.toString());
        
        // Store admin info in session
        if (result.admin) {
          sessionStorage.setItem('currentAdmin', JSON.stringify(result.admin));
          setCurrentAdmin(result.admin);
        }
        
      setIsAuthenticated(true);
      fetchOrders();
        fetchProducts();
        fetchPromoCodes();
        fetchAdminUsers();
    } else {
        setLoginError('Invalid password. Please try again.');
        setPassword('');
      }
    } catch {
      setLoginError('Connection error. Please check your internet and try again.');
    } finally {
      setIsLoggingIn(false);
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

  const fetchAdminUsers = async () => {
    setIsAdminsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch admin users');
      }
      const data = await response.json();
      setAdminUsers(Array.isArray(data) ? data : []);
      
      // Set current admin from stored session if available
      const storedAdmin = sessionStorage.getItem('currentAdmin');
      if (storedAdmin) {
        try {
          const admin = JSON.parse(storedAdmin);
          setCurrentAdmin(admin);
        } catch {
          // Invalid stored admin, ignore
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
      setAdminUsers([]);
    } finally {
      setIsAdminsLoading(false);
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
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-8 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-md w-full relative z-10">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20 transform hover:scale-105 transition-transform duration-300">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Nomad Stop
            </h1>
            <p className="text-gray-400 text-lg font-medium">Admin Dashboard</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              <Lock className="w-4 h-4 text-amber-500" />
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="bg-gray-800/95 backdrop-blur-sm border-gray-700/50 shadow-2xl animate-slide-up">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email/Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" />
                    Email or Username
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError('');
                    }}
                    className="bg-gray-700/50 border-gray-600 text-white h-12 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 placeholder:text-gray-500"
                    placeholder="admin@nomadstop.com (optional)"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError('');
                      }}
                      className="bg-gray-700/50 border-gray-600 text-white h-12 text-base pr-12 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 placeholder:text-gray-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors duration-200 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-0 focus:ring-offset-gray-800 cursor-pointer"
                    />
                    <Label htmlFor="remember" className="text-gray-300 text-sm cursor-pointer select-none">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-amber-500 hover:text-amber-400 transition-colors duration-200"
                    onClick={() => alert('Please contact system administrator to reset your password.')}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-shake">
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <Button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-base shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      <span>Sign In to Dashboard</span>
                    </div>
                  )}
                  </Button>

                {/* Security Notice */}
                <div className="pt-4 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Secure admin access • Authorized personnel only
                  </p>
                </div>
                </form>
              </CardContent>
            </Card>

          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Nomad Stop. All rights reserved.
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
          .animate-slide-up {
            animation: slide-up 0.6s ease-out 0.2s both;
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
          .delay-1000 {
            animation-delay: 1s;
          }
        `}</style>
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
        setNotification({
          type: 'success',
          message: editingProduct ? 'Product updated successfully' : 'Product created successfully'
        });
        setProductDialogOpen(false);
        resetProductForm();
        fetchProducts();
        setTimeout(() => setNotification(null), 3000);
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'Failed to save product';
        setNotification({
          type: errorMessage.includes('Database is disabled') ? 'warning' : 'error',
          message: errorMessage
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to save product. Please check your connection and try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError('');
    setAdminFormSuccess('');
    
    // Validation
    if (!adminForm.email) {
      setAdminFormError('Email is required');
      return;
    }
    
    // Only require password for new admins or if password is being changed
    if (!editingAdmin && !adminForm.password) {
      setAdminFormError('Password is required');
      return;
    }
    
    if (adminForm.password && adminForm.password !== adminForm.confirmPassword) {
      setAdminFormError('Passwords do not match');
      return;
    }
    
    if (adminForm.password && adminForm.password.length < 6) {
      setAdminFormError('Password must be at least 6 characters');
      return;
    }
    
    setIsCreatingAdmin(true);
    
    try {
      const payload: {
        email: string;
        username?: string | null;
        name?: string | null;
        password?: string;
        role: 'super_admin' | 'admin' | 'staff';
        isActive?: boolean;
      } = {
        email: adminForm.email,
        username: adminForm.username || null,
        name: adminForm.name || null,
        role: adminForm.role,
      };
      
      // Only include password if provided (for new admins or password changes)
      if (adminForm.password) {
        payload.password = adminForm.password;
      }
      
      // Include isActive for updates
      if (editingAdmin) {
        payload.isActive = adminForm.isActive;
      }
      
      const url = editingAdmin 
        ? `/api/admin/users/${editingAdmin.id}`
        : '/api/admin/users';
      const method = editingAdmin ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        setAdminFormSuccess(editingAdmin ? 'Admin user updated successfully' : 'Admin user created successfully');
        setTimeout(() => {
          setAdminDialogOpen(false);
          resetAdminForm();
          fetchAdminUsers();
        }, 1000);
      } else {
        const data = await response.json();
        setAdminFormError(data.error || 'Failed to save admin user');
      }
    } catch (error) {
      console.error('Save error:', error);
      setAdminFormError('Failed to save admin user. Please try again.');
    } finally {
      setIsCreatingAdmin(false);
    }
  };
  
  const resetAdminForm = () => {
    setAdminForm({
      email: '',
      username: '',
      name: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      isActive: true,
    });
    setEditingAdmin(null);
    setAdminFormError('');
    setAdminFormSuccess('');
  };
  
  const openAdminDialog = (admin?: AdminUser) => {
    if (admin) {
      setEditingAdmin(admin);
      setAdminForm({
        email: admin.email,
        username: admin.username || '',
        name: admin.name || '',
        password: '',
        confirmPassword: '',
        role: admin.role,
        isActive: admin.isActive,
      });
    } else {
      resetAdminForm();
    }
    setAdminDialogOpen(true);
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if database is disabled
    const response = await fetch('/api/admin/promotions');
    if (!response.ok && response.status === 503) {
      alert('Database is currently disabled. Please enable the database connection to create promo codes. Changes made in admin will appear on the website once the database is connected.');
      return;
    }
    
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
        const errorMessage = data.error || 'Failed to save promo code';
        
        // Show a more helpful message if database is disabled
        if (response.status === 503) {
          alert(`⚠️ Database is Currently Disabled\n\n${errorMessage}\n\nTo create promo codes, you need to:\n1. Set DISABLE_DB="false" in your .env file\n2. Restart the development server\n3. Ensure your database is properly connected\n\nUntil then, changes made in admin won't be saved.`);
        } else {
          alert(`Error: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save promo code. Please check your connection and try again.');
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
        variants: Array.isArray(product.variants) 
          ? product.variants.map(v => ({ id: v.id, name: v.name, price: (v.price / 100).toFixed(2) }))
          : [],
        addons: Array.isArray(product.addons) 
          ? product.addons.map(a => ({ id: a.id, name: a.name, price: (a.price / 100).toFixed(2) }))
          : [],
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
    // Revenue includes all orders that have been authorized or accepted (payment_authorized, captured, preparing, ready, completed)
    // Since payments are auto-captured, payment_authorized orders should also count as they will be captured
    // Calculate total from subtotal + deliveryFee + tip if total is not available
    totalRevenue: orders.filter(o => 
      o.status === 'payment_authorized' ||
      o.status === 'captured' || 
      o.status === 'preparing' || 
      o.status === 'ready' || 
      o.status === 'completed'
    ).reduce((sum, o) => {
      // Use total if available, otherwise calculate from components
      const orderTotal = o.total ?? (o.subtotal + o.deliveryFee + o.tip + (o.serviceFee || 0));
      return sum + orderTotal;
    }, 0),
  };

  const categories = ['Doner & Grill', 'Pizza', 'Karahi', 'Drinks'];

  return (
    <main className="min-h-screen bg-black py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-md animate-slide-in-right ${
            notification.type === 'success' 
              ? 'bg-green-600/90 border-green-500' 
              : notification.type === 'warning'
              ? 'bg-amber-600/90 border-amber-500'
              : 'bg-red-600/90 border-red-500'
          } border rounded-lg shadow-xl p-4 flex items-start gap-3`}>
            <div className="flex-shrink-0 mt-0.5">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : notification.type === 'warning' ? (
                <XCircle className="w-5 h-5 text-white" />
              ) : (
                <XCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{notification.message}</p>
              {notification.type === 'warning' && notification.message.includes('Database is disabled') && (
                <p className="text-white/80 text-xs mt-1">
                  To enable: Remove or set <code className="bg-white/20 px-1 rounded">DISABLE_DB=false</code> in your <code className="bg-white/20 px-1 rounded">.env</code> file and restart the server.
                </p>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

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
              onClick={() => {
                localStorage.removeItem('nomadAdminAuth');
                localStorage.removeItem('nomadAdminAuthExpiry');
                localStorage.removeItem('nomadAdminRemembered');
                sessionStorage.removeItem('currentAdmin');
                setIsAuthenticated(false);
                setPassword('');
                setEmail('');
                setCurrentAdmin(null);
              }}
              className="bg-gray-700/80 border-gray-600 text-gray-200 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400 font-semibold text-sm sm:text-base px-3 sm:px-4 transition-all duration-200"
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
              <span className="hidden xs:inline sm:hidden">Orders</span>
              <span className="hidden sm:inline">Recent Orders</span>
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
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden xs:inline sm:hidden">Settings</span>
              <span className="hidden sm:inline">Settings</span>
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
                                            <p className="text-xs text-gray-400 mb-3">Payment Status: <span className="text-green-400 font-semibold">CAPTURED</span></p>
                                            <p className="text-xs text-gray-400 mb-3">Reference: <span className="text-white font-mono">{selectedOrder.payment.worldpayRef}</span></p>
                                            <p className="text-xs text-green-400">Payment has been automatically captured.</p>
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
                                    className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500 hover:text-white text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
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
                                    className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500 hover:text-white text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
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

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password Card */}
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 sm:w-6 sm:h-6" style={{color: '#FFD500'}} />
                    Change Password
                  </CardTitle>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">Update your admin account password</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setPasswordError('');
                    setPasswordSuccess('');
                    setIsChangingPassword(true);

                    // Validate passwords
                    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                      setPasswordError('New passwords do not match');
                      setIsChangingPassword(false);
                      return;
                    }

                    if (passwordForm.newPassword.length < 6) {
                      setPasswordError('Password must be at least 6 characters long');
                      setIsChangingPassword(false);
                      return;
                    }

                    try {
                      const response = await fetch('/api/admin/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: currentAdmin?.email || email || 'admin@nomadstop.com',
                          currentPassword: passwordForm.currentPassword,
                          newPassword: passwordForm.newPassword,
                        }),
                      });

                      if (response.ok) {
                        setPasswordSuccess('Password changed successfully!');
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      } else {
                        const data = await response.json();
                        setPasswordError(data.error || 'Failed to change password');
                      }
                    } catch {
                      setPasswordError('Connection error. Please try again.');
                    } finally {
                      setIsChangingPassword(false);
                    }
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-gray-300 text-sm font-medium mb-2 block">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => {
                          setPasswordForm({...passwordForm, currentPassword: e.target.value});
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                        className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-gray-300 text-sm font-medium mb-2 block">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => {
                          setPasswordForm({...passwordForm, newPassword: e.target.value});
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                        className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        placeholder="Enter new password (min 6 characters)"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium mb-2 block">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => {
                          setPasswordForm({...passwordForm, confirmPassword: e.target.value});
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                        className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    {passwordError && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-shake">
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <XCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{passwordSuccess}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Changing Password...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Key className="w-5 h-5" />
                          <span>Change Password</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Admin Users Management Card */}
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6" style={{color: '#FFD500'}} />
                        Admin Users
                      </CardTitle>
                      <p className="text-gray-400 text-xs sm:text-sm">Manage admin accounts and permissions</p>
                    </div>
                    <Button
                      onClick={() => openAdminDialog()}
                      className="bg-amber-600 hover:bg-amber-700 text-black font-semibold text-xs sm:text-sm px-3 sm:px-4"
                      style={{backgroundColor: '#FFD500'}}
                    >
                      <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add Admin</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isAdminsLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Loading admin users...</p>
                    </div>
                  ) : adminUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-4">No admin users found</p>
                      <p className="text-gray-500 text-xs">Click &quot;Add Admin&quot; to create the first admin account</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminUsers.map((admin) => (
                        <div key={admin.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-medium text-sm sm:text-base truncate">
                                  {admin.name || admin.email}
                                </p>
                                {admin.role === 'super_admin' && (
                                  <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/50 text-xs">
                                    Super Admin
                                  </Badge>
                                )}
                                {!admin.isActive && (
                                  <Badge className="bg-red-600/20 text-red-400 border-red-600/50 text-xs">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs truncate">{admin.email}</p>
                              {admin.username && (
                                <p className="text-gray-500 text-xs">@{admin.username}</p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAdminDialog(admin)}
                                className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500 hover:text-white text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-7 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-xl font-bold text-white">Basic Information</h3>
                </div>
                
                <div>
                  <Label htmlFor="name" className="text-gray-300 text-sm font-medium mb-2 block">
                    Item Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})}
                    className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="e.g., Chicken Doner Kebab"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-2">Enter the name of the dish as customers will see it</p>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-gray-300 text-sm font-medium mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white min-h-[100px] text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                    placeholder="Describe the dish... (e.g., Tender chicken pieces marinated in special spices, served with fresh salad and homemade sauces)"
                    rows={4}
                  />
                  <p className="text-gray-400 text-xs mt-2">A brief description helps customers understand what they&apos;re ordering</p>
                </div>
              </div>

              {/* Category & Settings Section */}
              <div className="space-y-5 pt-6 border-t border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-7 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-xl font-bold text-white">Category & Settings</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-300 text-sm font-medium mb-2 block">
                      Menu Category <span className="text-red-400">*</span>
                    </Label>
                    <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all">
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
                          <span className="text-gray-400 text-xs">Show a &quot;Popular&quot; badge on this item</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                    <Label htmlFor="allergens" className="text-gray-300 text-sm font-medium mb-2 block">
                      Allergen Information
                    </Label>
                    <Input
                      id="allergens"
                      value={productForm.allergens}
                      onChange={(e) => setProductForm({...productForm, allergens: e.target.value})}
                      className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="e.g., Contains gluten, dairy, nuts"
                    />
                    <p className="text-gray-400 text-xs mt-2">Important: List any allergens customers need to know about</p>
                </div>
              </div>
              
              {/* Pricing Section */}
              <div className="space-y-5 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                    <h3 className="text-xl font-bold text-white">Pricing & Sizes</h3>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setProductForm({...productForm, variants: [...productForm.variants, {name: '', price: ''}]})}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-md shadow-amber-500/25 transition-all duration-200 h-10 px-4 text-sm"
                    style={{backgroundColor: '#FFD500'}}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Size/Price Option
                  </Button>
                </div>
                {productForm.variants.length === 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                    <p className="text-amber-300 text-sm flex items-center gap-2">
                      <Package className="w-4 h-4 flex-shrink-0" style={{color: '#FFD500'}} />
                      <span>Add at least one size or price option for this item (e.g., Small £8.99, Large £12.99)</span>
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {productForm.variants.map((variant, idx) => (
                    <div key={idx} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                      <div className="flex gap-3 items-center">
                        <div className="flex-1">
                          <Label className="text-gray-300 text-sm font-medium mb-2 block">Size Name</Label>
                          <Input
                            placeholder="e.g., Small, Medium, Large, Regular, Family Size"
                            value={variant.name}
                            onChange={(e) => {
                              const newVariants = [...productForm.variants];
                              newVariants[idx].name = e.target.value;
                              setProductForm({...productForm, variants: newVariants});
                            }}
                            className="bg-gray-700/50 border-gray-600 text-white h-11 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          />
                        </div>
                        <div className="w-36">
                          <Label className="text-gray-300 text-sm font-medium mb-2 block">Price (£)</Label>
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
                            className="bg-gray-700/50 border-gray-600 text-white h-11 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
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
              <div className="space-y-5 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                    <h3 className="text-xl font-bold text-white">Extra Add-ons (Optional)</h3>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setProductForm({...productForm, addons: [...productForm.addons, {name: '', price: ''}]})}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-md shadow-amber-500/25 transition-all duration-200 h-10 px-4 text-sm"
                    style={{backgroundColor: '#FFD500'}}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Extra
                  </Button>
                </div>
                <p className="text-gray-400 text-sm mb-4">Optional extras customers can add (e.g., Extra cheese, Extra sauce, etc.)</p>
                <div className="space-y-3">
                  {productForm.addons.map((addon, idx) => (
                    <div key={idx} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                      <div className="flex gap-3 items-center">
                        <div className="flex-1">
                          <Label className="text-gray-300 text-sm font-medium mb-2 block">Add-on Name</Label>
                          <Input
                            placeholder="e.g., Extra Cheese, Extra Sauce, Extra Meat"
                            value={addon.name}
                            onChange={(e) => {
                              const newAddons = [...productForm.addons];
                              newAddons[idx].name = e.target.value;
                              setProductForm({...productForm, addons: newAddons});
                            }}
                            className="bg-gray-700/50 border-gray-600 text-white h-11 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          />
                        </div>
                        <div className="w-36">
                          <Label className="text-gray-300 text-sm font-medium mb-2 block">Price (£)</Label>
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
                            className="bg-gray-700/50 border-gray-600 text-white h-11 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
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
                    <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-6 text-center">
                      <p className="text-gray-400 text-sm">No add-ons added yet. Click &quot;Add Extra&quot; above if you want to offer optional extras.</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-8 mt-8 border-t border-gray-700/50 flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProductDialogOpen(false)}
                  className="w-full sm:w-auto bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white font-medium px-6 h-11 text-base transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 h-11 text-base shadow-lg shadow-amber-500/25 transition-all duration-200"
                  style={{backgroundColor: '#FFD500'}}
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
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-lg font-semibold text-white">Code Information</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code" className="text-gray-300 text-sm font-medium mb-2 block">
                      Promo Code <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="code"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                      className="bg-gray-700/50 border-gray-600 text-white font-mono h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="SAVE10"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1.5">Enter the code customers will type at checkout (e.g., SAVE10, WELCOME20)</p>
                  </div>
                  <div>
                    <Label htmlFor="discountType" className="text-gray-300 text-sm font-medium mb-2 block">
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
                  <Label htmlFor="description" className="text-gray-300 text-sm font-medium mb-2 block">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white min-h-[70px] text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                    rows={2}
                    placeholder="e.g., Welcome discount for new customers"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">This description is for your reference only (won&apos;t be shown to customers)</p>
                </div>
              </div>

              {/* Discount Settings */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-lg font-semibold text-white">Discount Settings</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountValue" className="text-gray-300 text-sm font-medium mb-2 block">
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
                      className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
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
                      <Label htmlFor="maxDiscount" className="text-gray-300 text-sm font-medium mb-2 block">
                        Maximum Discount (£)
                        <span className="text-gray-400 text-xs font-normal ml-2">Optional</span>
                      </Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        step="0.01"
                        value={promoForm.maxDiscount}
                        onChange={(e) => setPromoForm({...promoForm, maxDiscount: e.target.value})}
                        className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        placeholder="No limit"
                      />
                      <p className="text-gray-500 text-xs mt-1.5">Limit the maximum discount amount (e.g., cap at £20 even if 25% would be more)</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="minOrderAmount" className="text-gray-300 text-sm font-medium mb-2 block">
                    Minimum Order Amount (£)
                    <span className="text-gray-400 text-xs font-normal ml-2">Optional</span>
                  </Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    step="0.01"
                    value={promoForm.minOrderAmount}
                    onChange={(e) => setPromoForm({...promoForm, minOrderAmount: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="No minimum"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">Require a minimum order value to use this code (e.g., must order at least £15)</p>
                </div>
              </div>

              {/* Usage & Validity */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 rounded-full" style={{backgroundColor: '#FFD500'}}></div>
                  <h3 className="text-lg font-semibold text-white">Usage & Validity</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usageLimit" className="text-gray-300 text-sm font-medium mb-2 block">
                      Usage Limit
                      <span className="text-gray-400 text-xs font-normal ml-2">Optional</span>
                    </Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={promoForm.usageLimit}
                      onChange={(e) => setPromoForm({...promoForm, usageLimit: e.target.value})}
                      className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
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
                    <Label htmlFor="validFrom" className="text-gray-300 text-sm font-medium mb-2 block">
                      Start Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={promoForm.validFrom}
                      onChange={(e) => setPromoForm({...promoForm, validFrom: e.target.value})}
                      className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1.5">When customers can start using this code</p>
                  </div>
                  <div>
                    <Label htmlFor="validUntil" className="text-gray-300 text-sm font-medium mb-2 block">
                      End Date
                      <span className="text-gray-400 text-xs font-normal ml-2">Optional</span>
                    </Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={promoForm.validUntil}
                      onChange={(e) => setPromoForm({...promoForm, validUntil: e.target.value})}
                      className="bg-gray-700/50 border-gray-600 text-white h-11 text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                    <p className="text-gray-500 text-xs mt-1.5">When this code expires (leave empty for no expiration)</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-8 mt-8 border-t border-gray-700/50 flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPromoDialogOpen(false)}
                  className="w-full sm:w-auto bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white font-medium px-6 h-11 text-base transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 h-11 text-base shadow-lg shadow-amber-500/25 transition-all duration-200"
                  style={{backgroundColor: '#FFD500'}}
                >
                  {editingPromo ? 'Save Changes' : 'Create Promo Code'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Admin User Form Dialog */}
        <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-gray-700">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <UserPlus className="w-6 h-6" style={{color: '#FFD500'}} />
                {editingAdmin ? 'Edit Admin User' : 'Add New Admin User'}
              </DialogTitle>
              <p className="text-gray-400 text-sm mt-2">
                {editingAdmin ? 'Update admin user details' : 'Create a new admin account with access to the dashboard'}
              </p>
            </DialogHeader>
            <form onSubmit={handleAdminSubmit} className="space-y-6 mt-6">
              {adminFormError && (
                <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-400 text-sm">
                  {adminFormError}
                </div>
              )}
              {adminFormSuccess && (
                <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-3 text-green-400 text-sm">
                  {adminFormSuccess}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admin-email" className="text-white text-sm font-medium mb-2 block">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => {
                      setAdminForm({...adminForm, email: e.target.value});
                      setAdminFormError('');
                    }}
                    className="bg-gray-700/50 border-gray-600 text-white h-11"
                    placeholder="admin@nomadstop.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="admin-username" className="text-white text-sm font-medium mb-2 block">
                    Username (Optional)
                  </Label>
                  <Input
                    id="admin-username"
                    type="text"
                    value={adminForm.username}
                    onChange={(e) => {
                      setAdminForm({...adminForm, username: e.target.value});
                      setAdminFormError('');
                    }}
                    className="bg-gray-700/50 border-gray-600 text-white h-11"
                    placeholder="admin_username"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="admin-name" className="text-white text-sm font-medium mb-2 block">
                  Full Name (Optional)
                </Label>
                <Input
                  id="admin-name"
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => {
                    setAdminForm({...adminForm, name: e.target.value});
                    setAdminFormError('');
                  }}
                  className="bg-gray-700/50 border-gray-600 text-white h-11"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admin-password" className="text-white text-sm font-medium mb-2 block">
                    {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password'} <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => {
                      setAdminForm({...adminForm, password: e.target.value});
                      setAdminFormError('');
                    }}
                    className="bg-gray-700/50 border-gray-600 text-white h-11"
                    placeholder={editingAdmin ? "Enter new password" : "Enter password"}
                    required={!editingAdmin}
                    minLength={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="admin-confirm-password" className="text-white text-sm font-medium mb-2 block">
                    Confirm Password {!editingAdmin && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="admin-confirm-password"
                    type="password"
                    value={adminForm.confirmPassword}
                    onChange={(e) => {
                      setAdminForm({...adminForm, confirmPassword: e.target.value});
                      setAdminFormError('');
                    }}
                    className="bg-gray-700/50 border-gray-600 text-white h-11"
                    placeholder="Confirm password"
                    required={!editingAdmin}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="admin-role" className="text-white text-sm font-medium mb-2 block">
                  Role <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={adminForm.role}
                  onValueChange={(value: 'super_admin' | 'admin' | 'staff') => {
                    setAdminForm({...adminForm, role: value});
                    setAdminFormError('');
                  }}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="super_admin" className="text-white hover:bg-gray-700">
                      Super Admin (Full Access)
                    </SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-700">
                      Admin (Standard Access)
                    </SelectItem>
                    <SelectItem value="staff" className="text-white hover:bg-gray-700">
                      Staff (Limited Access)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  onClick={() => {
                    setAdminDialogOpen(false);
                    resetAdminForm();
                  }}
                  className="w-full sm:w-auto bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white font-medium px-6 h-11 text-base transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 h-11 text-base shadow-lg shadow-amber-500/25 transition-all duration-200 disabled:opacity-50"
                  style={{backgroundColor: '#FFD500'}}
                >
                  {isCreatingAdmin ? 'Saving...' : editingAdmin ? 'Save Changes' : 'Create Admin User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
