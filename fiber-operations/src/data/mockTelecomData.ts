import { FatNode, RsuDevice, FiberCableSegment, OperationSwitch, FieldNote, MetricCardData } from '../types/telecom';

export const METRICS_DATA: MetricCardData[] = [
  {
    id: 'total-fats',
    title: 'TOTAL FATS',
    value: '15.80',
    unit: 'MFB',
    changeRate: '+6.45%',
    isPositive: true,
    trend: 'up',
    timeLabels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    dataPoints: [28, 42, 35, 68, 52, 79, 92, 85, 96],
    colorTheme: 'cyan'
  },
  {
    id: 'unique-asus',
    title: 'UNIQUE ASUS / RSUs',
    value: '2277',
    unit: 'MTm',
    changeRate: '+0.92%',
    isPositive: true,
    trend: 'up',
    timeLabels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    dataPoints: [18, 25, 45, 62, 78, 58, 88, 94, 91],
    colorTheme: 'amber'
  },
  {
    id: 'total-hubs',
    title: 'TOTAL HUBS',
    value: '11.74',
    unit: 'HUB',
    changeRate: '0.00%',
    isPositive: true,
    trend: 'stable',
    timeLabels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    dataPoints: [45, 48, 52, 50, 53, 52, 55, 54, 55],
    colorTheme: 'blue'
  }
];

export const FAT_NODES: FatNode[] = [
  {
    id: 'fat-01',
    code: 'DKA039631',
    name: 'VKA FAT 01 (Central)',
    type: '16-Port Outdoor FAT',
    status: 'active',
    statusText: 'Now Working',
    coordinates: { lat: 10.0234, lng: 80.1387 },
    totalParameter: '0.004M',
    spliceType: 'YH HB',
    securityHash: '001404',
    currentRsus: '0.0 FK',
    networkAddress: '4.35 MB',
    contentAddress: '11.74 HUB',
    poleUnit: 'VHN POLE #42',
    totalConnection: 'Concrete / Fiber G.652D',
    portsUsed: 14,
    portsTotal: 16,
    opticalPowerDbm: -18.4,
    createdDate: '18/01/2024',
    lastInspection: '02/09/2026',
    description: 'Main Optical Distribution Terminal for urban sector cluster VKA-01',
    distanceKm: 0.8
  },
  {
    id: 'fat-02',
    code: 'DKA039632',
    name: 'VKA FAT ASUS West',
    type: '32-Port Core FAT',
    status: 'active',
    statusText: 'Now Working',
    coordinates: { lat: 10.0285, lng: 80.1310 },
    totalParameter: '0.007M',
    spliceType: 'YH HC',
    securityHash: '001409',
    currentRsus: '1.2 FK',
    networkAddress: '15.80 MB',
    contentAddress: '11.74 HUB',
    poleUnit: 'VHN POLE #88',
    totalConnection: 'Aerial / ADSS 48-Core',
    portsUsed: 28,
    portsTotal: 32,
    opticalPowerDbm: -19.1,
    createdDate: '12/03/2024',
    lastInspection: '04/09/2026',
    description: 'Subnet 32-Conn feed serving residential and telecom retail sector',
    distanceKm: 1.4
  },
  {
    id: 'fat-03',
    code: 'DKA039633',
    name: 'Bumhvad Cianbot Terminal',
    type: '8-Port Mini FAT',
    status: 'active',
    statusText: 'Optimal Link',
    coordinates: { lat: 10.0190, lng: 80.1250 },
    totalParameter: '0.002M',
    spliceType: 'YH HA',
    securityHash: '001398',
    currentRsus: '0.5 FK',
    networkAddress: '8.20 MB',
    contentAddress: '9.40 HUB',
    poleUnit: 'VHN TOWER #12',
    totalConnection: 'Duct Conduit / Armored',
    portsUsed: 7,
    portsTotal: 8,
    opticalPowerDbm: -17.8,
    createdDate: '05/02/2024',
    lastInspection: '01/10/2026',
    description: 'Bumhvad relay point terminating 23.5M high-density fiber segment',
    distanceKm: 2.3
  },
  {
    id: 'fat-04',
    code: 'DKA039634',
    name: 'Detskoe Servisovt Hub',
    type: '48-Port Distribution Frame',
    status: 'active',
    statusText: 'Now Working',
    coordinates: { lat: 10.0350, lng: 80.1420 },
    totalParameter: '0.012M',
    spliceType: 'YH HD',
    securityHash: '001455',
    currentRsus: '2.4 FK',
    networkAddress: '23.90 MB',
    contentAddress: '12.00 HUB',
    poleUnit: 'CENTRAL EXCHANGE',
    totalConnection: 'Fiber ODF Ribbon 96',
    portsUsed: 44,
    portsTotal: 48,
    opticalPowerDbm: -16.5,
    createdDate: '10/01/2024',
    lastInspection: '03/10/2026',
    description: 'Detskoe Servisovt primary trunk junction (23.90 Mmi backbone)',
    distanceKm: 3.1
  },
  {
    id: 'fat-05',
    code: 'DKA039635',
    name: 'Samsun Servirov Junction',
    type: '24-Port Splice Cabinet',
    status: 'active',
    statusText: 'Now Working',
    coordinates: { lat: 10.0310, lng: 80.1550 },
    totalParameter: '0.009M',
    spliceType: 'YH HB',
    securityHash: '001462',
    currentRsus: '1.8 FK',
    networkAddress: '18.40 MB',
    contentAddress: '11.74 HUB',
    poleUnit: 'SUB-STATION C',
    totalConnection: 'Underground Duct Ring',
    portsUsed: 21,
    portsTotal: 24,
    opticalPowerDbm: -18.9,
    createdDate: '22/02/2024',
    lastInspection: '28/09/2026',
    description: 'Samsun Servirov relay (23 11 00 ml sector conduit)',
    distanceKm: 4.2
  },
  {
    id: 'fat-06',
    code: 'DKA039636',
    name: 'VKA FATESHORY Corner',
    type: '16-Port Outdoor FAT',
    status: 'warning',
    statusText: 'Minor Attenuation',
    coordinates: { lat: 10.0150, lng: 80.1410 },
    totalParameter: '0.005M',
    spliceType: 'YH HA',
    securityHash: '001420',
    currentRsus: '0.2 FK',
    networkAddress: '6.10 MB',
    contentAddress: '10.20 HUB',
    poleUnit: 'VHN POLE #104',
    totalConnection: 'Aerial ADSS',
    portsUsed: 12,
    portsTotal: 16,
    opticalPowerDbm: -23.2,
    createdDate: '15/04/2024',
    lastInspection: '04/10/2026',
    description: 'Splice tray inspection recommended due to micro-bending loss',
    distanceKm: 1.9
  }
];

