<script setup lang='ts'>
import { onMounted } from 'vue'
import { NButton, NModal } from 'naive-ui'
import { useUrlSearchParams } from '@vueuse/core'
import { fetchSSOLogin } from '@/api'
import { useAuthStore, useUserStore } from '@/store'
import Icon403 from '@/icons/403.vue'

interface Props {
  visible: boolean
}

defineProps<Props>()

const authStore = useAuthStore()

// const ms = useMessage()

// const loading = ref(false)
// const token = ref('')

// const disabled = computed(() => !token.value.trim() || loading.value)

// async function handleVerify() {
//   const secretKey = token.value.trim()

//   if (!secretKey)
//     return

//   try {
//     loading.value = true
//     await fetchVerify(secretKey)
//     authStore.setToken(secretKey)
//     ms.success('success')
//     window.location.reload()
//   }
//   catch (error: any) {
//     ms.error(error.message ?? 'error')
//     authStore.removeToken()
//     token.value = ''
//   }
//   finally {
//     loading.value = false
//   }
// }

// function handlePress(event: KeyboardEvent) {
//   if (event.key === 'Enter' && !event.shiftKey) {
//     event.preventDefault()
//     handleVerify()
//   }
// }

const params = useUrlSearchParams('history')
const userStore = useUserStore()

onMounted(() => {
  if (params.token) {
    userStore.updateUserInfo({
      name: params.user_name as string,
      avatar: params.avatar as string,
      description: params.user_name_en as string,
    })
    authStore.setToken(params.token as string)

    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
    window.history.pushState({ path: newUrl }, '', newUrl)
  }
})
</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            请登录
          </h2>
          <p class="text-base text-center text-slate-500 dark:text-slate-500">
            {{ $t('common.unauthorizedTips') }}
          </p>
          <Icon403 class="w-[200px] m-auto" />
        </header>
        <!-- <NInput v-model:value="token" type="password" placeholder="" @keypress="handlePress" />
        <NButton
          block
          type="primary"
          :disabled="disabled"
          :loading="loading"
          @click="handleVerify"
        >
          {{ $t('common.verify') }}
        </NButton> -->

        <NButton
          block
          type="primary"
          @click="fetchSSOLogin"
        >
          企业微信单点登录
        </NButton>
      </div>
    </div>
  </NModal>
</template>
