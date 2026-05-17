const Joi = require('joi');

const cuidPattern = /^[a-z0-9]{20,32}$/i;

const prequalifyApplicationSchema = Joi.object({
  propertyId: Joi.string().trim().pattern(cuidPattern).required(),
  occupationType: Joi.string()
    .valid('EMPLOYEE', 'INDEPENDENT', 'STUDENT', 'PENSIONER', 'FOREIGNER')
    .required(),
  monthlyIncome: Joi.number().integer().min(0).required(),
  occupants: Joi.number().integer().min(1).max(12).required(),
  hasBackup: Joi.boolean().required(),
  backupOption: Joi.string()
    .valid('NONE', 'CO_SIGNER', 'INSURANCE', 'GUARANTOR', 'OTHER')
    .default('NONE'),
  desiredMoveIn: Joi.date().iso().greater('now'),
  leaseMonths: Joi.number().integer().min(1).max(60),
  notes: Joi.string().trim().max(1000).allow('', null),
});

module.exports = {
  prequalifyApplicationSchema,
};
