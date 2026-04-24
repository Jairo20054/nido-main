# NIDO Supabase - Quick Reference Guide

## 🚀 Quick Start

### Initialize Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/backend/types/database'

export const supabase = createClient<Database>(
  'https://hoqcfprckuozcsnwzgei.supabase.co',
  'sb_publishable_Q9naTZLx0fUqmqL4ud6wdA_JEOFKHT4'
)
```

---

## 🔐 Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUpWithPassword({
  email: 'user@example.com',
  password: 'secure_password',
  options: {
    data: {
      first_name: 'John',
      role: 'tenant' // or 'landlord'
    }
  }
})
```

### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure_password'
})
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser()
```

### Get User Profile
```typescript
const { data: profile } = await supabase
  .rpc('get_current_user_profile')
  .single()

// Returns: { id, email, first_name, role, tenant_id, landlord_id }
```

### Logout
```typescript
await supabase.auth.signOut()
```

---

## 👥 User Management

### Get User Role
```typescript
const { data: role } = await supabase
  .rpc('get_user_role', { user_id: userId })
```

### Check if Landlord
```typescript
const { data: isLandlord } = await supabase
  .rpc('is_landlord', { user_id: userId })
```

### Check if Tenant
```typescript
const { data: isTenant } = await supabase
  .rpc('is_tenant', { user_id: userId })
```

### Update Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    first_name: 'Jane',
    phone: '+34612345678',
    bio: 'Software engineer'
  })
  .eq('auth_id', userId)
  .select()
```

---

## 🏠 Properties

### Get Published Properties
```typescript
const { data: properties } = await supabase
  .from('properties')
  .select(`
    *,
    landlords!inner(*),
    property_images(*)
  `)
  .eq('status', 'published')
  .order('created_at', { ascending: false })
```

### Create Property (Landlord)
```typescript
const { data, error } = await supabase
  .from('properties')
  .insert({
    landlord_id: landlordId,
    title: 'Beautiful apartment in downtown',
    description: 'Modern 2BR apartment...',
    property_type: 'apartment',
    address: 'Calle Mayor 123',
    city: 'Madrid',
    country: 'Spain',
    postal_code: '28001',
    bedrooms: 2,
    bathrooms: 1,
    area_m2: 75,
    monthly_rent: 1500,
    security_deposit: 3000,
    status: 'published'
  })
  .select()
```

### Get My Properties (Landlord)
```typescript
const { data: properties } = await supabase
  .from('properties')
  .select('*')
  .eq('landlord_id', landlordId)
```

### Search Properties
```typescript
const { data: properties } = await supabase
  .from('properties')
  .select('*')
  .eq('status', 'published')
  .eq('city', 'Madrid')
  .gte('bedrooms', 2)
  .lte('monthly_rent', 2000)
```

---

## 📱 Applications & Prequalification

### Get Prequalification
```typescript
const { data: prequalResult } = await supabase
  .rpc('calculate_prequalification', {
    p_tenant_id: tenantId,
    p_occupation: 'software_engineer',
    p_monthly_income: 5000,
    p_has_guarantor: false
  })
  .single()

// Returns: { result, classification, score }
// result: 'approved' | 'needs_backup' | 'rejected'
// classification: 'high' | 'medium' | 'low'
// score: 0-100
```

### Create Application
```typescript
const { data, error } = await supabase
  .from('applications')
  .insert({
    property_id: propertyId,
    tenant_id: tenantId,
    landlord_id: landlordId,
    desired_move_in: '2026-06-01',
    lease_months: 12,
    occupants: 2,
    has_pets: false,
    cover_letter: 'We are a quiet couple...'
  })
  .select()
```

### Get My Applications (Tenant)
```typescript
const { data: applications } = await supabase
  .from('applications')
  .select(`
    *,
    properties(title, monthly_rent),
    approval_decisions(*)
  `)
  .eq('tenant_id', tenantId)
  .order('created_at', { ascending: false })
```

### Get Applications (Landlord)
```typescript
const { data: applications } = await supabase
  .from('applications')
  .select(`
    *,
    tenants!inner(*),
    profiles!inner(*),
    approval_decisions(*)
  `)
  .eq('landlord_id', landlordId)
```

### Update Application Status
```typescript
const { data, error } = await supabase
  .from('applications')
  .update({ status: 'approved' })
  .eq('id', applicationId)
  .select()
```

---

## 📄 Documents

### Get Document Requirements
```typescript
const { data: requirements } = await supabase
  .from('document_requirements')
  .select('*')
  .eq('application_id', applicationId)
```

### Upload Document
```typescript
const { data: upload, error } = await supabase
  .from('document_uploads')
  .insert({
    requirement_id: requirementId,
    application_id: applicationId,
    file_url: 'https://storage.example.com/document.pdf',
    file_name: 'employment_letter.pdf',
    file_type: 'application/pdf',
    status: 'uploaded'
  })
  .select()
```

