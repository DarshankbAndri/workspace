const regions = [
  ['Rajasthan', 'Jaisalmer', 26.9157, 70.9083],
  ['Gujarat', 'Kutch', 23.7337, 69.8597],
  ['Karnataka', 'Pavagada', 14.1010, 77.2807],
  ['Tamil Nadu', 'Kamuthi', 9.4071, 78.3788],
  ['Andhra Pradesh', 'Kurnool', 15.8281, 78.0373],
  ['Maharashtra', 'Dhule', 20.9042, 74.7749],
];

const equipmentTemplates = [
  ['INV', 'Central Inverter', 'Inverter Systems', 'Sungrow', 'SG3125HV'],
  ['SINV', 'String Inverter', 'Inverter Systems', 'Huawei', 'SUN2000-330KTL'],
  ['TRF', 'Power Transformer', 'Transformers', 'PowerAxis', '33/0.8kV 5MVA'],
  ['HTP', 'HT Switchgear Panel', 'Switchgear', 'Siemens', '8DJH'],
  ['SCB', 'String Combiner Box', 'DC Collection', 'Statcon', '24-Input 1500VDC'],
  ['WMS', 'Weather Monitoring Station', 'Instrumentation', 'Campbell Scientific', 'CR1000X'],
  ['PYR', 'Pyranometer', 'Instrumentation', 'Kipp & Zonen', 'SMP10'],
  ['TRK', 'Single Axis Tracker', 'Tracker Systems', 'Nextracker', 'NX Horizon'],
  ['SCADA', 'SCADA Server', 'Automation', 'Dell', 'PowerEdge R550'],
  ['PUMP', 'Module Cleaning Water Pump', 'Utilities', 'Kirloskar', 'KDS-538'],
  ['UPS', 'Control Room UPS', 'Electrical Utilities', 'Vertiv', 'Liebert EXS'],
  ['FIRE', 'Fire Alarm Control Panel', 'Safety Systems', 'Honeywell', 'Morley-IAS'],
];

const spareTemplates = [
  ['FAN', 'Inverter Cooling Fan', 'Inverter Spares', 'PCS', 18500],
  ['IGBT', 'IGBT Power Module', 'Inverter Spares', 'PCS', 145000],
  ['DCF', '1500V DC Fuse', 'DC Electrical', 'PCS', 2400],
  ['CONT', 'AC Contactor', 'AC Electrical', 'PCS', 12800],
  ['COM', 'Inverter Communication Card', 'Automation Spares', 'PCS', 68500],
  ['TMOT', 'Tracker Drive Motor', 'Tracker Spares', 'PCS', 42000],
  ['TGBX', 'Tracker Gearbox', 'Tracker Spares', 'PCS', 56000],
  ['PYRS', 'Class A Pyranometer Sensor', 'Instrumentation', 'PCS', 215000],
  ['TEMP', 'Module Temperature Sensor PT100', 'Instrumentation', 'PCS', 9500],
  ['MC4', 'MC4 Connector Pair', 'DC Electrical', 'PAIR', 680],
  ['DCC', 'Solar DC Cable 6 sq mm', 'Cables', 'MTR', 145],
  ['VCBC', 'VCB Closing Coil', 'Switchgear Spares', 'PCS', 18500],
  ['TRFG', 'Transformer Gasket Kit', 'Transformer Spares', 'SET', 26500],
  ['PBRG', 'Water Pump Bearing Set', 'Mechanical Spares', 'SET', 7200],
  ['UPSB', 'UPS Battery 12V 100Ah', 'Electrical Utilities', 'PCS', 19800],
  ['FCON', 'Industrial Fiber Converter', 'Network Spares', 'PCS', 16200],
];

const pmTasks = [
  ['Inverter monthly inspection', 'Inspect cooling, DC inputs, alarm history, and communication health.'],
  ['Transformer oil level inspection', 'Check oil level, leakage, breather silica gel, and temperature indicators.'],
  ['Transformer thermography', 'Capture thermal images of bushings, cable terminations, and radiators.'],
  ['String combiner box inspection', 'Inspect fuses, SPD status, torque, insulation, and string currents.'],
  ['Tracker lubrication', 'Lubricate bearings and verify slew-drive movement and limit switches.'],
  ['Module cleaning inspection', 'Verify cleaning quality, water pressure, brush condition, and safety barricading.'],
  ['Weather station calibration', 'Compare sensors with references and record calibration deviations.'],
  ['Pyranometer calibration', 'Clean dome, verify levelling, cable integrity, and calibration factor.'],
  ['SCADA server backup', 'Verify database backup, storage health, time synchronization, and restore readiness.'],
  ['UPS battery inspection', 'Measure battery voltage, impedance, terminal torque, and backup duration.'],
  ['Fire panel inspection', 'Test panel indications, loop health, batteries, and selected field devices.'],
  ['Earthing resistance measurement', 'Measure earth-pit resistance and inspect joints, labels, and chamber condition.'],
];

