import React, { useRef, useState } from 'react';
import { ImagePlus, MoveLeft, MoveRight, Trash2, Video } from 'lucide-react';
import { InlineMessage } from '../../components/ui/InlineMessage';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Convierte archivos locales a data URLs para previsualizacion inmediata sin requerir backend.
const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No fue posible leer el archivo'));
    reader.readAsDataURL(file);
  });

// Normaliza el archivo del navegador al shape esperado por el formulario de propiedades.
const buildMediaItem = async (file, type, position) => ({
  type,
  url: await readFileAsDataUrl(file),
  alt: file.name,
  position,
  mimeType: file.type,
  sizeBytes: file.size,
});

/**
 * Componente de uso para la seccion multimedia del formulario de propiedades.
 * Se monta dentro de `PropertyForm` y encapsula validacion de archivos, previsualizacion,
 * orden manual de imagenes y el manejo de un video opcional.
 */
export function PropertyMediaManager({ media, onChange }) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [error, setError] = useState('');

  const imageItems = media.filter((item) => item.type === 'IMAGE');
  const videoItem = media.find((item) => item.type === 'VIDEO') || null;

  // Mantiene un unico origen de verdad para posiciones e integridad del arreglo mixto.
  const syncMedia = (images, video = videoItem) => {
    const normalized = [
      ...images.map((item, index) => ({ ...item, position: index })),
      ...(video ? [{ ...video, position: images.length }] : []),
    ];
    onChange(normalized);
  };

  // Valida tipos/tamanos y agrega multiples imagenes en el orden de seleccion.
  const handleAddImages = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    try {
      for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          throw new Error('Solo se permiten imagenes JPG, PNG o WEBP');
        }

        if (file.size > MAX_IMAGE_SIZE) {
          throw new Error('Cada imagen debe pesar maximo 4 MB');
        }
      }

      const nextImages = [...imageItems];

      for (const file of files) {
        nextImages.push(await buildMediaItem(file, 'IMAGE', nextImages.length));
      }

      syncMedia(nextImages);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      event.target.value = '';
    }
  };

  // Solo permite un video asociado a la propiedad.
  const handleAddVideo = async (event) => {
    const [file] = Array.from(event.target.files || []);

    if (!file) {
      return;
    }

    try {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error('El video debe estar en MP4, MOV o WEBM');
      }

      if (file.size > MAX_VIDEO_SIZE) {
        throw new Error('El video debe pesar maximo 20 MB');
      }

      const built = await buildMediaItem(file, 'VIDEO', imageItems.length);
      syncMedia(imageItems, built);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      event.target.value = '';
    }
  };

  const removeImage = (index) => {
    syncMedia(imageItems.filter((_, itemIndex) => itemIndex !== index));
  };

  // Reordena el carrusel de fotos preservando posiciones consecutivas.
  const moveImage = (index, direction) => {
    const next = [...imageItems];
    const target = index + direction;

    if (target < 0 || target >= next.length) {
      return;
    }

    [next[index], next[target]] = [next[target], next[index]];
    syncMedia(next);
  };

  return (
    <div className="content-card content-card--compact">
      <div className="section__heading section__heading--tight">
        <div>
          <span className="section__eyebrow">Medios visuales</span>
          <h3>Fotos y video</h3>
        </div>
      </div>

      <p>Necesitas minimo 4 fotos para enviar la publicacion a revision o publicarla.</p>
      <InlineMessage tone="danger">{error}</InlineMessage>

      <div className="media-toolbar">
        <button className="button button--secondary" type="button" onClick={() => imageInputRef.current?.click()}>
          <ImagePlus size={16} />
          Subir fotos
        </button>
        <button className="button button--secondary" type="button" onClick={() => videoInputRef.current?.click()}>
          <Video size={16} />
          Agregar video
        </button>
      </div>

      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden multiple onChange={handleAddImages} />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={handleAddVideo} />

      <div className="media-grid">
        {imageItems.map((item, index) => (
          <article key={`${item.url}-${index}`} className="media-card">
            <img src={item.url} alt={item.alt || `Imagen ${index + 1}`} className="media-card__preview" />
            <div className="media-card__actions">
              <span>Foto {index + 1}</span>
              <div className="media-card__buttons">
                <button className="icon-button" type="button" onClick={() => moveImage(index, -1)}>
                  <MoveLeft size={14} />
                </button>
                <button className="icon-button" type="button" onClick={() => moveImage(index, 1)}>
                  <MoveRight size={14} />
                </button>
                <button className="icon-button icon-button--danger" type="button" onClick={() => removeImage(index)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}

        {!imageItems.length ? (
          <div className="empty-media-card">
            <strong>Aun no has agregado fotos</strong>
            <span>Sube minimo 4 imagenes claras de la vivienda.</span>
          </div>
        ) : null}
      </div>

      {videoItem ? (
        <div className="video-preview-card">
          <video src={videoItem.url} controls className="video-preview-card__video" />
          <button
            className="button button--ghost-danger"
            type="button"
            onClick={() => syncMedia(imageItems, null)}
          >
            Eliminar video
          </button>
        </div>
      ) : (
        <div className="empty-media-card empty-media-card--video">
          <strong>Video opcional</strong>
          <span>Puedes incluir un recorrido corto para mejorar la decision del arrendatario.</span>
        </div>
      )}
    </div>
  );
}
