export interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
}

const apiKeys: ApiKey[] = []

export function createApiKey(name: string): ApiKey {
  const key: ApiKey = {
    id: Date.now().toString(),
    name,
    key: 'ak_' + Date.now() + '_xxxxxxxxxxxxxxxxxxxx',
    created: new Date().toISOString().split('T')[0],
    lastUsed: 'Never',
  }
  apiKeys.push(key)
  return key
}

export function deleteApiKey(id: string) {
  const index = apiKeys.findIndex(k => k.id === id)
  if (index !== -1) apiKeys.splice(index, 1)
}

export function listApiKeys() {
  return apiKeys
}
