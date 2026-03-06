import nodemailer from 'nodemailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readRawBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const parseBody = async (req) => {
  const rawBody = await readRawBody(req);
  const contentType = (req.headers['content-type'] || '').toLowerCase();

  if (contentType.includes('application/json')) {
    try {
      const json = JSON.parse(rawBody || '{}');
      return new Map(Object.entries(json));
    } catch {
      return new Map();
    }
  }

  return new URLSearchParams(rawBody);
};

const getEnv = () => ({
  recipient: process.env.CONTACT_RECIPIENT_EMAIL?.trim(),
  from: (process.env.CONTACT_FROM_EMAIL || 'ProductionBot <no-reply@productionbot.com>').trim(),
  smtp: {
    host: process.env.SMTP_HOST?.trim(),
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS,
  },
});

const getMissingConfig = (env) => {
  const missing = [];
  if (!env.recipient) missing.push('CONTACT_RECIPIENT_EMAIL');
  if (!env.smtp.host) missing.push('SMTP_HOST');
  if (!Number.isFinite(env.smtp.port)) missing.push('SMTP_PORT');
  if (!env.smtp.user) missing.push('SMTP_USER');
  if (!env.smtp.pass) missing.push('SMTP_PASS');
  return missing;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  try {
    const body = await parseBody(req);
    const email = (body.get('email') || body.get('email-2') || '').trim().toLowerCase();

    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    const env = getEnv();
    const missingConfig = getMissingConfig(env);

    if (missingConfig.length > 0) {
      console.error(`submit.js misconfigured: missing ${missingConfig.join(', ')}`);
      res.status(500).json({ error: 'Form service is not configured.' });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });

    await transporter.sendMail({
      from: env.from,
      to: env.recipient,
      replyTo: email,
      subject: 'New ProductionBot contact',
      text: `Email: ${email}\nSubmitted at: ${new Date().toISOString()}`,
      html: `<p><strong>Email:</strong> ${email}</p><p><strong>Submitted at:</strong> ${new Date().toISOString()}</p>`,
    });

    res.status(200).json({ message: 'Thanks, we got it.' });
  } catch (error) {
    console.error('Mail delivery failed:', error);
    res.status(500).json({ error: 'Unable to deliver message right now.' });
  }
}
