<template>
  <div class="home-container">
    
    <section class="hero-section">
      <div class="hero-content">
        <h3 class="hero-title monsieur-la-doulaise-regular">Welcome to my work</h3>
        <div class="hero-subtitle-wrapper">
          <p class="hero-subtitle font-mono">Cybersecurity / Mathematics / Philosophy / Economics / Literature / Sketch drawing</p>
        </div>
        
        <p class="hero-desc">
          Hi, I'm <strong class="highlight">Tanadol Langputeh</strong>, a 20 years old computer science student driven by cryptographic design and analytical logic.
        </p>
      </div>
    </section>

    <section class="featured-section">
      <div class="section-header">
        <h2 class="section-label font-mono">Explore by Discipline</h2>
        <div class="header-line"></div>
      </div>

      <div class="featured-grid">
        <div class="featured-card">
          <div class="card-content">
            <div class="title-with-line">
              <h3>lorem</h3>
              <span class="line-effect"></span>
            </div>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nam rem dolores quidem corrupti nemo aliquid doloremque molestiae nisi pariatur! Maiores.</p>
          </div>
          <i class="pi pi-arrow-up-right card-icon"></i>
        </div>

        <router-link to="/project" class="featured-card">
          <div class="card-content">
            <div class="title-with-line">
              <h3>lorem</h3>
              <span class="line-effect"></span>
            </div>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repellendus, vero.</p>
          </div>
          <i class="pi pi-arrow-up-right card-icon"></i>
        </router-link>
      </div>
    </section>

    <section class="bookshelf-section">
      <div class="section-header">
        <h2 class="section-label font-mono">/ What I read?</h2>
        <div class="header-line"></div>
      </div>
      
      <div 
        class="marquee-container"
        ref="scrollContainer"
        :class="{ 'is-grabbing': isDown }"
        @mousedown="handleMouseDown"
        @mouseleave="handleMouseLeave"
        @mouseup="handleMouseUp"
        @mousemove="handleMouseMove"
        @mouseenter="handleMouseEnter"
      >
        <div class="marquee-track">
          <div class="book-group" v-for="g in 3" :key="'group-'+g">
            <div v-for="book in bookshelf" :key="book.title + '-' + g" class="book-item">
              
              <div class="book-cover-wrap">
                <img :src="book.coverArt" :alt="book.title" class="book-cover" loading="lazy" />
              </div>
              
              <div class="book-details">
                <span v-if="book.status === 'Reading'" class="book-status reading font-mono">
                  Status: Reading
                </span>
                <span v-else-if="book.status === 'Completed'" class="book-status completed font-mono">
                  Status: Completed
                </span>
                <span v-else class="book-status font-mono">
                  Status: {{ book.status }}
                </span>

                <div class="book-info">
                  <span class="book-title">{{ book.title }}</span>
                  <span class="book-author">by {{ book.author }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const bookshelf = ref([
  {
    title: "Animal Farm",
    author: "george orwell",
    status: "Completed",
    coverArt: "https://api.chulabook.com/images/pid-231893.JPG"
  },
  {
    title: "1984",
    author: "George Orwell",
    status: "Reading",
    coverArt: "https://cdn-local.mebmarket.com/meb/server1/59412/Thumbnail/book_detail_large.gif?8"
  },
  {
    title: "Thus Spoke Zarathustra",
    author: "Friedrich Nietzsche",
    status: "Reading",
    coverArt: "https://bci.kinokuniya.com/jsp/images/book-img/97801/97801404/9780140441185.JPG"
  },
  {
    title: "The Castle ปราสาท",
    author: "Franz Kafka",
    status: "Reading",
    coverArt: "https://storage.naiin.com/system/application/bookstore/resource/product/202110/534420/1000243867_front_XXL.jpg?v=1725896686"
  },
  {
    title: "The Idiot",
    author: "Fyodor Dostoevsky",
    status: "Reading",
    coverArt: "https://static.wixstatic.com/media/936e61_fb65cc3c8955443c8c3fe7d95d6d7f32~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    status: "Reading",
    coverArt: "https://bci.kinokuniya.com/jsp/images/book-img/97801/97801414/9780141439518.JPG"
  },
  {
    title: "A Treatise of Human Nature",
    author: "David Hume",
    status: "Reading",
    coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZmyllv6iEaoxAQrSKXKQqYt-4786fy3ZoZQ&s"
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    status: "Reading",
    coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQacn_nf34wrzKXEUzNard-mr1qg03XCza5Aw&s"
  },
  {
    title: "White nights",
    author: "Fyodor Dostoevsky",
    status: "Reading",
    coverArt: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdSLqB0TEGTmSwd-J84GCxoTo8d0IZ7D4Grw&s"
  }
])

const scrollContainer = ref(null)
const isDown = ref(false)
const isHovered = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
let animationId = null

const autoScroll = () => {
  if (scrollContainer.value && !isDown.value && !isHovered.value) {
    scrollContainer.value.scrollLeft += 0.8
    
    const maxScroll = scrollContainer.value.scrollWidth / 3
    if (scrollContainer.value.scrollLeft >= maxScroll * 2) {
      scrollContainer.value.scrollLeft -= maxScroll
    }
  }
  animationId = requestAnimationFrame(autoScroll)
}

onMounted(() => {
  animationId = requestAnimationFrame(autoScroll)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

const handleMouseDown = (e) => {
  isDown.value = true
  startX.value = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft.value = scrollContainer.value.scrollLeft
}

const handleMouseLeave = () => {
  isDown.value = false
  isHovered.value = false
}

const handleMouseEnter = () => {
  isHovered.value = true 
}

const handleMouseUp = () => {
  isDown.value = false
}

const handleMouseMove = (e) => {
  if (!isDown.value) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX.value) * 1.5 
  scrollContainer.value.scrollLeft = scrollLeft.value - walk
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Monsieur+La+Doulaise&display=swap');

.home-container {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem 2rem 5rem 2rem;
  color: #252422; 
  -webkit-font-smoothing: antialiased;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

.monsieur-la-doulaise-regular {
  font-family: "Monsieur La Doulaise", cursive;
  font-weight: 400;
  font-style: normal;
  text-transform: none;
}

.hero-section {
  text-align: center;
  margin-bottom: 5rem;
}

.hero-title {
  font-size: clamp(4rem, 11vw, 6.5rem);
  font-weight: 400;
  color: #eb5e28; 
  margin: 0;
  line-height: 0.9;
}

.hero-subtitle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0 2rem;
}

.hero-subtitle {
  color: #64748b; 
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 600;
}

.hero-desc {
  color: #403d39;
  max-width: 580px;
  margin: 0 auto;
  line-height: 1.75;
  font-size: 1.05rem;
}

.highlight {
  color: #252422;
  font-weight: 700;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.section-label {
  color: #64748b;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  white-space: nowrap;
  font-weight: 600;
}

.header-line {
  height: 1px;
  background: rgba(37, 36, 34, 0.08); 
  width: 100%;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 5rem;
}

.featured-card {
  position: relative;
  background: rgba(255, 255, 255, 0.6); 
  border: 1px solid rgba(37, 36, 34, 0.06);
  border-radius: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.featured-card:hover {
  transform: translateY(-5px);
  border-color: rgba(37, 36, 34, 0.15); 
  background: #ffffff;
  box-shadow: 0 15px 35px rgba(37, 36, 34, 0.04);
}

.card-content {
  padding: 2.5rem;
}

.title-with-line {
  position: relative;
  display: inline-block;
  margin-bottom: 0.85rem;
}

.featured-card h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #252422; 
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
}

.line-effect {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1.5px;
  background-color: #eb5e28;
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.featured-card:hover .line-effect {
  width: 100%; 
}

.featured-card p {
  color: #575551;
  font-size: 0.88rem;
  line-height: 1.6;
  margin: 0;
}

.card-icon {
  position: absolute;
  top: 2rem;
  right: 2rem;
  color: #64748b;
  opacity: 0.3;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.featured-card:hover .card-icon {
  color: #eb5e28; 
  opacity: 1;
  transform: translate(2px, -2px); 
}

.bookshelf-section {
  width: 100%;
  margin-top: 2rem;
}

.marquee-container {
  position: relative;
  width: 100%;
  padding: 2rem 0;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  cursor: grab;
  user-select: none;
  scrollbar-width: none;
  -ms-overflow-style: none;
  mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
}

.marquee-container::-webkit-scrollbar {
  display: none;
}

.marquee-container.is-grabbing {
  cursor: grabbing;
}

.marquee-track {
  display: inline-block;
  width: max-content;
}

.book-group {
  display: flex;
  gap: 3.5rem; 
  padding-right: 3.5rem;
  display: inline-flex;
}

.book-item {
  display: flex;
  align-items: center;
  gap: 1.5rem; 
  width: 340px;
  background: transparent;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.book-item:hover {
  transform: translateY(-6px); 
}

.book-cover-wrap {
  width: 85px; 
  height: 125px; 
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(37, 36, 34, 0.18);
  background: #eae9e4;
  border: 1px solid rgba(37, 36, 34, 0.08);
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.book-details {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  justify-content: center;
}

.book-status {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.book-status.reading {
  color: #eb5e28;
}

.book-status.completed {
  color: #64748b;
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.book-title {
  font-size: 1.15rem;
  font-weight: 800;   
  color: #252422;
  line-height: 1.3;
  white-space: normal;
}

.book-author {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
}

@media (max-width: 768px) {
  .hero-section { margin-bottom: 3.5rem; }
  .section-header { margin-bottom: 2rem; }
  .card-content { padding: 2rem; }
  .featured-grid { margin-bottom: 3.5rem; }
  .book-item { width: 300px; }
  .book-cover-wrap { width: 75px; height: 110px; }
}
</style>