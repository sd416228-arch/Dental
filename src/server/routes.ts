import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import {
  requireAdminAuth,
  signAdminToken,
  AUTH_COOKIE_NAME,
  createRateLimiter,
} from './auth';

export const apiRouter = Router();

// Rate limiters
const loginLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 min
const bookingLimiter = createRateLimiter(15, 10 * 60 * 1000); // 15 bookings per 10 min

/**
 * Helper: Get current date string in clinic timezone
 */
function getTodayStringInTimezone(tz = 'Asia/Kathmandu'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Helper: Get clinic settings as an object
 */
function getClinicSettingsMap(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM clinic_settings').all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

/* ==========================================================================
   PUBLIC ENDPOINTS
   ========================================================================== */

/**
 * GET /api/clinic-info - Public operational info
 */
apiRouter.get('/clinic-info', (req: Request, res: Response) => {
  const settings = getClinicSettingsMap();
  res.json({
    name: settings.clinic_name || 'Denta Care',
    tagline: settings.clinic_tagline || 'EVERY SMILE MATTERS',
    phone: settings.clinic_phone || '+97714412345',
    phoneFormatted: settings.clinic_phone_display || '01-4412345',
    whatsappNumber: settings.clinic_whatsapp || '9779841234567',
    whatsappFormatted: settings.clinic_whatsapp_display || '+977 9841 234567',
    email: settings.clinic_email || 'care@dentacare.com.np',
    openingHours: settings.opening_hours || '09:30 AM - 07:00 PM',
    daysOpen: settings.days_open || 'Sun - Fri',
    timezone: settings.timezone || 'Asia/Kathmandu',
    slotDurationMinutes: parseInt(settings.slot_duration_minutes || '45', 10),
    bookingNotice: settings.booking_notice || 'All appointment requests are subject to confirmation.',
  });
});

/**
 * GET /api/services - Active dental services for public viewing and booking
 */
apiRouter.get('/services', (req: Request, res: Response) => {
  const services = db.prepare(`
    SELECT id, name, category, short_desc as shortDesc, full_desc as fullDesc,
           duration, price_from as priceFrom, recommended_frequency as recommendedFrequency,
           icon_name as iconName
    FROM dental_services
    WHERE is_active = 1
    ORDER BY name ASC
  `).all();
  res.json(services);
});

/**
 * GET /api/appointments/booked-slots - Return booked slots for availability checking
 */
apiRouter.get('/appointments/booked-slots', (req: Request, res: Response) => {
  const { date, clinic } = req.query;
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date query parameter is required' });
  }

  const query = clinic
    ? 'SELECT preferred_time as time FROM appointments WHERE preferred_date = ? AND clinic_branch = ? AND status IN ("CONFIRMED", "PENDING")'
    : 'SELECT preferred_time as time FROM appointments WHERE preferred_date = ? AND status IN ("CONFIRMED", "PENDING")';

  const params = clinic ? [date, clinic] : [date];
  const rows = db.prepare(query).all(...params) as { time: string }[];
  res.json({ date, bookedSlots: rows.map((r) => r.time) });
});

/**
 * POST /api/appointments - Submit public appointment request
 */
apiRouter.post('/appointments', bookingLimiter, (req: Request, res: Response) => {
  const {
    name,
    phone,
    email,
    serviceId,
    serviceName,
    clinicBranch,
    preferredDate,
    preferredTime,
    notes,
  } = req.body;

  // 1. Validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Patient full name is required (min 2 characters).' });
  }

  const cleanPhone = (phone || '').replace(/[\s\-()]/g, '');
  if (!phone || cleanPhone.length < 7 || cleanPhone.length > 15) {
    return res.status(400).json({ error: 'Please enter a valid phone number.' });
  }

  if (!preferredDate) {
    return res.status(400).json({ error: 'Preferred appointment date is required.' });
  }

  // Check date against clinic local timezone
  const settings = getClinicSettingsMap();
  const tz = settings.timezone || 'Asia/Kathmandu';
  const todayStr = getTodayStringInTimezone(tz);

  if (preferredDate < todayStr) {
    return res.status(400).json({ error: 'Appointment date cannot be in the past.' });
  }

  // Max 90 days in advance
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];
  if (preferredDate > maxDateStr) {
    return res.status(400).json({ error: 'Appointments cannot be booked more than 90 days in advance.' });
  }

  if (!preferredTime) {
    return res.status(400).json({ error: 'Preferred appointment time slot is required.' });
  }

  // Service lookup
  let resolvedServiceId = serviceId;
  let resolvedServiceName = serviceName;

  if (serviceId) {
    const s = db.prepare('SELECT id, name FROM dental_services WHERE id = ?').get(serviceId) as any;
    if (s) {
      resolvedServiceName = s.name;
    }
  } else if (serviceName) {
    const s = db.prepare('SELECT id, name FROM dental_services WHERE name = ? COLLATE NOCASE').get(serviceName) as any;
    if (s) {
      resolvedServiceId = s.id;
    } else {
      resolvedServiceId = 'general-dentistry';
    }
  } else {
    resolvedServiceId = 'checkup';
    resolvedServiceName = 'Dental Checkup';
  }

  const branch = clinicBranch || 'Kathmandu';
  const sanitizedNotes = notes ? String(notes).trim().slice(0, 500) : null;
  const sanitizedEmail = email && typeof email === 'string' && email.includes('@') ? email.trim() : null;

  // 2. Conflict verification: Check if slot is already CONFIRMED
  const existingConfirmed = db.prepare(`
    SELECT id FROM appointments
    WHERE preferred_date = ? AND preferred_time = ? AND clinic_branch = ? AND status = 'CONFIRMED'
  `).get(preferredDate, preferredTime, branch);

  if (existingConfirmed) {
    return res.status(409).json({
      error: 'The selected appointment slot has already been confirmed for another patient. Please select a different time.',
    });
  }

  // 3. Generate unique reference ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const appointmentId = `DC-${new Date().getFullYear()}-${randomSuffix}`;
  const now = new Date().toISOString();

  // 4. Insert appointment and audit log inside transaction
  const insertTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO appointments (
        id, patient_name, phone, email, service_id, service_name,
        clinic_branch, preferred_date, preferred_time, status,
        notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)
    `).run(
      appointmentId,
      name.trim(),
      phone.trim(),
      sanitizedEmail,
      resolvedServiceId,
      resolvedServiceName,
      branch,
      preferredDate,
      preferredTime,
      sanitizedNotes,
      now,
      now
    );

    db.prepare(`
      INSERT INTO appointment_status_history (
        appointment_id, from_status, to_status, changed_by, reason, created_at
      )
      VALUES (?, NULL, 'PENDING', 'Patient (Online Request)', 'Initial online booking request', ?)
    `).run(appointmentId, now);
  });

  try {
    insertTx();
    return res.status(201).json({
      success: true,
      appointment: {
        id: appointmentId,
        patientName: name.trim(),
        phone: phone.trim(),
        serviceName: resolvedServiceName,
        clinicBranch: branch,
        preferredDate,
        preferredTime,
        status: 'PENDING',
        notice: 'Your appointment request has been received. Our clinic coordinator will contact you to confirm.',
      },
    });
  } catch (err: any) {
    console.error('Failed to create appointment:', err);
    return res.status(500).json({ error: 'Failed to record appointment request. Please try again.' });
  }
});

/* ==========================================================================
   ADMIN AUTHENTICATION ENDPOINTS
   ========================================================================== */

/**
 * POST /api/admin/login
 */
apiRouter.post('/admin/login', loginLimiter, (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const admin = db.prepare(`
    SELECT id, username, password_hash, name, role
    FROM admin_users
    WHERE username = ?
  `).get(username.trim()) as any;

  // Use generic response to prevent username enumeration
  const invalidError = 'Invalid username or password.';

  if (!admin) {
    return res.status(401).json({ error: invalidError });
  }

  const passwordMatch = bcrypt.compareSync(password, admin.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: invalidError });
  }

  // Update last login timestamp
  const now = new Date().toISOString();
  db.prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?').run(now, admin.id);

  // Generate JWT
  const token = signAdminToken({
    userId: admin.id,
    username: admin.username,
    role: admin.role,
  });

  // Set HttpOnly, SameSite cookie
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });

  return res.json({
    success: true,
    token,
    user: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    },
  });
});

/**
 * POST /api/admin/logout
 */
apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/admin/me
 */
apiRouter.get('/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  res.json({ user: admin });
});

/**
 * PATCH /api/admin/change-password
 */
apiRouter.patch('/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const user = db.prepare('SELECT password_hash FROM admin_users WHERE id = ?').get(admin.id) as any;
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, admin.id);

  res.json({ success: true, message: 'Password updated successfully.' });
});

/* ==========================================================================
   PROTECTED ADMIN DASHBOARD & APPOINTMENTS
   ========================================================================== */

/**
 * GET /api/admin/dashboard/stats - Aggregated metrics
 */
apiRouter.get('/admin/dashboard/stats', requireAdminAuth, (req: Request, res: Response) => {
  const settings = getClinicSettingsMap();
  const tz = settings.timezone || 'Asia/Kathmandu';
  const todayStr = getTodayStringInTimezone(tz);

  const total = db.prepare('SELECT count(*) as count FROM appointments').get() as any;
  const todayCount = db.prepare('SELECT count(*) as count FROM appointments WHERE preferred_date = ?').get(todayStr) as any;
  const pendingCount = db.prepare("SELECT count(*) as count FROM appointments WHERE status = 'PENDING'").get() as any;
  const confirmedCount = db.prepare("SELECT count(*) as count FROM appointments WHERE status = 'CONFIRMED'").get() as any;
  const completedCount = db.prepare("SELECT count(*) as count FROM appointments WHERE status = 'COMPLETED'").get() as any;
  const cancelledCount = db.prepare("SELECT count(*) as count FROM appointments WHERE status IN ('CANCELLED', 'REJECTED')").get() as any;

  // Breakdown by status
  const breakdownRows = db.prepare(`
    SELECT status, count(*) as count
    FROM appointments
    GROUP BY status
  `).all() as { status: string; count: number }[];

  // Recent 5 appointments
  const recent = db.prepare(`
    SELECT id, patient_name as patientName, phone, service_name as serviceName,
           clinic_branch as clinicBranch, preferred_date as preferredDate,
           preferred_time as preferredTime, status, created_at as createdAt
    FROM appointments
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  res.json({
    todayDate: todayStr,
    totalAppointments: total.count,
    todayAppointments: todayCount.count,
    pendingRequests: pendingCount.count,
    confirmedAppointments: confirmedCount.count,
    completedAppointments: completedCount.count,
    cancelledOrRejected: cancelledCount.count,
    statusBreakdown: breakdownRows,
    recentAppointments: recent,
  });
});

