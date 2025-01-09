export const carBrands = [
  { BrandID: '1', BrandName: 'Toyota' },
  { BrandID: '2', BrandName: 'Honda' },
  { BrandID: '3', BrandName: 'Ford' },
  { BrandID: '4', BrandName: 'BMW' },
];

export const carModels: Record<string, { ModelName: string }[]> = {
  '1': [{ ModelName: 'Corolla' }, { ModelName: 'Camry' }, { ModelName: 'Prius' },],
  '2': [{ ModelName: 'Civic' }, { ModelName: 'Accord' }, { ModelName: 'CR-V' },],
  '3': [{ ModelName: 'Focus' }, { ModelName: 'Fusion' }, { ModelName: 'Mustang' },],
  '4': [{ ModelName: '3 Series' }, { ModelName: '5 Series' }, { ModelName: 'X5' },],
};

export const chassisTypes = [
  { Chassis_type: 'Sedan' },
  { Chassis_type: 'SUV' },
  { Chassis_type: 'Hatchback' },
  { Chassis_type: 'Truck' },
];

export const engineTypes = [
  { Engine_type: 'Gasoline' },
  { Engine_type: 'Diesel' },
  { Engine_type: 'Electric' },
  { Engine_type: 'Hybrid' },
];

