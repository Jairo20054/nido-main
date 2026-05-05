import React, { useEffect, useRef, useState } from 'react';
import {
  ImagePlus,
  LoaderCircle,
  MoveLeft,
  MoveRight,
  Trash2,
  Video,
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { InlineMessage } from '../../components/ui/InlineMessage';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_COUNT,
  MAX_VIDEO_SIZE,
  buildPendingMediaItem,
  deletePropertyMedia,
  disposeMediaPreview,
  uploadPropertyMedia,
} from './propertyMediaService';

/**
 * Componente de uso para la seccion multimedia del formulario de propiedades.
 * Se monta dentro de `PropertyForm` y encapsula validacion de archivos, previsualizacion,
 * orden manual de imagenes y el manejo de un video opcional.
 */
export function PropertyMediaManager({ media, onChange }) {
  const { user } = useAuth();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const mediaRef = useRef(media);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [workingMediaId, setWorkingMediaId] = useState('');

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(
    () => () => {
      mediaRef.current.forEach((item) => disposeMediaPreview(item));
    },
    []
  );

  const imageItems = media.filter((item) => item.type === 'IMAGE');
  const videoItem = media.find((item) => item.type === 'VIDEO') || null;

  const commitMedia = (nextMedia) => {
    mediaRef.current = nextMedia;
    onChange(nextMedia);
  };

  // Mantiene un unico origen de verdad para posiciones e integridad del arreglo mixto.
  const syncMedia = (images, video = null) => {
    const normalized = [
      ...images.map((item, index) => ({ ...item, position: index })),
      ...(video ? [{ ...video, position: images.length }] : []),
    ];

    commitMedia(normalized);
    return normalized;
  };

  const replaceMediaItem = (mediaId, updater) => {
    const currentImages = mediaRef.current.filter((item) => item.type === 'IMAGE');
    const currentVideo = mediaRef.current.find((item) => item.type === 'VIDEO') || null;
    const nextImages = currentImages.map((item) =>
      item.id === mediaId ? updater(item) : item
    );
    const nextVideo =
      currentVideo?.id === mediaId ? updater(currentVideo) : currentVideo;

    syncMedia(nextImages, nextVideo);
  };

  // Valida tipos/tamanos y agrega multiples imagenes en el orden de seleccion.
  const handleAddImages = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    try {
      if (imageItems.length + files.length > MAX_IMAGE_COUNT) {
        throw new Error(`Puedes subir hasta ${MAX_IMAGE_COUNT} fotos por propiedad.`);
      }

      for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          throw new Error('Solo se permiten imagenes JPG, PNG o WEBP.');
        }

        if (file.size > MAX_IMAGE_SIZE) {
          throw new Error('Cada imagen debe pesar maximo 4 MB.');
        }
      }

      const currentImages = mediaRef.current.filter((item) => item.type === 'IMAGE');
      const currentVideo = mediaRef.current.find((item) => item.type === 'VIDEO') || null;
      const pendingItems = files.map((file, index) =>
        buildPendingMediaItem(file, 'IMAGE', currentImages.length + index)
      );

      syncMedia([...currentImages, ...pendingItems], currentVideo);
      setError('');
      setMessage('Subiendo imagenes...');

      await Promise.all(
        pendingItems.map(async (pendingItem, index) => {
          try {
            const uploaded = await uploadPropertyMedia(files[index], {
              ownerId: user?.id,
              type: 'IMAGE',
            });

            replaceMediaItem(pendingItem.id, (currentItem) => {
              disposeMediaPreview(currentItem);
              return {
                ...currentItem,
                url: uploaded.url,
                storagePath: uploaded.storagePath,
                uploadStatus: 'uploaded',
                isPersisted: false,
              };
            });
          } catch (uploadError) {
            replaceMediaItem(pendingItem.id, (currentItem) => ({
              ...currentItem,
              uploadStatus: 'error',
              uploadError: uploadError.message,
            }));
          }
        })
      );

      const failedUploads = mediaRef.current.filter((item) => item.uploadStatus === 'error').length;
      if (failedUploads) {
        setError('Algunos archivos fallaron. Eliminalos y vuelve a intentarlo.');
        setMessage('');
      } else {
        setMessage('Fotos listas para guardar en la propiedad.');
      }
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
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
      if (videoItem && MAX_VIDEO_COUNT === 1) {
        throw new Error('Solo puedes adjuntar un video por publicacion.');
      }

      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error('El video debe estar en MP4, MOV o WEBM.');
      }

      if (file.size > MAX_VIDEO_SIZE) {
        throw new Error('El video debe pesar maximo 20 MB.');
      }

      const currentImages = mediaRef.current.filter((item) => item.type === 'IMAGE');
      const pendingVideo = buildPendingMediaItem(file, 'VIDEO', currentImages.length);
      syncMedia(currentImages, pendingVideo);
      setError('');
      setMessage('Subiendo video...');

      const uploaded = await uploadPropertyMedia(file, {
        ownerId: user?.id,
        type: 'VIDEO',
      });

      replaceMediaItem(pendingVideo.id, (currentItem) => {
        disposeMediaPreview(currentItem);
        return {
          ...currentItem,
          url: uploaded.url,
          storagePath: uploaded.storagePath,
          uploadStatus: 'uploaded',
          isPersisted: false,
        };
      });

      setMessage('Video listo para guardar.');
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    } finally {
      event.target.value = '';
    }
  };

  const removeMediaItem = async (item) => {
    const currentImages = mediaRef.current.filter((entry) => entry.type === 'IMAGE');
    const currentVideo = mediaRef.current.find((entry) => entry.type === 'VIDEO') || null;

    try {
      setWorkingMediaId(item.id || '');
      if (!item.isPersisted && item.storagePath) {
        await deletePropertyMedia(item.storagePath);
      }

      disposeMediaPreview(item);

      if (item.type === 'VIDEO') {
        syncMedia(currentImages, null);
      } else {
        syncMedia(currentImages.filter((entry) => entry.id !== item.id), currentVideo);
      }

      setError('');
      setMessage(
        item.isPersisted
          ? 'El archivo se quitara de la propiedad cuando guardes los cambios.'
          : item.type === 'VIDEO'
            ? 'Video eliminado.'
            : 'Archivo eliminado.'
      );
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    } finally {
      setWorkingMediaId('');
    }
  };

  // Reordena el carrusel de fotos preservando posiciones consecutivas.
  const moveImage = (index, direction) => {
    const next = [...imageItems];
    const target = index + direction;

    if (target < 0 || target >= next.length) {
      return;
    }

    [next[index], next[target]] = [next[target], next[index]];
    syncMedia(next, videoItem);
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
      <InlineMessage tone="success">{message}</InlineMessage>

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

      <div className="media-toolbar__hint">
        Hasta {MAX_IMAGE_COUNT} fotos en JPG, PNG o WEBP. Video opcional en MP4, MOV o WEBM.
      </div>

      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden multiple onChange={handleAddImages} />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={handleAddVideo} />

      <div className="media-grid">
        {imageItems.map((item, index) => (
          <article key={item.id || `${item.url}-${index}`} className={`media-card media-card--${item.uploadStatus || 'uploaded'}`}>
            <img src={item.url} alt={item.alt || `Imagen ${index + 1}`} className="media-card__preview" />
            <div className="media-card__overlay">
              {item.uploadStatus === 'uploading' ? (
                <span className="media-status-pill media-status-pill--loading">
                  <LoaderCircle size={14} />
                  Subiendo...
                </span>
              ) : item.uploadStatus === 'error' ? (
                <span className="media-status-pill media-status-pill--danger">Error</span>
              ) : (
                <span className="media-status-pill">Lista</span>
              )}
              {index === 0 ? <span className="media-status-pill media-status-pill--accent">Principal</span> : null}
            </div>
            <div className="media-card__actions">
              <span>{item.uploadStatus === 'error' ? item.uploadError || 'Vuelve a subir esta imagen.' : `Foto ${index + 1}`}</span>
              <div className="media-card__buttons">
                <button className="icon-button" type="button" onClick={() => moveImage(index, -1)} disabled={item.uploadStatus === 'uploading'}>
                  <MoveLeft size={14} />
                </button>
                <button className="icon-button" type="button" onClick={() => moveImage(index, 1)} disabled={item.uploadStatus === 'uploading'}>
                  <MoveRight size={14} />
                </button>
                <button className="icon-button icon-button--danger" type="button" onClick={() => removeMediaItem(item)} disabled={workingMediaId === item.id}>
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
        <div className={`video-preview-card video-preview-card--${videoItem.uploadStatus || 'uploaded'}`}>
          <video src={videoItem.url} controls className="video-preview-card__video" />
          <div className="video-preview-card__footer">
            <span>{videoItem.uploadStatus === 'uploading' ? 'Subiendo video...' : videoItem.uploadStatus === 'error' ? videoItem.uploadError || 'Error al subir el video.' : 'Video listo para guardar.'}</span>
            <button
              className="button button--ghost-danger"
              type="button"
              disabled={workingMediaId === videoItem.id}
              onClick={() => removeMediaItem(videoItem)}
            >
              Eliminar video
            </button>
          </div>
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
