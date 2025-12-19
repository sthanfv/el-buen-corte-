'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { OrderItem } from '@/types/products'; // Will move type here

interface CartContextType {
    order: OrderItem[];
    addToCart: (item: OrderItem) => void;
    removeFromCart: (index: number) => void;
    updateCartItem: (orderId: string, updates: Partial<OrderItem>) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [order, setOrder] = useState<OrderItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Hydrate from localStorage if needed (Optional for now)

    const addToCart = (item: OrderItem) => {
        setOrder((prev) => [...prev, item]);
        setIsCartOpen(true);
    };

    const removeFromCart = (index: number) => {
        setOrder((prev) => prev.filter((_, i) => i !== index));
    };

    const updateCartItem = (orderId: string, updates: Partial<OrderItem>) => {
        setOrder((prev) => prev.map((item) =>
            item.orderId === orderId ? { ...item, ...updates } : item
        ));
    };

    const clearCart = () => {
        setOrder([]);
    };

    return (
        <CartContext.Provider
            value={{ order, addToCart, removeFromCart, updateCartItem, clearCart, isCartOpen, setIsCartOpen }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
