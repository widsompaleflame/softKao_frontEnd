import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChapterView from '../views/ChapterView.vue'
import NoteView from '../views/NoteView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/chapter/:id', component: ChapterView },
    { path: '/note/:id', component: NoteView },
  ]
})

export default router
