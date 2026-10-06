export function parseVideo(url) {
  if (!url) return null
  const u = url.trim()

  if (/tiktok\.com/.test(u)) {
    const m = u.match(/\/video\/(\d+)/)
    if (m) return { platform: 'tiktok', embed: `https://www.tiktok.com/embed/v2/${m[1]}` }
    return { platform: 'tiktok', embed: null }
  }

  if (/youtube\.com|youtu\.be/.test(u)) {
    let id = null
    let m = u.match(/[?&]v=([^&]+)/)
    if (m) id = m[1]
    m = u.match(/youtu\.be\/([^?]+)/)
    if (m) id = m[1]
    m = u.match(/shorts\/([^?]+)/)
    if (m) id = m[1]
    if (id) return { platform: 'youtube', embed: `https://www.youtube.com/embed/${id}` }
    return { platform: 'youtube', embed: null }
  }

  if (/vk\.com\/video/.test(u)) {
    const m = u.match(/video(-?\d+)_(\d+)/)
    if (m) return { platform: 'vk', embed: `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}&hd=2` }
    return { platform: 'vk', embed: null }
  }

  if (/rutube\.ru/.test(u)) {
    const m = u.match(/video\/([a-f0-9]+)/)
    if (m) return { platform: 'rutube', embed: `https://rutube.ru/play/embed/${m[1]}` }
    return { platform: 'rutube', embed: null }
  }

  return { platform: 'other', embed: null }
}