### Get Document Uploads
```typescript
const { data: uploads } = await supabase
  .from('document_uploads')
  .select('*')
  .eq('application_id', applicationId)
```

### Update Document Status (Admin)
```typescript
const { data, error } = await supabase
  .from('document_uploads')
  .update({
    status: 'approved',
    reviewed_by: adminId,
    review_notes: 'All good'
  })
  .eq('id', documentId)
  .select()
```

---

## ✅ Verifications & Approvals

### Create Verification (Admin)
```typescript
const { data, error } = await supabase
  .from('verifications')
  .insert({
    tenant_id: tenantId,
    application_id: applicationId,
    verification_type: 'identity',
    status: 'pending'
  })
  .select()
```

### Update Verification Status
```typescript
const { data, error } = await supabase
  .from('verifications')
  .update({
    status: 'approved',
    verified_by: adminId,
    verified_at: new Date().toISOString()
  })
  .eq('id', verificationId)
  .select()
```

### Create Approval Decision (Admin)
```typescript
const { data, error } = await supabase
  .from('approval_decisions')
  .insert({
    application_id: applicationId,
    tenant_id: tenantId,
    landlord_id: landlordId,
    classification: 'high', // high, medium, low
    approval_status: 'approved', // approved, needs_backup, rejected
    reasoning: 'Excellent credit score and stable income'
  })
  .select()
```

### Get Approval Decision
```typescript
const { data: approval } = await supabase
  .from('approval_decisions')
  .select('*')
  .eq('application_id', applicationId)
  .single()
```

---

## 📋 Contracts

### Create Contract (Admin)
```typescript
const { data, error } = await supabase
  .from('contracts')
  .insert({
    application_id: applicationId,
    property_id: propertyId,
    landlord_id: landlordId,
    tenant_id: tenantId,
    rent_amount: 1500,
    security_deposit: 3000,
    lease_start_date: '2026-06-01',
    lease_end_date: '2027-05-31',
    duration_months: 12,
    status: 'draft',
    terms_and_conditions: 'Lorem ipsum...'
  })
  .select()
```

### Add Contract Party
```typescript
const { data, error } = await supabase
  .from('contract_parties')
  .insert({
    contract_id: contractId,
    profile_id: profileId,
    party_type: 'tenant', // tenant, landlord, guarantor
    signature_status: 'pending'
  })
  .select()
```

### Get Contract
```typescript
const { data: contract } = await supabase
  .from('contracts')
  .select(`
    *,
    contract_parties(*),
    signatures(*)
  `)
  .eq('id', contractId)
  .single()
```

### Get My Contracts (Tenant)
```typescript
const { data: contracts } = await supabase
  .from('contracts')
  .select(`
    *,
    properties(title)
  `)
  .eq('tenant_id', tenantId)
```

---

## ✍️ Signatures

### Sign Contract
```typescript
const { data, error } = await supabase
  .from('signatures')
  .insert({
    contract_id: contractId,
    party_id: partyId,
    signer_id: signerProfileId,
    signature_type: 'digital',
    signature_image_url: 'https://storage.example.com/signature.png',
    status: 'signed'
  })
  .select()
```

### Get Signature Status
```typescript
const { data: signatures } = await supabase
  .from('signatures')
  .select('*')
  .eq('contract_id', contractId)
```

---

## 💰 Payments

### Record Payment
```typescript
const { data, error } = await supabase
  .from('payments')
  .insert({
    contract_id: contractId,
    tenant_id: tenantId,
    landlord_id: landlordId,
    payment_type: 'first_payment', // first_payment, deposit, monthly_rent
    amount: 1500,
    due_date: '2026-06-01',
    status: 'pending'
  })
  .select()
```

### Update Payment Status
```typescript
const { data, error } = await supabase
  .from('payments')
  .update({
    status: 'released',
    paid_date: new Date().toISOString()
  })
  .eq('id', paymentId)
  .select()
```

### Get Payment History
```typescript
const { data: payments } = await supabase
  .from('payments')
  .select('*')
  .eq('contract_id', contractId)
  .order('due_date', { ascending: false })
```

### Release Payout (Admin)
```typescript
const { data, error } = await supabase
  .from('payout_releases')
  .insert({
    contract_id: contractId,
    landlord_id: landlordId,
    total_amount: 15000,
    status: 'released'
  })
  .select()
```

---

## 📦 Delivery

### Create Checklist
```typescript
const { data, error } = await supabase
  .from('delivery_checklists')
  .insert({
    contract_id: contractId,
    property_id: propertyId,
    checklist_type: 'move_in', // move_in, move_out
    created_by: creatorProfileId,
    status: 'pending'
  })
  .select()
```

