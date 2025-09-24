import { supabase } from '@/supabse/Supabase'

function randomId(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function extFromUri(uri: string, fallback = 'jpg') {
  try {
    const q = uri.split('?')[0]
    const dot = q.lastIndexOf('.')
    if (dot !== -1) return q.slice(dot + 1).toLowerCase()
  } catch {}
  return fallback
}

function mimeFromExt(ext: string) {
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'heic':
      return 'image/heic'
    default:
      return 'application/octet-stream'
  }
}

export type UploadResult = { path: string; publicUrl: string }

export async function uploadImageFromUri(opts: {
  uri: string
  bucket: string
  userId: string
  folder?: string
  pathOverride?: string
  upsert?: boolean
}): Promise<UploadResult> {
  const { uri, bucket, userId, folder, pathOverride, upsert } = opts

  // Fetch the local file as a Blob
  const res = await fetch(uri)
  if (!res.ok) throw new Error('Failed to read file for upload')
  // @ts-ignore React Native fetch supports blob in modern Expo
  const blob: Blob = await res.blob()

  const guessedExt = extFromUri(uri)
  const ext = (blob as any).type ? ((blob as any).type as string).split('/')[1] || guessedExt : guessedExt
  const contentType = (blob as any).type || mimeFromExt(ext)

  const filename = pathOverride
    ? pathOverride
    : `${userId}/${folder ? folder + '/' : ''}${Date.now()}-${randomId(6)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, blob as any, { contentType, upsert: !!upsert })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return { path: filename, publicUrl: data.publicUrl }
}

export async function removeFile(bucket: string, path: string): Promise<void> {
  if (!path) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

export async function uploadFromUrl(opts: {
  url: string
  bucket: string
  userId: string
  folder?: string
  filenameBase?: string
  upsert?: boolean
}): Promise<UploadResult> {
  const { url, bucket, userId, folder, filenameBase, upsert } = opts
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch remote image')
  // @ts-ignore
  const blob: Blob = await res.blob()
  const type = (blob as any).type || 'image/jpeg'
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'
  const filename = `${userId}/${folder ? folder + '/' : ''}${filenameBase || 'preview'}-${Date.now()}-${randomId(6)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(filename, blob as any, {
    contentType: type,
    upsert: !!upsert,
  })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return { path: filename, publicUrl: data.publicUrl }
}

export async function uploadBase64(opts: {
  base64: string
  mime?: string
  bucket: string
  userId: string
  folder?: string
  filenameBase?: string
  upsert?: boolean
}): Promise<UploadResult> {
  const { base64, mime = 'image/jpeg', bucket, userId, folder, filenameBase, upsert } = opts
  // Use data URL -> fetch to get a Blob in RN without atob
  const dataUrl = base64.startsWith('data:') ? base64 : `data:${mime};base64,${base64}`
  const res = await fetch(dataUrl)
  if (!res.ok) throw new Error('Failed to decode base64 data URL')
  // @ts-ignore
  const blob: Blob = await res.blob()
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'
  const filename = `${userId}/${folder ? folder + '/' : ''}${filenameBase || 'image'}-${Date.now()}-${randomId(6)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(filename, blob as any, {
    contentType: mime,
    upsert: !!upsert,
  })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return { path: filename, publicUrl: data.publicUrl }
}
