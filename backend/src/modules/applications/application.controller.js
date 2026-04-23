const { PropertyStatus } = require('@prisma/client');
const { prisma } = require('../../shared/prisma');
const { badRequest, notFound } = require('../../shared/errors');
const { serializeProperty } = require('../../shared/serializers');

const OCCUPATION_RULES = {
  EMPLOYEE: {
    label: 'Empleado',
    incomeMultiplierAdjustment: 0,
    scoreBonus: 6,
    requiresBackupWithoutThreshold: false,
  },
  INDEPENDENT: {
    label: 'Independiente',
    incomeMultiplierAdjustment: 0.15,
    scoreBonus: 2,
    requiresBackupWithoutThreshold: false,
  },
  STUDENT: {
    label: 'Estudiante',
    incomeMultiplierAdjustment: 0.1,
    scoreBonus: -6,
    requiresBackupWithoutThreshold: true,
  },
  PENSIONER: {
    label: 'Pensionado',
    incomeMultiplierAdjustment: 0,
    scoreBonus: 4,
    requiresBackupWithoutThreshold: false,
  },
  FOREIGNER: {
    label: 'Extranjero',
    incomeMultiplierAdjustment: 0.1,
    scoreBonus: -2,
    requiresBackupWithoutThreshold: false,
  },
};