### Add Inventory Item
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .insert({
    checklist_id: checklistId,
    item_name: 'Refrigerator',
    item_description: 'White fridge in kitchen',
    condition: 'good',
    quantity: 1
  })
  .select()
```

### Upload Delivery Image
```typescript
const { data, error } = await supabase
  .from('delivery_images')
  .insert({
    checklist_id: checklistId,
    image_url: 'https://storage.example.com/move_in.jpg',
    description: 'Overall apartment condition',
    taken_by: profileId
  })
  .select()
```

### Complete Checklist
```typescript
const { data, error } = await supabase
  .from('delivery_checklists')
  .update({
    status: 'completed',
    confirmed_by: confirmingProfileId,
    confirmed_at: new Date().toISOString()
  })
  .eq('id', checklistId)
  .select()
```

---

## 🔔 Notifications

### Send Notification
```typescript
const { data, error } = await supabase
  .rpc('send_notification', {
    p_recipient_id: recipientProfileId,
    p_title: 'Application Approved!',
    p_message: 'Your application has been approved',
    p_notification_type: 'success',
    p_action_url: '/applications/123'
  })
```

### Get My Notifications
```typescript
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('recipient_id', profileId)
  .eq('is_read', false)
  .order('created_at', { ascending: false })
```

### Mark Notification as Read
```typescript
const { data, error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('id', notificationId)
  .select()
```

---

## 📊 Admin Features

### Get Pending Verifications
```typescript
const { data: pending } = await supabase
  .from('verifications')
  .select(`
    *,
    tenants(*),
    applications(*)
  `)
  .eq('status', 'pending')
  .order('created_at', { ascending: true })
```

### Get Audit Log
```typescript
const { data: logs } = await supabase
  .from('audit_logs')
  .select('*')
  .eq('entity_type', 'application')
  .order('created_at', { ascending: false })
  .limit(50)
```

### Dashboard Statistics
```typescript
// Get application stats
const { data: appStats } = await supabase
  .from('applications')
  .select('status, count()', { count: 'exact' })
  .groupBy('status')

// Get payment stats
const { data: paymentStats } = await supabase
  .from('payments')
  .select('status, sum(amount)')
  .groupBy('status')
```

---

## 🎯 Favorites

### Add to Favorites
```typescript
const { data, error } = await supabase
  .from('favorites')
  .insert({
    tenant_id: tenantId,
    property_id: propertyId
  })
  .select()
```

### Remove from Favorites
```typescript
const { error } = await supabase
  .from('favorites')
  .delete()
  .match({ tenant_id: tenantId, property_id: propertyId })
```

### Get My Favorites
```typescript
const { data: favorites } = await supabase
  .from('favorites')
  .select(`
    *,
    properties(*)
  `)
  .eq('tenant_id', tenantId)
```

---

## ⚠️ Error Handling

```typescript
const { data, error } = await supabase
  .from('applications')
  .insert({ /* ... */ })

if (error) {
  console.error('Error creating application:', error.message)
  console.error('Error code:', error.code)
  console.error('Error details:', error.details)
  
  // Common errors:
  // PGRST116 - RLS violation (no SELECT policy)
  // 23505 - Unique constraint violation
  // 23503 - Foreign key violation
}
```

---

## 🔄 Real-time Subscriptions

```typescript
// Listen for contract changes
const subscription = supabase
  .from('contracts')
  .on('*', (payload) => {
    console.log('Contract changed:', payload)
  })
  .subscribe()

// Listen for notifications
supabase
  .from(`notifications:recipient_id=eq.${profileId}`)
  .on('INSERT', (payload) => {
    console.log('New notification:', payload.new)
  })
  .subscribe()

// Unsubscribe
subscription.unsubscribe()
```

---

## 💡 Best Practices

### 1. Always Check Auth
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')
```

### 2. Handle Errors
```typescript
const { data, error } = await supabase.from('table').select()
if (error) throw error
```

### 3. Use Transactions (for admin operations)
```typescript
const { data: result, error } = await supabase.rpc('transaction_function')
if (error) throw error
```

### 4. Load Relations Efficiently
```typescript
// ✅ Good - load what you need
const { data } = await supabase
  .from('applications')
  .select('*, properties(title)')
  .single()

// ❌ Avoid - unnecessary relations
const { data } = await supabase
  .from('applications')
  .select('*')
  .single()
```

### 5. Filter on Server
```typescript
// ✅ Good - filter in query
const { data } = await supabase
  .from('properties')
  .select('*')
  .eq('city', 'Madrid')

// ❌ Avoid - filter in app
const { data } = await supabase
  .from('properties')
  .select('*')

const filtered = data.filter(p => p.city === 'Madrid')
```

---

**Version**: 1.0.0
**Last Updated**: 2026-04-24
