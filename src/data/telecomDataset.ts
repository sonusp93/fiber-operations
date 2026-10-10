export interface FatRecord {
  id: string;
  city: string;
  rsu: string;
  rsuLat: number;
  rsuLog: number;
  hub: string;
  hubLat: number;
  hubLog: number;
  fatId: string;
  fatLat: number;
  fatLog: number;
  affiliatedPon: string;
  ponPort: string;
  rfsDate: string;
  totalCap: number;
  neAddress: string;
  locality: string;
}

export type RawFatTuple = [
  string, // 0: id
  string, // 1: city
  string, // 2: rsu
  number, // 3: rsuLat
  number, // 4: rsuLog
  string, // 5: hub
  number, // 6: hubLat
  number, // 7: hubLog
  string, // 8: fatId
  number, // 9: fatLat
  number, // 10: fatLog
  string, // 11: affiliatedPon
  string, // 12: ponPort
  string, // 13: rfsDate
  number, // 14: totalCap
  string, // 15: neAddress
  string  // 16: locality
];

export function tupleToFatRecord(c: RawFatTuple): FatRecord {
  return {
    id: c[0] || 'FAT-0',
    city: c[1] || 'Cochin',
    rsu: c[2] || '08N',
    rsuLat: c[3] || 10.0261,
    rsuLog: c[4] || 76.3125,
    hub: c[5] || '08N01',
    hubLat: c[6] || 10.0261,
    hubLog: c[7] || 76.3125,
    fatId: c[8] || '08N0101',
    fatLat: c[9] || 10.0261,
    fatLog: c[10] || 76.3125,
    affiliatedPon: c[11] || 'PON-1',
    ponPort: c[12] || '08N-A1/1/1',
    rfsDate: c[13] || '1/20/2023',
    totalCap: c[14] || 16,
    neAddress: c[15] || 'Fiber Optical Terminal',
    locality: c[16] || 'Optical Corridor'
  };
}

export interface HubRecord {
  hub: string;
  rsu: string;
  city: string;
  lat: number;
  lng: number;
  locality: string;
  fatCount: number;
  totalCapacity: number;
  fats: FatRecord[];
}

export interface RsuRecord {
  rsu: string;
  city: string;
  lat: number;
  lng: number;
  hubCount: number;
  fatCount: number;
  totalCapacity: number;
  hubsList: HubRecord[];
}

export interface PonRecord {
  ponPort: string;
  affiliatedPon: string;
  hub: string;
  rsu: string;
  city: string;
  fatCount: number;
  totalCapacity: number;
  fats: FatRecord[];
}

// Master state holding loaded records
let RAW_TUPLE_DATASET: RawFatTuple[] = [];
export let FAT_DATASET: FatRecord[] = [];
export let HUB_DATASET: HubRecord[] = [];
export let RSU_DATASET: RsuRecord[] = [];
export let FAT_BY_CITY_MAP: Map<string, FatRecord[]> = new Map();
export let FAT_BY_HUB_MAP: Map<string, FatRecord[]> = new Map();
export let FAT_BY_RSU_MAP: Map<string, FatRecord[]> = new Map();

export function getPonDataset(): PonRecord[] {
  const ponMap = new Map<string, PonRecord>();
  for (const fat of FAT_DATASET) {
    const key = fat.ponPort || 'PON-UNKNOWN';
    const existing = ponMap.get(key);
    if (!existing) {
      ponMap.set(key, {
        ponPort: fat.ponPort,
        affiliatedPon: fat.affiliatedPon,
        hub: fat.hub,
        rsu: fat.rsu,
        city: fat.city,
        fatCount: 1,
        totalCapacity: fat.totalCap,
        fats: [fat]
      });
    } else {
      existing.fatCount += 1;
      existing.totalCapacity += fat.totalCap;
      existing.fats.push(fat);
    }
  }
  return Array.from(ponMap.values()).sort((a, b) => a.ponPort.localeCompare(b.ponPort));
}

let isDataLoaded = false;
let loadPromise: Promise<boolean> | null = null;

