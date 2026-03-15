import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Helpers ---
const sanitize = (str: string) => sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// Shared SMTP transporter (created once)
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("⚠ SMTP environment variables not configured – emails will NOT be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: { user, pass },
  });
}

const ownerEmail = process.env.OWNER_EMAIL || "tomasz_jaskiewicz@hotmail.com";
const smtpFrom = process.env.SMTP_USER || "noreply@betrouwbouw.nl";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Security middleware ---
  app.use(helmet({ contentSecurityPolicy: false })); // CSP off for Vite dev
  app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });

  // API Routes

  // Contact / Quote Form
  app.post("/api/contact", apiLimiter, async (req, res) => {
    try {
      const { name, phone, email, message } = req.body;

      if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const safeName = sanitize(name);
      const safePhone = sanitize(phone);
      const safeEmail = sanitize(email);
      const safeMessage = sanitize(message);

      const transporter = createTransporter();
      if (!transporter) {
        return res.status(503).json({ error: "Email service not configured" });
      }

      // Email to business owner
      await transporter.sendMail({
        from: `"Betrouw Bouw Website" <${smtpFrom}>`,
        to: ownerEmail,
        subject: `Nieuwe offerte aanvraag van ${safeName}`,
        html: `
          <h2>Nieuwe offerte aanvraag via de website</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;font-weight:bold;">Naam:</td><td style="padding:8px;">${safeName}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Telefoon:</td><td style="padding:8px;">${safePhone}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">E-mail:</td><td style="padding:8px;">${safeEmail}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Bericht:</td><td style="padding:8px;">${safeMessage}</td></tr>
          </table>
        `,
      });

      // Confirmation email to customer
      await transporter.sendMail({
        from: `"Betrouw Bouw B.V." <${smtpFrom}>`,
        to: safeEmail,
        subject: "Bedankt voor uw aanvraag - Betrouw Bouw B.V.",
        html: `
          <p>Beste ${safeName},</p>
          <p>Bedankt voor uw offerte aanvraag. Wij hebben uw bericht in goede orde ontvangen en nemen zo snel mogelijk contact met u op.</p>
          <p>Met vriendelijke groet,<br/>Team Betrouw Bouw B.V.</p>
        `,
      });

      res.status(200).json({ message: "Success" });
    } catch (error) {
      console.error("Error sending contact form:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // CV Submission
  app.post("/api/cv-submit", apiLimiter, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'existingCv', maxCount: 1 },
    { name: 'certificates', maxCount: 5 },
    { name: 'license', maxCount: 1 },
    { name: 'vcaDocument', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const formData = JSON.parse(req.body.data);
      const pdfBase64 = req.body.pdf;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const transporter = createTransporter();
      if (!transporter) {
        return res.status(503).json({ error: "Email service not configured" });
      }

      const safeFirstName = sanitize(formData.personal.firstName);
      const safeLastName = sanitize(formData.personal.lastName);

      // Attachments
      const attachments: any[] = [];
      
      if (pdfBase64) {
        attachments.push({
          filename: `CV_${safeFirstName}_${safeLastName}.pdf`,
          content: pdfBase64.split("base64,")[1],
          encoding: 'base64'
        });
      }

      // Add uploaded files to attachments
      if (files) {
        Object.keys(files).forEach(key => {
          files[key].forEach(file => {
            attachments.push({
              filename: file.originalname,
              content: file.buffer
            });
          });
        });
      }

      // Email to Owner
      await transporter.sendMail({
        from: `"Betrouw Bouw Website" <${smtpFrom}>`,
        to: ownerEmail,
        subject: `Nieuwe sollicitatie: ${safeFirstName} ${safeLastName} - ${sanitize(formData.professional.desiredJob)}`,
        text: `Nieuwe kandidaat inschrijving ontvangen.\n\nNaam: ${safeFirstName} ${safeLastName}\nE-mail: ${sanitize(formData.personal.email)}\nTelefoon: ${sanitize(formData.personal.phone)}\nFunctie: ${sanitize(formData.professional.desiredJob)}`,
        attachments
      });

      // Confirmation Email to Candidate
      await transporter.sendMail({
        from: `"Betrouw Bouw B.V." <${smtpFrom}>`,
        to: sanitize(formData.personal.email),
        subject: `Bevestiging inschrijving - Betrouw Bouw B.V.`,
        text: `Beste ${safeFirstName},\n\nBedankt voor je inschrijving bij Betrouw Bouw B.V. We hebben je gegevens en het automatisch gegenereerde CV in goede orde ontvangen.\n\nWe zullen je sollicitatie bekijken en zo snel mogelijk contact met je opnemen.\n\nMet vriendelijke groet,\n\nTeam Betrouw Bouw B.V.`,
      });

      res.status(200).json({ message: "Success" });
    } catch (error) {
      console.error("Error submitting CV:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
