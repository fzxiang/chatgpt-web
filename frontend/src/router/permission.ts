import type { Router } from 'vue-router'
import { StatusCodes } from 'http-status-codes'
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
    debugger
    if (!authStore.session && to.meta?.auth) {
      try {
        const data = await authStore.getSession()
        if (String(data.auth) === 'false')
          authStore.removeToken()
        next()
      }
      catch (error: any) {
        // 信息过期或者无权限 跳转到sso
        if (to.path !== '/sso' && error.response.status === StatusCodes.UNAUTHORIZED) {
          authStore.removeToken()
          next({ name: 'sso' })
        }
        else {
          next()
        }
      }
    }
    else {
      next()
    }
  })
}
