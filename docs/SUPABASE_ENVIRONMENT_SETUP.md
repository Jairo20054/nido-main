# NIDO Backend - Guia de configuracion del entorno

## 🔧 Archivos de configuracion

### 1. Backend Environment Variables (`.env.local`)

```bash
# Supabase Configuration
SUPABASE_URL=https://hoqcfprckuozcsnwzgei.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_Q9naTZLx0fUqmqL4ud6wdA_JEOFKHT4

# For backend operations only (NEVER expose to frontend)
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Application Configuration
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Stripe (when implemented)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (for notifications)
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@nido.com

# SMS (optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1234567890

# Admin Credentials
ADMIN_EMAIL=admin@nido.local
ADMIN_PASSWORD=CHANGE_ME_IN_PRODUCTION

# Feature Flags
ENABLE_STRIPE_INTEGRATION=false
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_EMAIL_NOTIFICATIONS=true
```

### 2. Frontend Environment Variables (`.env`)

```bash
# Supabase - PUBLIC KEYS ONLY
VITE_SUPABASE_URL=https://hoqcfprckuozcsnwzgei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcWNmcHJja3VvemNzbnd6Z2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDQ5ODAsImV4cCI6MjA5MjM4MDk4MH0.REZoC3R91W1xWMQHdUOt5ejM_XkivH4wtP-a9Ac3RJ8

# API Configuration
VITE_API_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### 3. TypeScript Configuration

**`tsconfig.json`** - Already configured, no changes needed.

**`tsconfig.build.json`** - For production builds:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "skipLibCheck": true,
    "sourceMap": false,
    "declaration": true
  },
  "include": ["backend/src"],
  "exclude": ["backend/src/**/*.test.ts", "node_modules"]
}
```

---

## 🚀 Instalacion y configuracion

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment
```bash
# Copy template
cp .env.example .env.local

# Edit with your Supabase keys
nano .env.local
```

### Step 3: Generate TypeScript Types
```bash
npm run prisma:generate
```

Or if using Supabase CLI:
```bash
supabase gen types typescript --project-id hoqcfprckuozcsnwzgei
```

### Step 4: Run Migrations (if needed)
```bash
# Using Supabase CLI
supabase migration list

# Migrations are already applied!
```

### Step 5: Start Development
```bash
# Start both frontend and backend
npm run dev

# Or separate:
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3000
```

---

## 📚 Actualizacion del esquema de base de datos

### To Apply Changes to Supabase

**Method 1: Using Supabase CLI** (Recommended)
```bash
# Create a new migration
supabase migration new create_new_table

# Edit the migration file
vim supabase/migrations/[timestamp]_create_new_table.sql

# Apply to local development
supabase db reset

# Push to production (with confirmation)
supabase db push --remote
```

**Method 2: Direct SQL Execution**
```bash
# Using supabase CLI
supabase db query

# Or using psql directly
psql postgresql://postgres:password@db.hoqcfprckuozcsnwzgei.supabase.co:5432/postgres
```

**Method 3: Supabase Dashboard**
```
1. Go to https://supabase.com/dashboard/project/hoqcfprckuozcsnwzgei/sql
2. Click "New Query"
3. Paste your SQL
4. Execute
```

---

## 🔑 Gestion de claves de Supabase

### Development Keys (SAFE to expose)
- ✅ `SUPABASE_URL` - Project URL
- ✅ `SUPABASE_PUBLISHABLE_KEY` / Anon Key - Public key with limited permissions
- ✅ TypeScript types - Safe to commit

### Production Keys (NEVER expose)
- ❌ `SUPABASE_SERVICE_KEY` - Super admin key
- ❌ `.env.local` - Keep private
- ❌ Database password

### How to Get Keys
```
1. Go to https://supabase.com/dashboard/project/hoqcfprckuozcsnwzgei/settings/api
2. Copy the values:
   - Project URL → SUPABASE_URL
   - Publishable key → SUPABASE_ANON_KEY
   - Service role key → SUPABASE_SERVICE_KEY
```

### Rotate Keys (If Compromised)
```
1. Go to API settings
2. Click "Regenerate" on the compromised key
3. Update .env.local and restart services
4. Test connections
```

---

## 🗄️ PostgreSQL Connection

### Connect with psql
```bash
# Via URL
psql "postgresql://postgres:PASSWORD@db.hoqcfprckuozcsnwzgei.supabase.co:5432/postgres"

# Or individually
psql -h db.hoqcfprckuozcsnwzgei.supabase.co \
     -U postgres \
     -d postgres \
     -p 5432
```

### Common psql Commands
```sql
-- List all tables
\dt

-- Describe table structure
\d table_name

-- List all schemas
\dn

-- Execute file
\i /path/to/file.sql

-- Show current user
SELECT current_user;

-- Quit
\q
```

---

## 🧪 Pruebas de conexion con Supabase

