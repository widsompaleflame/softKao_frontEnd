<template>
  <div class="chapter-view">
    <!-- Chapter header -->
    <div class="chapter-header" v-if="chapter">
      <div class="ch-left">
        <div class="ch-icon-wrap" :style="{ background: chapter.color + '22', borderColor: chapter.color + '44' }">
          <span class="ch-icon">{{ chapter.icon }}</span>
        </div>
        <div>
          <h1 class="ch-title">{{ chapter.title }}</h1>
          <p class="ch-sub">{{ chapter.subtitle }}</p>
        </div>
      </div>
      <button class="btn btn-primary" @click="showModal = true">
        <span>＋</span> 新建笔记
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!notes.length && !loading" class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-title">这章还没有笔记</div>
      <div class="empty-sub">粘贴 Claude 生成的内容，支持完整 HTML/SVG 交互</div>
      <button class="btn btn-primary" style="margin-top:16px" @click="showModal = true">新建第一条笔记</button>
    </div>

    <!-- Note cards -->
    <div class="note-grid" v-else>
      <RouterLink
        v-for="note in notes"
        :key="note.id"
        :to="`/note/${note.id}`"
        class="note-card"
      >
        <div class="note-card-top">
          <div class="note-title">{{ note.title }}</div>
          <span class="note-time">{{ note.created_at }}</span>
        </div>
        <div class="note-summary" v-if="note.summary">{{ note.summary }}</div>
        <div class="note-tags" v-if="note.tags">
          <span class="tag" v-for="t in note.tags.split(',')" :key="t">{{ t.trim() }}</span>
        </div>
      </RouterLink>
    </div>

    <!-- Create Note Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h2>新建笔记</h2>
              <button class="modal-close" @click="showModal = false">✕</button>
            </div>

            <div class="modal-body">
              <label class="field-label">标题 *</label>
              <input v-model="form.title" class="field-input" placeholder="例：流水线执行时间公式" />

              <label class="field-label">标签（逗号分隔）</label>
              <input v-model="form.tags" class="field-input" placeholder="流水线,公式,计算题" />

              <label class="field-label">摘要（可选，用于侧边栏搜索显示）</label>
              <input v-model="form.summary" class="field-input" placeholder="简短描述这条笔记的内容..." />

              <label class="field-label">
                内容（粘贴 Claude 的 HTML/SVG 代码）
                <span class="field-hint">— 交互功能将完整保留</span>
              </label>
              <textarea
                v-model="form.content_html"
                class="field-textarea"
                placeholder="把 Claude 生成的 HTML 或 SVG 代码粘贴到这里...&#10;&#10;支持：&#10;· 带 JS 的交互式 SVG 图表&#10;· 带测验/动画的 HTML 页面&#10;· 知识图谱和流程图&#10;· 任何 claude.ai 可显示的内容"
                rows="14"
              ></textarea>

              <!-- Preview -->
              <div v-if="form.content_html.trim()" class="preview-wrap">
                <div class="preview-label">预览</div>
                <iframe
                  class="preview-frame"
                  sandbox="allow-scripts allow-same-origin"
                  :srcdoc="form.content_html"
                ></iframe>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-ghost" @click="showModal = false">取消</button>
              <button class="btn btn-primary" @click="saveNote" :disabled="saving">
                {{ saving ? '保存中...' : '保存笔记' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { notesAPI } from '../api/index.js'
import { useChaptersStore } from '../stores/useChapters.js'

const route = useRoute()
const store = useChaptersStore()

const chapterId = computed(() => Number(route.params.id))
const chapter = computed(() => store.chapters.find(c => c.id === chapterId.value))
const notes = ref([])
const loading = ref(false)
const showModal = ref(false)
const saving = ref(false)
const form = ref({ title: '', content_html: '', summary: '', tags: '' })

async function loadNotes() {
  loading.value = true
  try {
    const { data } = await notesAPI.listByChapter(chapterId.value)
    notes.value = data
  } finally {
    loading.value = false
  }
}

async function saveNote() {
  if (!form.value.title.trim() || !form.value.content_html.trim()) {
    alert('请填写标题和内容')
    return
  }
  saving.value = true
  try {
    const { data } = await notesAPI.create(chapterId.value, form.value)
    notes.value.unshift(data)
    store.incrementCount(chapterId.value)
    showModal.value = false
    form.value = { title: '', content_html: '', summary: '', tags: '' }
  } finally {
    saving.value = false
  }
}

watch(chapterId, loadNotes, { immediate: true })
</script>

<style scoped>
.chapter-view { padding: 36px 40px; max-width: 1000px; min-height: 100vh; }

.chapter-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 32px; gap: 16px;
}
.ch-left { display: flex; align-items: center; gap: 16px; }
.ch-icon-wrap {
  width: 56px; height: 56px; border-radius: 14px;
  border: 1px solid; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ch-icon { font-size: 26px; }
.ch-title { font-family: 'Noto Serif SC', serif; font-size: 22px; font-weight: 600; color: var(--text1); }
.ch-sub { font-size: 13px; color: var(--text3); margin-top: 4px; }

/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 40px; color: var(--text3); gap: 10px;
}
.empty-icon { font-size: 48px; }
.empty-title { font-size: 16px; color: var(--text2); font-weight: 500; }
.empty-sub { font-size: 13px; }

.spinner {
  width: 24px; height: 24px; border: 2px solid var(--border2);
  border-top-color: var(--amber); border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Note grid */
.note-grid { display: flex; flex-direction: column; gap: 12px; }
.note-card {
  background: var(--bg1); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 18px 22px;
  text-decoration: none; display: block;
  transition: all .15s;
}
.note-card:hover { background: var(--bg2); border-color: var(--border2); transform: translateX(3px); }
.note-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.note-title { font-size: 14.5px; font-weight: 600; color: var(--text1); }
.note-time { font-size: 11px; color: var(--text3); white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
.note-summary { font-size: 12.5px; color: var(--text2); margin-top: 8px; line-height: 1.6; }
.note-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: #00000088;
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal {
  background: var(--bg1); border: 1px solid var(--border2);
  border-radius: 16px; width: 760px; max-width: 100%;
  max-height: 90vh; display: flex; flex-direction: column;
  box-shadow: 0 24px 80px #000000aa;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h2 { font-family: 'Noto Serif SC', serif; font-size: 18px; color: var(--text1); }
.modal-close {
  background: none; color: var(--text3); font-size: 16px;
  padding: 4px 8px; border-radius: 4px; transition: color .12s;
}
.modal-close:hover { color: var(--text1); }
.modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

.field-label { font-size: 12px; font-weight: 600; color: var(--text2); display: flex; gap: 6px; }
.field-hint { color: var(--amber); font-weight: 400; }
.field-input {
  width: 100%; background: var(--bg3); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text1); padding: 9px 12px;
  font-size: 13px; font-family: inherit; outline: none; transition: border-color .15s;
}
.field-input:focus { border-color: var(--amber); }
.field-textarea {
  width: 100%; background: var(--bg0); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text2); padding: 10px 12px;
  font-size: 12px; font-family: 'JetBrains Mono', monospace;
  outline: none; resize: vertical; line-height: 1.6; transition: border-color .15s;
}
.field-textarea:focus { border-color: var(--amber); color: var(--text1); }

/* Live preview */
.preview-wrap { border-top: 1px solid var(--border); padding-top: 12px; }
.preview-label { font-size: 11px; color: var(--amber); font-weight: 600; margin-bottom: 8px; letter-spacing: .05em; }
.preview-frame {
  width: 100%; min-height: 260px; border: 1px solid var(--border);
  border-radius: var(--radius); background: #fff;
}
</style>
