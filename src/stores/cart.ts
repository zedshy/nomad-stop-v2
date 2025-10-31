import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  variant?: string;
  price: number; // in pence
  quantity: number;
  addons?: string[];
  allergens?: string;
}

interface CartStore {
  items: CartItem[];
  fulfilment: 'pickup' | 'delivery';
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  address: {
    line1: string;
    city: string;
    postcode: string;
  };
  slot: {
    start: string;
    end: string;
  } | null;
  tipPercent: number;
  promoCode: {
    code: string;
    discount: number;
  } | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setFulfilment: (fulfilment: 'pickup' | 'delivery') => void;
  setCustomer: (customer: Partial<CartStore['customer']>) => void;
  setAddress: (address: Partial<CartStore['address']>) => void;
  setSlot: (slot: CartStore['slot']) => void;
  setTipPercent: (tipPercent: number) => void;
  setPromoCode: (promoCode: CartStore['promoCode']) => void;
  
  // Computed values
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTip: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      fulfilment: 'pickup',
      customer: {
        name: '',
        phone: '',
        email: '',
      },
      address: {
        line1: '',
        city: '',
        postcode: '',
      },
      slot: null,
      tipPercent: 0,
      promoCode: null,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.id === item.id && 
          i.variant === item.variant && 
          JSON.stringify(i.addons) === JSON.stringify(item.addons)
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i === existingItem
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      clear: () => {
        set({
          items: [],
          customer: { name: '', phone: '', email: '' },
          address: { line1: '', city: '', postcode: '' },
          slot: null,
          tipPercent: 0,
          promoCode: null,
        });
      },

      setFulfilment: (fulfilment) => {
        set({ fulfilment });
      },

      setCustomer: (customer) => {
        set({
          customer: { ...get().customer, ...customer },
        });
      },

      setAddress: (address) => {
        set({
          address: { ...get().address, ...address },
        });
      },

      setSlot: (slot) => {
        set({ slot });
      },

      setTipPercent: (tipPercent) => {
        set({ tipPercent });
      },

      setPromoCode: (promoCode) => {
        set({ promoCode });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getDeliveryFee: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        if (state.fulfilment === 'pickup') return 0;
        
        // Free delivery over £25
        if (subtotal >= 2500) return 0;
        
        // £2.99 delivery fee
        return 299;
      },

      getTip: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        return Math.round(subtotal * (state.tipPercent / 100));
      },

      getDiscount: () => {
        const state = get();
        return state.promoCode?.discount || 0;
      },

      getTotal: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const deliveryFee = state.getDeliveryFee();
        const tip = state.getTip();
        const discount = state.getDiscount();
        return subtotal + deliveryFee + tip - discount;
      },
    }),
    {
      name: 'nomad-cart',
      partialize: (state) => ({
        items: state.items,
        fulfilment: state.fulfilment,
        customer: state.customer,
        address: state.address,
        slot: state.slot,
        tipPercent: state.tipPercent,
        promoCode: state.promoCode,
      }),
    }
  )
);
