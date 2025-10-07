# Nido Media Backend

Complete backend service for uploading, processing, and serving real images and videos for the Nido rental social network.

## Features

- **Upload Methods**: Presigned URLs (S3-compatible) and direct multipart/form-data
- **Media Processing**: Thumbnails for images, transcoding to MP4/WebM + poster frames for videos
- **Storage**: AWS S3, DigitalOcean Spaces, or MinIO (local)
- **Background Jobs**: BullMQ + Redis for heavy processing
- **Security**: Virus scanning with ClamAV, MIME type validation, size limits
- **Permissions**: Property owner access control
- **CDN Ready**: Signed URLs with configurable expiration

## Tech Stack

- **Language**: TypeScript (Node.js 18+)
- **Framework**: Fastify
- **ORM**: Prisma + PostgreSQL
- **Queue**: BullMQ + Redis
- **Storage**: AWS SDK (S3-compatible)
- **Processing**: FFmpeg (videos) + Sharp (images)
- **Security**: ClamAV for virus scanning
- **Testing**: Jest + Supertest

## Quick Start (Local Development)

1. **Clone and setup**:
   ```bash
   git clone <repo>
   cd nido-main
   cp .env.example .env
   ```

2. **Start services**:
   ```bash
   docker-compose up --build -d
   ```

3. **Install dependencies**:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run the app**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:4000`.

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection
- `S3_*`: Storage configuration (use MinIO for local)
- `JWT_SECRET`: For authentication
- `MAX_IMAGE_SIZE_BYTES`: Default 10MB
- `MAX_VIDEO_SIZE_BYTES`: Default 500MB

## API Endpoints

### Upload Flow

1. **Initiate Upload**
   ```
   POST /api/properties/:propertyId/media/initiate
   Body: { filename, mimeType, size, kind: "image"|"video" }
   Response: { uploadUrl, uploadKey, uploadMethod, tempId }
   ```

2. **Complete Upload**
   ```
   POST /api/properties/:propertyId/media/complete
   Body: { tempId, uploadKey }
   Response: { mediaId, status: "processing" }
   ```

### Direct Upload
```
POST /api/properties/:propertyId/media
Content-Type: multipart/form-data
Body: file + fields
```

### Media Management
```
GET /api/properties/:propertyId/media
GET /api/media/:mediaId
DELETE /api/media/:mediaId
```

### Admin
```
POST /admin/media/:mediaId/reprocesar
GET /admin/queue/status
```

## Example cURL Commands

**Initiate image upload**:
```bash
curl -X POST http://localhost:4000/api/properties/123/media/initiate \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"filename":"vacation.jpg","mimeType":"image/jpeg","size":2048000,"kind":"image"}'
```

**Upload to presigned URL**:
```bash
curl -X PUT "PRESIGNED_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @vacation.jpg
```

**Complete upload**:
```bash
curl -X POST http://localhost:4000/api/properties/123/media/complete \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"tempId":"temp-uuid","uploadKey":"123/temp-uuid/vacation.jpg"}'
```

**Get media list**:
```bash
curl -X GET http://localhost:4000/api/properties/123/media \
  -H "Authorization: Bearer YOUR_JWT"
```

## Testing

Run unit tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## Production Deployment

1. **Database**: Use RDS PostgreSQL or similar
2. **Redis**: ElastiCache or managed Redis
3. **Storage**: AWS S3 or DigitalOcean Spaces
4. **Worker**: Run separate worker process/container
5. **ClamAV**: Run ClamAV daemon service
6. **SSL**: Configure HTTPS with certbot/letsencrypt

Example docker-compose.prod.yml:
```yaml
version: '3.8'
services:
  app:
    image: nido-media:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      # ... other env vars
    ports:
      - "80:4000"
  worker:
    image: nido-media-worker:latest
    environment:
      - NODE_ENV=production
      # ... env vars
```

## Security Notes

- All uploads are scanned for viruses
- MIME types are validated server-side
- File sizes are enforced
- Signed URLs prevent unauthorized access
- Property ownership is verified for all operations
- Rate limiting recommended for production

## Limitations

- Video processing is CPU-intensive; scale workers accordingly
- ClamAV scanning adds latency; consider async scanning for large files
- No built-in CDN; integrate with CloudFront or similar
- Admin endpoints lack authentication (add middleware)

## Development

- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Migrations**: `npx prisma migrate dev`
- **Seed**: `npx prisma db seed`

## Contributing

1. Fork the repo
2. Create feature branch
3. Add tests
4. Submit PR

## License

MIT
