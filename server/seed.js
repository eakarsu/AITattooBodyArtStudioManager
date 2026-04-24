const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop tables in reverse dependency order
    await client.query(`
      DROP TABLE IF EXISTS ai_generations CASCADE;
      DROP TABLE IF EXISTS pricing_records CASCADE;
      DROP TABLE IF EXISTS aftercare_instructions CASCADE;
      DROP TABLE IF EXISTS flash_designs CASCADE;
      DROP TABLE IF EXISTS cleaning_checklists CASCADE;
      DROP TABLE IF EXISTS commissions CASCADE;
      DROP TABLE IF EXISTS loyalty_rewards CASCADE;
      DROP TABLE IF EXISTS gift_certificates CASCADE;
      DROP TABLE IF EXISTS walkin_queue CASCADE;
      DROP TABLE IF EXISTS sterilization_logs CASCADE;
      DROP TABLE IF EXISTS inventory CASCADE;
      DROP TABLE IF EXISTS consultations CASCADE;
      DROP TABLE IF EXISTS consent_forms CASCADE;
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS clients CASCADE;
      DROP TABLE IF EXISTS artists CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialties TEXT,
        bio TEXT,
        experience_years INTEGER DEFAULT 0,
        hourly_rate DECIMAL(10,2) DEFAULT 0,
        commission_rate DECIMAL(5,2) DEFAULT 0,
        portfolio_url VARCHAR(500),
        instagram VARCHAR(255),
        available BOOLEAN DEFAULT true,
        rating DECIMAL(3,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        dob DATE,
        medical_history TEXT,
        allergies TEXT,
        skin_type VARCHAR(100),
        emergency_contact VARCHAR(255),
        emergency_phone VARCHAR(50),
        notes TEXT,
        loyalty_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        artist_id INTEGER REFERENCES artists(id) ON DELETE SET NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        service_type VARCHAR(100),
        body_placement VARCHAR(255),
        size VARCHAR(100),
        design_description TEXT,
        deposit_amount DECIMAL(10,2) DEFAULT 0,
        total_price DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE consent_forms (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
        form_type VARCHAR(100) NOT NULL,
        content TEXT,
        signed BOOLEAN DEFAULT false,
        signed_date TIMESTAMP,
        witness_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE consultations (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        artist_id INTEGER REFERENCES artists(id) ON DELETE SET NULL,
        date DATE,
        design_description TEXT,
        style_preferences TEXT,
        reference_images TEXT,
        size_estimate VARCHAR(100),
        placement VARCHAR(255),
        budget DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE inventory (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        brand VARCHAR(255),
        quantity INTEGER DEFAULT 0,
        unit VARCHAR(50),
        reorder_level INTEGER DEFAULT 5,
        cost_per_unit DECIMAL(10,2) DEFAULT 0,
        supplier VARCHAR(255),
        expiry_date DATE,
        last_restocked DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE sterilization_logs (
        id SERIAL PRIMARY KEY,
        equipment_name VARCHAR(255) NOT NULL,
        sterilization_type VARCHAR(100),
        cycle_number INTEGER,
        temperature DECIMAL(6,2),
        duration_minutes INTEGER,
        operator VARCHAR(255),
        result VARCHAR(50),
        notes TEXT,
        log_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE walkin_queue (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        desired_service VARCHAR(255),
        preferred_artist VARCHAR(255),
        estimated_wait INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'waiting',
        check_in_time TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE gift_certificates (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        purchaser_name VARCHAR(255),
        recipient_name VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        balance DECIMAL(10,2) NOT NULL,
        expiry_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE loyalty_rewards (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        points INTEGER DEFAULT 0,
        action VARCHAR(100),
        description TEXT,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE commissions (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER REFERENCES artists(id) ON DELETE SET NULL,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
        service_amount DECIMAL(10,2) DEFAULT 0,
        commission_rate DECIMAL(5,2) DEFAULT 0,
        commission_amount DECIMAL(10,2) DEFAULT 0,
        tip_amount DECIMAL(10,2) DEFAULT 0,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        pay_period VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE cleaning_checklists (
        id SERIAL PRIMARY KEY,
        area VARCHAR(255) NOT NULL,
        task VARCHAR(500) NOT NULL,
        assigned_to VARCHAR(255),
        completed BOOLEAN DEFAULT false,
        completed_by VARCHAR(255),
        shift VARCHAR(50),
        checklist_date DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE flash_designs (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER REFERENCES artists(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        style VARCHAR(100),
        size VARCHAR(100),
        placement_suggestion VARCHAR(255),
        price DECIMAL(10,2) DEFAULT 0,
        available BOOLEAN DEFAULT true,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE aftercare_instructions (
        id SERIAL PRIMARY KEY,
        service_type VARCHAR(100) NOT NULL,
        instructions TEXT NOT NULL,
        custom_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE pricing_records (
        id SERIAL PRIMARY KEY,
        service_type VARCHAR(100),
        style VARCHAR(100),
        size VARCHAR(100),
        complexity VARCHAR(100),
        color_work VARCHAR(100),
        placement VARCHAR(255),
        base_price DECIMAL(10,2) DEFAULT 0,
        hourly_rate DECIMAL(10,2) DEFAULT 0,
        estimated_hours DECIMAL(5,2) DEFAULT 0,
        total_estimate DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE ai_generations (
        id SERIAL PRIMARY KEY,
        feature VARCHAR(100),
        prompt TEXT,
        response TEXT,
        model VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed users
    const passwordHash = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, name, role) VALUES
      ('admin@tattoo.studio', $1, 'Studio Admin', 'admin'),
      ('manager@tattoo.studio', $1, 'Floor Manager', 'manager'),
      ('front@tattoo.studio', $1, 'Front Desk', 'staff')
    `, [passwordHash]);

    // Seed artists (15)
    await client.query(`
      INSERT INTO artists (name, specialties, bio, experience_years, hourly_rate, commission_rate, portfolio_url, instagram, available, rating) VALUES
      ('Marcus "Ink" Rivera', 'Japanese Traditional, Irezumi', 'Master of traditional Japanese tattooing with 15 years of dedicated practice. Specializes in full back pieces, koi fish, and dragon sleeves.', 15, 200.00, 60.00, 'https://portfolio.tattoo/marcus', '@marcus_ink_art', true, 4.95),
      ('Luna Blackwood', 'Blackwork, Geometric', 'Precision-focused artist known for intricate geometric patterns and dotwork mandalas. Former architect turned tattoo artist.', 8, 175.00, 55.00, 'https://portfolio.tattoo/luna', '@luna_blackwork', true, 4.88),
      ('Dmitri Volkov', 'Realism, Portrait', 'Photorealistic portrait specialist. Award-winning artist at multiple international tattoo conventions.', 12, 225.00, 60.00, 'https://portfolio.tattoo/dmitri', '@dmitri_realism', true, 4.92),
      ('Sage Chen', 'Watercolor, Illustrative', 'Brings painterly watercolor techniques to skin. Known for vibrant florals and nature-inspired designs.', 6, 160.00, 50.00, 'https://portfolio.tattoo/sage', '@sage_watercolor', true, 4.80),
      ('Axel Thorsen', 'Nordic, Tribal', 'Viking and Norse mythology specialist. Designs authentic rune work and Nordic knotwork patterns.', 10, 185.00, 55.00, 'https://portfolio.tattoo/axel', '@axel_norse', true, 4.85),
      ('Yuki Tanaka', 'Fine Line, Minimalist', 'Delicate single-needle specialist creating ethereal fine line work. Expert in micro tattoos and dainty designs.', 7, 170.00, 50.00, 'https://portfolio.tattoo/yuki', '@yuki_fineline', true, 4.90),
      ('Rosa Gutierrez', 'Neo-Traditional, Chicano', 'Blends classic Chicano style with neo-traditional elements. Known for stunning roses, portraits, and lettering.', 11, 190.00, 55.00, 'https://portfolio.tattoo/rosa', '@rosa_neotrad', true, 4.87),
      ('Kai Nakamura', 'Anime, Illustrative', 'Anime and manga-inspired tattoo specialist. Creates vibrant character pieces and scene compositions.', 5, 155.00, 45.00, 'https://portfolio.tattoo/kai', '@kai_anime_ink', true, 4.78),
      ('Freya Odinsdottir', 'Ornamental, Henna-inspired', 'Creates flowing ornamental designs inspired by henna and mehndi traditions with a modern twist.', 9, 180.00, 55.00, 'https://portfolio.tattoo/freya', '@freya_ornamental', true, 4.83),
      ('Theo Baptiste', 'Trash Polka, Abstract', 'Avant-garde artist specializing in the bold Trash Polka style. Combines realism with graphic elements.', 8, 195.00, 55.00, 'https://portfolio.tattoo/theo', '@theo_trashpolka', true, 4.82),
      ('Ivy Sterling', 'Botanical, Nature', 'Botanical illustration expert. Creates scientifically accurate yet artistically beautiful plant and flower tattoos.', 6, 165.00, 50.00, 'https://portfolio.tattoo/ivy', '@ivy_botanical', true, 4.86),
      ('Diego Santos', 'Color Realism, Surrealism', 'Vibrant color realism with surrealist twists. Known for mind-bending optical illusion pieces.', 10, 210.00, 60.00, 'https://portfolio.tattoo/diego', '@diego_surreal', true, 4.91),
      ('Ember Wolfe', 'Dark Art, Horror', 'Dark art and horror specialist. Creates haunting, atmospheric pieces inspired by gothic literature and film.', 7, 175.00, 50.00, 'https://portfolio.tattoo/ember', '@ember_darkart', true, 4.79),
      ('Zara Patel', 'Mandala, Sacred Geometry', 'Sacred geometry and mandala expert. Combines spiritual symbolism with mathematical precision.', 8, 180.00, 55.00, 'https://portfolio.tattoo/zara', '@zara_mandala', true, 4.84),
      ('Rex Morrison', 'American Traditional, Old School', 'Old school American traditional purist. Bold lines, saturated colors, and classic flash designs.', 20, 190.00, 55.00, 'https://portfolio.tattoo/rex', '@rex_traditional', true, 4.93)
    `);

    // Seed clients (15)
    await client.query(`
      INSERT INTO clients (name, email, phone, dob, medical_history, allergies, skin_type, emergency_contact, emergency_phone, notes, loyalty_points) VALUES
      ('Jordan Mitchell', 'jordan.m@email.com', '555-0101', '1992-03-15', 'None', 'None known', 'Normal', 'Sarah Mitchell', '555-0102', 'Regular client, loves Japanese style', 450),
      ('Alex Thompson', 'alex.t@email.com', '555-0103', '1988-07-22', 'Diabetes Type 2', 'Latex allergy', 'Sensitive', 'Chris Thompson', '555-0104', 'Must use non-latex gloves. Heals slowly.', 320),
      ('Casey Rivera', 'casey.r@email.com', '555-0105', '1995-11-08', 'None', 'Red ink sensitivity', 'Oily', 'Maria Rivera', '555-0106', 'Avoid red pigments. Prefers black and grey.', 180),
      ('Morgan Lee', 'morgan.l@email.com', '555-0107', '1990-01-30', 'Epilepsy - controlled', 'None known', 'Normal', 'Pat Lee', '555-0108', 'Takes medication. No issues during sessions.', 520),
      ('Taylor Kim', 'taylor.k@email.com', '555-0109', '1997-06-14', 'None', 'None known', 'Dry', 'Jamie Kim', '555-0110', 'First-time client. Interested in fine line work.', 50),
      ('Drew Sullivan', 'drew.s@email.com', '555-0111', '1985-09-03', 'Heart murmur', 'Adhesive tape allergy', 'Combination', 'Robin Sullivan', '555-0112', 'Use paper tape only. Cleared by doctor for tattoos.', 780),
      ('Quinn Harper', 'quinn.h@email.com', '555-0113', '1993-12-25', 'None', 'None known', 'Normal', 'Blake Harper', '555-0114', 'Building full sleeve. Session 4 of 6 upcoming.', 650),
      ('Sam Okafor', 'sam.o@email.com', '555-0115', '1991-04-17', 'Keloid scarring history', 'None known', 'Dark', 'Ade Okafor', '555-0116', 'Prone to keloids. Test patch recommended for new areas.', 200),
      ('Avery Chen', 'avery.c@email.com', '555-0117', '1996-08-09', 'None', 'Topical anesthetic allergy', 'Normal', 'Wei Chen', '555-0118', 'Cannot use numbing cream. Handles pain well.', 380),
      ('Riley Foster', 'riley.f@email.com', '555-0119', '1989-02-28', 'Hemophilia - mild', 'None known', 'Fair', 'Dana Foster', '555-0120', 'Bleeds more than average. Extra aftercare needed.', 150),
      ('Jamie Reeves', 'jamie.r@email.com', '555-0121', '1994-10-11', 'None', 'None known', 'Normal', 'Kelly Reeves', '555-0122', 'Collector - has 20+ tattoos from various artists.', 920),
      ('Parker Davis', 'parker.d@email.com', '555-0123', '1987-05-06', 'Eczema', 'Fragrance sensitivity', 'Sensitive', 'Lee Davis', '555-0124', 'Avoid fragranced products. Flare-ups on inner arms.', 280),
      ('Skyler Wood', 'skyler.w@email.com', '555-0125', '1998-01-19', 'None', 'None known', 'Normal', 'River Wood', '555-0126', 'Young collector. Prefers anime and illustrative styles.', 100),
      ('Dakota Nguyen', 'dakota.n@email.com', '555-0127', '1986-07-31', 'None', 'Nickel allergy', 'Olive', 'Minh Nguyen', '555-0128', 'Verify jewelry/metal in equipment. Regular for piercings too.', 410),
      ('Emerson Blake', 'emerson.b@email.com', '555-0129', '1992-11-23', 'Anxiety disorder', 'None known', 'Normal', 'Casey Blake', '555-0130', 'May need breaks during longer sessions. Very communicative.', 340)
    `);

    // Seed appointments (15)
    await client.query(`
      INSERT INTO appointments (client_id, artist_id, date, time, duration_minutes, service_type, body_placement, size, design_description, deposit_amount, total_price, status, notes) VALUES
      (1, 1, '2026-03-25', '10:00', 180, 'Tattoo', 'Full back', 'Extra Large', 'Japanese dragon with cherry blossoms - session 2 of 5', 500.00, 2500.00, 'scheduled', 'Continuing from previous outline session'),
      (2, 6, '2026-03-25', '14:00', 60, 'Tattoo', 'Inner wrist', 'Small', 'Delicate wildflower bouquet in fine line', 50.00, 250.00, 'scheduled', 'First tattoo - use non-latex gloves'),
      (3, 2, '2026-03-26', '11:00', 120, 'Tattoo', 'Forearm', 'Medium', 'Geometric wolf head with dotwork background', 100.00, 600.00, 'scheduled', 'Black ink only per client preference'),
      (4, 4, '2026-03-26', '09:00', 90, 'Tattoo', 'Shoulder blade', 'Medium', 'Watercolor phoenix rising', 80.00, 450.00, 'confirmed', 'Bright colors approved'),
      (5, 6, '2026-03-27', '13:00', 45, 'Tattoo', 'Behind ear', 'Tiny', 'Minimalist crescent moon', 30.00, 150.00, 'scheduled', 'First tattoo consultation completed'),
      (6, 3, '2026-03-27', '10:00', 240, 'Tattoo', 'Thigh', 'Large', 'Photorealistic lion portrait with mane detail', 200.00, 1200.00, 'confirmed', 'Reference photos approved. Paper tape only.'),
      (7, 1, '2026-03-28', '09:00', 300, 'Tattoo', 'Full sleeve', 'Extra Large', 'Japanese sleeve continuation - koi and waves', 400.00, 2000.00, 'in_progress', 'Session 4 of 6. Color fill today.'),
      (8, 14, '2026-03-28', '14:00', 60, 'Consultation', 'Upper arm', 'Medium', 'Sacred geometry mandala design discussion', 0.00, 0.00, 'scheduled', 'Test patch first - keloid risk'),
      (9, 5, '2026-03-29', '11:00', 150, 'Tattoo', 'Chest', 'Large', 'Norse Yggdrasil tree with runes', 150.00, 800.00, 'scheduled', 'No numbing cream - client preference'),
      (10, 11, '2026-03-29', '10:00', 90, 'Tattoo', 'Ankle', 'Small', 'Botanical lavender sprig with roots', 60.00, 300.00, 'confirmed', 'Extra aftercare instructions for bleeder'),
      (11, 15, '2026-03-30', '09:00', 120, 'Tattoo', 'Upper arm', 'Medium', 'Classic American eagle with banner', 100.00, 550.00, 'scheduled', 'Traditional bold colors'),
      (12, 9, '2026-03-30', '13:00', 90, 'Tattoo', 'Sternum', 'Medium', 'Ornamental underboob design', 80.00, 400.00, 'scheduled', 'Fragrance-free products only'),
      (13, 8, '2026-03-31', '11:00', 120, 'Tattoo', 'Calf', 'Medium', 'Full color anime character - Gojo Satoru', 100.00, 500.00, 'scheduled', 'Client bringing reference art'),
      (14, 10, '2026-03-31', '10:00', 180, 'Tattoo', 'Ribcage', 'Large', 'Trash Polka style clock and roses', 150.00, 900.00, 'confirmed', 'Bold red and black design'),
      (15, 7, '2026-04-01', '09:00', 150, 'Tattoo', 'Forearm', 'Medium', 'Neo-traditional rose with dagger', 120.00, 650.00, 'scheduled', 'Break every 45 min for client comfort')
    `);

    // Seed consent forms (15)
    await client.query(`
      INSERT INTO consent_forms (client_id, appointment_id, form_type, content, signed, signed_date, witness_name) VALUES
      (1, 1, 'Tattoo Consent', 'I consent to receive a tattoo and acknowledge all risks including infection, allergic reaction, and scarring. I confirm I am over 18 and not under the influence of drugs or alcohol.', true, '2026-03-20 10:00:00', 'Front Desk Staff'),
      (2, 2, 'Tattoo Consent', 'I consent to receive a tattoo and acknowledge all risks including infection, allergic reaction, and scarring. I confirm I am over 18 and not under the influence of drugs or alcohol.', false, NULL, NULL),
      (3, 3, 'Tattoo Consent', 'I consent to receive a tattoo and acknowledge all risks. I have disclosed my red ink sensitivity.', false, NULL, NULL),
      (4, 4, 'Tattoo Consent', 'I consent to receive a tattoo. I have disclosed my epilepsy condition and confirm it is controlled with medication.', true, '2026-03-22 09:00:00', 'Rosa Gutierrez'),
      (5, 5, 'Tattoo Consent - First Timer', 'I consent to receive my first tattoo. I understand the permanence of the procedure and have reviewed aftercare instructions.', false, NULL, NULL),
      (6, 6, 'Tattoo Consent - Medical', 'I consent to receive a tattoo. I have a heart murmur and adhesive tape allergy which have been noted. My physician has cleared me for this procedure.', true, '2026-03-21 14:00:00', 'Luna Blackwood'),
      (7, 7, 'Tattoo Consent - Continuation', 'I consent to continue my sleeve tattoo series. All previous sessions healed without complications.', true, '2026-03-18 09:00:00', 'Marcus Rivera'),
      (8, 8, 'Consultation Consent', 'I consent to a design consultation. I understand this does not obligate me to receive a tattoo.', false, NULL, NULL),
      (9, 9, 'Tattoo Consent', 'I consent to receive a tattoo. I decline the use of topical anesthetic and will communicate if I need breaks.', false, NULL, NULL),
      (10, 10, 'Tattoo Consent - Medical', 'I consent to receive a tattoo. I have disclosed my mild hemophilia. Extra aftercare measures have been explained.', true, '2026-03-23 10:00:00', 'Ivy Sterling'),
      (11, 11, 'Tattoo Consent', 'I consent to receive a tattoo and acknowledge all associated risks. I am an experienced tattoo collector.', false, NULL, NULL),
      (12, 12, 'Tattoo Consent - Sensitive Skin', 'I consent to receive a tattoo. I have disclosed my eczema and fragrance sensitivity. Only unscented products will be used.', false, NULL, NULL),
      (13, 13, 'Tattoo Consent', 'I consent to receive a tattoo and acknowledge all risks including infection, allergic reaction, and scarring.', false, NULL, NULL),
      (14, 14, 'Tattoo Consent', 'I consent to receive a tattoo in the ribcage area. I understand this is a sensitive area and may be more painful.', true, '2026-03-22 16:00:00', 'Theo Baptiste'),
      (15, 15, 'Tattoo Consent - Anxiety', 'I consent to receive a tattoo. I have disclosed my anxiety disorder. I may request breaks during the session and will communicate my needs.', false, NULL, NULL)
    `);

    // Seed consultations (15)
    await client.query(`
      INSERT INTO consultations (client_id, artist_id, date, design_description, style_preferences, reference_images, size_estimate, placement, budget, status, notes) VALUES
      (1, 1, '2026-03-10', 'Full back Japanese dragon piece with cherry blossoms and waves', 'Japanese Traditional, Irezumi', 'dragon_ref1.jpg, dragon_ref2.jpg', 'Extra Large - Full Back', 'Full back', 5000.00, 'approved', 'Multi-session piece. Client very committed.'),
      (5, 6, '2026-03-15', 'Minimalist crescent moon behind the ear', 'Fine line, Minimalist', 'moon_ref.jpg', 'Tiny - 1 inch', 'Behind ear', 200.00, 'approved', 'First tattoo. Client nervous but excited.'),
      (8, 14, '2026-03-20', 'Sacred geometry mandala for upper arm', 'Mandala, Sacred Geometry', 'mandala_ref1.jpg, mandala_ref2.jpg', 'Medium - 5x5 inches', 'Upper arm', 500.00, 'pending', 'Need to do test patch first due to keloid history.'),
      (2, 4, '2026-03-18', 'Watercolor hummingbird with flowers', 'Watercolor, Nature', 'hummingbird_ref.jpg', 'Medium - 4x6 inches', 'Upper back', 400.00, 'pending', 'Non-latex gloves required. Discuss color options.'),
      (11, 12, '2026-03-12', 'Surrealist eye with galaxy inside', 'Surrealism, Color Realism', 'galaxy_eye_ref.jpg', 'Medium - 4x4 inches', 'Inner forearm', 600.00, 'approved', 'Complex color work. Client experienced.'),
      (3, 13, '2026-03-19', 'Dark gothic castle with bats and full moon', 'Dark Art, Gothic', 'gothic_castle_ref.jpg', 'Large - 8x6 inches', 'Upper arm', 700.00, 'pending', 'Black and grey only.'),
      (13, 8, '2026-03-17', 'Anime sleeve with multiple characters', 'Anime, Illustrative', 'anime_ref1.jpg, anime_ref2.jpg, anime_ref3.jpg', 'Extra Large - Full Sleeve', 'Full arm sleeve', 3000.00, 'in_progress', 'Will start with one character and build out.'),
      (6, 3, '2026-03-14', 'Photorealistic lion portrait', 'Realism, Portrait', 'lion_ref1.jpg, lion_ref2.jpg', 'Large - 8x10 inches', 'Thigh', 1200.00, 'approved', 'Paper tape only. Doctor clearance on file.'),
      (9, 5, '2026-03-16', 'Yggdrasil world tree with rune border', 'Nordic, Tribal', 'yggdrasil_ref.jpg', 'Large - 10x8 inches', 'Chest', 900.00, 'approved', 'No numbing cream. Client researched rune meanings.'),
      (14, 7, '2026-03-13', 'Day of the Dead sugar skull with marigolds', 'Neo-Traditional, Chicano', 'skull_ref.jpg', 'Medium - 5x5 inches', 'Calf', 500.00, 'approved', 'Verify equipment metals for nickel allergy.'),
      (12, 9, '2026-03-11', 'Ornamental sternum piece with flowing lines', 'Ornamental, Henna-inspired', 'ornamental_ref.jpg', 'Medium - 6x8 inches', 'Sternum', 450.00, 'approved', 'Fragrance-free products only.'),
      (15, 7, '2026-03-20', 'Neo-traditional rose with dagger and banner', 'Neo-Traditional', 'rose_dagger_ref.jpg', 'Medium - 5x7 inches', 'Forearm', 650.00, 'approved', 'Plan breaks for anxiety management.'),
      (4, 11, '2026-03-22', 'Botanical illustration of birth month flowers', 'Botanical, Illustrative', 'birth_flowers_ref.jpg', 'Medium - 4x8 inches', 'Ribcage', 500.00, 'pending', 'January (carnation) and June (rose).'),
      (7, 1, '2026-03-08', 'Japanese koi fish sleeve with waves and maple leaves', 'Japanese Traditional', 'koi_ref1.jpg, koi_ref2.jpg', 'Extra Large - Full Sleeve', 'Full arm', 4000.00, 'in_progress', 'Ongoing project. Great healer.'),
      (10, 11, '2026-03-21', 'Delicate lavender sprig botanical', 'Botanical, Fine Line', 'lavender_ref.jpg', 'Small - 2x4 inches', 'Ankle', 300.00, 'approved', 'Extra aftercare for bleeder client.')
    `);

    // Seed inventory (15)
    await client.query(`
      INSERT INTO inventory (item_name, category, brand, quantity, unit, reorder_level, cost_per_unit, supplier, expiry_date, last_restocked) VALUES
      ('Black Tattoo Ink - 4oz', 'Ink', 'Eternal Ink', 24, 'bottles', 10, 18.50, 'Kingpin Tattoo Supply', '2028-06-15', '2026-03-01'),
      ('Round Liner Needles #8 (50pk)', 'Needles', 'Cheyenne', 15, 'packs', 5, 45.00, 'Barber DTS', '2027-12-31', '2026-02-15'),
      ('Nitrile Gloves - Medium (100ct)', 'Safety', 'Unigloves', 30, 'boxes', 10, 12.99, 'Medical Supply Co', '2027-09-01', '2026-03-10'),
      ('A4 Stencil Paper (100 sheets)', 'Supplies', 'Spirit', 8, 'packs', 3, 22.00, 'Kingpin Tattoo Supply', NULL, '2026-03-05'),
      ('Green Soap Concentrate - 1 Gallon', 'Cleaning', 'Cosco', 5, 'gallons', 2, 28.00, 'Tattoo Supply Direct', '2027-03-01', '2026-02-20'),
      ('Tattoo Machine Power Supply', 'Equipment', 'Critical', 4, 'units', 2, 289.00, 'Critical Tattoo Supply', NULL, '2025-11-01'),
      ('Petroleum Jelly - 16oz', 'Aftercare', 'Vaseline', 18, 'jars', 8, 6.50, 'Medical Supply Co', '2028-01-15', '2026-03-12'),
      ('Disposable Razor Blades (100ct)', 'Prep', 'BIC', 12, 'packs', 5, 15.00, 'General Supply', '2027-06-30', '2026-02-28'),
      ('Autoclave Sterilization Pouches (200ct)', 'Sterilization', 'Crosstex', 10, 'boxes', 4, 35.00, 'Medical Supply Co', '2027-12-01', '2026-03-08'),
      ('Color Ink Set - Primary (12 colors)', 'Ink', 'Intenze', 6, 'sets', 2, 185.00, 'Kingpin Tattoo Supply', '2028-03-01', '2026-01-15'),
      ('Barrier Film Roll (1200 sheets)', 'Safety', 'DermShield', 8, 'rolls', 3, 42.00, 'Tattoo Supply Direct', '2027-08-15', '2026-03-01'),
      ('Transfer Gel - 8oz', 'Supplies', 'Stencil Stuff', 14, 'bottles', 5, 19.99, 'Kingpin Tattoo Supply', '2027-11-01', '2026-02-10'),
      ('Ink Cups - Small (1000ct)', 'Supplies', 'Saferly', 20, 'bags', 8, 8.50, 'Barber DTS', NULL, '2026-03-15'),
      ('Antibacterial Foam Soap - 1L', 'Cleaning', 'Dettol', 9, 'bottles', 4, 11.99, 'General Supply', '2027-05-01', '2026-03-03'),
      ('Thermal Printer Paper (5 rolls)', 'Equipment', 'Spirit', 7, 'packs', 3, 32.00, 'Kingpin Tattoo Supply', NULL, '2026-02-25'),
      ('Witch Hazel - 16oz', 'Aftercare', 'Thayers', 16, 'bottles', 6, 9.99, 'Medical Supply Co', '2027-10-01', '2026-03-11')
    `);

    // Seed sterilization logs (15)
    await client.query(`
      INSERT INTO sterilization_logs (equipment_name, sterilization_type, cycle_number, temperature, duration_minutes, operator, result, notes, log_date) VALUES
      ('Autoclave Unit A', 'Steam Autoclave', 1001, 134.00, 18, 'Marcus Rivera', 'Pass', 'Morning cycle - all indicators passed', '2026-03-23 08:00:00'),
      ('Autoclave Unit A', 'Steam Autoclave', 1002, 134.00, 18, 'Marcus Rivera', 'Pass', 'Second morning cycle for additional load', '2026-03-23 08:30:00'),
      ('Autoclave Unit B', 'Steam Autoclave', 567, 132.00, 20, 'Luna Blackwood', 'Pass', 'Backup unit cycle', '2026-03-23 09:00:00'),
      ('Ultrasonic Cleaner', 'Ultrasonic', 2205, 45.00, 15, 'Front Desk Staff', 'Pass', 'Pre-autoclave ultrasonic cleaning', '2026-03-23 07:45:00'),
      ('Autoclave Unit A', 'Steam Autoclave', 998, 134.00, 18, 'Dmitri Volkov', 'Pass', 'Standard afternoon cycle', '2026-03-22 13:00:00'),
      ('Autoclave Unit A', 'Steam Autoclave', 999, 133.50, 18, 'Sage Chen', 'Pass', 'Evening sterilization run', '2026-03-22 17:00:00'),
      ('Autoclave Unit A', 'Steam Autoclave', 1000, 134.00, 18, 'Axel Thorsen', 'Pass', 'Milestone cycle 1000 - unit inspected', '2026-03-22 20:00:00'),
      ('Autoclave Unit B', 'Steam Autoclave', 564, 131.00, 20, 'Yuki Tanaka', 'Fail', 'Temperature slightly low. Re-run required.', '2026-03-21 08:00:00'),
      ('Autoclave Unit B', 'Steam Autoclave', 565, 133.00, 20, 'Yuki Tanaka', 'Pass', 'Re-run after adjustment. All clear.', '2026-03-21 08:45:00'),
      ('Ultrasonic Cleaner', 'Ultrasonic', 2203, 44.00, 15, 'Rosa Gutierrez', 'Pass', 'Morning ultrasonic cycle', '2026-03-21 07:30:00'),
      ('Autoclave Unit A', 'Steam Autoclave', 997, 134.00, 18, 'Rex Morrison', 'Pass', 'Standard cycle - spore test included', '2026-03-21 13:00:00'),
      ('Ultrasonic Cleaner', 'Ultrasonic', 2204, 45.00, 15, 'Theo Baptiste', 'Pass', 'Afternoon pre-clean cycle', '2026-03-22 12:00:00'),
      ('Autoclave Unit A', 'Steam Autoclave', 996, 134.00, 18, 'Kai Nakamura', 'Pass', 'End of day sterilization', '2026-03-20 18:00:00'),
      ('Autoclave Unit B', 'Steam Autoclave', 566, 133.00, 20, 'Freya Odinsdottir', 'Pass', 'Weekly deep cycle with biological indicator', '2026-03-22 09:00:00'),
      ('Dry Heat Sterilizer', 'Dry Heat', 310, 170.00, 60, 'Diego Santos', 'Pass', 'Dry heat cycle for non-steam items', '2026-03-22 10:00:00')
    `);

    // Seed walk-in queue (15)
    await client.query(`
      INSERT INTO walkin_queue (client_name, phone, desired_service, preferred_artist, estimated_wait, position, status, check_in_time) VALUES
      ('Chris Walker', '555-0201', 'Small tattoo - flash design', 'Any available', 30, 1, 'waiting', '2026-03-23 10:00:00'),
      ('Jamie Torres', '555-0202', 'Ear piercing', 'No preference', 15, 2, 'waiting', '2026-03-23 10:15:00'),
      ('Pat Murphy', '555-0203', 'Medium tattoo - custom', 'Luna Blackwood', 60, 3, 'waiting', '2026-03-23 10:30:00'),
      ('Sam Green', '555-0204', 'Nose piercing', 'No preference', 20, 4, 'waiting', '2026-03-23 10:45:00'),
      ('Alex Brown', '555-0205', 'Touch-up on existing tattoo', 'Rex Morrison', 45, 5, 'waiting', '2026-03-23 11:00:00'),
      ('Robin Nash', '555-0206', 'Small flash tattoo', 'Yuki Tanaka', 30, 6, 'waiting', '2026-03-23 11:15:00'),
      ('Jesse Ortiz', '555-0207', 'Consultation only', 'Dmitri Volkov', 15, 7, 'waiting', '2026-03-23 11:30:00'),
      ('Morgan Price', '555-0208', 'Finger tattoo', 'Any available', 20, 8, 'waiting', '2026-03-23 11:45:00'),
      ('Dana White', '555-0209', 'Cover-up consultation', 'Rosa Gutierrez', 30, 0, 'in_service', '2026-03-23 09:30:00'),
      ('Taylor Ford', '555-0210', 'Small lettering tattoo', 'Yuki Tanaka', 45, 0, 'in_service', '2026-03-23 09:45:00'),
      ('Casey West', '555-0211', 'Helix piercing', 'No preference', 0, 0, 'completed', '2026-03-23 08:30:00'),
      ('Reese Kim', '555-0212', 'Flash tattoo from wall', 'Rex Morrison', 0, 0, 'completed', '2026-03-23 08:00:00'),
      ('Quinn Cole', '555-0213', 'Small custom tattoo', 'Sage Chen', 0, 0, 'cancelled', '2026-03-23 09:00:00'),
      ('Blake Reed', '555-0214', 'Septum piercing', 'No preference', 25, 9, 'waiting', '2026-03-23 12:00:00'),
      ('Jordan Diaz', '555-0215', 'Memorial tattoo consultation', 'Dmitri Volkov', 35, 10, 'waiting', '2026-03-23 12:15:00')
    `);

    // Seed gift certificates (15)
    await client.query(`
      INSERT INTO gift_certificates (code, purchaser_name, recipient_name, amount, balance, expiry_date, status, notes) VALUES
      ('GIFT-2026-001', 'Sarah Mitchell', 'Jordan Mitchell', 500.00, 500.00, '2027-03-23', 'active', 'Birthday gift for dragon tattoo'),
      ('GIFT-2026-002', 'Mike Thompson', 'Alex Thompson', 200.00, 150.00, '2027-06-15', 'active', 'Partial redemption on fine line piece'),
      ('GIFT-2026-003', 'Lisa Chen', 'Avery Chen', 300.00, 300.00, '2027-01-01', 'active', 'Holiday gift'),
      ('GIFT-2026-004', 'Tom Rivera', 'Casey Rivera', 150.00, 0.00, '2026-12-31', 'redeemed', 'Used for geometric piece'),
      ('GIFT-2026-005', 'Karen Lee', 'Morgan Lee', 400.00, 250.00, '2027-04-30', 'active', 'Anniversary present'),
      ('GIFT-2026-006', 'Bob Sullivan', 'Drew Sullivan', 1000.00, 800.00, '2027-09-01', 'active', 'Major piece fund'),
      ('GIFT-2026-007', 'Amy Harper', 'Quinn Harper', 350.00, 350.00, '2027-03-01', 'active', 'Sleeve continuation funding'),
      ('GIFT-2026-008', 'James Foster', 'Riley Foster', 250.00, 250.00, '2027-07-15', 'active', 'Graduation gift'),
      ('GIFT-2026-009', 'Nancy Reeves', 'Jamie Reeves', 500.00, 100.00, '2027-02-28', 'active', 'Tattoo enthusiast gift - mostly used'),
      ('GIFT-2026-010', 'Pete Davis', 'Parker Davis', 200.00, 200.00, '2026-08-01', 'expired', 'Expired unused'),
      ('GIFT-2026-011', 'Maria Wood', 'Skyler Wood', 175.00, 175.00, '2027-05-15', 'active', '18th birthday tattoo fund'),
      ('GIFT-2026-012', 'David Nguyen', 'Dakota Nguyen', 300.00, 180.00, '2027-08-31', 'active', 'Used partially for piercing'),
      ('GIFT-2026-013', 'Ellen Blake', 'Emerson Blake', 250.00, 250.00, '2027-11-23', 'active', 'Self-care gift'),
      ('GIFT-2026-014', 'Corporate Events Inc', 'Employee Raffle Winner', 100.00, 100.00, '2026-09-30', 'active', 'Corporate event prize'),
      ('GIFT-2026-015', 'Linda Okafor', 'Sam Okafor', 350.00, 350.00, '2027-04-17', 'active', 'Birthday present - test patch first')
    `);

    // Seed loyalty rewards (15)
    await client.query(`
      INSERT INTO loyalty_rewards (client_id, points, action, description, date) VALUES
      (1, 100, 'session_complete', 'Completed Japanese dragon session 1', '2026-02-15'),
      (1, 50, 'referral', 'Referred Taylor Kim', '2026-03-01'),
      (4, 100, 'session_complete', 'Completed watercolor phoenix tattoo', '2026-01-20'),
      (4, 20, 'review', 'Left 5-star Google review', '2026-01-25'),
      (6, 200, 'session_complete', 'Completed large portrait session', '2026-02-10'),
      (6, 100, 'session_complete', 'Completed second portrait session', '2026-03-05'),
      (7, 150, 'session_complete', 'Sleeve session 3 complete', '2026-03-01'),
      (7, 50, 'referral', 'Referred a friend', '2026-02-20'),
      (11, 200, 'session_complete', 'Multiple small pieces completed', '2026-01-15'),
      (11, 100, 'session_complete', 'Color piece completed', '2026-02-28'),
      (11, 20, 'social_share', 'Shared tattoo on Instagram', '2026-03-02'),
      (14, 100, 'session_complete', 'Piercing and jewelry purchase', '2026-02-05'),
      (14, 10, 'check_in', 'Loyalty check-in bonus', '2026-03-10'),
      (9, 80, 'session_complete', 'Medium tattoo completed', '2026-02-18'),
      (15, 50, 'session_complete', 'First tattoo completed', '2026-03-15')
    `);

    // Seed commissions (15)
    await client.query(`
      INSERT INTO commissions (artist_id, appointment_id, service_amount, commission_rate, commission_amount, tip_amount, payment_method, status, pay_period) VALUES
      (1, 1, 2500.00, 60.00, 1500.00, 200.00, 'credit_card', 'paid', '2026-03-01 to 2026-03-15'),
      (6, 2, 250.00, 50.00, 125.00, 40.00, 'cash', 'pending', '2026-03-16 to 2026-03-31'),
      (2, 3, 600.00, 55.00, 330.00, 80.00, 'credit_card', 'pending', '2026-03-16 to 2026-03-31'),
      (4, 4, 450.00, 50.00, 225.00, 60.00, 'credit_card', 'pending', '2026-03-16 to 2026-03-31'),
      (6, 5, 150.00, 50.00, 75.00, 25.00, 'cash', 'pending', '2026-03-16 to 2026-03-31'),
      (3, 6, 1200.00, 60.00, 720.00, 150.00, 'credit_card', 'pending', '2026-03-16 to 2026-03-31'),
      (1, 7, 2000.00, 60.00, 1200.00, 180.00, 'credit_card', 'pending', '2026-03-16 to 2026-03-31'),
      (5, 9, 800.00, 55.00, 440.00, 100.00, 'debit', 'pending', '2026-03-16 to 2026-03-31'),
      (11, 10, 300.00, 50.00, 150.00, 45.00, 'cash', 'pending', '2026-03-16 to 2026-03-31'),
      (15, 11, 550.00, 55.00, 302.50, 75.00, 'credit_card', 'pending', '2026-03-16 to 2026-03-31'),
      (9, 12, 400.00, 55.00, 220.00, 50.00, 'credit_card', 'pending', '2026-03-16 to 2026-03-31'),
      (8, 13, 500.00, 45.00, 225.00, 65.00, 'debit', 'pending', '2026-03-16 to 2026-03-31'),
      (10, 14, 900.00, 55.00, 495.00, 120.00, 'credit_card', 'pending', '2026-03-16 to 2026-03-31'),
      (7, 15, 650.00, 55.00, 357.50, 85.00, 'credit_card', 'pending', '2026-03-16 to 2026-03-31'),
      (14, 8, 0.00, 55.00, 0.00, 0.00, 'N/A', 'pending', '2026-03-16 to 2026-03-31')
    `);

    // Seed cleaning checklists (15)
    await client.query(`
      INSERT INTO cleaning_checklists (area, task, assigned_to, completed, completed_by, shift, checklist_date, notes) VALUES
      ('Station 1', 'Wipe down tattoo chair with medical-grade disinfectant', 'Marcus Rivera', true, 'Marcus Rivera', 'morning', '2026-03-23', 'Completed before first client'),
      ('Station 1', 'Replace barrier film on all surfaces', 'Marcus Rivera', true, 'Marcus Rivera', 'morning', '2026-03-23', NULL),
      ('Station 2', 'Wipe down tattoo chair with medical-grade disinfectant', 'Luna Blackwood', true, 'Luna Blackwood', 'morning', '2026-03-23', NULL),
      ('Station 2', 'Replace barrier film on all surfaces', 'Luna Blackwood', false, NULL, 'morning', '2026-03-23', NULL),
      ('Reception', 'Vacuum and mop floors', 'Front Desk Staff', true, 'Front Desk Staff', 'morning', '2026-03-23', 'Used new floor cleaner'),
      ('Reception', 'Wipe down counter and display cases', 'Front Desk Staff', true, 'Front Desk Staff', 'morning', '2026-03-23', NULL),
      ('Bathroom', 'Deep clean and restock supplies', 'Front Desk Staff', true, 'Front Desk Staff', 'morning', '2026-03-23', 'Restocked paper towels and soap'),
      ('Sterilization Room', 'Clean autoclave exterior and trays', 'Sage Chen', false, NULL, 'morning', '2026-03-23', NULL),
      ('Sterilization Room', 'Log biological indicator results', 'Sage Chen', false, NULL, 'morning', '2026-03-23', NULL),
      ('Station 3', 'Wipe down tattoo chair with medical-grade disinfectant', 'Dmitri Volkov', false, NULL, 'afternoon', '2026-03-23', NULL),
      ('Station 3', 'Replace barrier film on all surfaces', 'Dmitri Volkov', false, NULL, 'afternoon', '2026-03-23', NULL),
      ('Common Area', 'Empty all trash bins and replace liners', 'Front Desk Staff', false, NULL, 'afternoon', '2026-03-23', NULL),
      ('Common Area', 'Wipe down seating area and magazines', 'Front Desk Staff', false, NULL, 'afternoon', '2026-03-23', NULL),
      ('All Stations', 'End of day deep clean - all work surfaces', 'Closing Staff', false, NULL, 'evening', '2026-03-23', NULL),
      ('Entire Studio', 'Weekly floor deep clean and UV sanitization', 'Closing Staff', false, NULL, 'evening', '2026-03-23', 'Scheduled weekly deep clean')
    `);

    // Seed flash designs (15)
    await client.query(`
      INSERT INTO flash_designs (artist_id, name, description, style, size, placement_suggestion, price, available, image_url) VALUES
      (15, 'Classic Anchor', 'Bold American traditional anchor with rope and banner reading "Hold Fast"', 'American Traditional', 'Medium - 4x5 inches', 'Forearm, Calf', 250.00, true, '/flash/anchor.jpg'),
      (15, 'Sailor Jerry Swallow', 'Pair of traditional swallows in red, blue, and yellow', 'American Traditional', 'Small - 3x3 inches each', 'Chest, Shoulders', 200.00, true, '/flash/swallows.jpg'),
      (6, 'Celestial Moon Phase', 'Delicate fine line moon phase strip design', 'Fine Line', 'Small - 1x6 inches', 'Spine, Forearm, Collarbone', 180.00, true, '/flash/moonphase.jpg'),
      (6, 'Wildflower Bundle', 'Minimalist wildflower bouquet with lavender, daisy, and poppy', 'Fine Line', 'Small - 2x4 inches', 'Inner Arm, Ankle, Ribs', 175.00, true, '/flash/wildflowers.jpg'),
      (2, 'Sacred Geometry Cube', 'Metatrons cube with dotwork shading', 'Geometric', 'Medium - 4x4 inches', 'Upper Arm, Back, Thigh', 300.00, true, '/flash/metatron.jpg'),
      (14, 'Lotus Mandala', 'Intricate mandala within a lotus flower outline', 'Mandala', 'Medium - 5x5 inches', 'Thigh, Shoulder, Back', 320.00, true, '/flash/lotus_mandala.jpg'),
      (4, 'Watercolor Butterfly', 'Vibrant watercolor butterfly with paint splatter effect', 'Watercolor', 'Medium - 4x4 inches', 'Shoulder Blade, Upper Back', 280.00, true, '/flash/watercolor_butterfly.jpg'),
      (13, 'Gothic Rose', 'Dark gothic rose with thorns and dripping ink effect', 'Dark Art', 'Medium - 3x5 inches', 'Forearm, Neck, Hand', 240.00, true, '/flash/gothic_rose.jpg'),
      (5, 'Viking Compass', 'Vegvisir Norse compass with rune border', 'Nordic', 'Medium - 4x4 inches', 'Chest, Upper Arm, Back', 290.00, true, '/flash/vegvisir.jpg'),
      (7, 'Sugar Skull', 'Detailed Day of the Dead sugar skull with flowers', 'Neo-Traditional', 'Medium - 4x5 inches', 'Thigh, Calf, Upper Arm', 310.00, true, '/flash/sugar_skull.jpg'),
      (8, 'Chibi Cat', 'Cute anime-style chibi cat with cherry blossoms', 'Anime', 'Small - 2x3 inches', 'Wrist, Ankle, Behind Ear', 150.00, true, '/flash/chibi_cat.jpg'),
      (11, 'Botanical Fern', 'Realistic fern frond with unfurling fiddlehead', 'Botanical', 'Small - 2x5 inches', 'Forearm, Ribcage, Calf', 200.00, true, '/flash/fern.jpg'),
      (12, 'Eye of Providence', 'Surreal all-seeing eye with galaxy iris', 'Surrealism', 'Medium - 3x4 inches', 'Inner Forearm, Back of Hand', 350.00, true, '/flash/eye_galaxy.jpg'),
      (9, 'Ornamental Band', 'Flowing ornamental arm band with filigree patterns', 'Ornamental', 'Medium - 2x12 inches', 'Upper Arm, Thigh, Calf', 275.00, true, '/flash/ornamental_band.jpg'),
      (10, 'Trash Polka Clock', 'Abstract clock face with bold red and black splatter', 'Trash Polka', 'Large - 6x6 inches', 'Upper Arm, Thigh, Chest', 380.00, true, '/flash/trash_clock.jpg'),
      (3, 'Realistic Eye', 'Photorealistic human eye with reflection detail', 'Realism', 'Small - 2x3 inches', 'Inner Arm, Back of Neck', 300.00, true, '/flash/realistic_eye.jpg')
    `);

    // Seed aftercare instructions (15)
    await client.query(`
      INSERT INTO aftercare_instructions (service_type, instructions, custom_notes) VALUES
      ('Tattoo - Standard', 'Keep bandage on for 2-4 hours. Gently wash with lukewarm water and fragrance-free soap. Pat dry with clean paper towel. Apply thin layer of unscented moisturizer 2-3 times daily. Avoid direct sunlight, swimming, and soaking for 2-3 weeks. Do not pick or scratch peeling skin. Wear loose clothing over the tattoo.', 'Standard aftercare for most tattoos'),
      ('Tattoo - Color', 'Keep bandage on for 2-4 hours. Wash gently with fragrance-free antibacterial soap. Apply aftercare ointment sparingly. Color tattoos may take longer to heal - expect 3-4 weeks. Avoid sun exposure as UV can fade colors quickly. Apply SPF 50+ once fully healed.', 'Color tattoos need extra sun protection'),
      ('Tattoo - Fine Line', 'Keep second skin bandage on for 3-5 days if applied. If traditional wrap, remove after 2-3 hours. Fine line work is delicate - be extremely gentle when washing. Apply minimal moisturizer. Avoid stretching the area. Fine lines may need a touch-up after healing.', 'Fine line work requires gentle care'),
      ('Tattoo - Large Piece', 'Keep bandage on for recommended time. Large pieces generate more plasma - this is normal. Wash 2-3 times daily gently. Expect significant peeling around days 3-7. Sleep on clean sheets. Stay hydrated and eat well to support healing. Healing may take 4-6 weeks.', 'Large pieces have longer healing times'),
      ('Tattoo - Hand/Finger', 'Hand and finger tattoos fade faster due to high use. Keep bandage on as long as possible. Wash hands gently and apply moisturizer frequently. Avoid submerging hands in water. Touch-ups are commonly needed within 6-12 months. Apply sunscreen daily once healed.', 'Hand tattoos need frequent touch-ups'),
      ('Tattoo - Ribcage', 'This area is prone to more swelling. Apply ice packs over a cloth if needed. Avoid tight clothing. Sleep on the opposite side. The ribcage moves with breathing so healing may take longer. Keep the area clean and moisturized.', 'Ribcage tattoos may swell more'),
      ('Tattoo - Cover-Up', 'Cover-up tattoos involve heavier ink saturation. The area may weep more ink initially - this is normal. Keep extra clean and moisturized. Healing may take slightly longer than a fresh tattoo. Avoid any trauma to the area.', 'Cover-ups have heavier saturation'),
      ('Piercing - Ear Lobe', 'Clean twice daily with sterile saline solution. Do not twist or rotate jewelry. Avoid sleeping on the piercing side. Do not remove jewelry for at least 6-8 weeks. Watch for signs of infection: excessive redness, warmth, or green discharge.', 'Standard ear lobe piercing care'),
      ('Piercing - Cartilage', 'Clean with saline 2 times daily. Cartilage piercings take 6-12 months to fully heal. Do not change jewelry during healing. Avoid snagging on clothing or hair. Sleep on a travel pillow to avoid pressure on the piercing.', 'Cartilage heals much slower than lobe'),
      ('Piercing - Nose', 'Clean inside and outside with saline spray. Do not blow nose forcefully for the first week. Avoid makeup near the piercing. If using a stud, be careful with clothing. Healing takes 3-6 months. See a piercer for jewelry changes.', 'Nose piercings need careful cleaning'),
      ('Piercing - Septum', 'Clean with saline spray 2-3 times daily. You can flip the jewelry up during healing if needed. Avoid touching with dirty hands. Do not pull on the jewelry. Healing takes 6-8 weeks for initial, 6 months for full heal.', 'Septum piercings are relatively quick healers'),
      ('Tattoo - Watercolor', 'Watercolor tattoos use lighter saturation which can fade faster. Follow standard tattoo aftercare. Apply SPF 50+ religiously once healed. Touch-ups may be needed sooner than traditional tattoos. Avoid prolonged sun exposure.', 'Watercolor fades faster - sunscreen essential'),
      ('Tattoo - Blackwork', 'Heavy blackwork may weep significant amounts of ink - this is normal. Use white or dark sheets during initial healing. Clean thoroughly 2-3 times daily. The solid black will appear grey during peeling - color returns as skin heals.', 'Blackwork seeps more ink initially'),
      ('Tattoo - Sensitive Skin', 'For clients with sensitive skin: Use only unscented, hypoallergenic products. Aquaphor or specialized tattoo balm recommended over regular lotion. Monitor for allergic reactions. If excessive redness or raised skin persists beyond 48 hours, contact the studio.', 'Hypoallergenic products only'),
      ('Tattoo - Touch Up', 'Touch-up aftercare follows the same protocol as a new tattoo. The area may heal faster since the skin has been tattooed before. Still avoid sun, soaking, and picking. Apply moisturizer regularly.', 'Touch-ups heal slightly faster')
    `);

    // Seed pricing records (15)
    await client.query(`
      INSERT INTO pricing_records (service_type, style, size, complexity, color_work, placement, base_price, hourly_rate, estimated_hours, total_estimate, notes) VALUES
      ('tattoo', 'Traditional', 'Small', 'simple', 'full-color', 'Forearm', 150.00, 150.00, 1.0, 150.00, 'Classic sailor jerry style flash'),
      ('tattoo', 'Japanese', 'Large', 'complex', 'full-color', 'Full Sleeve', 700.00, 200.00, 6.0, 1820.00, 'Full sleeve koi and waves'),
      ('tattoo', 'Realism', 'Medium', 'complex', 'black-grey', 'Upper Arm', 350.00, 180.00, 3.0, 700.00, 'Portrait piece'),
      ('tattoo', 'Blackwork', 'Large', 'detailed', 'black-grey', 'Back', 700.00, 160.00, 5.0, 1232.00, 'Geometric mandala back piece'),
      ('tattoo', 'Watercolor', 'Medium', 'moderate', 'full-color', 'Ribcage', 350.00, 175.00, 2.5, 568.75, 'Watercolor floral design'),
      ('tattoo', 'Minimalist', 'Tiny', 'simple', 'black-grey', 'Wrist', 80.00, 150.00, 0.5, 80.00, 'Fine line minimal design'),
      ('tattoo', 'Neo-Traditional', 'Medium', 'detailed', 'full-color', 'Thigh', 350.00, 170.00, 3.0, 588.00, 'Neo-trad animal portrait'),
      ('tattoo', 'Dotwork', 'Large', 'ultra-complex', 'black-grey', 'Chest', 700.00, 190.00, 8.0, 2012.50, 'Full chest sacred geometry'),
      ('piercing', 'Standard', 'Small', 'simple', 'black-grey', 'Ear', 50.00, 0.00, 0.25, 50.00, 'Standard lobe piercing with jewelry'),
      ('piercing', 'Cartilage', 'Small', 'moderate', 'black-grey', 'Ear', 75.00, 0.00, 0.25, 75.00, 'Helix/tragus piercing'),
      ('tattoo', 'Chicano', 'Medium', 'detailed', 'black-grey', 'Forearm', 350.00, 165.00, 3.0, 560.00, 'Script and portrait work'),
      ('tattoo', 'Tribal', 'Large', 'moderate', 'black-grey', 'Shoulder', 700.00, 155.00, 4.0, 910.00, 'Polynesian tribal shoulder'),
      ('tattoo', 'Surrealism', 'Medium', 'complex', 'full-color', 'Calf', 350.00, 185.00, 3.5, 700.00, 'Surreal landscape piece'),
      ('touch-up', 'Various', 'Small', 'simple', 'full-color', 'Various', 75.00, 100.00, 0.5, 75.00, 'Standard touch-up session'),
      ('cover-up', 'Realism', 'Medium', 'complex', 'full-color', 'Upper Arm', 450.00, 200.00, 4.0, 900.00, 'Cover-up with realistic design')
    `);

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
