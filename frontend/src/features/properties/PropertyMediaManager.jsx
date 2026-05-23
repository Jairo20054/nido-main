import React, { useEffect, useRef, useState } from 'react';
import {
  ImagePlus,
  Link2,
  LoaderCircle,
  MoveLeft,
  MoveRight,
  RotateCcw,
  Star,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react';
import { useAuth } from '../../app/providers/useAuth';
import { InlineMessage } from '../../components/ui/InlineMessage';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  EXTERNAL_VIDEO_MIME_TYPE,
  EXTERNAL_VIDEO_URL_PATTERN,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_COUNT,
  MAX_VIDEO_SIZE,
  MIN_IMAGE_COUNT_TO_PUBLISH,
  buildExternalVideoMediaItem,
  buildPendingMediaItem,
  deletePropertyMedia,
  disposeMediaPreview,
  uploadPropertyMedia,
} from './propertyMediaService';

const formatFileSize = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;
const isExternalVideoItem = (item) => item?.mimeType === EXTERNAL_VIDEO_MIME_TYPE;

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
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

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
  const processImageFiles = async (files) => {
    if (!files.length) {
      return;
    }

    try {
      const currentImages = mediaRef.current.filter((item) => item.type === 'IMAGE');
      const currentVideo = mediaRef.current.find((item) => item.type === 'VIDEO') || null;

      if (currentImages.length + files.length > MAX_IMAGE_COUNT) {
        throw new Error(`Puedes agregar hasta ${MAX_IMAGE_COUNT} imágenes por propiedad.`);
      }

      for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          throw new Error('Solo se permiten imágenes JPG, PNG o WebP.');
        }

        if (file.size > MAX_IMAGE_SIZE) {
          throw new Error(`Cada imagen debe pesar máximo ${formatFileSize(MAX_IMAGE_SIZE)}.`);
        }
      }

      const pendingItems = files.map((file, index) =>
        buildPendingMediaItem(file, 'IMAGE', currentImages.length + index)
      );

      syncMedia([...currentImages, ...pendingItems], currentVideo);
      setError('');
      setMessage('Cargando imágenes...');

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
                sourceFile: null,
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
        setError('No pudimos cargar una o más imágenes. Revisa el formato o el tamaño del archivo e inténtalo nuevamente.');
        setMessage('');
      } else {
        setMessage('Las imágenes se cargaron correctamente.');
      }
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    }
  };

  const handleAddImages = async (event) => {
    try {
      await processImageFiles(Array.from(event.target.files || []));
    } finally {
      event.target.value = '';
    }
  };

  const handleImageDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    await processImageFiles(Array.from(event.dataTransfer.files || []));
  };

  // Solo permite un video asociado a la propiedad.
  const handleAddVideo = async (event) => {
    const [file] = Array.from(event.target.files || []);

    if (!file) {
      return;
    }

    try {
      if (videoItem && MAX_VIDEO_COUNT === 1) {
        throw new Error('Solo puedes agregar un video por publicación.');
      }

      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error('El video debe estar en MP4 o WebM.');
      }

      if (file.size > MAX_VIDEO_SIZE) {
        throw new Error(`El video debe pesar máximo ${formatFileSize(MAX_VIDEO_SIZE)}.`);
      }

      const currentImages = mediaRef.current.filter((item) => item.type === 'IMAGE');
      const pendingVideo = buildPendingMediaItem(file, 'VIDEO', currentImages.length);
      syncMedia(currentImages, pendingVideo);
      setError('');
      setMessage('Cargando video...');

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
          sourceFile: null,
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

  const handleAddVideoUrl = () => {
    try {
      const normalizedUrl = videoUrl.trim();

      if (!normalizedUrl) {
        return;
      }

      if (videoItem && MAX_VIDEO_COUNT === 1) {
        throw new Error('Solo puedes agregar un video por publicación.');
      }

      if (!EXTERNAL_VIDEO_URL_PATTERN.test(normalizedUrl)) {
        throw new Error('El enlace de video debe ser de YouTube o Vimeo y comenzar con https://.');
      }

      const currentImages = mediaRef.current.filter((item) => item.type === 'IMAGE');
      syncMedia(currentImages, buildExternalVideoMediaItem(normalizedUrl, currentImages.length));
      setVideoUrl('');
      setError('');
      setMessage('El enlace de video quedó listo para guardar.');
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    }
  };

  const retryUpload = async (item) => {
    if (!item.sourceFile) {
      setError('Selecciona el archivo nuevamente para reintentar la carga.');
      return;
    }

    try {
      setWorkingMediaId(item.id || '');
      replaceMediaItem(item.id, (currentItem) => ({
        ...currentItem,
        uploadStatus: 'uploading',
        uploadError: '',
      }));

      const uploaded = await uploadPropertyMedia(item.sourceFile, {
        ownerId: user?.id,
        type: item.type,
      });

      replaceMediaItem(item.id, (currentItem) => {
        disposeMediaPreview(currentItem);
        return {
          ...currentItem,
          url: uploaded.url,
          storagePath: uploaded.storagePath,
          uploadStatus: 'uploaded',
          uploadError: '',
          isPersisted: false,
          sourceFile: null,
        };
      });

      setError('');
      setMessage(item.type === 'VIDEO' ? 'El video se cargó correctamente.' : 'La imagen se cargó correctamente.');
    } catch (requestError) {
      replaceMediaItem(item.id, (currentItem) => ({
        ...currentItem,
        uploadStatus: 'error',
        uploadError: requestError.message,
      }));
      setError(requestError.message);
      setMessage('');
    } finally {
      setWorkingMediaId('');
    }
  };

  const removeMediaItem = async (item) => {
    const confirmed = window.confirm(
      item.type === 'VIDEO'
        ? '¿Quieres eliminar este video de la propiedad?'
        : '¿Quieres eliminar esta imagen de la propiedad?'
    );

    if (!confirmed) {
      return;
    }

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
          ? 'El archivo se quitará de la propiedad cuando guardes los cambios.'
          : item.type === 'VIDEO'
            ? 'Video eliminado.'
            : 'Imagen eliminada.'
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

  const markAsCover = (index) => {
    if (index <= 0) {
      return;
    }

    const next = [...imageItems];
    const [selected] = next.splice(index, 1);
    syncMedia([selected, ...next], videoItem);
    setMessage('Imagen principal actualizada.');
  };

  return (
    <div className="media-panel">
      <div className="section__heading section__heading--tight">
        <div>
          <span className="section__eyebrow">Medios visuales</span>
          <h3>Imágenes y video de la propiedad</h3>
          <p>
            Agrega fotos claras de los espacios principales y, si lo deseas, un video corto para
            que los interesados conozcan mejor la vivienda.
          </p>
        </div>
      </div>

      <p>
        Recomendamos subir al menos 5 imágenes: fachada, sala, cocina, habitaciones y baños. Para
        enviar la publicación necesitas mínimo {MIN_IMAGE_COUNT_TO_PUBLISH}.
      </p>
      <InlineMessage tone="danger">{error}</InlineMessage>
      <InlineMessage tone="success">{message}</InlineMessage>

      <div
        className={`media-dropzone ${isDragging ? 'media-dropzone--active' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleImageDrop}
      >
        <UploadCloud size={24} />
        <strong>{imageItems.length ? `${imageItems.length} imagenes cargadas` : 'Aun no has agregado imagenes'}</strong>
        <span>
          {imageItems.length
            ? 'Puedes arrastrar mas fotos o agregarlas desde tu equipo.'
            : 'Arrastra tus fotos aqui o usa el boton para seleccionarlas desde tu equipo.'}
        </span>
        <button className="button button--secondary" type="button" onClick={() => imageInputRef.current?.click()}>
          <ImagePlus size={16} />
          Seleccionar imágenes
        </button>
      </div>

      <div className="media-toolbar">
        <button className="button button--secondary" type="button" onClick={() => imageInputRef.current?.click()}>
          <ImagePlus size={16} />
          Agregar imágenes
        </button>
        <button className="button button--secondary" type="button" onClick={() => videoInputRef.current?.click()}>
          <Video size={16} />
          Agregar video de la propiedad
        </button>
      </div>

      <div className="media-toolbar__hint">
        Máximo {MAX_IMAGE_COUNT} imágenes en JPG, PNG o WebP. Cada imagen puede pesar hasta{' '}
        {formatFileSize(MAX_IMAGE_SIZE)}. El video opcional puede estar en MP4, WebM o como enlace
        de YouTube/Vimeo.
      </div>

      <div className="video-link-row">
        <div className="field-group">
          <label htmlFor="propertyVideoUrl">Enlace de video</label>
          <input
            id="propertyVideoUrl"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={Boolean(videoItem)}
          />
        </div>
        <button className="button button--secondary" type="button" onClick={handleAddVideoUrl} disabled={Boolean(videoItem)}>
          <Link2 size={16} />
          Usar enlace
        </button>
      </div>

      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden multiple onChange={handleAddImages} />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" hidden onChange={handleAddVideo} />

      <div className="media-grid">
        {imageItems.map((item, index) => (
          <article key={item.id || `${item.url}-${index}`} className={`media-card media-card--${item.uploadStatus || 'uploaded'}`}>
            <img src={item.url} alt={item.alt || `Imagen ${index + 1}`} className="media-card__preview" />
            <div className="media-card__overlay">
              {item.uploadStatus === 'uploading' ? (
                <span className="media-status-pill media-status-pill--loading">
                  <LoaderCircle size={14} />
                  Cargando...
                </span>
              ) : item.uploadStatus === 'error' ? (
                <span className="media-status-pill media-status-pill--danger">Error</span>
              ) : (
                <span className="media-status-pill">Lista</span>
              )}
              {index === 0 ? <span className="media-status-pill media-status-pill--accent">Principal</span> : null}
            </div>
            <div className="media-card__progress" aria-hidden="true">
              <span style={{ width: item.uploadStatus === 'uploading' ? '56%' : item.uploadStatus === 'error' ? '100%' : '100%' }} />
            </div>
            <div className="media-card__actions">
              <span>{item.uploadStatus === 'error' ? item.uploadError || 'Vuelve a cargar esta imagen.' : `Imagen ${index + 1}`}</span>
              <div className="media-card__buttons">
                {item.uploadStatus === 'error' ? (
                  <button className="icon-button" type="button" onClick={() => retryUpload(item)} disabled={workingMediaId === item.id} aria-label="Reintentar carga">
                    <RotateCcw size={14} />
                  </button>
                ) : null}
                <button className="icon-button" type="button" onClick={() => markAsCover(index)} disabled={index === 0 || item.uploadStatus === 'uploading'} aria-label="Marcar como portada">
                  <Star size={14} />
                </button>
                <button className="icon-button" type="button" onClick={() => moveImage(index, -1)} disabled={item.uploadStatus === 'uploading'} aria-label="Mover a la izquierda">
                  <MoveLeft size={14} />
                </button>
                <button className="icon-button" type="button" onClick={() => moveImage(index, 1)} disabled={item.uploadStatus === 'uploading'} aria-label="Mover a la derecha">
                  <MoveRight size={14} />
                </button>
                <button className="icon-button icon-button--danger" type="button" onClick={() => removeMediaItem(item)} disabled={workingMediaId === item.id} aria-label="Eliminar imagen">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}

        {!imageItems.length ? (
          <div className="empty-media-card">
            <strong>Aún no has agregado imágenes</strong>
            <span>Sube fotos de buena calidad para aumentar la confianza de los interesados.</span>
          </div>
        ) : null}
      </div>

      {videoItem ? (
        <div className={`video-preview-card video-preview-card--${videoItem.uploadStatus || 'uploaded'}`}>
          {isExternalVideoItem(videoItem) ? (
            <a className="video-preview-card__external" href={videoItem.url} target="_blank" rel="noreferrer">
              <Link2 size={18} />
              Ver video externo
            </a>
          ) : (
            <video src={videoItem.url} controls className="video-preview-card__video" />
          )}
          <div className="video-preview-card__footer">
            <span>{videoItem.uploadStatus === 'uploading' ? 'Cargando video...' : videoItem.uploadStatus === 'error' ? videoItem.uploadError || 'No pudimos cargar el video.' : 'Video listo para guardar.'}</span>
            {videoItem.uploadStatus === 'error' ? (
              <button
                className="button button--secondary"
                type="button"
                disabled={workingMediaId === videoItem.id}
                onClick={() => retryUpload(videoItem)}
              >
                <RotateCcw size={16} />
                Reintentar
              </button>
            ) : null}
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
          <span>Puedes subir un video corto o pegar un enlace de YouTube o Vimeo.</span>
        </div>
      )}
    </div>
  );
}
