// Sri Lanka Provinces and Districts
// Single source of truth used by form, results page, and admin dashboard

export interface District {
  name: string;
}

export interface Province {
  name: string;
  districts: string[];
}

export const PROVINCES: Province[] = [
  {
    name: 'Western',
    districts: ['Colombo', 'Gampaha', 'Kalutara'],
  },
  {
    name: 'Central',
    districts: ['Kandy', 'Matale', 'Nuwara Eliya'],
  },
  {
    name: 'Southern',
    districts: ['Galle', 'Matara', 'Hambantota'],
  },
  {
    name: 'Northern',
    districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  },
  {
    name: 'Eastern',
    districts: ['Trincomalee', 'Batticaloa', 'Ampara'],
  },
  {
    name: 'North Western',
    districts: ['Kurunegala', 'Puttalam'],
  },
  {
    name: 'North Central',
    districts: ['Anuradhapura', 'Polonnaruwa'],
  },
  {
    name: 'Uva',
    districts: ['Badulla', 'Monaragala'],
  },
  {
    name: 'Sabaragamuwa',
    districts: ['Ratnapura', 'Kegalle'],
  },
];

export const PROVINCE_NAMES = PROVINCES.map((p) => p.name);

export function getDistrictsForProvince(province: string): string[] {
  return PROVINCES.find((p) => p.name === province)?.districts ?? [];
}

export function isValidProvince(province: string): boolean {
  return PROVINCE_NAMES.includes(province);
}

export function isValidDistrict(province: string, district: string): boolean {
  return getDistrictsForProvince(province).includes(district);
}
