<script setup lang="ts">
// Small architecture diagrams for the featured projects, drawn from what each project
// actually does (see src/data/profile.ts). Theme-aware SVG; the "traffic" dashes move
// slowly unless the visitor prefers reduced motion.
defineProps<{ name: string }>()
</script>

<template>
  <figure class="art" aria-hidden="true">
    <!-- AustenC2: operator → teamserver → cross-platform agents -->
    <svg v-if="name === 'AustenC2'" viewBox="0 0 600 200">
      <g class="link">
        <path d="M 120 100 L 260 100" />
        <path d="M 340 100 C 390 100 390 45 448 45" />
        <path d="M 340 100 L 448 100" />
        <path d="M 340 100 C 390 100 390 155 448 155" />
      </g>
      <g class="flow">
        <path d="M 120 100 L 260 100" />
        <path d="M 448 45 C 390 45 390 100 340 100" />
        <path d="M 448 100 L 340 100" />
        <path d="M 448 155 C 390 155 390 100 340 100" />
      </g>
      <g class="node">
        <rect x="40" y="76" width="80" height="48" rx="8" />
        <rect x="260" y="70" width="80" height="60" rx="8" class="hot" />
        <rect x="448" y="27" width="136" height="36" rx="8" />
        <rect x="448" y="82" width="136" height="36" rx="8" />
        <rect x="448" y="137" width="136" height="36" rx="8" />
      </g>
      <g class="label">
        <text x="80" y="104">operator</text>
        <text x="300" y="98">team</text>
        <text x="300" y="114">server</text>
        <text x="516" y="49">agent · linux</text>
        <text x="516" y="104">agent · windows</text>
        <text x="516" y="159">agent · macos</text>
      </g>
      <text x="190" y="90" class="tag">tasks</text>
      <text x="396" y="130" class="tag">beacons</text>
    </svg>

    <!-- CertGuard: Root CA in the management zone issuing certs into internal + DMZ -->
    <svg v-else-if="name === 'CertGuard'" viewBox="0 0 600 200">
      <g class="zone">
        <rect x="16" y="20" width="170" height="160" rx="10" />
        <rect x="214" y="20" width="170" height="160" rx="10" />
        <rect x="412" y="20" width="172" height="160" rx="10" />
      </g>
      <g class="zlabel">
        <text x="30" y="40">MANAGEMENT</text>
        <text x="228" y="40">INTERNAL</text>
        <text x="426" y="40">DMZ</text>
      </g>
      <g class="link">
        <path d="M 150 100 C 200 100 210 80 250 80" />
        <path d="M 150 100 C 200 100 210 130 250 130" />
        <path d="M 150 100 C 300 100 380 100 448 100" />
      </g>
      <g class="flow">
        <path d="M 150 100 C 200 100 210 80 250 80" />
        <path d="M 150 100 C 200 100 210 130 250 130" />
        <path d="M 150 100 C 300 100 380 100 448 100" />
      </g>
      <g class="node">
        <rect x="40" y="76" width="110" height="48" rx="8" class="hot" />
        <rect x="250" y="64" width="110" height="32" rx="6" />
        <rect x="250" y="114" width="110" height="32" rx="6" />
        <rect x="448" y="84" width="110" height="32" rx="6" />
      </g>
      <g class="label">
        <text x="95" y="98">Root CA</text>
        <text x="95" y="113" class="small">RSA-2048 · SHA-256</text>
        <text x="305" y="84">api.internal</text>
        <text x="305" y="134">dashboard</text>
        <text x="503" y="104">gateway</text>
      </g>
      <!-- expiry meters -->
      <g class="meter">
        <rect x="262" y="152" width="86" height="5" rx="2.5" class="track" />
        <rect x="262" y="152" width="64" height="5" rx="2.5" class="ok" />
        <rect x="460" y="130" width="86" height="5" rx="2.5" class="track" />
        <rect x="460" y="130" width="22" height="5" rx="2.5" class="warn" />
      </g>
      <text x="503" y="152" class="tag">renews soon</text>
    </svg>

    <!-- smart-plant-box: sensors → Arduino → wireless → live dashboard -->
    <svg v-else viewBox="0 0 600 200">
      <g class="link">
        <path d="M 110 100 L 200 100" />
        <path d="M 290 100 L 380 100" />
      </g>
      <g class="flow">
        <path d="M 110 100 L 200 100" />
        <path d="M 290 100 L 380 100" />
      </g>
      <g class="node">
        <rect x="30" y="74" width="80" height="52" rx="8" />
        <rect x="200" y="70" width="90" height="60" rx="8" class="hot" />
        <rect x="380" y="40" width="190" height="120" rx="10" />
      </g>
      <g class="label">
        <text x="70" y="104">sensors</text>
        <text x="245" y="98">Arduino</text>
        <text x="245" y="114" class="small">C / C++</text>
        <text x="335" y="90" class="tag">wireless</text>
      </g>
      <!-- the dashboard: a live reading -->
      <text x="396" y="62" class="tag start">plant health · live</text>
      <polyline
        class="wave"
        points="396,130 414,122 432,126 450,108 468,112 486,96 504,104 522,88 540,94 556,80"
      />
      <circle cx="556" cy="80" r="4" class="dot" />
    </svg>
  </figure>
</template>

<style scoped>
.art {
  margin: 0;
  border-radius: 10px;
  border: 1px solid var(--line);
  background:
    radial-gradient(var(--line) 1px, transparent 1px) 0 0 / 16px 16px,
    color-mix(in srgb, var(--accent) 3%, var(--bg));
  overflow: hidden;
}

svg {
  display: block;
  width: 100%;
  height: auto;
}

.link path {
  fill: none;
  stroke: var(--ink);
  stroke-opacity: 0.22;
  stroke-width: 2;
}

.flow path {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
  stroke-dasharray: 4 14;
  animation: flow 1.6s linear infinite;
}

@keyframes flow {
  to {
    stroke-dashoffset: -18;
  }
}

.node rect {
  fill: var(--bg);
  stroke: var(--ink);
  stroke-opacity: 0.35;
  stroke-width: 1.5;
}

.node rect.hot {
  fill: var(--accent-soft);
  stroke: var(--accent);
  stroke-opacity: 1;
}

.zone rect {
  fill: color-mix(in srgb, var(--ink) 3%, transparent);
  stroke: var(--ink);
  stroke-opacity: 0.18;
  stroke-dasharray: 5 5;
}

.zlabel text {
  font-family: var(--font-pixel);
  font-size: 10px;
  fill: var(--muted);
}

.label text {
  font-family: var(--font-mono);
  font-size: 12px;
  fill: var(--ink);
  text-anchor: middle;
}

.label text.small {
  font-size: 9px;
  fill: var(--muted);
}

.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  fill: var(--accent);
  text-anchor: middle;
}

.tag.start {
  text-anchor: start;
}

.track {
  fill: var(--line);
}
.ok {
  fill: #5f8f4a;
}
.warn {
  fill: var(--accent);
}

.wave {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.dot {
  fill: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .flow path {
    animation: none;
  }
}
</style>
