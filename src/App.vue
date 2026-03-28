<template>
  <div class="app-shell">
    <Sidebar />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.fullPath" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import { useChaptersStore } from './stores/useChapters.js'

const store = useChaptersStore()
onMounted(() => store.fetchChapters())
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg0);
  min-width: 0;
}
</style>
