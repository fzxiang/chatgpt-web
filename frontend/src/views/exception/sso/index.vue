<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchSSOLogin } from '@/api'
import { useAuthStore, useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

onMounted(async () => {
  const search = new URL(location.href).searchParams
  try {
    if (search.has('token')) {
      const token = search.get('token') || ''
      userStore.updateUserInfo({
        name: search.get('name') as string,
        // avatar: params.avatar as string,
        // description: params.user_name_en as string,
      })
      authStore.setToken(token)
      router.push({ name: 'Chat' })
    }
    else { fetchSSOLogin() }
  }
  catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div class="flex h-full" />
</template>
