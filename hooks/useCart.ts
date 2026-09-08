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

  const handleAddToCart = ({ product, price, notes }: AddToCartPayload) => {
    setStockMessage("");
    setCart((prev) => {
      const finalPrice = price ?? product.price;

      if (product.stock <= 0) {
        setStockMessage(`Maaf, stok "${product.menuName}" sedang habis.`);
        return prev;
      }

      let updatedItems: CartItemInterface[];

      // Check if product has custom price enabled
      if (product.isCustomPrice) {
        // For custom price items, always create a new entry even if the same product exists
        // This allows adding the same product with different prices as separate items
        updatedItems = [
          ...prev.cartItems,
          {
            id: product.menuId,
            imageUrl: product.menuImageUrl,
            name: product.menuName,
            price: finalPrice,
            isCustomPrice: product.isCustomPrice,
            quantity: 1,
            subtotal: finalPrice,
            notes: notes ?? "",
            stock: product.stock,
          },
        ];
      } else {
        // For regular items, merge with existing if found
        const existing = prev.cartItems.find(
          (item) => item.id === product.menuId && !item.isCustomPrice,
        );

        if (existing) {
          if (existing.quantity >= existing.stock) {
            setStockMessage(
              `Stok "${product.menuName}" tidak mencukupi. Maksimal ${existing.stock} item.`,
            );
            return prev;
          }

          updatedItems = prev.cartItems.map((item) =>
            item.id === product.menuId && !item.isCustomPrice
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          );
        } else {
          updatedItems = [
            ...prev.cartItems,
            {
              id: product.menuId,
              imageUrl: product.menuImageUrl,
              name: product.menuName,
              price: finalPrice,
              isCustomPrice: product.isCustomPrice,
              quantity: 1,
              subtotal: finalPrice,
              notes: notes ?? "",
              stock: product.stock,
            },
          ];
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

  const handleRemove = (id: number | null) => {
    setCart((prev) => {
      if (id == null) return prev;

      const updatedItems =
        id === 0 ? [] : prev.cartItems.filter((item) => item.id !== id);

      const { updatedCartItems, total } = calculateTotals(updatedItems);

      return {
        ...prev,
        cartItems: updatedCartItems,
        total,
      };
    });
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity <= 0) {
      return handleRemove(id);
    }

    setStockMessage("");

    setCart((prev) => {
      const updatedItems = prev.cartItems.map((item) => {
        if (item.id !== id) return item;

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

  const handleNotesChange = (id: number, notes: string) => {
    setCart((prev) => {
      const updatedItems = prev.cartItems.map((item) =>
        item.id === id
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

  const handlePriceChange = (id: number, price: number) => {
    setCart((prev) => {
      const updatedItems = prev.cartItems.map((item) =>
        item.id === id
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
