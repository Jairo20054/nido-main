const Joi = require('joi');

const prequalifyApplicationSchema = Joi.object({
  propertyId: Joi.string().required(),
  occupationType: Joi.string()
    .valid('EMPLOYEE', 'INDEPENDENT', 'STUDENT', 'PENSIONER', 'FOREIGNER')
    .required(),
  monthlyIncome: Joi.number().integer().min(0).required(),
  occupants: Joi.number().integer().min(1).max(12).required(),
  hasBackup: Joi.boolean().required(),
  backupOption: Joi.string()
    .valid('NONE', 'CO_SIGNER', 'INSURANCE', 'GUARANTOR', 'OTHER')
    .default('NONE'),
});

module.exports = {
  prequalifyApplicationSchema,
};
