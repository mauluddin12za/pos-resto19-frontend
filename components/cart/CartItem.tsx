import { CartItemPropsInterface } from "@/types";
import { priceFormat } from "@/utils/priceFormat";
import Image from "next/image";
import React, { useState } from "react";
import { Minus, Plus, Trash2, Pencil, Check } from "lucide-react";

export default function CartItem({
  item,
  stockMessage,
  onQuantityChange,
  onPriceChange,
  onNotesChange,
  onRemove,
}: Readonly<CartItemPropsInterface>) {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [draftPrice, setDraftPrice] = useState(item.price.toString());

  const handleIncrement = (uid: string | number, qty: number) => {
    onQuantityChange(uid, qty + 1);
  };

  const handleDecrement = (uid: string | number, qty: number) => {
    if (qty > 1) {
      onQuantityChange(uid, qty - 1);
    } else {
      onRemove(uid);
    }
  };

  const commitPrice = () => {
    const parsed = Number(draftPrice);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onPriceChange(item.uid, parsed);
    } else {
      setDraftPrice(item.price.toString());
    }
    setIsEditingPrice(false);
  };

  const startEditing = () => {
    setDraftPrice(item.price.toString());
    setIsEditingPrice(true);
  };

  const renderPrice = () => {
    if (!item.isCustomPrice) {
      return (
        <div className="mt-0.5 flex items-center gap-1">
          <span className="text-xs font-bold text-foreground">Rp</span>
          <p className="text-xs font-bold text-foreground">
            {priceFormat(item.price)}
          </p>
        </div>
      );
    }

    if (isEditingPrice) {
      return (
        <div className="mt-0.5 flex items-center gap-1">
          <span className="text-xs font-bold text-foreground">Rp</span>
          <input
            type="number"
            autoFocus
            min={0}
            value={draftPrice}
            onChange={(e) => setDraftPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitPrice()}
            onBlur={commitPrice}
            className="w-20 rounded-md border border-primary bg-card px-1.5 py-0.5 text-xs font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={commitPrice}
            className="flex h-5 w-5 items-center justify-center rounded-full text-primary hover:bg-primary/10"
          >
            <Check className="h-3 w-3" />
          </button>
        </div>
      );
    }

    return (
      <div className="mt-0.5 flex items-center gap-1">
        <span className="text-xs font-bold text-foreground">Rp</span>
        <button
          onClick={startEditing}
          className="flex items-center gap-1 text-xs font-bold text-foreground hover:text-primary"
        >
          {priceFormat(item.price)}
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-start gap-3">
        {/* IMAGE */}
        {item.imageUrl && (
          <Image
            className="h-12 w-12 rounded-lg object-cover"
            src={item.imageUrl ?? "no-image.png"}
            width={500}
            height={500}
            priority
            unoptimized
            alt={item.name}
          />
        )}

        {/* INFO */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {item.name}
          </p>

          {/* PRICE / CUSTOM PRICE EDITOR */}
          {renderPrice()}

          {stockMessage && (
            <p className="text-[10px] text-red-500 mt-1">{stockMessage}</p>
          )}
        </div>

        {/* QUANTITY */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDecrement(item.uid, item.quantity)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Minus className="h-3 w-3" />
          </button>

          <span className="min-w-5 text-center text-xs font-semibold tabular-nums">
            {item.quantity}
          </span>

          <button
            onClick={() => handleIncrement(item.uid, item.quantity)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* NOTES + REMOVE */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={item.notes || ""}
          onChange={(e) => onNotesChange(item.uid, e.target.value)}
          placeholder="Tulis catatan..."
          className="flex-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <button
          onClick={() => onRemove(item.uid)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
