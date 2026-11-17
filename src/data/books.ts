export interface Book {
  title: string
  author: string
  status: 'Reading' | 'Completed'
  coverArt: string
}

// Add new books here — the home page bookshelf splits them into two rows automatically.
export const books: Book[] = [
  { title: "Animal Farm", author: "George Orwell", status: "Completed", coverArt: "https://api.chulabook.com/images/pid-231893.JPG" },
  { title: "1984", author: "George Orwell", status: "Reading", coverArt: "https://cdn-local.mebmarket.com/meb/server1/59412/Thumbnail/book_detail_large.gif?8" },
  { title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche", status: "Reading", coverArt: "https://bci.kinokuniya.com/jsp/images/book-img/97801/97801404/9780140441185.JPG" },
  { title: "The Castle ปราสาท", author: "Franz Kafka", status: "Reading", coverArt: "https://storage.naiin.com/system/application/bookstore/resource/product/202110/534420/1000243867_front_XXL.jpg?v=1725896686" },
  { title: "The Idiot", author: "Fyodor Dostoevsky", status: "Reading", coverArt: "https://static.wixstatic.com/media/936e61_fb65cc3c8955443c8c3fe7d95d6d7f32~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg" },
  { title: "Pride and Prejudice", author: "Jane Austen", status: "Reading", coverArt: "https://bci.kinokuniya.com/jsp/images/book-img/97801/97801414/9780141439518.JPG" },
  { title: "A Treatise of Human Nature", author: "David Hume", status: "Reading", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZmyllv6iEaoxAQrSKXKQqYt-4786fy3ZoZQ&s" },
  { title: "Meditations", author: "Marcus Aurelius", status: "Reading", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQacn_nf34wrzKXEUzNard-mr1qg03XCza5Aw&s" },
  { title: "White nights", author: "Fyodor Dostoevsky", status: "Reading", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdSLqB0TEGTmSwd-J84GCxoTo8d0IZ7D4Grw&s" },
  { title: "สามก๊ก", author: "ล่อกวนตง", status: "Reading", coverArt: "https://api.chulabook.com/images/pid-65373.jpg" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", status: "Reading", coverArt: "https://m.media-amazon.com/images/I/71wvKXWfcML._UF1000,1000_QL80_.jpg" },
  { title: "Hidden Potential", author: "Adam Grant", status: "Completed", coverArt: "https://www.asiabooks.com/media/catalog/product/cache/a5ac216be58c0cbce1cb04612ece96dc/9/7/9780753560051.jpg" },
  { title: "Same as Ever", author: "Morgan Housel", status: "Reading", coverArt: "https://www.asiabooks.com/media/catalog/product/cache/a5ac216be58c0cbce1cb04612ece96dc/9/7/9780593716229.jpg" },
  { title: "Economics The User's Guide", author: "Ha-Joon Chang", status: "Reading", coverArt: "https://bookscape.co/wp-content/uploads/2023/06/economics-users-guide_%E0%B8%9B%E0%B8%81%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2.avif" },
  { title: "The Book of Five Rings", author: "Miyamoto Musashi", status: "Reading", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIG9P3Pnn4lC-hWu-h5hU0BBXnIuAzI_bXyQ&s" },
  { title: "mahabharata สงครามมหาภารตะ", author: "Vyasa", status: "Reading", coverArt: "https://storage.naiin.com/system/application/bookstore/resource/product/202411/628273/6000100469_front_XXL.jpg" },
  { title: "The Intelligent Investor", author: "Benjamin Graham", status: "Reading", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVC6Cj9xYtCEB2g-y8Y_b5sa2r9TwsuXMKSqSQzsnL-rJ0F-14HPz8L3b7ctN3bqLd31_V0bU0aypDGLYcEZXtOBgpuA045jpRiy8kiQ&s=10" },
  { title: "รักเร้นลับของ คาลิล ยิบราน", author: "Kahlil Gibran", status: "Completed", coverArt: "https://storage.naiin.com/system/application/bookstore/resource/product/202310/593910/1000266220_front_XXL.jpg?v=1725921920" },
  { title: "Mastery", author: "Robert Greene", status: "Reading", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-C4LTnaK_eZ8D4QL5yI5I7zNlFZh4ChKPE55z9L6vQ5At59uFBt-P1CKZCnYCLDZfOqxj7AgdGPOgQmUlCbGK3sX-JACfWC_V4j1Saco&s" },
  { title: "Alien Thinking", author: "Bouquet and Others", status: "Reading", coverArt: "https://storage.naiin.com/system/application/bookstore/resource/product/202406/614276/1000272617_front_XXL.jpg?v=1725910618" },
  { title: "Tortilla Flat", author: "John Steinbeck", status: "Reading", coverArt: "https://inwfile.com/s-di/o7fo6g.png" },
  { title: "The Analects", author: "Confucius", status: "Reading", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrnRMyBT81mHV8oS1qtLXc7AhaDXV1lIJIjg&s" },
  { title: "The Dream of a Ridiculous Man", author: "Fyodor Dostoevsky", status: "Completed", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsbt7nUg6rlrnsHPX6WQU-5FELi4GYM3hE6g&s" },
  { title: "A Mind For Numbers", author: "Barbara Oakley", status: "Completed", coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvP2UXn2aGl3QkXWY69_EqwKxwF_gaBrkhrQ&s" },
]
