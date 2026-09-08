"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { OrderInterface, MenuInterface } from "@/types";
import { priceFormat } from "@/utils/priceFormat";
import useOrderActions from "@/hooks/useOrderActions";
import { useMenus } from "@/api/menuServices";
import Image from "next/image";
import { FormInput } from "../ui/FormInput";
import { Minus, Plus, Trash2, ShoppingCart, CupSoda } from "lucide-react";
import PaymentMethod from "../payment/PaymentMethod";
import { Button } from "../ui/Button";
import MenuSearchSelect from "./MenuSearchSelect";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: OrderInterface;
  mutate: () => void;
  paymentOptions: string[];
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

interface EditLine {
  id: number;
  menuId: number;
  name: string;
  imageUrl: string;
  price: number;
  isCustomPrice: boolean;
  quantity: number;
  notes: string;
  stock: number;
}

const EditOrderModal = ({
  isOpen,
  onClose,
  selectedOrder,
  mutate,
  paymentOptions,
  paymentMethod,
  setPaymentMethod,
}: EditOrderModalProps) => {
  const { menus } = useMenus({ page: 1, pageSize: 100 });
  const { handleUpdateOrder } = useOrderActions();

  const [lines, setLines] = useState<EditLine[]>([]);

  // Load order
  useEffect(() => {
    if (!isOpen || !selectedOrder) return;

    setLines(
      selectedOrder.orderDetails.map((item, index) => ({
        id: Date.now() + index,
        menuId: item.menu.menuId,
        name: item.menu.menuName,
        imageUrl: item.menu.menuImageUrl,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || "",
        isCustomPrice: item.menu.isCustomPrice,
        stock: item.menu.stock,
      })),
    );

    setPaymentMethod(selectedOrder.paymentMethod ?? "");
  }, [isOpen, selectedOrder]);

  // Derived total
  const total = useMemo(() => {
    return lines.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [lines]);

  // Add line
  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: Date.now(),
        menuId: 0,
        name: "",
        imageUrl: "",
        price: 0,
        isCustomPrice: false,
        quantity: 1,
        notes: "",
        stock: 0,
      },
    ]);
  };

  // Remove line
  const removeLine = (id: number) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Change menu
  const changeMenu = (id: number, menuId: number) => {
    const menu = menus?.data?.find((m: MenuInterface) => m.menuId === menuId);
    if (!menu) return;

    setLines((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              menuId,
              name: menu.menuName,
              imageUrl: menu.menuImageUrl,
              price: menu.price,
              isCustomPrice: menu.isCustomPrice,
              stock: menu.stock,
              quantity: 1,
            }
          : line,
      ),
    );
  };

  const changePrice = (id: number, price: number) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, price } : l)));
  };

  const changeQty = (id: number, qty: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              quantity: Math.max(1, Math.min(qty, line.stock || 999)),
            }
          : line,
      ),
    );
  };

  const changeNotes = (id: number, notes: string) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, notes } : line)));
  };

  // Save
  const handleSave = () => {
    if (!selectedOrder) return;

    const cartItems = lines.map((line) => ({
      uid: String(line.id),
      id: line.menuId,
      name: line.name,
      imageUrl: line.imageUrl,
      price: line.price,
      isCustomPrice: line.isCustomPrice,
      quantity: line.quantity,
      subtotal: line.price * line.quantity,
      notes: line.notes,
      stock: line.stock,
    }));

    handleUpdateOrder(
      selectedOrder.orderId,
      cartItems,
      paymentMethod,
      mutate,
      onClose,
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Pesanan #${selectedOrder?.orderId}`}
      description="Ubah item, jumlah, catatan, dan metode pembayaran."
      icon={<ShoppingCart className="h-5 w-5" />}
      size="lg"
      footer={
        <>
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>

          <Button variant="primary" onClick={handleSave}>
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between">
          <p className="text-sm font-semibold">Daftar Item</p>
          <button
            onClick={addLine}
            className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs flex gap-2 items-center"
          >
            <Plus className="w-4 h-4" /> Tambah Item
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {lines.map((line) => (
            <div
              key={line.id}
              className="p-3 border rounded-2xl bg-secondary/30"
            >
              <div className="grid sm:grid-cols-[56px_1fr_auto] gap-3 items-center">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    width={56}
                    height={56}
                    className="rounded-xl"
                    alt={line.name || line.imageUrl}
                    unoptimized
                  />
                ) : (
                  <div className="h-14 w-14 bg-blue-100 flex items-center justify-center rounded-xl">
                    <CupSoda className="text-gray-400" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MenuSearchSelect
                      value={line.menuId}
                      menus={menus?.data || []}
                      onChange={(menuId) => changeMenu(line.id, menuId)}
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">Rp</span>

                      {line?.isCustomPrice ? (
                        <div className="w-24 shrink-0">
                          <FormInput
                            type="number"
                            min={0}
                            value={line.price}
                            onChange={(e) => changePrice(line.id, Number(e.target.value))}
                            placeholder="0"
                            className="w-full border-primary focus:ring-primary/20 rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="w-24 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground text-right">
                          {priceFormat(line.price)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FormInput
                      placeholder="Catatan"
                      value={line.notes}
                      onChange={(e) => changeNotes(line.id, e.target.value)}
                      className="flex-1 rounded-md"
                    />

                    <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
                      <button
                        onClick={() => changeQty(line.id, line.quantity - 1)}
                        className="hover:bg-gray-200 rounded p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                      <button
                        onClick={() => changeQty(line.id, line.quantity + 1)}
                        className="hover:bg-gray-200 rounded p-1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeLine(line.id)}
                      className="text-red-600 hover:bg-red-50 rounded-lg p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="border-t pt-4">
          <PaymentMethod
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentOptions={paymentOptions}
          />
        </div>

        {/* Total */}
        <div className="border-t pt-4 flex justify-between items-center">
          <p className="text-sm font-semibold">Total:</p>
          <p className="text-lg font-bold text-primary">{priceFormat(total)}</p>
        </div>
      </div>
    </Modal>
  );
};

export default EditOrderModal;
