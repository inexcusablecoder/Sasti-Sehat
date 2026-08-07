const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Treatment = require('../models/Treatment');
const HospitalTreatment = require('../models/HospitalTreatment');
const BillAnalysis = require('../models/BillAnalysis');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sasti_sehat';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Treatment.deleteMany({});
    await HospitalTreatment.deleteMany({});
    await BillAnalysis.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // Seed Demo Users
    const users = await User.create([
      {
        fullName: 'Rahul Sharma',
        email: 'patient@sastisehat.com',
        password: 'Password123!',
        city: 'Mumbai',
        phone: '+91 9876543210',
        role: 'patient'
      },
      {
        fullName: 'Dr. Priya Laghane (Admin)',
        email: 'admin@sastisehat.com',
        password: 'AdminPassword123!',
        city: 'Pune',
        phone: '+91 9812345678',
        role: 'admin'
      }
    ]);
    console.log(`[Seed] Created ${users.length} demo users.`);

    // Seed Hospitals across Indian cities
    const hospitals = await Hospital.create([
      {
        name: 'Apollo Specialty Hospital',
        city: 'Mumbai',
        address: 'Plot No. 13, Off Thane Belapur Road, Navi Mumbai, Maharashtra 400706',
        rating: 4.8,
        isVerified: true,
        contactPhone: '+91 22 3350 3350',
        accreditation: 'JCI & NABH Accredited',
        bedCapacity: 500,
        location: { type: 'Point', coordinates: [73.0182, 19.0330] }
      },
      {
        name: 'Max Super Specialty Hospital',
        city: 'Delhi',
        address: '1, 2, Press Enclave Marg, Saket, New Delhi 110017',
        rating: 4.7,
        isVerified: true,
        contactPhone: '+91 11 2651 5050',
        accreditation: 'NABH Accredited',
        bedCapacity: 450,
        location: { type: 'Point', coordinates: [77.2140, 28.5284] }
      },
      {
        name: 'Manipal Hospital',
        city: 'Bangalore',
        address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
        rating: 4.6,
        isVerified: true,
        contactPhone: '+91 80 2502 4444',
        accreditation: 'NABH & NABL Accredited',
        bedCapacity: 600,
        location: { type: 'Point', coordinates: [77.6476, 12.9592] }
      },
      {
        name: 'Ruby Hall Clinic',
        city: 'Pune',
        address: '40, Sassoon Road, Sangamvadi, Pune, Maharashtra 411001',
        rating: 4.5,
        isVerified: true,
        contactPhone: '+91 20 6645 5100',
        accreditation: 'NABH Accredited',
        bedCapacity: 350,
        location: { type: 'Point', coordinates: [73.8736, 18.5289] }
      },
      {
        name: 'KIMS Hospitals',
        city: 'Hyderabad',
        address: '1-8-31/1, Minister Rd, Krishna Nagar, Secunderabad, Telangana 500003',
        rating: 4.5,
        isVerified: true,
        contactPhone: '+91 40 4488 5000',
        accreditation: 'NABH Accredited',
        bedCapacity: 400,
        location: { type: 'Point', coordinates: [78.4842, 17.4399] }
      }
    ]);
    console.log(`[Seed] Created ${hospitals.length} hospitals.`);

    // Seed Treatments (Procedure Benchmarks)
    const treatments = await Treatment.create([
      {
        code: 'ANGIO-01',
        title: 'Coronary Angioplasty (with 1 Drug-Eluting Stent)',
        category: 'Cardiology',
        description: 'Minimally invasive procedure to open clogged heart arteries using a balloon and single drug-eluting stent.',
        avgCostNational: 180000,
        fairCostMin: 140000,
        fairCostMax: 220000
      },
      {
        code: 'CAT-01',
        title: 'Cataract Surgery with Monofocal IOL Lens',
        category: 'Ophthalmology',
        description: 'Phacoemulsification cataract removal with implantation of standard monofocal intraocular lens.',
        avgCostNational: 35000,
        fairCostMin: 25000,
        fairCostMax: 45000
      },
      {
        code: 'KNEE-01',
        title: 'Total Knee Replacement (Single Joint)',
        category: 'Orthopedics',
        description: 'Surgical replacement of damaged knee joint components with imported high-durability implant.',
        avgCostNational: 220000,
        fairCostMin: 180000,
        fairCostMax: 260000
      },
      {
        code: 'MRI-BR',
        title: 'MRI Scan Brain (with & without Contrast)',
        category: 'Diagnostics & Imaging',
        description: 'High-resolution 1.5T/3T MRI brain scan including contrast dye imaging and radiologist reporting.',
        avgCostNational: 7500,
        fairCostMin: 5500,
        fairCostMax: 9500
      },
      {
        code: 'APP-01',
        title: 'Laparoscopic Appendectomy',
        category: 'General Surgery',
        description: 'Keyhole laparoscopic removal of inflamed appendix including 2-day hospital stay and anesthesia.',
        avgCostNational: 65000,
        fairCostMin: 50000,
        fairCostMax: 80000
      },
      {
        code: 'GALL-01',
        title: 'Laparoscopic Cholecystectomy (Gallbladder Removal)',
        category: 'Gastroenterology',
        description: 'Minimally invasive gallbladder removal procedure under general anesthesia with standard ward stay.',
        avgCostNational: 75000,
        fairCostMin: 60000,
        fairCostMax: 95000
      },
      {
        code: 'ICU-DAY',
        title: 'ICU Day Stay with Multipara Monitoring',
        category: 'General Surgery',
        description: 'Intensive Care Unit stay per 24 hours including ventilator/monitor support and critical care doctor visits.',
        avgCostNational: 15000,
        fairCostMin: 10000,
        fairCostMax: 20000
      },
      {
        code: 'CBC-01',
        title: 'Complete Blood Count (CBC) + ESR',
        category: 'Diagnostics & Imaging',
        description: 'Comprehensive pathology blood profile evaluating hemoglobin, WBC, platelets, and ESR.',
        avgCostNational: 800,
        fairCostMin: 400,
        fairCostMax: 1200
      }
    ]);
    console.log(`[Seed] Created ${treatments.length} treatment benchmarks.`);

    // Hospital Treatment Pricing Mappings
    const hospitalTreatments = [];

    // Helper map
    const getTreatment = code => treatments.find(t => t.code === code);
    const getHospital = name => hospitals.find(h => h.name.includes(name));

    // Apollo Mumbai Pricing
    hospitalTreatments.push(
      { hospital: getHospital('Apollo')._id, treatment: getTreatment('ANGIO-01')._id, costMin: 165000, costMax: 210000, costAvg: 185000 },
      { hospital: getHospital('Apollo')._id, treatment: getTreatment('CAT-01')._id, costMin: 32000, costMax: 48000, costAvg: 38000 },
      { hospital: getHospital('Apollo')._id, treatment: getTreatment('KNEE-01')._id, costMin: 210000, costMax: 270000, costAvg: 235000 },
      { hospital: getHospital('Apollo')._id, treatment: getTreatment('MRI-BR')._id, costMin: 6800, costMax: 8800, costAvg: 7800 }
    );

    // Max Delhi Pricing
    hospitalTreatments.push(
      { hospital: getHospital('Max')._id, treatment: getTreatment('ANGIO-01')._id, costMin: 170000, costMax: 225000, costAvg: 195000 },
      { hospital: getHospital('Max')._id, treatment: getTreatment('APP-01')._id, costMin: 58000, costMax: 78000, costAvg: 68000 },
      { hospital: getHospital('Max')._id, treatment: getTreatment('GALL-01')._id, costMin: 70000, costMax: 92000, costAvg: 80000 }
    );

    // Manipal Bangalore Pricing
    hospitalTreatments.push(
      { hospital: getHospital('Manipal')._id, treatment: getTreatment('KNEE-01')._id, costMin: 195000, costMax: 245000, costAvg: 215000 },
      { hospital: getHospital('Manipal')._id, treatment: getTreatment('CAT-01')._id, costMin: 28000, costMax: 42000, costAvg: 34000 },
      { hospital: getHospital('Manipal')._id, treatment: getTreatment('MRI-BR')._id, costMin: 6000, costMax: 8000, costAvg: 7000 }
    );

    // Ruby Hall Pune Pricing
    hospitalTreatments.push(
      { hospital: getHospital('Ruby Hall')._id, treatment: getTreatment('APP-01')._id, costMin: 48000, costMax: 68000, costAvg: 56000 },
      { hospital: getHospital('Ruby Hall')._id, treatment: getTreatment('GALL-01')._id, costMin: 62000, costMax: 82000, costAvg: 70000 },
      { hospital: getHospital('Ruby Hall')._id, treatment: getTreatment('CAT-01')._id, costMin: 24000, costMax: 36000, costAvg: 30000 }
    );

    await HospitalTreatment.create(hospitalTreatments);
    console.log(`[Seed] Created ${hospitalTreatments.length} hospital-treatment price mappings.`);

    console.log('[Seed] Database seeding completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
