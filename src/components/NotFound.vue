<template>
  <div class="page nf">
    <h1 class="page-title">Lost?</h1>
    <p class="font-mono code">404 — this path doesn't exist.</p>
    <router-link to="/" class="btn btn-primary">Back home</router-link>
  </div>
</template>

<style scoped>
.nf {
  text-align: center;
  padding-top: 4rem;
}
.code {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 1rem 0 2rem;
}
</style>