const DOCUMENT_LIBRARY = {
  common: [
    {
      key: 'identity-front-back',
      label: 'Documento de identidad',
      why: 'Confirmamos que la persona que aplica coincide con la informacion del expediente.',
      formats: ['JPG', 'PNG', 'PDF'],
      exampleHint: 'Foto clara por ambos lados, sin recortes ni reflejos.',
    },
    {
      key: 'selfie-liveness',
      label: 'Selfie o prueba de vida',
      why: 'Ayuda a prevenir suplantacion y validar que la solicitud es real.',
      formats: ['JPG', 'PNG'],
      exampleHint: 'Rostro completo, buena luz y fondo simple.',
    },
  ],
  EMPLOYEE: [
    {
      key: 'employment-letter',
      label: 'Carta laboral',
      why: 'Nos ayuda a validar estabilidad laboral y cargo actual.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Documento reciente con empresa, cargo y salario.',
    },
    {
      key: 'payslips',
      label: '3 desprendibles de pago',
      why: 'Comparamos ingresos declarados con soportes recientes.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Sube los tres ultimos desprendibles completos.',
    },
  ],
  INDEPENDENT: [
    {
      key: 'income-supports',
      label: 'Soportes de ingresos',
      why: 'Validamos continuidad y origen de los ingresos reportados.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Facturas, certificados o cuentas de cobro recientes.',
    },
    {
      key: 'bank-statements',
      label: 'Extractos bancarios',
      why: 'Nos ayudan a revisar coherencia entre ingresos y movimientos.',
      formats: ['PDF'],
      exampleHint: 'Idealmente los ultimos 3 meses, completos.',
    },
    {
      key: 'tax-id',
      label: 'RUT o equivalente',
      why: 'Necesitamos confirmar formalizacion y registro tributario.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Documento legible y vigente.',
    },
  ],
  STUDENT: [
    {
      key: 'study-certificate',
      label: 'Certificado de estudio',
      why: 'Sirve para validar tu vinculacion academica actual.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Emitido por la institucion y con fecha reciente.',
    },
    {
      key: 'guardian-support',
      label: 'Soporte del acudiente o codeudor',
      why: 'Necesitamos una fuente de respaldo para la solicitud.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Puede ser carta, ingresos o documentos del respaldo.',
    },
  ],
  PENSIONER: [
    {
      key: 'pension-certificate',
      label: 'Certificado o soporte de pension',
      why: 'Nos ayuda a confirmar recurrencia y monto del ingreso.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Documento reciente con valor visible.',
    },
    {
      key: 'bank-statements',
      label: 'Extractos bancarios',
      why: 'Validamos consistencia entre el ingreso declarado y abonos recibidos.',
      formats: ['PDF'],
      exampleHint: 'Sube extractos completos y legibles.',
    },
  ],
  FOREIGNER: [
    {
      key: 'valid-foreign-id',
      label: 'Documento valido',
      why: 'Necesitamos verificar identidad con el documento habilitado en tu caso.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Pasaporte, cedula de extranjeria o documento equivalente.',
    },
    {
      key: 'migration-support',
      label: 'Soporte migratorio',
      why: 'Permite validar tu permanencia o estatus aplicable.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Vigente y completamente visible.',
    },
    {
      key: 'income-supports',
      label: 'Soportes de ingresos',
      why: 'Comparamos tus ingresos con el canon y la informacion declarada.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Sube documentos recientes y completos.',
    },
  ],
  backup: [
    {
      key: 'backup-choice',
      label: 'Documento del respaldo',
      why: 'Necesitamos validar la alternativa que respalda la solicitud.',
      formats: ['PDF', 'JPG', 'PNG'],
      exampleHint: 'Codeudor, poliza o garantia, segun la opcion que elijas.',
    },
  ],
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getIncomeThresholds = (occupationType) => {
  const occupationRule = OCCUPATION_RULES[occupationType];
  const baseEligible = 3;
  const baseBackup = 2.3;
  const adjustment = occupationRule?.incomeMultiplierAdjustment || 0;

  return {
    eligible: baseEligible + adjustment,
    backup: baseBackup + adjustment,
  };
};

const getDocumentChecklist = (occupationType, hasBackup, backupOption) => {
  const items = [
    ...DOCUMENT_LIBRARY.common,
    ...(DOCUMENT_LIBRARY[occupationType] || []),
  ];

  if (hasBackup || backupOption !== 'NONE') {
    items.push({
      ...DOCUMENT_LIBRARY.backup[0],
      label:
        backupOption === 'INSURANCE'
          ? 'Soporte de garantia o poliza'
          : 'Soporte del codeudor o respaldo',
    });
  }

  return items.map((item, index) => ({
    id: `${item.key}-${index + 1}`,
    ...item,
    status: 'pending',
  }));
};

const buildReasons = ({
  occupants,
  maxOccupants,
  ratio,
  thresholds,
  hasBackup,
  occupationType,
  requiresBackupByOccupation,
}) => {
  const reasons = [];

  if (occupants > maxOccupants) {
    reasons.push(
      `Este inmueble admite hasta ${maxOccupants} ${maxOccupants === 1 ? 'persona' : 'personas'}.`
    );
  }

  if (ratio >= thresholds.eligible) {
    reasons.push('Tus ingresos declarados lucen alineados con el canon de este inmueble.');
  } else if (ratio >= thresholds.backup) {
    reasons.push('Puedes continuar, pero necesitamos un respaldo para reducir riesgo.');
  } else {
    reasons.push('Con los ingresos declarados, este inmueble puede quedar fuera de tu rango actual.');
  }

  if (requiresBackupByOccupation && !hasBackup) {
    reasons.push(`Para el perfil ${OCCUPATION_RULES[occupationType].label.toLowerCase()}, pedimos respaldo desde el inicio.`);
  }

  return reasons;
};

const buildRecommendations = ({ result, hasBackup, monthlyTotal }) => {
  if (result === 'eligible') {
    return [
      'Continua con los documentos para mantener este proceso rapido.',
      `Ten a la mano soportes que validen al menos ${monthlyTotal.toLocaleString('es-CO')} mensuales en costo habitacional total.`,
    ];
  }

  if (result === 'eligible_with_backup') {
    return [
      hasBackup
        ? 'Avanza con tu respaldo y sube los documentos del titular y del respaldo juntos.'
        : 'Puedes mejorar tu resultado agregando codeudor o garantia.',
      'Si prefieres, tambien puedes explorar inmuebles con un canon mas bajo.',
    ];
  }

  return [
    'Explora inmuebles con un canon mas alineado a tu presupuesto.',
    'Si cuentas con respaldo adicional, puedes intentar una nueva evaluacion.',
  ];
};

const calculatePrequalification = (property, payload) => {
  const occupationRule = OCCUPATION_RULES[payload.occupationType];
  const monthlyTotal = (property.monthlyRent || 0) + (property.maintenanceFee || 0);
  const ratio = monthlyTotal > 0 ? payload.monthlyIncome / monthlyTotal : 0;
  const thresholds = getIncomeThresholds(payload.occupationType);
  const hardFloorThreshold = 1.6;
  const exceedsOccupancy = payload.occupants > property.maxOccupants;
  const requiresBackupByOccupation = occupationRule?.requiresBackupWithoutThreshold || false;

  let result = 'eligible';

  if (exceedsOccupancy) {
    result = 'not_eligible';
  } else if (ratio < hardFloorThreshold) {
    result = 'not_eligible';
  } else if (requiresBackupByOccupation && !payload.hasBackup) {
    result = 'eligible_with_backup';
  } else if (ratio >= thresholds.eligible) {
    result = payload.hasBackup ? 'eligible' : 'eligible';
  } else if (ratio >= thresholds.backup || payload.hasBackup) {
    result = 'eligible_with_backup';
  } else {
    result = 'not_eligible';
  }

  const ratioScore = clamp(Math.round((ratio / thresholds.eligible) * 45), 0, 45);
  const occupancyScore = exceedsOccupancy ? 0 : 20;
  const backupScore = payload.hasBackup ? 15 : requiresBackupByOccupation ? 2 : 8;
  const profileScore = clamp(12 + (occupationRule?.scoreBonus || 0), 4, 20);

  const score = clamp(ratioScore + occupancyScore + backupScore + profileScore, 0, 100);

  let riskBand = 'low';
  if (score < 60 || result === 'not_eligible') {
    riskBand = 'high';
  } else if (score < 80 || result === 'eligible_with_backup') {
    riskBand = 'medium';
  }

  return {
    result,
    riskBand,
    score,
    ratio: Number(ratio.toFixed(2)),
    monthlyTotal,
    requiresBackup:
      result === 'eligible_with_backup' || (requiresBackupByOccupation && !payload.hasBackup),
    reasons: buildReasons({
      occupants: payload.occupants,
      maxOccupants: property.maxOccupants,
      ratio,
      thresholds,
      hasBackup: payload.hasBackup,
      occupationType: payload.occupationType,
      requiresBackupByOccupation,
    }),
    recommendations: buildRecommendations({
      result,
      hasBackup: payload.hasBackup,
      monthlyTotal,
    }),
    thresholds,
  };
};

const prequalifyApplication = async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.body.propertyId },
    include: {
      owner: true,
      images: true,
      favorites: false,
      _count: {
        select: {
          rentalRequests: true,
        },
      },
    },
  });

  if (!property || property.status !== PropertyStatus.PUBLISHED) {
    throw notFound('La propiedad no esta disponible para aplicar');
  }

  if (req.body.backupOption !== 'NONE' && !req.body.hasBackup) {
    throw badRequest('Si indicas una opcion de respaldo, tambien debes confirmar que cuentas con respaldo.');
  }

  const evaluation = calculatePrequalification(property, req.body);

  res.json({
    success: true,
    data: {
      property: serializeProperty(property, req.user?.id || null),
      prequalification: {
        result: evaluation.result,
        riskBand: evaluation.riskBand,
        score: evaluation.score,
        ratio: evaluation.ratio,
        requiresBackup: evaluation.requiresBackup,
        reasons: evaluation.reasons,
        recommendations: evaluation.recommendations,
      },
      transparency: {
        city: property.city,
        canonAmount: property.monthlyRent,
        maintenanceFeeAmount: property.maintenanceFee,
        depositAmount: property.securityDeposit,
        monthlyTotal: evaluation.monthlyTotal,
        maxOccupants: property.maxOccupants,
        availableFrom: property.availableFrom,
        minLeaseMonths: property.minLeaseMonths,
        freeToApply: true,
      },
      documentChecklist: getDocumentChecklist(
        req.body.occupationType,
        evaluation.requiresBackup || req.body.hasBackup,
        req.body.backupOption
      ),
    },
  });
};

module.exports = {
  prequalifyApplication,
};
