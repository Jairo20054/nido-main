export const APPLICATION_STEPS = [
  { key: 'start', label: 'Resumen' },
  { key: 'prequal', label: 'Precalificacion' },
  { key: 'documents', label: 'Documentos' },
  { key: 'review', label: 'Revision' },
  { key: 'contract', label: 'Contrato' },
  { key: 'payment', label: 'Pago' },
  { key: 'move-in', label: 'Entrega' },
];

export const OCCUPATION_OPTIONS = [
  {
    value: 'EMPLOYEE',
    label: 'Empleado',
    description: 'Ingreso estable con carta laboral y desprendibles.',
  },
  {
    value: 'INDEPENDENT',
    label: 'Independiente',
    description: 'Ingreso variable con soportes y extractos.',
  },
  {
    value: 'STUDENT',
    label: 'Estudiante',
    description: 'Con acudiente o respaldo para continuar.',
  },
  {
    value: 'PENSIONER',
    label: 'Pensionado',
    description: 'Ingreso recurrente validado con soportes.',
  },
  {
    value: 'FOREIGNER',
    label: 'Extranjero',
    description: 'Documento valido y soporte migratorio si aplica.',
  },
];

export const BACKUP_OPTIONS = [
  { value: 'NONE', label: 'Aun no', description: 'Quiero ver primero si puedo continuar.' },
  { value: 'CO_SIGNER', label: 'Codeudor', description: 'Otra persona respalda la solicitud.' },
  { value: 'INSURANCE', label: 'Poliza', description: 'Prefiero respaldo con garantia o poliza.' },
  { value: 'GUARANTOR', label: 'Garantia', description: 'Tengo otra alternativa de respaldo.' },
];

export const PREQUAL_RESULT_CONTENT = {
  eligible: {
    badge: 'Apto para continuar',
    title: 'Puedes avanzar con este inmueble',
    description:
      'Tu informacion inicial se ve alineada con este canon. El siguiente paso es validar documentos.',
    tone: 'success',
  },
  eligible_with_backup: {
    badge: 'Apto con respaldo',
    title: 'Puedes continuar con una condicion clara',
    description:
      'Tu perfil puede seguir, pero necesitaremos un respaldo para estandarizar el riesgo.',
    tone: 'warning',
  },
  not_eligible: {
    badge: 'No apto para este inmueble',
    title: 'Este inmueble puede quedar fuera de tu rango actual',
    description:
      'Te mostramos alternativas para que no pierdas tiempo ni pagues por una revision que no te favorece.',
    tone: 'danger',
  },
};

export const APPLICATION_STATUS_CONTENT = {
  draft: { label: 'Pendiente', tone: 'muted' },
  in_review: { label: 'En revision', tone: 'warning' },
  correction_required: { label: 'Requiere correccion', tone: 'danger' },
  approved: { label: 'Aprobado', tone: 'success' },
  conditionally_approved: { label: 'Condicionado', tone: 'warning' },
  rejected: { label: 'Rechazado', tone: 'danger' },
  signed: { label: 'Firmado', tone: 'success' },
  paid: { label: 'Pagado', tone: 'success' },
  delivered: { label: 'Entregado', tone: 'success' },
  active: { label: 'Activo', tone: 'success' },
};

export const DOCUMENT_STATUS_CONTENT = {
  pending: { label: 'Pendiente', tone: 'muted' },
  uploaded: { label: 'Cargado', tone: 'success' },
  requires_correction: { label: 'Requiere correccion', tone: 'danger' },
};

export const getPrequalResultContent = (result) =>
  PREQUAL_RESULT_CONTENT[result] || PREQUAL_RESULT_CONTENT.eligible;

export const getApplicationStatusContent = (status) =>
  APPLICATION_STATUS_CONTENT[status] || APPLICATION_STATUS_CONTENT.draft;

export const getDocumentStatusContent = (status) =>
  DOCUMENT_STATUS_CONTENT[status] || DOCUMENT_STATUS_CONTENT.pending;
