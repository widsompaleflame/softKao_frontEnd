import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chaptersAPI } from '../api/index.js'

export const useChaptersStore = defineStore('chapters', () => {
  const chapters = ref([])
  const loading = ref(false)

  async function fetchChapters() {
    loading.value = true
    try {
      const { data } = await chaptersAPI.list()
      chapters.value = data
    } finally {
      loading.value = false
    }
  }

  function incrementCount(chapterId) {
    const ch = chapters.value.find(c => c.id === chapterId)
    if (ch) ch.note_count++
  }

  function decrementCount(chapterId) {
    const ch = chapters.value.find(c => c.id === chapterId)
    if (ch && ch.note_count > 0) ch.note_count--
  }

  return { chapters, loading, fetchChapters, incrementCount, decrementCount }
})
