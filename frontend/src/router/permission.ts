import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'

// export function setupPageGuard(router: Router) {
//   router.beforeEach(async (to, from, next) => {
//     const authStore = useAuthStoreWithout()
//     if (!authStore.session) {
//       try {
//         const data = await authStore.getSession()
//         if (String(data.auth) === 'false')
//           authStore.removeToken()
//         next()
//       }
//       catch (error) {
//         if (to.path !== '/500')
//           next({ name: '500' })
//         else
//           next()
//       }
//     }
//     else {
//       next()
//     }
//   })
// }

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    if (!authStore.session && to.meta?.auth) {
      try {
        const data = await authStore.getSession()
        if (String(data.auth) === 'false')
          authStore.removeToken()
        next()
      }
      catch (error: any) {
        next()
      }
    }
    else {
      next()
    }
  })
}
