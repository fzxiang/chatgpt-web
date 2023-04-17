export default function () {
  return { ssoLogin }
}

async function ssoLogin() {
  const SSO_URL = import.meta.env.VITE_APP_SSO_URL || 'http://me.paoyou.work'
  const url = new URL(SSO_URL)
  url.pathname = '/login'
  url.searchParams.set('service', window.location.href)
  window.location.href = url.href
}
