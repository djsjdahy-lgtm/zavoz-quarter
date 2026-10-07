import { supabase } from './supabase'

export async function uploadImage(bucket, userId, file) {
  if (!file) throw new Error('Файл не выбран')
  if (!file.type.startsWith('image/')) throw new Error('Только изображения')
  if (file.size > 3 * 1024 * 1024) throw new Error('Максимум 3 МБ')

  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: true })
  if (upErr) throw upErr

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}