export type TabType = 'FAT' | 'RSU' | 'HUB' | 'PON' | 'Settings';

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  unit: string;
  changeRate: string;
  isPositive: boolean;
  trend: 'up' | 'down' | 'stable';
  timeLabels: string[];
  dataPoints: number[];
  colorTheme: 'cyan' | 'amber' | 'emerald' | 'blue';
}

export interface FatNode {
  id: string;
  code: string;
  name: string;
  type: string;
  status: 'active' | 'warning' | 'down' | 'maintenance';
  statusText: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalParameter: string;
  spliceType: string;
  securityHash: string;
  currentRsus: string;
  networkAddress: string;
  contentAddress: string;
  poleUnit: string;
  totalConnection: string;
  portsUsed: number;
  portsTotal: number;
  opticalPowerDbm: number;
  createdDate: string;
  lastInspection: string;
  description: string;
  distanceKm: number;
}

export interface RsuDevice {
  id: string;
  name: string;
  code: string;
  bandwidth: string;
  status: 'active' | 'standby' | 'down';
  changeRate: string;
  ipAddress: string;
  associatedFatId: string;
  latencyMs: number;
  temperatureC: number;
  lastHeartbeat: string;
}

export interface FiberCableSegment {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  name: string;
  distanceLabel: string;
  attenuationDbPerKm: number;
  coreCount: number;
  points: [number, number][]; // [x, y] coordinates in map space
  status: 'optimal' | 'degraded' | 'cut';
}

export interface OperationSwitch {
  id: string;
  label: string;
  category: 'FAT' | 'RSU' | 'CORE';
  isActive: boolean;
  description: string;
}

export interface FieldNote {
  id: string;
  title: string;
  category: string;
  body: string;
  timestamp: string;
  author: string;
  pinned?: boolean;
}
