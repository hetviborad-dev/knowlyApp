export interface Category {
  id: string;
  label: string;
  emoji: string;
}

// TODO: Replace with data fetched from Supabase `categories` table.
export const MOCK_CATEGORIES: Category[] = [
  {id: '18plus', label: '18+', emoji: '🔥'},
  {id: 'animals-plants', label: 'Animals & Plants', emoji: '🌿'},
  {id: 'arts', label: 'Arts', emoji: '🎨'},
  {id: 'business', label: 'Business', emoji: '💼'},
  {id: 'cars', label: 'Cars', emoji: '🚗'},
  {id: 'cooking', label: 'Cooking', emoji: '🍴'},
  {id: 'culture-religion', label: 'Culture & Religion', emoji: '🏛️'},
  {id: 'fashion', label: 'Fashion', emoji: '👕'},
  {id: 'fun', label: 'Fun', emoji: '😊'},
  {id: 'geography', label: 'Geography', emoji: '🌍'},
  {id: 'health', label: 'Health', emoji: '🩺'},
  {id: 'history', label: 'History', emoji: '📜'},
];