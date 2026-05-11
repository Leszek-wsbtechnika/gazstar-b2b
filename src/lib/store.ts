import { create } from 'zustand';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (newItem) => set((state) => {
    // Sprawdzamy, czy ten gaz już jest w koszyku
    const existingItem = state.items.find((item) => item.id === newItem.id);
    if (existingItem) {
      // Jeśli jest, po prostu zwiększamy ilość
      return {
        items: state.items.map((item) => 
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        )
      };
    }
    // Jeśli nie ma, dodajemy jako nową pozycję
    return { items: [...state.items, newItem] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
  clearCart: () => set({ items: [] }),
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));