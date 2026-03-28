import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export const chaptersAPI = {
  list: () => api.get('/chapters'),
  update: (id, data) => api.patch(`/chapters/${id}`, data),
}

export const notesAPI = {
  listByChapter: (chapterId) => api.get(`/chapters/${chapterId}/notes`),
  get: (id) => api.get(`/notes/${id}`),
  create: (chapterId, data) => api.post(`/chapters/${chapterId}/notes`, data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
}

export const searchAPI = {
  search: (q) => api.get('/search', { params: { q } }),
}

export default api
