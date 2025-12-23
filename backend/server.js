const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'petshop',
  password: process.env.DB_PASSWORD || 'petshop123',
  database: process.env.DB_NAME || 'petshop_db',
});

// Initialize database tables
async function initDatabase() {
  try {
    // Services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        duration INTEGER NOT NULL,
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        pet_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        owner_phone VARCHAR(50),
        service_id INTEGER REFERENCES services(id),
        appointment_date TIMESTAMP NOT NULL,
        pickup_service BOOLEAN DEFAULT FALSE,
        pickup_address TEXT,
        notes TEXT,
        price DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add price, status, paid and payment_method columns if they don't exist (for existing databases)
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='appointments' AND column_name='price') THEN
          ALTER TABLE appointments ADD COLUMN price DECIMAL(10, 2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='appointments' AND column_name='status') THEN
          ALTER TABLE appointments ADD COLUMN status VARCHAR(20) DEFAULT 'scheduled';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='appointments' AND column_name='paid') THEN
          ALTER TABLE appointments ADD COLUMN paid BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='appointments' AND column_name='payment_method') THEN
          ALTER TABLE appointments ADD COLUMN payment_method VARCHAR(20);
        END IF;
      END $$;
    `);

    // Insert default services if table is empty
    const servicesCount = await pool.query('SELECT COUNT(*) FROM services');
    if (parseInt(servicesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO services (name, duration) VALUES
        ('Banho', 60),
        ('Tosa', 90),
        ('Banho e Tosa', 120),
        ('Consulta Veterinária', 30)
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes - Services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Error fetching services' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { name, duration } = req.body;
    const result = await pool.query(
      'INSERT INTO services (name, duration) VALUES ($1, $2) RETURNING *',
      [name, duration]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Error creating service' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration } = req.body;
    const result = await pool.query(
      'UPDATE services SET name = $1, duration = $2 WHERE id = $3 RETURNING *',
      [name, duration, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Error updating service' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Error deleting service' });
  }
});

// Routes - Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT a.*, s.name as service_name FROM appointments a LEFT JOIN services s ON a.service_id = s.id';
    const params = [];
    
    if (startDate && endDate) {
      query += ' WHERE a.appointment_date >= $1 AND a.appointment_date <= $2';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY a.appointment_date';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const {
      pet_name,
      owner_name,
      owner_phone,
      service_id,
      appointment_date,
      pickup_service,
      pickup_address,
      notes,
      price,
      status,
      payment_method
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO appointments 
       (pet_name, owner_name, owner_phone, service_id, appointment_date, pickup_service, pickup_address, notes, price, status, paid, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [pet_name, owner_name, owner_phone, service_id, appointment_date, pickup_service || false, pickup_address, notes, price || null, status || 'scheduled', false, payment_method || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Error creating appointment' });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pet_name,
      owner_name,
      owner_phone,
      service_id,
      appointment_date,
      pickup_service,
      pickup_address,
      notes,
      price,
      status,
      paid,
      payment_method
    } = req.body;
    
    const result = await pool.query(
      `UPDATE appointments SET
       pet_name = $1, owner_name = $2, owner_phone = $3, service_id = $4,
       appointment_date = $5, pickup_service = $6, pickup_address = $7, notes = $8, price = $9, status = $10, paid = COALESCE($11, paid), payment_method = $12
       WHERE id = $13 RETURNING *`,
      [pet_name, owner_name, owner_phone, service_id, appointment_date, pickup_service || false, pickup_address, notes, price || null, status || 'scheduled', paid !== undefined ? paid : null, payment_method || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Error updating appointment' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

// Routes - Billing
app.get('/api/billing', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Convert date strings to timestamps for proper comparison
    // Parse dates in local timezone to avoid timezone issues
    const startDateObj = new Date(startDate + 'T00:00:00');
    const endDateObj = new Date(endDate + 'T23:59:59.999');
    
    // Convert to ISO string for PostgreSQL (which expects UTC)
    const startTimestamp = startDateObj.toISOString();
    const endTimestamp = endDateObj.toISOString();

    console.log('Billing query:', { startDate, endDate, startTimestamp, endTimestamp });

    // Get appointments with status 'completed' or 'scheduled' in the date range
    // Use TO_CHAR to ensure consistent date format
    const result = await pool.query(
      `SELECT 
        a.*,
        s.name as service_name,
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_day
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.appointment_date >= $1 
        AND a.appointment_date <= $2
        AND a.status != 'cancelled'
      ORDER BY a.appointment_date`,
      [startTimestamp, endTimestamp]
    );

    console.log('Billing results count:', result.rows.length);

    // Calculate totals
    const total = result.rows.reduce((sum, apt) => sum + (parseFloat(apt.price) || 0), 0);
    const count = result.rows.length;

    // Group by day
    const byDay = {};
    result.rows.forEach(apt => {
      // Extract day - should already be in YYYY-MM-DD format from TO_CHAR
      let day = null;
      
      if (apt.appointment_day) {
        // appointment_day is already formatted as YYYY-MM-DD from TO_CHAR
        day = apt.appointment_day.toString().trim();
      } else if (apt.appointment_date) {
        // Fallback: extract from appointment_date
        const date = apt.appointment_date instanceof Date 
          ? apt.appointment_date 
          : new Date(apt.appointment_date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        day = `${year}-${month}-${dayNum}`;
      }
      
      if (!day) {
        console.warn('Could not extract day from appointment:', apt.id, apt);
        return;
      }
      
      if (!byDay[day]) {
        byDay[day] = { appointments: [], total: 0, count: 0 };
      }
      byDay[day].appointments.push(apt);
      byDay[day].total += parseFloat(apt.price) || 0;
      byDay[day].count += 1;
    });
    
    console.log('Grouped by day:', Object.keys(byDay));

    // Sort byDay by date (oldest first for better chronological view)
    const sortedByDay = Object.entries(byDay)
      .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
      .map(([day, data]) => ({
        day,
        total: data.total,
        count: data.count,
        appointments: data.appointments
      }));

    // Group by service type
    const byService = {};
    result.rows.forEach(apt => {
      const serviceName = apt.service_name || 'Sem serviço';
      if (!byService[serviceName]) {
        byService[serviceName] = { count: 0, total: 0 };
      }
      byService[serviceName].count += 1;
      byService[serviceName].total += parseFloat(apt.price) || 0;
    });

    const byServiceArray = Object.entries(byService)
      .map(([name, data]) => ({
        name,
        count: data.count,
        total: data.total
      }))
      .sort((a, b) => b.count - a.count);

    // Group by payment method
    const byPaymentMethod = {};
    result.rows.forEach(apt => {
      const paymentMethod = apt.payment_method || 'Não informado';
      if (!byPaymentMethod[paymentMethod]) {
        byPaymentMethod[paymentMethod] = { count: 0, total: 0 };
      }
      byPaymentMethod[paymentMethod].count += 1;
      byPaymentMethod[paymentMethod].total += parseFloat(apt.price) || 0;
    });

    const byPaymentMethodArray = Object.entries(byPaymentMethod)
      .map(([name, data]) => ({
        name,
        count: data.count,
        total: data.total
      }))
      .sort((a, b) => b.total - a.total);

    res.json({
      total,
      count,
      byDay: sortedByDay,
      byService: byServiceArray,
      byPaymentMethod: byPaymentMethodArray
    });
  } catch (error) {
    console.error('Error fetching billing:', error);
    res.status(500).json({ error: 'Error fetching billing' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

