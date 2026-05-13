import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definicja tego, co zawiera jeden produkt w koszyku
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

// Definicja wszystkich funkcji koszyka
interface CartStore {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void; // TO BYŁ BRAKUJĄCY ELEMENT
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      
      // Dodawanie produktu (jeśli już jest, zwiększamy ilość)
      addItem: (product) => set((state) => {
        const existingItem = state.items.find((i) => i.id === product.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === product.id 
                ? { ...i, quantity: i.quantity + product.quantity } 
                : i
            ),
          };
        }
        return { items: [...state.items, product] };
      }),

      // Usuwanie całego produktu
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      // AKTUALIZACJA ILOŚCI (To naprawia Twój błąd!)
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
        ),
      })),

      // Czyszczenie całego koszyka po zamówieniu
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', // Zapisuje koszyk w pamięci przeglądarki
    }
  )
);