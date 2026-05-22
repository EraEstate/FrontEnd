export interface CostOptions {
  isFirstTime: boolean;
  hasBroker: boolean;
  propertyType: 'APARTMENT' | 'HOUSE' | 'LAND';
}

export interface CostBreakdown {
  tax: number;
  notaryFee: number;
  registrationFee: number;
  brokerFee: number;
  totalExtraCost: number;
  totalPayment: number;
}

export const calculateTax = (price: number, isFirstTime: boolean) => {
  const baseTax = price * 0.02;
  return isFirstTime ? baseTax * 0.7 : baseTax;
};

export const calculateNotaryFee = (price: number) => {
  if (price <= 1_000_000_000) return price * 0.001;
  if (price <= 3_000_000_000) return price * 0.0008;
  return price * 0.0006;
};

export const calculateRegistrationFee = (price: number) => {
  return price * 0.005;
};

export const calculateBrokerFee = (price: number, hasBroker: boolean) => {
  return hasBroker ? price * 0.01 : 0;
};

export const calculateTotal = (price: number, options: CostOptions): CostBreakdown => {
  const tax = calculateTax(price, options.isFirstTime);
  const notaryFee = calculateNotaryFee(price);
  const registrationFee = calculateRegistrationFee(price);
  const brokerFee = calculateBrokerFee(price, options.hasBroker);
  const totalExtraCost = tax + notaryFee + registrationFee + brokerFee;

  return {
    tax,
    notaryFee,
    registrationFee,
    brokerFee,
    totalExtraCost,
    totalPayment: price + totalExtraCost,
  };
};

