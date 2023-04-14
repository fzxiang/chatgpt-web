import { StatusCodes } from 'http-status-codes'
import { useAuthStoreWithout } from '@/store/modules/auth'

const errorHander = (error: any) => {
  const authStore = useAuthStoreWithout()

  if (location.pathname !== '/sso' && error.response.status === StatusCodes.UNAUTHORIZED) {
    authStore.removeToken()
    location.pathname = '/sso'
  }
}

export default errorHander