export const RSU_DEVICES: RsuDevice[] = [
  {
    id: 'rsu-01',
    name: 'ASU Thalium COMM',
    code: 'RSU-THAL-01',
    bandwidth: '60 MB',
    status: 'active',
    changeRate: '+3.10%',
    ipAddress: '10.142.4.12',
    associatedFatId: 'fat-01',
    latencyMs: 3.8,
    temperatureC: 38.4,
    lastHeartbeat: 'Just now'
  },
  {
    id: 'rsu-02',
    name: 'VKA FAT ASUS',
    code: 'RSU-ASUS-02',
    bandwidth: '15.80 MB',
    status: 'active',
    changeRate: '+12.30%',
    ipAddress: '10.142.4.18',
    associatedFatId: 'fat-02',
    latencyMs: 4.2,
    temperatureC: 41.2,
    lastHeartbeat: '12s ago'
  },
  {
    id: 'rsu-03',
    name: 'VKA RSU Realtime',
    code: 'RSU-VKA-03',
    bandwidth: '55 MB',
    status: 'active',
    changeRate: '+0.85%',
    ipAddress: '10.142.5.01',
    associatedFatId: 'fat-01',
    latencyMs: 5.1,
    temperatureC: 39.0,
    lastHeartbeat: 'Just now'
  },
  {
    id: 'rsu-04',
    name: 'FKO Thulam COMM',
    code: 'RSU-FK-04',
    bandwidth: '40 MB',
    status: 'active',
    changeRate: '+4.15%',
    ipAddress: '10.142.5.14',
    associatedFatId: 'fat-04',
    latencyMs: 6.0,
    temperatureC: 42.1,
    lastHeartbeat: '45s ago'
  },
  {
    id: 'rsu-05',
    name: 'DKA FAT HUB Unit',
    code: 'RSU-DKA-05',
    bandwidth: '4.35 MB',
    status: 'active',
    changeRate: '+1.20%',
    ipAddress: '10.142.6.22',
    associatedFatId: 'fat-03',
    latencyMs: 4.5,
    temperatureC: 37.6,
    lastHeartbeat: '2m ago'
  }
];

