<template>
  <div class="note-view" v-if="note">
    <!-- Toolbar -->
    <div class="note-toolbar">
      <RouterLink :to="`/chapter/${note.chapter_id}`" class="back-link">
        ← 返回章节
      </RouterLink>
      <div class="toolbar-actions">
        <button class="btn btn-ghost" @click="toggleEdit">
          {{ editing ? '📄 预览' : '✏️ 编辑' }}
        </button>
        <button class="btn btn-ghost" @click="saveEdit" v-if="editing" :disabled="saving">
          {{ saving ? '保存中...' : '💾 保存' }}
        </button>
        <button class="btn btn-danger" @click="confirmDelete">
          🗑 删除
        </button>
      </div>
    </div>

    <!-- Note metadata -->
    <div class="note-meta">
      <div v-if="!editingMeta">
        <h1 class="note-title">{{ note.title }}</h1>
        <div class="note-info-row">
          <span class="note-time">{{ note.created_at }}</span>
          <div class="note-tags" v-if="note.tags">
            <span class="tag" v-for="t in note.tags.split(',')" :key="t">{{ t.trim() }}</span>
          </div>
          <button class="btn-edit-meta" @click="editingMeta = true">编辑信息</button>
        </div>
      </div>
      <div v-else class="meta-edit-form">
        <input v-model="editForm.title" class="field-input" placeholder="标题" />
        <input v-model="editForm.tags" class="field-input" placeholder="标签（逗号分隔）" />
        <input v-model="editForm.summary" class="field-input" placeholder="摘要" />
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" @click="saveMeta">保存</button>
          <button class="btn btn-ghost" @click="editingMeta = false">取消</button>
        </div>
      </div>
    </div>

    <!-- Content: iframe (preview) or textarea (edit) -->
    <div class="content-area">
      <!-- EDIT MODE: textarea for raw HTML -->
      <div v-if="editing" class="edit-panel">
        <div class="edit-header">
          <span class="edit-label">HTML / SVG 源码</span>
          <span class="edit-hint">修改后点击「保存」</span>
        </div>
        <textarea
          v-model="editForm.content_html"
          class="content-textarea"
          spellcheck="false"
        ></textarea>
      </div>

      <!-- PREVIEW MODE: sandboxed iframe with full interactivity -->
      <div v-else class="preview-panel">
        <iframe
          ref="iframeRef"
          class="content-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms"
          :srcdoc="note.content_html"
          @load="resizeIframe"
        ></iframe>
      </div>
    </div>
  </div>

  <!-- Loading state -->
  <div class="loading-screen" v-else>
    <div class="spinner"></div>
    <span>加载笔记中...</span>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { notesAPI } from '../api/index.js'
import { useChaptersStore } from '../stores/useChapters.js'

const route = useRoute()
const router = useRouter()
const store = useChaptersStore()
const iframeRef = ref(null)

const note = ref(null)
const editing = ref(false)
const editingMeta = ref(false)
const saving = ref(false)
const editForm = reactive({ title: '', tags: '', summary: '', content_html: '' })

onMounted(async () => {
  const { data } = await notesAPI.get(route.params.id)
  note.value = data
  Object.assign(editForm, data)
})

function resizeIframe() {
  if (!iframeRef.value) return
  try {
    const h = iframeRef.value.contentDocument?.body?.scrollHeight
    if (h && h > 300) iframeRef.value.style.height = h + 40 + 'px'
  } catch {}
}

function toggleEdit() {
  editing.value = !editing.value
  if (editing.value) Object.assign(editForm, note.value)
}

async function saveEdit() {
  saving.value = true
  try {
    await notesAPI.update(note.value.id, {
      content_html: editForm.content_html
    })
    note.value.content_html = editForm.content_html
    editing.value = false
  } finally {
    saving.value = false
  }
}

async function saveMeta() {
  await notesAPI.update(note.value.id, {
    title: editForm.title,
    tags: editForm.tags,
    summary: editForm.summary
  })
  note.value.title = editForm.title
  note.value.tags = editForm.tags
  note.value.summary = editForm.summary
  editingMeta.value = false
}

async function confirmDelete() {
  if (!confirm(`确定删除「${note.value.title}」吗？`)) return
  await notesAPI.delete(note.value.id)
  store.decrementCount(note.value.chapter_id)
  router.push(`/chapter/${note.value.chapter_id}`)
}
</script>

<style scoped>
.note-view { display: flex; flex-direction: column; min-height: 100vh; }

/* Toolbar */
.note-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 36px;
  border-bottom: 1px solid var(--border);
  background: var(--bg1);
  position: sticky; top: 0; z-index: 50;
}
.back-link {
  color: var(--text2); text-decoration: none; font-size: 13px;
  transition: color .12s;
}
.back-link:hover { color: var(--amber); }
.toolbar-actions { display: flex; gap: 8px; }

/* Note metadata */
.note-meta {
  padding: 28px 36px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg1);
}
.note-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 24px; font-weight: 600; color: var(--text1); margin-bottom: 12px;
}
.note-info-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.note-time { font-size: 12px; color: var(--text3); font-family: 'JetBrains Mono', monospace; }
.note-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-edit-meta {
  background: none; border: none; color: var(--text3); font-size: 12px;
  cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: color .12s;
}
.btn-edit-meta:hover { color: var(--amber); }

/* Meta edit form */
.meta-edit-form { display: flex; flex-direction: column; gap: 8px; max-width: 560px; }
.field-input {
  width: 100%; background: var(--bg3); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text1); padding: 8px 12px;
  font-size: 13px; font-family: inherit; outline: none; transition: border-color .15s;
}
.field-input:focus { border-color: var(--amber); }

/* Content area */
.content-area { flex: 1; padding: 0; }

/* Edit panel */
.edit-panel { display: flex; flex-direction: column; height: calc(100vh - 180px); }
.edit-header {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 36px; background: var(--bg2); border-bottom: 1px solid var(--border);
}
.edit-label { font-size: 12px; font-weight: 600; color: var(--amber); }
.edit-hint { font-size: 12px; color: var(--text3); }
.content-textarea {
  flex: 1; background: var(--bg0); border: none; outline: none;
  color: var(--text2); padding: 24px 36px;
  font-size: 12.5px; font-family: 'JetBrains Mono', monospace;
  line-height: 1.7; resize: none;
}

/* Preview panel: iframe fills available space */
.preview-panel { padding: 28px 36px; }
.content-iframe {
  width: 100%; min-height: 600px; height: auto;
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  background: #fff; display: block;
  transition: height .3s;
}

/* Loading */
.loading-screen {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100vh; gap: 14px; color: var(--text3);
}
.spinner {
  width: 28px; height: 28px; border: 2px solid var(--border2);
  border-top-color: var(--amber); border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