/**
 * GET /api/admin/appointments - List and filter
 */
apiRouter.get('/admin/appointments', requireAdminAuth, (req: Request, res: Response) => {
  const { status, date, service, search } = req.query;

  let sql = `
    SELECT id, patient_name as patientName, phone, email, service_id as serviceId,
           service_name as serviceName, clinic_branch as clinicBranch,
           preferred_date as preferredDate, preferred_time as preferredTime,
           confirmed_date as confirmedDate, confirmed_time as confirmedTime,
           status, notes, admin_notes as adminNotes, rejection_reason as rejectionReason,
           created_at as createdAt, updated_at as updatedAt
    FROM appointments
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'ALL') {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (date) {
    sql += ' AND preferred_date = ?';
    params.push(date);
  }

  if (service && service !== 'ALL') {
    sql += ' AND service_id = ?';
    params.push(service);
  }

  if (search && typeof search === 'string') {
    sql += ' AND (id LIKE ? OR patient_name LIKE ? OR phone LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY preferred_date DESC, preferred_time ASC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

/**
 * GET /api/admin/appointments/:id - Single appointment with audit history
 */
apiRouter.get('/admin/appointments/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;

  const appt = db.prepare(`
    SELECT id, patient_name as patientName, phone, email, service_id as serviceId,
           service_name as serviceName, clinic_branch as clinicBranch,
           preferred_date as preferredDate, preferred_time as preferredTime,
           confirmed_date as confirmedDate, confirmed_time as confirmedTime,
           status, notes, admin_notes as adminNotes, rejection_reason as rejectionReason,
           created_at as createdAt, updated_at as updatedAt
    FROM appointments
    WHERE id = ?
  `).get(id) as any;

  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const history = db.prepare(`
    SELECT id, from_status as fromStatus, to_status as toStatus, changed_by as changedBy,
           reason, created_at as createdAt
    FROM appointment_status_history
    WHERE appointment_id = ?
    ORDER BY created_at ASC
  `).all(id);

  res.json({ appointment: appt, history });
});

/**
 * POST /api/admin/appointments/:id/confirm - Confirm appointment with transaction
 */
apiRouter.post('/admin/appointments/:id/confirm', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = (req as any).adminUser;
  const now = new Date().toISOString();

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any;
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  // Database transaction for conflict checking and atomic update
  const confirmTx = db.transaction(() => {
    // Check if another confirmed appointment already occupies this slot
    const conflict = db.prepare(`
      SELECT id FROM appointments
      WHERE preferred_date = ? AND preferred_time = ? AND clinic_branch = ?
        AND status = 'CONFIRMED' AND id != ?
    `).get(appt.preferred_date, appt.preferred_time, appt.clinic_branch, id) as any;

    if (conflict) {
      throw new Error(`CONFLICT: Another appointment (${conflict.id}) is already confirmed for this time slot.`);
    }

    db.prepare(`
      UPDATE appointments
      SET status = 'CONFIRMED',
          confirmed_date = preferred_date,
          confirmed_time = preferred_time,
          updated_at = ?
      WHERE id = ?
    `).run(now, id);

    db.prepare(`
      INSERT INTO appointment_status_history (
        appointment_id, from_status, to_status, changed_by, reason, created_at
      )
      VALUES (?, ?, 'CONFIRMED', ?, 'Appointment confirmed by admin', ?)
    `).run(id, appt.status, admin.name || admin.username, now);
  });

  try {
    confirmTx();
    res.json({ success: true, message: `Appointment ${id} confirmed successfully.` });
  } catch (err: any) {
    if (err.message && err.message.startsWith('CONFLICT:')) {
      return res.status(409).json({ error: err.message.replace('CONFLICT: ', '') });
    }
    console.error('Error confirming appointment:', err);
    return res.status(500).json({ error: 'Failed to confirm appointment.' });
  }
});

/**
 * POST /api/admin/appointments/:id/reject
 */
apiRouter.post('/admin/appointments/:id/reject', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const admin = (req as any).adminUser;
  const now = new Date().toISOString();

  const appt = db.prepare('SELECT status FROM appointments WHERE id = ?').get(id) as any;
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const rejectReason = reason ? String(reason).trim() : 'Clinic schedule unavailable';

  const rejectTx = db.transaction(() => {
    db.prepare(`
      UPDATE appointments
      SET status = 'REJECTED',
          rejection_reason = ?,
          updated_at = ?
      WHERE id = ?
    `).run(rejectReason, now, id);

    db.prepare(`
      INSERT INTO appointment_status_history (
        appointment_id, from_status, to_status, changed_by, reason, created_at
      )
      VALUES (?, ?, 'REJECTED', ?, ?, ?)
    `).run(id, appt.status, admin.name || admin.username, rejectReason, now);
  });

  rejectTx();
  res.json({ success: true, message: `Appointment ${id} marked as rejected.` });
});

/**
 * POST /api/admin/appointments/:id/reschedule
 */
apiRouter.post('/admin/appointments/:id/reschedule', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { newDate, newTime, reason } = req.body;
  const admin = (req as any).adminUser;
  const now = new Date().toISOString();

  if (!newDate || !newTime) {
    return res.status(400).json({ error: 'New date and new time are required.' });
  }

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any;
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const rescheduleTx = db.transaction(() => {
    // Conflict check on new slot
    const conflict = db.prepare(`
      SELECT id FROM appointments
      WHERE preferred_date = ? AND preferred_time = ? AND clinic_branch = ?
        AND status = 'CONFIRMED' AND id != ?
    `).get(newDate, newTime, appt.clinic_branch, id) as any;

    if (conflict) {
      throw new Error(`CONFLICT: Slot ${newDate} at ${newTime} is already booked.`);
    }

    db.prepare(`
      UPDATE appointments
      SET preferred_date = ?,
          preferred_time = ?,
          confirmed_date = ?,
          confirmed_time = ?,
          status = 'RESCHEDULED',
          updated_at = ?
      WHERE id = ?
    `).run(newDate, newTime, newDate, newTime, now, id);

    const logReason = reason ? String(reason).trim() : `Rescheduled to ${newDate} at ${newTime}`;
    db.prepare(`
      INSERT INTO appointment_status_history (
        appointment_id, from_status, to_status, changed_by, reason, created_at
      )
      VALUES (?, ?, 'RESCHEDULED', ?, ?, ?)
    `).run(id, appt.status, admin.name || admin.username, logReason, now);
  });

  try {
    rescheduleTx();
    res.json({ success: true, message: `Appointment ${id} rescheduled to ${newDate} at ${newTime}.` });
  } catch (err: any) {
    if (err.message && err.message.startsWith('CONFLICT:')) {
      return res.status(409).json({ error: err.message.replace('CONFLICT: ', '') });
    }
    return res.status(500).json({ error: 'Failed to reschedule appointment.' });
  }
});

/**
 * POST /api/admin/appointments/:id/complete
 */
apiRouter.post('/admin/appointments/:id/complete', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = (req as any).adminUser;
  const now = new Date().toISOString();

  const appt = db.prepare('SELECT status FROM appointments WHERE id = ?').get(id) as any;
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const completeTx = db.transaction(() => {
    db.prepare(`
      UPDATE appointments
      SET status = 'COMPLETED', updated_at = ?
      WHERE id = ?
    `).run(now, id);

    db.prepare(`
      INSERT INTO appointment_status_history (
        appointment_id, from_status, to_status, changed_by, reason, created_at
      )
      VALUES (?, ?, 'COMPLETED', ?, 'Marked completed after patient consultation', ?)
    `).run(id, appt.status, admin.name || admin.username, now);
  });

  completeTx();
  res.json({ success: true, message: `Appointment ${id} completed.` });
});

/**
 * POST /api/admin/appointments/:id/cancel
 */
apiRouter.post('/admin/appointments/:id/cancel', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const admin = (req as any).adminUser;
  const now = new Date().toISOString();

  const appt = db.prepare('SELECT status FROM appointments WHERE id = ?').get(id) as any;
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const cancelTx = db.transaction(() => {
    db.prepare(`
      UPDATE appointments
      SET status = 'CANCELLED', updated_at = ?
      WHERE id = ?
    `).run(now, id);

    db.prepare(`
      INSERT INTO appointment_status_history (
        appointment_id, from_status, to_status, changed_by, reason, created_at
      )
      VALUES (?, ?, 'CANCELLED', ?, ?, ?)
    `).run(id, appt.status, admin.name || admin.username, reason || 'Cancelled', now);
  });

  cancelTx();
  res.json({ success: true, message: `Appointment ${id} cancelled.` });
});

/**
 * PATCH /api/admin/appointments/:id - Update admin notes
 */
apiRouter.patch('/admin/appointments/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE appointments
    SET admin_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(adminNotes || '', now, id);

  res.json({ success: true, message: 'Notes saved.' });
});

/* ==========================================================================
   PROTECTED SERVICE MANAGEMENT
   ========================================================================== */

/**
 * GET /api/admin/services - All services
 */
apiRouter.get('/admin/services', requireAdminAuth, (req: Request, res: Response) => {
  const services = db.prepare(`
    SELECT id, name, category, short_desc as shortDesc, full_desc as fullDesc,
           duration, price_from as priceFrom, recommended_frequency as recommendedFrequency,
           icon_name as iconName, is_active as isActive, created_at as createdAt
    FROM dental_services
    ORDER BY created_at ASC
  `).all();
  res.json(services);
});

/**
 * POST /api/admin/services - Add service
 */
apiRouter.post('/admin/services', requireAdminAuth, (req: Request, res: Response) => {
  const { name, category, shortDesc, fullDesc, duration, priceFrom, recommendedFrequency, iconName } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Service name and category are required.' });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `service-${Date.now()}`;
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO dental_services (
        id, name, category, short_desc, full_desc, duration, price_from,
        recommended_frequency, icon_name, is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      id,
      name.trim(),
      category.trim(),
      shortDesc ? shortDesc.trim() : '',
      fullDesc ? fullDesc.trim() : '',
      duration ? duration.trim() : '30-45 mins',
      priceFrom ? priceFrom.trim() : 'Contact clinic',
      recommendedFrequency ? recommendedFrequency.trim() : 'As advised',
      iconName || 'Stethoscope',
      now,
      now
    );

    res.status(201).json({ success: true, id, message: 'Service added successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: 'Service with similar ID or name already exists.' });
  }
});

/**
 * PATCH /api/admin/services/:id - Edit or toggle service
 */
apiRouter.patch('/admin/services/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, shortDesc, fullDesc, duration, priceFrom, recommendedFrequency, isActive } = req.body;
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM dental_services WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  db.prepare(`
    UPDATE dental_services
    SET name = COALESCE(?, name),
        category = COALESCE(?, category),
        short_desc = COALESCE(?, short_desc),
        full_desc = COALESCE(?, full_desc),
        duration = COALESCE(?, duration),
        price_from = COALESCE(?, price_from),
        recommended_frequency = COALESCE(?, recommended_frequency),
        is_active = COALESCE(?, is_active),
        updated_at = ?
    WHERE id = ?
  `).run(
    name,
    category,
    shortDesc,
    fullDesc,
    duration,
    priceFrom,
    recommendedFrequency,
    isActive !== undefined ? (isActive ? 1 : 0) : null,
    now,
    id
  );

  res.json({ success: true, message: 'Service updated.' });
});

/* ==========================================================================
   PROTECTED CLINIC SETTINGS
   ========================================================================== */

/**
 * GET /api/admin/settings
 */
apiRouter.get('/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const settings = getClinicSettingsMap();
  res.json(settings);
});

/**
 * PATCH /api/admin/settings
 */
apiRouter.patch('/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid settings body.' });
  }

  const now = new Date().toISOString();
  const upsert = db.prepare(`
    INSERT INTO clinic_settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);

  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string' || typeof value === 'number') {
        upsert.run(key, String(value), now);
      }
    }
  });

  tx();
  res.json({ success: true, message: 'Clinic settings updated successfully.' });
});