### Test Backend Connection
```bash
curl http://localhost:3000/health
# Should return: {"success":true,"status":"ok","timestamp":"..."}
```

### Test Auth
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hoqcfprckuozcsnwzgei.supabase.co',
  'sb_publishable_Q9naTZLx0fUqmqL4ud6wdA_JEOFKHT4'
)

// Try to get user
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
```

### Test Database Query
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)

console.log('Profiles:', data)
console.log('Error:', error)
```

---

## 🔄 Supabase CLI Commands

### Autenticacion
```bash
# Login to Supabase
supabase login

# Logout
supabase logout

# Show current user
supabase projects list
```

### Database
```bash
# Reset local database (DESTRUCTIVE)
supabase db reset

# List migrations
supabase migration list

# Create new migration
supabase migration new migration_name

# Push migrations to production
supabase db push --remote

# Pull remote schema changes
supabase db pull --remote
```

### Secrets
```bash
# List all secrets
supabase secrets list

# Set a secret
supabase secrets set SECRET_NAME=value

# Delete a secret
supabase secrets unset SECRET_NAME
```

### Local Development
```bash
# Start local Supabase stack
supabase start

# Stop local Supabase
supabase stop

# View logs
supabase logs --db

# Estado
supabase status
```

---

## 🐛 Troubleshooting

### Connection Refused
```bash
# Check if backend is running
lsof -i :3000

# Check Supabase status
supabase status

# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_PUBLISHABLE_KEY
```

### RLS Policy Violations
```
Error: PGRST116 - Attempted to read from public.table without permission

→ User doesn't have SELECT policy
→ Check RLS policies in Supabase dashboard
→ Verify auth.uid() is set correctly
```

### Autenticacion Issues
```
Error: Invalid API key

→ Check SUPABASE_PUBLISHABLE_KEY is correct
→ Verify key has required scopes
→ Try rotating keys
→ Clear browser cache and session
```

### Database Connection Issues
```
Error: connect ECONNREFUSED

→ Verify SUPABASE_URL is accessible
→ Check firewall settings
→ Verify database is not in pause state
→ Check if IP is whitelisted (if applicable)
```

### Performance Issues
```
Query slow?

1. Check indexes: SELECT * FROM pg_indexes WHERE tablename = 'table_name';
2. Check query plan: EXPLAIN ANALYZE SELECT ...;
3. Check database size: SELECT pg_size_pretty(pg_database_size('dbname'));
4. Monitor with: SELECT * FROM pg_stat_statements;
```

---

## 📊 Monitoring & Logging

### Supabase Dashboard
```
https://supabase.com/dashboard/project/hoqcfprckuozcsnwzgei
- Logs: Database, API, Edge Functions, Auth
- Storage: Usage, bandwidth
- Backups: Automated daily backups
```

### Backend Logs
```bash
# Start with logs
npm run dev 2>&1 | tee app.log

# View specific logs
grep "error" app.log
grep "ERROR" app.log
grep "WARN" app.log
```

### Database Queries
```sql
-- View slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

-- View table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 🔐 Checklist de seguridad

- [ ] All environment secrets in `.env.local` (not committed)
- [ ] `.env.local` added to `.gitignore`
- [ ] Service key only used in backend
- [ ] Publishable key used in frontend
- [ ] RLS enabled on all tables
- [ ] Policies verified for each role
- [ ] No sensitive data in logs
- [ ] Audit logging enabled
- [ ] Regular backups configured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTPS enforced in production

---

## 📝 Checklist de despliegue

### Before Production Deploy

- [ ] Environment variables set
- [ ] Migrations applied
- [ ] RLS policies verified
- [ ] Audit logging working
- [ ] Backups configured
- [ ] Error monitoring enabled
- [ ] API keys rotated
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Monitoring alerts set
- [ ] Documentation updated
- [ ] Tested end-to-end flows

---

## 🚀 Configuracion de produccion

### Environment Variables (Production)
```bash
NODE_ENV=production
SUPABASE_URL=https://hoqcfprckuozcsnwzgei.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_Q9naTZLx0fUqmqL4ud6wdA_JEOFKHT4
SUPABASE_SERVICE_KEY=prod_service_key_here
CLIENT_URL=https://nido.com
PORT=3000
LOG_LEVEL=warn
```

### SSL/TLS Certificate
```bash
# Using Let's Encrypt
certbot certonly --standalone -d nido.com -d www.nido.com

# Update nginx/reverse proxy with certificate path
```

### Database Backups
```bash
# Supabase provides daily automated backups
# Access at: https://supabase.com/dashboard/project/hoqcfprckuozcsnwzgei/database/backups

# To restore from backup
1. Go to Backups
2. Click "Restore" on desired backup
3. Wait for restoration (downtime!)
```

---

**Ultima actualizacion**: 2026-04-24
**Version**: 1.0.0

