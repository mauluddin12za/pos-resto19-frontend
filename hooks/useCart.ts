import { AddToCartPayload, CartInterface, CartItemInterface } from "@/types";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cart";

const safeParseCart = (value: string | null): CartInterface => {
  try {
    if (!value) {
      return { total: "0", cartItems: [] };
    }

    const parsed = JSON.parse(value);

    return {
      total: parsed?.total ?? "0",
      cartItems: Array.isArray(parsed?.cartItems) ? parsed.cartItems : [],
    };
  } catch (err) {
    console.error("Invalid cart in localStorage", err);
    return { total: "0", cartItems: [] };
  }
};

const clampQuantity = (qty: number, stock: number) => {
  return Math.max(1, Math.min(qty, stock));
};

const calculateTotals = (cartItems: CartItemInterface[]) => {
  const updatedCartItems = cartItems.map((item) => {
    const subtotal = Number((item.price * item.quantity).toFixed(2));

    return {
      ...item,
      subtotal,
    };
  });

  const total = updatedCartItems
    .reduce((acc, item) => acc + item.subtotal, 0)
    .toFixed(2);

  return {
    updatedCartItems,
    total,
  };
};

// generate unique id for cart entries
const generateUid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const useCart = () => {
  const [cart, setCart] = useState<CartInterface>({
    total: "0",
    cartItems: [],
  });

  const [stockMessage, setStockMessage] = useState("");
  const [priceMessage, setPriceMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setCart(safeParseCart(stored));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart", err);
    }
  }, [cart]);

  const handleAddToCart = ({ product, price, notes, forceNew }: AddToCartPayload) => {
    setStockMessage("");
    setCart((prev) => {
      const finalPrice = price ?? product.price;

      if (product.stock <= 0) {
        setStockMessage(`Maaf, stok "${product.menuName}" sedang habis.`);
        return prev;
      }

      let updatedItems: CartItemInterface[] = [...prev.cartItems];

      // If product.isCustomPrice OR forceNew is true, always create a new entry
      if (product.isCustomPrice || forceNew) {
        updatedItems.push({
          uid: generateUid(),
          id: product.menuId,
          imageUrl: product.menuImageUrl,
          name: product.menuName,
          price: finalPrice,
          isCustomPrice: product.isCustomPrice,
          quantity: 1,
          subtotal: finalPrice,
          notes: notes ?? "",
          stock: product.stock,
        });
      } else {
        // Try to find first existing non-custom item with same menu id
        const existingIndex = prev.cartItems.findIndex(
          (item) => item.id === product.menuId && !item.isCustomPrice,
        );

        if (existingIndex !== -1) {
          const existing = prev.cartItems[existingIndex];
          if (existing.quantity >= existing.stock) {
            setStockMessage(
              `Stok "${product.menuName}" tidak mencukupi. Maksimal ${existing.stock} item.`,
            );
            return prev;
          }

          updatedItems = prev.cartItems.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        } else {
          updatedItems.push({
            uid: generateUid(),
            id: product.menuId,
            imageUrl: product.menuImageUrl,
            name: product.menuName,
            price: finalPrice,
            isCustomPrice: product.isCustomPrice,
            quantity: 1,
            subtotal: finalPrice,
            notes: notes ?? "",
            stock: product.stock,
          });
        }
      }

      const { updatedCartItems, total } = calculateTotals(updatedItems);

      return {
        ...prev,
        cartItems: updatedCartItems,
        total,
      };
    });
  };

  // uidOrId: support 0 (clear all) or uid for per-row operations
  const handleRemove = (uidOrId: string | number | null) => {
    setCart((prev) => {
      if (uidOrId == null) return prev;

      if (uidOrId === 0) {
        const { updatedCartItems, total } = calculateTotals([]);
        return {
          ...prev,
          cartItems: updatedCartItems,
          total,
        };
      }

      const updatedItems = prev.cartItems.filter((item) => item.uid !== uidOrId);
      const { updatedCartItems, total } = calculateTotals(updatedItems);

      return {
        ...prev,
        cartItems: updatedCartItems,
        total,
      };
    });
  };

  const handleQuantityChange = (uidOrId: string | number, quantity: number) => {
    if (quantity <= 0) {
      return handleRemove(uidOrId);
    }

    setStockMessage("");

    setCart((prev) => {
      const updatedItems = prev.cartItems.map((item) => {
        if (item.uid !== uidOrId) return item;

        if (quantity > item.stock) {
          setStockMessage(
            `Stok "${item.name}" hanya tersedia ${item.stock} item.`,
          );
        }

        return {
          ...item,
          quantity: clampQuantity(quantity, item.stock),
        };
      });

      const { updatedCartItems, total } = calculateTotals(updatedItems);

      return {
        ...prev,
        cartItems: updatedCartItems,
        total,
      };
    });
  };

  const handleNotesChange = (uidOrId: string | number, notes: string) => {
    setCart((prev) => {
      const updatedItems = prev.cartItems.map((item) =>
        item.uid === uidOrId
          ? {
              ...item,
              notes,
            }
          : item,
      );

      const { updatedCartItems, total } = calculateTotals(updatedItems);

      return {
        ...prev,
        cartItems: updatedCartItems,
        total,
      };
    });
  };

  const handlePriceChange = (uidOrId: string | number, price: number) => {
    setCart((prev) => {
      const updatedItems = prev.cartItems.map((item) =>
        item.uid === uidOrId
          ? {
              ...item,
              price,
            }
          : item,
      );

      const { updatedCartItems, total } = calculateTotals(updatedItems);

      return {
        ...prev,
        cartItems: updatedCartItems,
        total,
      };
    });
  };

  return {
    cart,
    setCart,
    handleAddToCart,
    handleRemove,
    handleQuantityChange,
    handleNotesChange,
    handlePriceChange,
    stockMessage,
  };
};

export default useCart;
