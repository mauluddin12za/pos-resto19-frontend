// Menu and Category Interfaces
export interface CategoryInterface {
  categoryId: number;
  categoryName: string;
}

export interface ExpenseInterface {
  expenseId: string;
  expenseName: string;
  category: string;
  paymentMethod: string;
  amount: string;
  expenseDate: string;
  description: string;
}
export interface MenuInterface {
  menuId: number;
  menuName: string;
  menuDescription: string;
  menuImageUrl: string;
  price: number;
  isCustomPrice: boolean;
  stock: number;
  categoryId: number | null;
  category: CategoryInterface;
}
export interface MenuFormInterface {
  menuId?: string;
  menuName: string;
  menuDescription: string;
  price: string;
  isCustomPrice: boolean;
  stock: string;
  categoryId: string | null;
  menuImage?: File | null;
  imagePreview?: string;
}
export interface ExpenseFormInterface {
  expenseId?: string;
  expenseName: string;
  category: string;
  paymentMethod: string;
  amount: string;
  expenseDate: string;
  description: string;
}
export interface CategoryFormInterface {
  categoryId?: string;
  categoryName: string;
}
export interface UserFormInterface {
  userId?: string;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface CategoryFilterInterface {
  categoryId?: number | null;
  categoryName?: string;
  searchQuery?: string;
  sort?: string;
  page: number;
  pageSize: number;
  allFromPage?: boolean;
}
export interface MenuFilterInterface {
  categoryId?: number | null | { in?: number[] };
  menuName?: string;
  searchQuery?: string;
  price?: {
    gte?: number | null;
    lte?: number | null;
  };
  sort?: string;
  page: number;
  pageSize: number;
  allFromPage?: boolean;
}
export interface ExpenseFilterInterface {
  expenseName?: string;
  category?: string;
  paymentMethod?: string;
  searchQuery?: string;
  amount?: {
    gte?: number | null;
    lte?: number | null;
  };
  sort?: string;
  page: number;
  pageSize: number;
  allFromPage?: boolean;
}

export interface OrderFilterInterface {
  page: number;
  pageSize: number;
  allFromPage?: boolean;

  searchQuery?: string;

  userId?: number;
  username?: string;

  paymentMethod?: string;
  paymentStatus?: string;

  total?: {
    gte?: number | null;
    lte?: number | null;
  };

  fromDate?: string;
  toDate?: string;

  sort?: string;
}

// Cart Interfaces
export interface CartInterface {
  total: string;
  cartItems: CartItemInterface[];
}

export interface CartItemInterface {
  // menu id
  id: number;
  // unique cart entry id so multiple same-menu items are distinct
  uid: string;
  imageUrl: string;
  name: string;
  price: number;
  isCustomPrice: boolean;
  quantity: number;
  subtotal: number;
  notes: string;
  stock: number;
}

export interface AddToCartPayload {
  product: MenuInterface;
  price?: number;
  notes?: string;
  // when true, always create a new cart row instead of merging
  forceNew?: boolean;
}
export interface CartItemPropsInterface {
  item: CartItemInterface;
  stockMessage: string;
  onQuantityChange: (uidOrId: string | number, quantity: number) => void;
  onPriceChange: (uidOrId: string | number, price: number) => void;
  onNotesChange: (uidOrId: string | number, notes: string) => void;
  onRemove: (uidOrId: string | number) => void;
}

export interface ShowCartModalButtonProps {
  setCartModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  cartItemLength: number | null;
}

// User Interface (for login or user info)
export interface UserInterface {
  userId: number;
  name: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
}

// Order Interface (related to orders transactions)
export interface OrderInterface {
  orderId: number;
  createdAt: string;
  orderDetails: OrderDetailInterface[];
  total: number;
  subtotal: number;
  paymentMethod: string;
  paymentStatus: string;
}

export interface OrderDetailInterface {
  orderDetailId: number;
  quantity: number;
  menu: MenuInterface;
  price: number;
  subtotal: number;
  notes: string;
}

// Pagination Interface
export interface PaginationPropsInterface {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  allFromPage?: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export interface TopItem {
  item: MenuInterface;
  sold: number;
  revenue: number;
}
