import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { supabase } from '@/lib/supabase'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'generator',
        component: () => import('@/modules/generator'),
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            name: 'profile',
            component: () => import('@/modules/profile/pages/ProfilePage.vue'),
          },
          {
            path: 'edit',
            name: 'profile-edit',
            component: () => import('@/modules/profile/pages/EditProfilePage.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: () => import('@/modules/auth/pages/SignUpPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import('@/modules/auth/pages/SignInPage.vue'),
    meta: { guestOnly: true },
  },
]

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  })

  router.beforeEach(async (to) => {
    if (!to.meta.requiresAuth && !to.meta.guestOnly) return

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    const isAuthenticated = !error && session !== null

    if (to.meta.requiresAuth && !isAuthenticated) {
      return { name: 'sign-up', replace: true }
    }

    if (to.meta.guestOnly && isAuthenticated) {
      return { name: 'generator', replace: true }
    }
  })

  return router
}
