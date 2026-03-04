import nodemailer from 'nodemailer';

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(new URLSearchParams(body)));
    req.on('error', reject);
  });

const getEnv = () => ({
  recipient: process.env.CONTACT_RECIPIENT_EMAIL,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  },
  from: process.env.CONTACT_FROM_EMAIL || 'ProductionBot <no-reply@productionbot.com>',
});

const transporter = nodemailer.createTransport({
  ...getEnv().smtp,
  tls: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  const params = await parseBody(req);
  const email = params.get('email') || params.get('email-2');
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const env = getEnv();
  if (!env.recipient) {
    console.warn('CONTACT_RECIPIENT_EMAIL missing, skipping email delivery.');
    res.status(200).json({ message: 'Form received (recipient not configured yet).' });
    return;
  }

  try {
    await transporter.sendMail({
      from: env.from,
      to: env.recipient,
      subject: 'New ProductionBot contact',
      text: `Email: ${email}\nSubmitted at ${new Date().toISOString()}`,
    });
    res.status(200).json({ message: 'Thanks, we got it.' });
  } catch (error) {
    console.error('Mail delivery failed:', error);
    res.status(500).json({ error: 'Unable to deliver message right now.' });
  }
}
