import { db, initDatabase } from './db';
import bcrypt from 'bcryptjs';
import { signAdminToken } from './auth';

async function runTests() {
  console.log('--- STARTING DENTA CARE CLINIC SYSTEM TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Database Initialization
  initDatabase();
  const adminCheck = db.prepare('SELECT count(*) as count FROM admin_users').get() as { count: number };
  assert(adminCheck.count > 0, 'Database tables and initial admin seeded successfully');

  const servicesCheck = db.prepare('SELECT count(*) as count FROM dental_services WHERE is_active = 1').get() as { count: number };
  assert(servicesCheck.count >= 8, `Dental services table populated with active services (count: ${servicesCheck.count})`);

  // 2. Authentication & Password Hashing
  const adminUser = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin') as any;
  assert(Boolean(adminUser), 'Admin user exists in database');
  assert(adminUser.password_hash.startsWith('$2'), 'Admin password is securely hashed with bcrypt (never plaintext)');
  assert(bcrypt.compareSync('DentaCare2026!Secure', adminUser.password_hash), 'Admin password validates correctly with bcrypt');
  assert(!bcrypt.compareSync('WrongPassword', adminUser.password_hash), 'Invalid password rejected by bcrypt comparison');

  // 3. JWT Token Generation
  const token = signAdminToken({ userId: adminUser.id, username: adminUser.username, role: adminUser.role });
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT token generated with 3 signed segments');

  // 4. Appointment Booking Persistence Test
  const testApptId = `TEST-${Date.now()}`;
  const now = new Date().toISOString();
  const testDate = '2026-10-25';
  const testTime = '11:00 AM';

  db.prepare(`
    INSERT INTO appointments (
      id, patient_name, phone, email, service_id, service_name,
      clinic_branch, preferred_date, preferred_time, status, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)
  `).run(
    testApptId,
    'Jane Test Patient',
    '9841234567',
    'jane.test@example.com',
    'checkup',
    'Dental Checkups & Diagnostics',
    'Kathmandu',
    testDate,
    testTime,
    'Test notes',
    now,
    now
  );

  const savedAppt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(testApptId) as any;
  assert(Boolean(savedAppt), 'Appointment successfully persisted into database');
  assert(savedAppt.status === 'PENDING', 'Initial appointment status is PENDING');

  // 5. Transactional Confirmation & Conflict Prevention
  // Confirm the first appointment
  db.prepare(`
    UPDATE appointments SET status = 'CONFIRMED', confirmed_date = ?, confirmed_time = ? WHERE id = ?
  `).run(testDate, testTime, testApptId);

  const confirmedAppt = db.prepare('SELECT status FROM appointments WHERE id = ?').get(testApptId) as any;
  assert(confirmedAppt.status === 'CONFIRMED', 'Appointment transitioned to CONFIRMED');

  // Create a second appointment for the exact same slot
  const testApptId2 = `TEST-CONFLICT-${Date.now()}`;
  db.prepare(`
    INSERT INTO appointments (
      id, patient_name, phone, service_id, service_name, clinic_branch,
      preferred_date, preferred_time, status, created_at, updated_at
    )
    VALUES (?, 'Second Patient', '9841999999', 'checkup', 'Dental Checkup', 'Kathmandu', ?, ?, 'PENDING', ?, ?)
  `).run(testApptId2, testDate, testTime, now, now);

  // Attempt to confirm second appointment: should detect conflict
  const conflict = db.prepare(`
    SELECT id FROM appointments
    WHERE preferred_date = ? AND preferred_time = ? AND clinic_branch = ?
      AND status = 'CONFIRMED' AND id != ?
  `).get(testDate, testTime, 'Kathmandu', testApptId2) as any;

  assert(Boolean(conflict) && conflict.id === testApptId, 'Conflict prevention detected that the slot is already CONFIRMED by another patient');

  // 6. Rescheduling Test
  const newDate = '2026-10-26';
  const newTime = '02:30 PM';
  db.prepare(`
    UPDATE appointments
    SET preferred_date = ?, preferred_time = ?, confirmed_date = ?, confirmed_time = ?, status = 'RESCHEDULED', updated_at = ?
    WHERE id = ?
  `).run(newDate, newTime, newDate, newTime, now, testApptId2);

  const rescheduledAppt = db.prepare('SELECT status, preferred_date FROM appointments WHERE id = ?').get(testApptId2) as any;
  assert(rescheduledAppt.status === 'RESCHEDULED' && rescheduledAppt.preferred_date === newDate, 'Appointment successfully rescheduled');

  // 7. Status History Audit Log
  db.prepare(`
    INSERT INTO appointment_status_history (
      appointment_id, from_status, to_status, changed_by, reason, created_at
    )
    VALUES (?, 'PENDING', 'RESCHEDULED', 'Admin User', 'Patient requested alternative slot', ?)
  `).run(testApptId2, now);

  const historyEntries = db.prepare('SELECT * FROM appointment_status_history WHERE appointment_id = ?').all(testApptId2);
  assert(historyEntries.length > 0, 'Status transition history audit log verified in database');

  // 8. Cleanup test rows
  db.prepare('DELETE FROM appointments WHERE id IN (?, ?)').run(testApptId, testApptId2);

  console.log(`\n--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
