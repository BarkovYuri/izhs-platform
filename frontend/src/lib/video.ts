/**
 * Преобразует ссылку на видео из YouTube/RuTube/VK в URL для встраивания
 * в <iframe>. Если ссылка не распознана — возвращает null, и компонент
 * показывает кнопку "Смотреть видео" с прямой ссылкой.
 */
export function getVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube: youtu.be/<id> | youtube.com/watch?v=<id> | youtube.com/embed/<id>
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/embed/")) return trimmed;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      // /shorts/<id>
      const m = u.pathname.match(/^\/shorts\/([^/]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }

    // RuTube: rutube.ru/video/<id>/ -> /play/embed/<id>
    if (host.endsWith("rutube.ru")) {
      const m = u.pathname.match(/^\/video\/([^/]+)/);
      if (m) return `https://rutube.ru/play/embed/${m[1]}`;
      if (u.pathname.startsWith("/play/embed/")) return trimmed;
    }

    // VK Видео и VK Клипы используют один и тот же embed-эндпоинт
    // video_ext.php. URL могут быть:
    //   vk.com/video-12345_67890       — обычное видео
    //   vk.com/clip-12345_67890        — клип
    //   vk.com/clips-12345?z=clip-...  — клип из списка канала
    //   vk.com/video?z=video-...       — видео по параметру z
    //   vkvideo.ru/clip-... / video-...
    if (host === "vk.com" || host === "m.vk.com" || host === "vkvideo.ru") {
      // /video-12345_67890 или /clip-12345_67890
      const m = u.pathname.match(/^\/(?:video|clip)(-?\d+)_(\d+)/);
      if (m) {
        return `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}&hd=2`;
      }
      // ?z=video-12345_67890 или ?z=clip-12345_67890
      // (может иметь хвост типа /hash после ID — игнорируем его)
      const z = u.searchParams.get("z") || "";
      const zm = z.match(/^(?:video|clip)(-?\d+)_(\d+)/);
      if (zm) {
        return `https://vk.com/video_ext.php?oid=${zm[1]}&id=${zm[2]}&hd=2`;
      }
      if (u.pathname.startsWith("/video_ext.php")) return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}
