<template>
  <div class="home">
    <!-- Header -->
    <div class="home-header">
      <div>
        <h1 class="home-title">系统架构师 · 知识库</h1>
        <p class="home-sub">你好 Angela！已整理 <strong>{{ totalNotes }}</strong> 条笔记 · 共 10 章</p>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-label">学习进度</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <div class="progress-pct">{{ progressPct }}%</div>
      </div>
    </div>

    <!-- Chapter grid -->
    <div class="chapter-grid">
      <RouterLink
        v-for="ch in store.chapters"
        :key="ch.id"
        :to="`/chapter/${ch.id}`"
        class="chapter-card"
        :style="{ '--card-color': ch.color }"
      >
        <div class="card-top">
          <span class="card-icon">{{ ch.icon }}</span>
          <span class="card-badge" :class="{ 'badge-active': ch.note_count > 0 }">
            {{ ch.note_count > 0 ? ch.note_count + ' 条' : '待开始' }}
          </span>
        </div>
        <div class="card-title">{{ ch.title }}</div>
        <div class="card-sub">{{ ch.subtitle }}</div>
        <div class="card-progress">
          <div class="card-prog-bar">
            <div class="card-prog-fill"
              :style="{ width: Math.min(ch.note_count * 8, 100) + '%', background: ch.color }">
            </div>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Tips -->
    <div class="tips-row">
      <div class="tip-card">
        <span class="tip-icon">💡</span>
        <div>
          <div class="tip-title">如何保存 Claude 的交互式内容</div>
          <div class="tip-body">在 Claude 对话中，点击「新建笔记」→ 粘贴 Claude 生成的 HTML/SVG 代码 → 所有交互功能原样保留，通过 iframe 隔离渲染。</div>
        </div>
      </div>
      <div class="tip-card">
        <span class="tip-icon">🔖</span>
        <div>
          <div class="tip-title">快捷操作</div>
          <div class="tip-body">侧边栏可以直接搜索笔记内容 · 每条笔记支持标签分类 · 知识图谱和测验交互完全保留。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChaptersStore } from '../stores/useChapters.js'

const store = useChaptersStore()

const totalNotes = computed(() => store.chapters.reduce((s, c) => s + c.note_count, 0))
const progressPct = computed(() => {
  const chaptersWithNotes = store.chapters.filter(c => c.note_count > 0).length
  return Math.round((chaptersWithNotes / 10) * 100)
})
</script>

<style scoped>
.home { padding: 36px 40px; max-width: 1100px; }

.home-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 36px; gap: 24px;
}
.home-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 26px; font-weight: 600;
  color: var(--text1); letter-spacing: -.01em;
}
.home-sub { color: var(--text2); margin-top: 6px; font-size: 14px; }
.home-sub strong { color: var(--amber); }

.progress-bar-wrap { text-align: right; flex-shrink: 0; }
.progress-label { font-size: 11px; color: var(--text3); margin-bottom: 6px; }
.progress-bar {
  width: 180px; height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden;
}
.progress-fill {
  height: 100%; background: var(--amber);
  border-radius: 3px; transition: width .5s cubic-bezier(.4,0,.2,1);
}
.progress-pct { font-size: 12px; color: var(--amber); margin-top: 4px; }

/* Chapter grid */
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}
.chapter-card {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  text-decoration: none;
  display: block;
  transition: all .18s;
  border-top: 2px solid var(--card-color);
}
.chapter-card:hover {
  background: var(--bg2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px #00000044;
}
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.card-icon { font-size: 22px; }
.card-badge {
  font-size: 10px; padding: 3px 8px; border-radius: 10px;
  background: var(--bg4); color: var(--text3);
}
.card-badge.badge-active { background: var(--amber-dim); color: var(--amber); }
.card-title { font-size: 13.5px; font-weight: 600; color: var(--text1); margin-bottom: 6px; }
.card-sub { font-size: 11px; color: var(--text3); line-height: 1.5; min-height: 30px; }
.card-progress { margin-top: 14px; }
.card-prog-bar { height: 3px; background: var(--bg4); border-radius: 2px; overflow: hidden; }
.card-prog-fill { height: 100%; border-radius: 2px; transition: width .4s; }

/* Tips */
.tips-row { display: flex; gap: 14px; }
.tip-card {
  flex: 1; background: var(--bg1); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 18px;
  display: flex; gap: 14px; align-items: flex-start;
}
.tip-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
.tip-title { font-size: 13px; font-weight: 600; color: var(--text1); margin-bottom: 6px; }
.tip-body { font-size: 12px; color: var(--text3); line-height: 1.7; }
</style>
