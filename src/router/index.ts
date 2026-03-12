import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/notes/new',
      name: 'note-create',
      component: () => import('@/views/NoteCreateView.vue'),
    },
    {
      path: '/notes/:id',
      name: 'note-detail',
      component: () => import('@/views/NoteDetailView.vue'),
    },
    {
      path: '/notes/:id/edit',
      name: 'note-edit',
      component: () => import('@/views/NoteEditView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import('@/views/PrivacyPolicyView.vue'),
    },
    {
      path: '/licenses',
      name: 'licenses',
      component: () => import('@/views/LicenseView.vue'),
    },
  ],
})

export default router