const issues = [
  ['Inverter communication failure', 'The inverter stopped reporting live values to SCADA while local generation continued.'],
  ['Low inverter output', 'Active power is below the expected curve despite normal irradiance.'],
  ['Transformer oil leakage', 'Oil seepage is visible near the radiator flange and requires inspection.'],
  ['High winding temperature', 'Winding temperature alarm occurred during peak generation hours.'],
  ['String current mismatch', 'One DC string group shows persistent current deviation above the alert threshold.'],
  ['Tracker motor jammed', 'Tracker row failed to follow the commanded morning angle.'],
  ['SCADA data unavailable', 'Plant historian tags are stale and dashboard data is unavailable.'],
  ['Pyranometer reading abnormal', 'Plane-of-array irradiance differs materially from the redundant sensor.'],
  ['Module hotspot detected', 'Drone thermography identified a probable hotspot in the array.'],
  ['DC cable insulation damage', 'Inspection found abrasion on a DC cable near the tray entry.'],
  ['AC breaker trip', 'Feeder breaker tripped during normal loading and requires root-cause analysis.'],
  ['Water pump vibration', 'Cleaning water pump vibration and bearing noise have increased.'],
  ['UPS battery low', 'UPS autonomy test ended below the required backup duration.'],
  ['Weather station communication issue', 'Weather station gateway is intermittently dropping Modbus frames.'],
];

const firstNames = ['Aarav', 'Aditya', 'Ananya', 'Arjun', 'Deepak', 'Diya', 'Farhan', 'Gaurav', 'Ishita', 'Karan', 'Kavya', 'Lakshmi', 'Manish', 'Meera', 'Naveen', 'Neha', 'Pranav', 'Priya', 'Rahul', 'Riya', 'Rohan', 'Sanjay', 'Sneha', 'Vikram'];
const lastNames = ['Sharma', 'Patel', 'Reddy', 'Iyer', 'Singh', 'Kulkarni', 'Joshi', 'Nair', 'Verma', 'Rao', 'Mehta', 'Das'];
const roles = ['Electrical Engineer', 'Mechanical Engineer', 'SCADA Engineer', 'Inverter Technician', 'Tracker Technician', 'Solar O&M Technician', 'Module Cleaning Supervisor', 'Store Executive', 'Safety Officer', 'Shift Operator'];
const vendorRoots = ['SunVolt Energy Systems', 'GreenGrid Electricals', 'HelioTrack Technologies', 'PowerAxis Transformers', 'SolarSense Automation', 'EcoClean Robotics', 'BrightRay Modules', 'GridSecure Systems', 'Renewable Spares India', 'Astra Cable Solutions'];
const vendorCategories = ['Inverter Service', 'Electrical Balance of Plant', 'Tracker Maintenance', 'Transformer Service', 'SCADA and Automation', 'Robotic Cleaning', 'Solar Modules', 'Security Systems', 'Maintenance Spares', 'Cables and Terminations'];
const downtimeReasons = ['Inverter breakdown', 'Grid outage', 'Transformer maintenance', 'Tracker failure', 'SCADA communication loss', 'Module cleaning activity', 'Breaker trip', 'DC cable fault', 'Weather shutdown', 'Preventive maintenance'];

