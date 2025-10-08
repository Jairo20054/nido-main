// utils/email.js - Servicio de envío de emails con nodemailer
// CREADO POR IA: 2024-10-05

const nodemailer = require('nodemailer');
const logger = require('./logger');

// Configuración del transporter de nodemailer
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  // Verificar configuración
  if (!config.auth.user || !config.auth.pass) {
    logger.warn('Configuración SMTP incompleta - emails no se enviarán');
    return null;
  }

  try {
    const transporter = nodemailer.createTransporter(config);

    // Verificar conexión
    transporter.verify((error, success) => {
      if (error) {
        logger.error('Error en configuración SMTP', { error: error.message });
      } else {
        logger.info('Servidor SMTP listo para enviar emails');
      }
    });

    return transporter;
  } catch (error) {
    logger.error('Error creando transporter de email', { error: error.message });
    return null;
  }
};

const transporter = createTransporter();

// Plantillas de email
const emailTemplates = {
  verification: (name, verificationUrl) => ({
    subject: 'Verifica tu cuenta en Nido',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido a Nido, ${name}!</h2>
        <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Verificar Email</a>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no solicitaste esta verificación, ignora este email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Equipo de Nido</p>
      </div>
    `,
    text: `¡Bienvenido a Nido, ${name}!\n\nGracias por registrarte. Para completar tu registro, visita: ${verificationUrl}\n\nEste enlace expirará en 24 horas.\n\nSi no solicitaste esta verificación, ignora este email.\n\nEquipo de Nido`
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Restablece tu contraseña en Nido',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Restablece tu contraseña, ${name}</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Restablecer Contraseña</a>
        <p>Este enlace expirará en 1 hora por seguridad.</p>
        <p>Si no solicitaste este cambio, tu contraseña permanecerá sin cambios.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Equipo de Nido</p>
      </div>
    `,
    text: `Restablece tu contraseña, ${name}\n\nRecibimos una solicitud para restablecer tu contraseña. Visita: ${resetUrl}\n\nEste enlace expirará en 1 hora.\n\nSi no solicitaste este cambio, ignora este email.\n\nEquipo de Nido`
  })
};

// Enviar email de verificación
const sendVerificationEmail = async (to, name, verificationUrl) => {
  if (!transporter) {
    logger.warn('Transporter no disponible - email de verificación no enviado');
    return;
  }

  const template = emailTemplates.verification(name, verificationUrl);

  try {
    const info = await transporter.sendMail({
      from: `"Nido" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    logger.info('Email de verificación enviado', { messageId: info.messageId, to });
  } catch (error) {
    logger.error('Error enviando email de verificación', { error: error.message, to });
    throw error;
  }
};

// Enviar email de reset de contraseña
const sendPasswordResetEmail = async (to, name, resetUrl) => {
  if (!transporter) {
    logger.warn('Transporter no disponible - email de reset no enviado');
    return;
  }

  const template = emailTemplates.passwordReset(name, resetUrl);

  try {
    const info = await transporter.sendMail({
      from: `"Nido" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    logger.info('Email de reset de contraseña enviado', { messageId: info.messageId, to });
  } catch (error) {
    logger.error('Error enviando email de reset', { error: error.message, to });
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