// Initialize index structures in a non-blocking microtask (0ms main thread lock)
export function initializeTelecomDataAsync(rawTuples: RawFatTuple[]): Promise<boolean> {
  return new Promise((resolve) => {
    RAW_TUPLE_DATASET = rawTuples;
    const len = rawTuples.length;
    FAT_DATASET = new Array<FatRecord>(len);

    const cityMap = new Map<string, FatRecord[]>();
    const hubMap = new Map<string, FatRecord[]>();
    const rsuMap = new Map<string, FatRecord[]>();

    const hubStructMap = new Map<string, {
      hub: string;
      rsu: string;
      city: string;
      lat: number;
      lng: number;
      locality: string;
      fatCount: number;
      totalCapacity: number;
      fats: FatRecord[];
    }>();

    setTimeout(() => {
      let validCount = 0;
      for (let i = 0; i < len; i++) {
        const c = rawTuples[i];
        if (!c) continue;

        const fat: FatRecord = tupleToFatRecord(c);
        FAT_DATASET[validCount++] = fat;

        const cityKey = fat.city.toLowerCase();
        const cityList = cityMap.get(cityKey);
        if (cityList) cityList.push(fat);
        else cityMap.set(cityKey, [fat]);

        const hubList = hubMap.get(fat.hub);
        if (hubList) hubList.push(fat);
        else hubMap.set(fat.hub, [fat]);

        const rsuList = rsuMap.get(fat.rsu);
        if (rsuList) rsuList.push(fat);
        else rsuMap.set(fat.rsu, [fat]);

        const existingHub = hubStructMap.get(fat.hub);
        if (!existingHub) {
          hubStructMap.set(fat.hub, {
            hub: fat.hub,
            rsu: fat.rsu,
            city: fat.city,
            lat: fat.hubLat,
            lng: fat.hubLog,
            locality: fat.locality,
            fatCount: 1,
            totalCapacity: fat.totalCap,
            fats: [fat]
          });
        } else {
          existingHub.fatCount += 1;
          existingHub.totalCapacity += fat.totalCap;
          existingHub.fats.push(fat);
        }
      }

      FAT_BY_CITY_MAP = cityMap;
      FAT_BY_HUB_MAP = hubMap;
      FAT_BY_RSU_MAP = rsuMap;

      HUB_DATASET = Array.from(hubStructMap.values());

      const rsuStructMap = new Map<string, {
        rsu: string;
        city: string;
        lat: number;
        lng: number;
        hubMap: Map<string, HubRecord>;
        fatCount: number;
        totalCapacity: number;
      }>();

      for (let i = 0; i < HUB_DATASET.length; i++) {
        const h = HUB_DATASET[i];
        const rsuId = h.rsu;
        const existingRsu = rsuStructMap.get(rsuId);
        if (!existingRsu) {
          const hMap = new Map<string, HubRecord>();
          hMap.set(h.hub, h);
          rsuStructMap.set(rsuId, {
            rsu: rsuId,
            city: h.city,
            lat: h.lat,
            lng: h.lng,
            hubMap: hMap,
            fatCount: h.fatCount,
            totalCapacity: h.totalCapacity
          });
        } else {
          existingRsu.hubMap.set(h.hub, h);
          existingRsu.fatCount += h.fatCount;
          existingRsu.totalCapacity += h.totalCapacity;
        }
      }

      RSU_DATASET = Array.from(rsuStructMap.values()).map((r) => ({
        rsu: r.rsu,
        city: r.city,
        lat: r.lat,
        lng: r.lng,
        hubCount: r.hubMap.size,
        fatCount: r.fatCount,
        totalCapacity: r.totalCapacity,
        hubsList: Array.from(r.hubMap.values())
      }));

      // Trim any trailing empty slots from FAT_DATASET
      FAT_DATASET.length = validCount;

      isDataLoaded = true;
      resolve(true);
    }, 10);
  });
}

