'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import type { Product } from '@/lib/catalog';

export type CartItem = { product: Product; size: string; color: string; quantity: number };

const productSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  gender: z.enum(['women', 'men', 'boys', 'girls', 'unisex']),
  category: z.string(),
  price: z.number(),
  salePrice: z.number().optional(),
  description: z.string(),
  images: z.array(z.string()),
  imagePositions: z.array(z.string()).optional(),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  featured: z.boolean().optional(),
  new: z.boolean().optional(),
  sale: z.boolean().optional(),
  available: z.boolean().optional(),
  stock: z.number(),
});
const cartSchema = z.array(z.object({
  product: productSchema,
  size: z.string(),
  color: z.string(),
  quantity: z.number().int().positive(),
}));
const wishlistSchema = z.array(z.string());

type Store = {
  items: CartItem[];
  count: number;
  wishlist: string[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  add: (product: Product, size: string, color: string, quantity?: number) => void;
  remove: (index: number) => void;
  update: (index: number, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
};

const CartContext = createContext<Store | undefined>(undefined);

function readStorage<T>(key: string, schema: z.ZodType<T>): T | undefined {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return undefined;
    const result = schema.safeParse(JSON.parse(stored));
    if (!result.success) throw result.error;
    return result.data;
  } catch (error) {
    console.error(`Unable to restore DIOC ${key} from local storage.`, error);
    return undefined;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedItems = readStorage('dioc-cart', cartSchema);
    const savedWishlist = readStorage('dioc-wishlist', wishlistSchema);
    if (savedItems) setItems(savedItems);
    if (savedWishlist) setWishlist(savedWishlist);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('dioc-cart', JSON.stringify(items));
      localStorage.setItem('dioc-wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Unable to save DIOC shopping preferences to local storage.', error);
    }
  }, [hydrated, items, wishlist]);

  const add = useCallback((product: Product, size: string, color: string, quantity = 1) => {
    setItems((current) => {
      const at = current.findIndex((item) => item.product.id === product.id && item.size === size && item.color === color);
      return at > -1
        ? current.map((item, index) => index === at ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { product, size, color, quantity }];
    });
    setDrawerOpen(true);
  }, []);

  const remove = useCallback((index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  const update = useCallback((index: number, quantity: number) => {
    setItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, quantity: Math.max(1, quantity) } : item
    )));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  }, []);

  const value = useMemo(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    wishlist,
    drawerOpen,
    setDrawerOpen,
    add,
    remove,
    update,
    toggleWishlist,
  }), [items, wishlist, drawerOpen, add, remove, update, toggleWishlist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw Error('useCart must be used inside StoreProvider');
  return value;
};