export const FIBER_CABLES: FiberCableSegment[] = [
  {
    id: 'cable-01',
    sourceNodeId: 'fat-04',
    targetNodeId: 'fat-01',
    name: 'Detskoe Servisovt Trunk',
    distanceLabel: '23.90 Mmi',
    attenuationDbPerKm: 0.22,
    coreCount: 48,
    points: [
      [240, 90],
      [240, 160],
      [210, 220],
      [190, 290]
    ],
    status: 'optimal'
  },
  {
    id: 'cable-02',
    sourceNodeId: 'fat-01',
    targetNodeId: 'fat-03',
    name: 'Bumhvad Cianbot Feeder',
    distanceLabel: '23.5M',
    attenuationDbPerKm: 0.24,
    coreCount: 24,
    points: [
      [190, 290],
      [150, 310],
      [110, 340],
      [110, 380]
    ],
    status: 'optimal'
  },
  {
    id: 'cable-03',
    sourceNodeId: 'fat-04',
    targetNodeId: 'fat-05',
    name: 'Samsun Servirov Ring',
    distanceLabel: '23 11 00 ml',
    attenuationDbPerKm: 0.21,
    coreCount: 96,
    points: [
      [240, 90],
      [310, 100],
      [340, 150],
      [320, 210]
    ],
    status: 'optimal'
  },
  {
    id: 'cable-04',
    sourceNodeId: 'fat-05',
    targetNodeId: 'fat-01',
    name: 'VKA Redundant Return Loop',
    distanceLabel: '18.40 Mmi',
    attenuationDbPerKm: 0.25,
    coreCount: 24,
    points: [
      [320, 210],
      [270, 250],
      [220, 270],
      [190, 290]
    ],
    status: 'optimal'
  },
  {
    id: 'cable-05',
    sourceNodeId: 'fat-01',
    targetNodeId: 'fat-06',
    name: 'Fateshory Southern Drop',
    distanceLabel: '12.30 Mmi',
    attenuationDbPerKm: 0.38,
    coreCount: 12,
    points: [
      [190, 290],
      [200, 360],
      [220, 420]
    ],
    status: 'degraded'
  }
];

export const INITIAL_SWITCHES: OperationSwitch[] = [
  {
    id: 'sw-open-fat',
    label: 'Open FAT',
    category: 'FAT',
    isActive: true,
    description: 'Enables optical distribution feeder ports for all provisioned FAT units'
  },
  {
    id: 'sw-fat-rsu',
    label: 'FAT RSU',
    category: 'FAT',
    isActive: true,
    description: 'Synchronizes active telemetry between FAT terminal enclosures and remote RSUs'
  },
  {
    id: 'sw-rsu-downs',
    label: 'RSU Downs',
    category: 'RSU',
    isActive: false,
    description: 'Isolates degraded downstream RSU clusters to prevent optical reflection'
  },
  {
    id: 'sw-down-repaired',
    label: 'Down Repaired',
    category: 'RSU',
    isActive: true,
    description: 'Marks repaired fiber spans as verified after OTDR splice confirmation'
  },
  {
    id: 'sw-byah-fats',
    label: 'BYAH FATS',
    category: 'FAT',
    isActive: true,
    description: 'Auto-balances optical power across Byah sector feeder splitters'
  },
  {
    id: 'sw-connector',
    label: 'Connector',
    category: 'CORE',
    isActive: true,
    description: 'SC/APC fiber port interface latch status and optical safety lock'
  },
  {
    id: 'sw-cap-distance',
    label: 'Cap Distance',
    category: 'CORE',
    isActive: false,
    description: 'Enforces maximum 20km optical dispersion limit across PON loop'
  }
];

export const INITIAL_NOTES: FieldNote[] = [
  {
    id: 'note-01',
    title: 'Style guide',
    category: 'Standard Operating Procedures',
    body: 'Color coding for fiber cores: 1-Blue, 2-Orange, 3-Green, 4-Brown, 5-Slate, 6-White. Verify dBm thresholds between -14dBm and -24dBm before sealing splice trays.',
    timestamp: 'Today, 3:24 PM',
    author: 'Field Engineer #41',
    pinned: true
  },
  {
    id: 'note-02',
    title: 'Periodic design system upgrades',
    category: 'System Upgrades',
    body: 'Mobile app client rebuilt in Kotlin Jetpack Compose for Android field tablets with offline GIS caching and haptic feedback.',
    timestamp: 'Today, 2:10 PM',
    author: 'Telecom Systems Lead',
    pinned: true
  },
  {
    id: 'note-03',
    title: 'Brand new note: Bumhvad splice inspection',
    category: 'Field Inspection',
    body: 'Inspected Bumhvad Cianbot 23.5M junction. Port 3 cleaned with optical alcohol swab; optical signal returned to -17.8 dBm.',
    timestamp: 'Yesterday',
    author: 'OTDR Specialist',
    pinned: false
  },
  {
    id: 'note-04',
    title: 'Website Redesign & NOC Telemetry',
    category: 'NOC Synchronization',
    body: 'Real-time sync established between field mobile devices and Central NOC console over secure WebSocket RPC.',
    timestamp: 'Oct 02, 2026',
    author: 'Network Admin',
    pinned: false
  }
];
