/**
 * Global cart state for tickets. Count is shown in the nav (e.g. next to "My Tickets").
 * Persists count to localStorage so it survives refresh.
 *
 * @since cart-context
 */
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SavedTicketDoc } from '../../../tickets-srv/src/models/Ticket';
import { LS_KEYS, LocalStore } from '../lib/localstorage/LocalStore';

type CartContextType = {
  cartCount: number;
  cartItems: SavedTicketDoc[];
  addToCart: (ticket: SavedTicketDoc) => void;
  removeFromCart: (ticketId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function readStoredItems(): SavedTicketDoc[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = LocalStore.getItem(LS_KEYS.CART_ITEMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeItems(items: SavedTicketDoc[]) {
  try {
    LocalStore.setItem(LS_KEYS.CART_ITEMS, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<SavedTicketDoc[]>(() => []);

  useEffect(() => {
    setCartItems(readStoredItems());
  }, []);

  /**
   * Adds a ticket to the cart
   *
   * @param {SavedTicketDoc} ticket  The ticket to add to the cart
   */
  const addToCart = useCallback((ticket: SavedTicketDoc) => {
    setCartItems((prev) => {
      // If the ticket is already in the cart, don't add it again
      if (prev.some((item) => item.id === ticket.id)) return prev;
      const next = [...prev, ticket];
      writeItems(next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((ticketId: string) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.id !== ticketId);
      writeItems(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    writeItems([]);
  }, []);

  const cartCount = cartItems.length;

  const value = useMemo(
    () => ({ cartCount, cartItems, addToCart, removeFromCart, clearCart }),
    [cartCount, cartItems, addToCart, removeFromCart, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
