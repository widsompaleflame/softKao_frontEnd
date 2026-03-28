<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">架</span>
        <div>
          <div class="logo-title">软考架构师</div>
          <div class="logo-sub">学习知识库</div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="search-wrap">
      <input
        v-model="searchQ"
        class="search-input"
        placeholder="搜索笔记..."
        @input="onSearch"
        @focus="searchFocused = true"
        @blur="setTimeout(() => searchFocused = false, 180)"
      />
      <span class="search-icon">⌕</span>
      <!-- Results dropdown -->
      <div v-if="searchFocused && searchResults.length" class="search-results">
        <RouterLink
          v-for="r in searchResults"
          :key="r.id"
          :to="`/note/${r.id}`"
          class="search-result-item"
          @click="searchQ = ''; searchResults = []"
        >
          <span class="sr-title">{{ r.title }}</span>
          <span class="sr-tag" v-if="r.tags">{{ r.tags.split(',')[0] }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- Home link -->
    <RouterLink to="/" class="nav-home" :class="{ active: $route.path === '/' }">
      <span>🏠</span> 首页总览
    </RouterLink>

    <!-- Chapter list -->
    <div class="chapter-list-label">章节目录</div>
    <nav class="chapter-nav">
      <div
        v-for="ch in store.chapters"
        :key="ch.id"
        class="chapter-item"
        :class="{ active: $route.params.id == ch.id }"
        @click="navigate(ch.id)"
      >
        <div class="chapter-dot" :style="{ background: ch.color }"></div>
        <div class="chapter-meta">
          <div class="chapter-name">{{ ch.icon }} {{ ch.title }}</div>
          <div class="chapter-count">{{ ch.note_count }} 条笔记</div>
        </div>
      </div>
    </nav>

    <!-- Exam countdown -->
    <div class="countdown-box">
      <div class="cd-label">距离软考</div>
      <div class="cd-days">{{ daysLeft }}</div>
      <div class="cd-sub">天 · 2026年5月</div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChaptersStore } from '../stores/useChapters.js'
import { searchAPI } from '../api/index.js'

const store = useChaptersStore()
const router = useRouter()

const searchQ = ref('')
const searchResults = ref([])
const searchFocused = ref(false)
let searchTimer = null

function onSearch() {
  clearTimeout(searchTimer)
  if (!searchQ.value.trim()) { searchResults.value = []; return }
  searchTimer = setTimeout(async () => {
    const { data } = await searchAPI.search(searchQ.value)
    searchResults.value = data
  }, 280)
}

function navigate(id) {
  router.push(`/chapter/${id}`)
}

// Exam countdown: May 24, 2026 (approximate)
const daysLeft = computed(() => {
  const exam = new Date('2026-05-23')
  const today = new Date()
  const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : '已完成!'
})
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: var(--bg1);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-header { padding: 20px 16px 14px; border-bottom: 1px solid var(--border); }

.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon {
  width: 36px; height: 36px; border-radius: 8px;
  background: linear-gradient(135deg, var(--amber), #e07b20);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Noto Serif SC', serif;
  font-size: 18px; font-weight: 600; color: #0d1117;
  flex-shrink: 0;
}
.logo-title { font-size: 14px; font-weight: 600; color: var(--text1); }
.logo-sub { font-size: 11px; color: var(--text3); margin-top: 1px; }

/* Search */
.search-wrap { position: relative; padding: 12px 12px 8px; }
.search-input {
  width: 100%; background: var(--bg3); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text1);
  padding: 7px 10px 7px 32px; font-size: 13px; font-family: inherit;
  outline: none; transition: border-color .15s;
}
.search-input:focus { border-color: var(--amber); }
.search-input::placeholder { color: var(--text3); }
.search-icon {
  position: absolute; left: 22px; top: 50%; transform: translateY(-4px);
  font-size: 16px; color: var(--text3); pointer-events: none;
}
.search-results {
  position: absolute; top: calc(100% - 4px); left: 12px; right: 12px;
  background: var(--bg2); border: 1px solid var(--border2);
  border-radius: var(--radius); z-index: 100; max-height: 240px; overflow-y: auto;
  box-shadow: 0 8px 24px #00000066;
}
.search-result-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 12px; text-decoration: none; color: var(--text1);
  border-bottom: 1px solid var(--border); font-size: 12px;
  transition: background .1s;
}
.search-result-item:last-child { border-bottom: none; }
.search-result-item:hover { background: var(--bg3); }
.sr-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sr-tag { margin-left: 8px; font-size: 10px; color: var(--amber); background: var(--amber-dim); padding: 2px 6px; border-radius: 10px; flex-shrink: 0; }

/* Home link */
.nav-home {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; font-size: 13px; font-weight: 500;
  color: var(--text2); text-decoration: none;
  transition: all .15s;
}
.nav-home:hover, .nav-home.active { color: var(--amber); background: var(--amber-dim); }

/* Chapter list */
.chapter-list-label {
  padding: 8px 16px 4px;
  font-size: 10px; font-weight: 600; letter-spacing: .08em;
  color: var(--text3); text-transform: uppercase;
}
.chapter-nav { flex: 1; }
.chapter-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; cursor: pointer;
  border-left: 2px solid transparent;
  transition: all .14s;
}
.chapter-item:hover { background: var(--bg2); }
.chapter-item.active {
  background: var(--bg2);
  border-left-color: var(--amber);
}
.chapter-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0; opacity: .85;
}
.chapter-meta { min-width: 0; }
.chapter-name {
  font-size: 12.5px; color: var(--text1); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.chapter-count { font-size: 11px; color: var(--text3); margin-top: 1px; }

/* Countdown */
.countdown-box {
  margin: 12px; padding: 14px; border-radius: var(--radius-lg);
  background: var(--amber-dim); border: 1px solid var(--amber-glow);
  text-align: center;
}
.cd-label { font-size: 11px; color: var(--amber); font-weight: 500; }
.cd-days { font-size: 32px; font-weight: 700; color: var(--amber); font-family: 'JetBrains Mono', monospace; line-height: 1.1; margin-top: 4px; }
.cd-sub { font-size: 11px; color: var(--text3); margin-top: 2px; }
</style>
