"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import React from "react";
import { priceFormat } from "@/utils/priceFormat";
import LoadingButton from "../ui/LoadingButton";
import { CartInterface, CartItemInterface } from "@/types";
import CartItem from "./CartItem";
import { validateCart } from "@/utils/cartValidation";

export interface CartPropsInterface {
  orderId: number | null;
  cartItems: CartItemInterface[];
  stockMessage: string;
  onRemove: (uidOrId: string | number | null) => void;
  onQuantityChange: (uidOrId: string | number, quantity: number) => void;
  onPriceChange: (uidOrId: string | number, price: number) => void;
  onNotesChange: (uidOrId: string | number, notes: string) => void;
  onOrder: (onClose: () => void) => void;
  isSubmitting: boolean;
  closeCart: () => void;
}

const Cart: React.FC<CartPropsInterface> = ({
  orderId,
  cartItems,
  stockMessage,
  onRemove,
  onQuantityChange,
  onPriceChange,
  onNotesChange,
  onOrder,
  isSubmitting,
  closeCart,
}) => {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const orderNumber = cartItems.length === 0 ? "" : (orderId ?? 0) + 1;

  const handleClearAll = () => {
    onRemove(0);
    closeCart();
  };
  const cart: CartInterface = {
    total: "0",
    cartItems: cartItems,
  };
  const validation = validateCart(cart);
  return (
    <aside className="flex w-full h-full flex-col border border-border bg-card">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-foreground" />
          <h2 className="text-lg font-bold text-foreground">
            Pesanan #{orderNumber}
          </h2>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground cu[...]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {cartItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
              <ShoppingCart className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Belum ada pesanan
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pilih menu untuk memulai
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {cartItems.map((item: CartItemInterface) => (
              <li key={item.uid}>
                <CartItem
                  item={item}
                  stockMessage={stockMessage}
                  onPriceChange={onPriceChange}
                  onQuantityChange={onQuantityChange}
                  onNotesChange={onNotesChange}
                  onRemove={onRemove}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FOOTER */}
      {cartItems.length > 0 && (
        <footer className="border-t border-border px-5 py-4">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {priceFormat(total)}
            </span>
          </div>

          <button
            onClick={() => onOrder(closeCart)}
            disabled={isSubmitting || !validation.valid}
            className="mb-2 w-full rounded-xl bg-success py-3 text-sm font-semibold text-success-foreground transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingButton /> Loading...
              </div>
            ) : (
              "Buat Pesanan Baru"
            )}
          </button>

          <button
            onClick={handleClearAll}
            className="w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold hover:bg-secondary cursor-pointer disabled:cursor-not-allowed"
          >
            Batalkan Pesanan
          </button>
        </footer>
      )}
    </aside>
  );
};

export default Cart;