// Synchronous fallback initializer
export function initializeTelecomData(rawTuples: RawFatTuple[]): boolean {
  RAW_TUPLE_DATASET = rawTuples;
  const len = rawTuples.length;
  FAT_DATASET = new Array<FatRecord>(len);

  const cityMap = new Map<string, FatRecord[]>();
  const hubMap = new Map<string, FatRecord[]>();
  const rsuMap = new Map<string, FatRecord[]>();

  const hubStructMap = new Map<string, {
    hub: string;
    rsu: string;
    city: string;
    lat: number;
    lng: number;
    locality: string;
    fatCount: number;
    totalCapacity: number;
    fats: FatRecord[];
  }>();

  let validCount = 0;
  for (let i = 0; i < len; i++) {
    const c = rawTuples[i];
    if (!c) continue;

    const fat: FatRecord = tupleToFatRecord(c);
    FAT_DATASET[validCount++] = fat;

    const cityKey = fat.city.toLowerCase();
    const cityList = cityMap.get(cityKey);
    if (cityList) cityList.push(fat);
    else cityMap.set(cityKey, [fat]);

    const hubList = hubMap.get(fat.hub);
    if (hubList) hubList.push(fat);
    else hubMap.set(fat.hub, [fat]);

    const rsuList = rsuMap.get(fat.rsu);
    if (rsuList) rsuList.push(fat);
    else rsuMap.set(fat.rsu, [fat]);

    const existingHub = hubStructMap.get(fat.hub);
    if (!existingHub) {
      hubStructMap.set(fat.hub, {
        hub: fat.hub,
        rsu: fat.rsu,
        city: fat.city,
        lat: fat.hubLat,
        lng: fat.hubLog,
        locality: fat.locality,
        fatCount: 1,
        totalCapacity: fat.totalCap,
        fats: [fat]
      });
    } else {
      existingHub.fatCount += 1;
      existingHub.totalCapacity += fat.totalCap;
      existingHub.fats.push(fat);
    }
  }

  FAT_BY_CITY_MAP = cityMap;
  FAT_BY_HUB_MAP = hubMap;
  FAT_BY_RSU_MAP = rsuMap;

  HUB_DATASET = Array.from(hubStructMap.values());

  const rsuStructMap = new Map<string, {
    rsu: string;
    city: string;
    lat: number;
    lng: number;
    hubMap: Map<string, HubRecord>;
    fatCount: number;
    totalCapacity: number;
  }>();

  for (let i = 0; i < HUB_DATASET.length; i++) {
    const h = HUB_DATASET[i];
    const rsuId = h.rsu;
    const existingRsu = rsuStructMap.get(rsuId);
    if (!existingRsu) {
      const hMap = new Map<string, HubRecord>();
      hMap.set(h.hub, h);
      rsuStructMap.set(rsuId, {
        rsu: rsuId,
        city: h.city,
        lat: h.lat,
        lng: h.lng,
        hubMap: hMap,
        fatCount: h.fatCount,
        totalCapacity: h.totalCapacity
      });
    } else {
      existingRsu.hubMap.set(h.hub, h);
      existingRsu.fatCount += h.fatCount;
      existingRsu.totalCapacity += h.totalCapacity;
    }
  }

  RSU_DATASET = Array.from(rsuStructMap.values()).map((r) => ({
    rsu: r.rsu,
    city: r.city,
    lat: r.lat,
    lng: r.lng,
    hubCount: r.hubMap.size,
    fatCount: r.fatCount,
    totalCapacity: r.totalCapacity,
    hubsList: Array.from(r.hubMap.values())
  }));

  // Trim empty slots
  FAT_DATASET.length = validCount;

  isDataLoaded = true;
  return true;
}

// Async dataset loader fetching local asset natively (100% offline & fast)
export async function loadTelecomDatasetAsync(): Promise<boolean> {
  if (isDataLoaded) return true;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // Attempt 1: Fetch local JSON asset directly
    try {
      const res = await fetch('fat_boxes_compact.json');
      if (res.ok) {
        const raw = await res.json();
        if (raw && Array.isArray(raw) && raw.length > 0) {
          return await initializeTelecomDataAsync(raw);
        }
      }
    } catch (e) {
      console.warn('Fetch fat_boxes_compact.json failed:', e);
    }

    // Attempt 2: Fetch relative asset path
    try {
      const res = await fetch('./fat_boxes_compact.json');
      if (res.ok) {
        const raw = await res.json();
        if (raw && Array.isArray(raw) && raw.length > 0) {
          return await initializeTelecomDataAsync(raw);
        }
      }
    } catch (e) {
      console.warn('Fetch ./fat_boxes_compact.json failed:', e);
    }

    // Absolute fail-safe: initialize empty array so app NEVER gets trapped on black screen!
    return await initializeTelecomDataAsync([]);
  })();

  return loadPromise;
}

export function isTelecomDataReady(): boolean {
  return isDataLoaded;
}

// Geodesic distance calculator in meters
export function calculateGpsDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function calculateBearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return (Math.round((theta * 180) / Math.PI) + 360) % 360;
}

export function getCompassHeading(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
