"use client";

import Image from "next/image";
import { priceFormat } from "@/utils/priceFormat";
import { CartInterface, AddToCartPayload, MenuInterface } from "@/types";

export interface ProductCardPropsInterface {
  product: MenuInterface;
  onAddToCart: (payload: AddToCartPayload) => void;
  cart: CartInterface;
  onQuantityChange: (id: number, quantity: number) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  cart,
  onQuantityChange,
}: Readonly<ProductCardPropsInterface>) {
  const cartItem = cart.cartItems.find((item) => item.id === product.menuId);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    if (!cartItem) {
      onAddToCart({
        product,
      });
    } else {
      onQuantityChange(product.menuId, quantity + 1);
    }
  };

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-3 shadow-(--shadow-card) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-elevated) relative">
      {/* OUT OF STOCK OVERLAY */}
      {product.stock === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/70 text-white text-sm font-semibold">
          Out of Stock
        </div>
      )}

      {/* IMAGE */}
      <div className="aspect-square overflow-hidden rounded-xl bg-secondary">
        <Image
          src={product.menuImageUrl ?? "no-image.png"}
          alt={product.menuName}
          width={500}
          height={500}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      </div>

      {/* CONTENT */}
      <div className="mt-3 flex-1">
        <h3 className="text-sm font-semibold text-foreground">
          {product.menuName}
        </h3>
        {product.price > 0 && (
          <p className="mt-0.5 text-base font-bold text-foreground">
            {priceFormat(product.price)}
          </p>
        )}
      </div>

      {/* ACTION */}
      <div className="mt-3 flex items-center justify-center gap-3 w-full">
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="w-full h-8 rounded-full border-2 border-primary text-primary text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          type="button"
        >
          Order{quantity > 0 ? ` · ${quantity}` : ""}
        </button>
      </div>
    </div>
  );
}
