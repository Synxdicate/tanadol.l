<template>
  <div class="min-h-screen font-sans selection:bg-[#eb5e28] selection:text-white">
    
    <header class="header-glass">
      <nav class="nav-container">
        
        <router-link to="/" class="no-underline brand-wrapper hover:opacity-90">
          <h1 class="name">Tanadol L.</h1>
        </router-link>

        <div class="nav-menu">
          <router-link to="/about" class="nav-link">About</router-link>
          <router-link to="/project" class="nav-link">Projects</router-link>
          <router-link to="/article" class="nav-link">Articles</router-link>
          <router-link to="/resume" class="nav-link">Resume</router-link>
        </div>
      </nav>
    </header>

    <main class="content-area">
      <div class="max-w-5xl mx-auto px-6">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

  </div>
</template>

<style scoped>
.header-glass {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background-color: rgba(255, 252, 242, 0.85); 
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(37, 36, 34, 0.06);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.2rem 2rem;
}

.brand-wrapper {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: #403d39;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #64748b; 
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.nav-link:hover, 
.router-link-active {
  color: #eb5e28 !important;
  letter-spacing: 0.15em;
}

.content-area {
  padding-top: 90px;
  padding-bottom: 60px;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
}
</style>