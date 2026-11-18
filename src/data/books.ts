export const CATEGORIES = ['Literature', 'Philosophy', 'Mind & Learning', 'Economics & Money', 'Epics'] as const
export type Category = (typeof CATEGORIES)[number]

export interface Book {
  title: string
  category: Category
  author: string
  status: 'Reading' | 'Completed'
  coverArt: string
}

// Covers live in public/books/ (small WebP files) so they never depend on another site.
// Add new books here — the home page bookshelf splits them into two rows automatically.
export const books: Book[] = [
  { title: "Animal Farm", category: "Literature", author: "George Orwell", status: "Completed", coverArt: "/books/animal-farm.webp" },
  { title: "1984", category: "Literature", author: "George Orwell", status: "Reading", coverArt: "/books/1984.webp" },
  { title: "Thus Spoke Zarathustra", category: "Philosophy", author: "Friedrich Nietzsche", status: "Reading", coverArt: "/books/thus-spoke-zarathustra.webp" },
  { title: "The Castle ปราสาท", category: "Literature", author: "Franz Kafka", status: "Reading", coverArt: "/books/the-castle.webp" },
  { title: "The Idiot", category: "Literature", author: "Fyodor Dostoevsky", status: "Reading", coverArt: "/books/the-idiot.webp" },
  { title: "Pride and Prejudice", category: "Literature", author: "Jane Austen", status: "Reading", coverArt: "/books/pride-and-prejudice.webp" },
  { title: "A Treatise of Human Nature", category: "Philosophy", author: "David Hume", status: "Reading", coverArt: "/books/a-treatise-of-human-nature.webp" },
  { title: "Meditations", category: "Philosophy", author: "Marcus Aurelius", status: "Reading", coverArt: "/books/meditations.webp" },
  { title: "White nights", category: "Literature", author: "Fyodor Dostoevsky", status: "Reading", coverArt: "/books/white-nights.webp" },
  { title: "สามก๊ก", category: "Epics", author: "ล่อกวนตง", status: "Reading", coverArt: "/books/book-c7298223.webp" },
  { title: "Thinking, Fast and Slow", category: "Mind & Learning", author: "Daniel Kahneman", status: "Reading", coverArt: "/books/thinking-fast-and-slow.webp" },
  { title: "Hidden Potential", category: "Mind & Learning", author: "Adam Grant", status: "Completed", coverArt: "https://www.asiabooks.com/media/catalog/product/cache/a5ac216be58c0cbce1cb04612ece96dc/9/7/9780753560051.jpg" },
  { title: "Same as Ever", category: "Economics & Money", author: "Morgan Housel", status: "Reading", coverArt: "https://www.asiabooks.com/media/catalog/product/cache/a5ac216be58c0cbce1cb04612ece96dc/9/7/9780593716229.jpg" },
  { title: "Economics The User's Guide", category: "Economics & Money", author: "Ha-Joon Chang", status: "Reading", coverArt: "/books/economics-the-user-s-guide.webp" },
  { title: "The Book of Five Rings", category: "Philosophy", author: "Miyamoto Musashi", status: "Reading", coverArt: "/books/the-book-of-five-rings.webp" },
  { title: "mahabharata สงครามมหาภารตะ", category: "Epics", author: "Vyasa", status: "Reading", coverArt: "/books/mahabharata.webp" },
  { title: "The Intelligent Investor", category: "Economics & Money", author: "Benjamin Graham", status: "Reading", coverArt: "/books/the-intelligent-investor.webp" },
  { title: "รักเร้นลับของ คาลิล ยิบราน", category: "Literature", author: "Kahlil Gibran", status: "Completed", coverArt: "/books/book-80e0863e.webp" },
  { title: "Mastery", category: "Mind & Learning", author: "Robert Greene", status: "Reading", coverArt: "/books/mastery.webp" },
  { title: "Alien Thinking", category: "Mind & Learning", author: "Bouquet and Others", status: "Reading", coverArt: "/books/alien-thinking.webp" },
  { title: "Tortilla Flat", category: "Literature", author: "John Steinbeck", status: "Reading", coverArt: "/books/tortilla-flat.webp" },
  { title: "The Analects", category: "Philosophy", author: "Confucius", status: "Reading", coverArt: "/books/the-analects.webp" },
  { title: "The Dream of a Ridiculous Man", category: "Literature", author: "Fyodor Dostoevsky", status: "Completed", coverArt: "/books/the-dream-of-a-ridiculous-man.webp" },
  { title: "A Mind For Numbers", category: "Mind & Learning", author: "Barbara Oakley", status: "Completed", coverArt: "/books/a-mind-for-numbers.webp" },
]
