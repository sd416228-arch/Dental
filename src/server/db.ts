import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { SERVICES_LIST, CLINIC_CONFIG, CLINIC_LOCATIONS } from '../data/clinicData';

// Ensure data directory exists
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'clinic.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize Tables and Run Migrations
 */
export function initDatabase() {
  db.exec(`
    -- Administrator Accounts
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );

    -- Dental Services
    CREATE TABLE IF NOT EXISTS dental_services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      short_desc TEXT NOT NULL,
      full_desc TEXT NOT NULL,
      duration TEXT NOT NULL,
      price_from TEXT NOT NULL,
      recommended_frequency TEXT,
      icon_name TEXT NOT NULL DEFAULT 'Stethoscope',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Clinic Settings (Key-Value Store)
    CREATE TABLE IF NOT EXISTS clinic_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Appointments Table
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      clinic_branch TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      admin_notes TEXT,
      rejection_reason TEXT,
      confirmed_date TEXT,
      confirmed_time TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Appointment Status History Audit Log
    CREATE TABLE IF NOT EXISTS appointment_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
    );

    -- Indexes for high-performance filtering and conflict checking
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(phone);
    CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_confirmed_slot ON appointments(preferred_date, preferred_time, clinic_branch, status);
  `);

  // Seed Initial Admin User if none exists
  const existingAdmin = db.prepare('SELECT count(*) as count FROM admin_users').get() as { count: number };
  if (existingAdmin.count === 0) {
    const adminUsername = process.env.ADMIN_INITIAL_USERNAME || 'admin';
    const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || 'DentaCare2026!Secure';
    const passwordHash = bcrypt.hashSync(rawPassword, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin-1', adminUsername, passwordHash, 'Head Clinic Administrator', 'superadmin', now);

    console.log(`[Database] Initial admin created with username: "${adminUsername}"`);
  }

  // Seed Services if none exist
  const existingServices = db.prepare('SELECT count(*) as count FROM dental_services').get() as { count: number };
  if (existingServices.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO dental_services (id, name, category, short_desc, full_desc, duration, price_from, recommended_frequency, icon_name, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    const now = new Date().toISOString();
    const seedTransaction = db.transaction(() => {
      for (const service of SERVICES_LIST) {
        insertService.run(
          service.id,
          service.name,
          service.category,
          service.shortDesc,
          service.fullDesc,
          service.duration,
          service.priceFrom,
          service.recommendedFrequency,
          service.iconName,
          now,
          now
        );
      }
    });
    seedTransaction();
    console.log(`[Database] Seeded ${SERVICES_LIST.length} initial dental services.`);
  } else {
    // Ensure existing services are synchronized to current pricing (e.g. Nepali Rupees)
    const updatePriceStmt = db.prepare('UPDATE dental_services SET price_from = ? WHERE id = ?');
    const syncPricesTx = db.transaction(() => {
      for (const service of SERVICES_LIST) {
        updatePriceStmt.run(service.priceFrom, service.id);
      }
    });
    syncPricesTx();
  }

  // Seed Clinic Settings if none exist
  const existingSettings = db.prepare('SELECT count(*) as count FROM clinic_settings').get() as { count: number };
  if (existingSettings.count === 0) {
    const now = new Date().toISOString();
    const initialSettings: Record<string, string> = {
      clinic_name: CLINIC_CONFIG.name,
      clinic_tagline: CLINIC_CONFIG.tagline,
      clinic_phone: CLINIC_CONFIG.phone,
      clinic_phone_display: CLINIC_CONFIG.phoneFormatted,
      clinic_whatsapp: CLINIC_CONFIG.whatsappNumber,
      clinic_whatsapp_display: CLINIC_CONFIG.whatsappFormatted,
      clinic_email: CLINIC_CONFIG.email,
      opening_hours: CLINIC_CONFIG.openingHoursDisplay,
      days_open: CLINIC_CONFIG.daysOpenDisplay,
      timezone: 'Asia/Kathmandu', // Configured clinic local timezone per prompt
      slot_duration_minutes: '45',
      address_main: CLINIC_LOCATIONS[0].address + ', ' + CLINIC_LOCATIONS[0].city,
      booking_notice: 'Online requests are confirmed by our patient coordinator within 2 hours.',
    };

    const insertSetting = db.prepare(`
      INSERT INTO clinic_settings (key, value, updated_at)
      VALUES (?, ?, ?)
    `);

    const settingsTx = db.transaction(() => {
      for (const [key, value] of Object.entries(initialSettings)) {
        insertSetting.run(key, value, now);
      }
    });
    settingsTx();
    console.log('[Database] Seeded initial clinic operational settings.');
  } else {
    // Synchronize latest contact and location updates
    const now = new Date().toISOString();
    const upsertSetting = db.prepare(`
      INSERT INTO clinic_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);
    upsertSetting.run('clinic_phone', CLINIC_CONFIG.phone, now);
    upsertSetting.run('clinic_phone_display', CLINIC_CONFIG.phoneFormatted, now);
    upsertSetting.run('clinic_whatsapp', CLINIC_CONFIG.whatsappNumber, now);
    upsertSetting.run('clinic_whatsapp_display', CLINIC_CONFIG.whatsappFormatted, now);
    upsertSetting.run('clinic_email', CLINIC_CONFIG.email, now);
    upsertSetting.run('address_main', CLINIC_LOCATIONS[0].address + ', ' + CLINIC_LOCATIONS[0].city, now);
  }
}