const pad = (value, length = 3) => String(value).padStart(length, '0');
const isoDate = (daysFromToday) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
};
const localDateTime = (hoursAgo) => {
  const date = new Date(Date.now() - hoursAgo * 3600000 - new Date().getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
};

function site(index, prefix) {
  const region = regions[index % regions.length];
  const block = Math.floor(index / regions.length) + 1;
  return {
    siteCode: `${prefix}-SITE-${pad(index + 1)}`,
    siteName: `${region[0]} Solar Park - Block ${pad(block, 2)} Zone ${(index % 6) + 1}`,
    organizationName: 'SunGrid Renewable Energy Pvt Ltd',
    siteType: 'Utility Scale Solar PV Plant',
    addressLine1: `Solar Array Block ${pad(block, 2)}, ${region[1]} Renewable Energy Zone`,
    addressLine2: 'Main O&M access road', city: region[1], state: region[0], country: 'India',
    pincode: String(300000 + index), contactPerson: `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`,
    contactMobile: `9${String(100000000 + index).slice(-9)}`, contactEmail: `site.${pad(index + 1)}@sungrid-demo.example`,
    latitude: (region[2] + (index % 10) * 0.001).toFixed(6), longitude: (region[3] + (index % 10) * 0.001).toFixed(6),
  };
}

function employee(index, prefix) {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  const role = roles[index % roles.length];
  return {
    employeeCode: `${prefix}-EMP-${pad(index + 1)}`, firstName, lastName,
    mobileNumber: `8${String(200000000 + index).slice(-9)}`, email: `${firstName}.${lastName}.${pad(index + 1)}@sungrid-demo.example`.toLowerCase(),
    gender: index % 3 === 0 ? 'FEMALE' : 'MALE', dateOfBirth: isoDate(-9000 - index * 7), dateOfJoining: isoDate(-1500 + (index % 700)),
    designation: role, department: role.includes('Store') ? 'Store and Inventory' : role.includes('Safety') ? 'Health and Safety' : role.includes('SCADA') ? 'SCADA and Automation' : 'Plant Maintenance',
    siteRole: role,
  };
}

function vendor(index, prefix) {
  const region = regions[index % regions.length];
  return {
    vendorCode: `${prefix}-VEN-${pad(index + 1)}`,
    vendorName: `${vendorRoots[index % vendorRoots.length]} - ${region[1]} ${pad(Math.floor(index / vendorRoots.length) + 1, 2)}`,
    contactPerson: `${firstNames[(index + 5) % firstNames.length]} ${lastNames[(index + 3) % lastNames.length]}`,
    email: `service.${pad(index + 1)}@solar-vendor-demo.example`, phone: `7${String(300000000 + index).slice(-9)}`,
    serviceCategory: vendorCategories[index % vendorCategories.length],
    address: `${region[1]} industrial service area, ${region[0]}, India`,
  };
}

function equipment(index, prefix) {
  const t = equipmentTemplates[index % equipmentTemplates.length];
  const block = pad(Math.floor(index / equipmentTemplates.length) + 1, 2);
  return {
    equipmentCode: `${prefix}-${t[0]}-B${block}-${pad(index + 1)}`,
    equipmentName: `${t[1]} Block ${block} Unit ${pad((index % equipmentTemplates.length) + 1, 2)}`,
    category: t[2], location: `Array Block ${block}, Service Bay ${(index % 8) + 1}`, manufacturer: t[3], modelNumber: t[4],
    serialNumber: `${t[0]}-2024-${pad(index + 1001, 5)}`, installationDate: isoDate(-900 - (index % 365)),
    commissioningDate: isoDate(-800 - (index % 365)), warrantyExpiryDate: isoDate(900 + (index % 730)),
    criticality: ['MEDIUM', 'HIGH', 'CRITICAL', 'HIGH'][index % 4], purchaseCost: 250000 + (index % 12) * 175000,
    assetNumber: `SGRE-FA-${pad(index + 1, 5)}`, costCenter: `SOLAR-OM-${pad((index % 20) + 1, 2)}`,
  };
}

function spare(index, prefix) {
  const t = spareTemplates[index % spareTemplates.length];
  const lowStock = index % 4 === 0;
  const minimumStock = 4 + (index % 8);
  return {
    partCode: `${prefix}-SPR-${t[0]}-${pad(index + 1)}`, partName: `${t[1]} - Approved Plant Spare ${pad(index + 1)}`,
    category: t[2], unit: t[3], unitCost: t[4] + (index % 5) * 250, minimumStock,
    currentStock: lowStock ? Math.max(0, minimumStock - 2) : minimumStock + 8 + (index % 15),
    storageLocation: `Central Store Rack ${String.fromCharCode(65 + (index % 12))}-${pad((index % 40) + 1, 2)}`,
    description: `${t[1]} maintained as traceable solar plant breakdown and preventive-maintenance stock.`, lowStock,
  };
}

module.exports = {
  pad, isoDate, localDateTime, site, employee, vendor, equipment, spare,
  pmTasks, issues, roles, downtimeReasons,
};
