export type Element = 'Kim' | 'Moc' | 'Thuy' | 'Hoa' | 'Tho';

const elementByMod: Record<number, Element> = {
  0: 'Kim',
  1: 'Thuy',
  2: 'Hoa',
  3: 'Tho',
  4: 'Moc',
};

const directionsByElement: Record<Element, string[]> = {
  Kim: ['Tay', 'Tay Bac', 'Tay Nam'],
  Moc: ['Dong', 'Dong Nam', 'Bac'],
  Thuy: ['Bac', 'Dong Bac', 'Tay Bac'],
  Hoa: ['Nam', 'Dong', 'Dong Nam'],
  Tho: ['Dong Bac', 'Tay Nam', 'Nam'],
};

const colorsByElement: Record<Element, string[]> = {
  Kim: ['Trang', 'Xam', 'Vang'],
  Moc: ['Xanh la', 'Xanh reu', 'Nau'],
  Thuy: ['Xanh duong', 'Den', 'Trang'],
  Hoa: ['Do', 'Hong', 'Cam'],
  Tho: ['Vang dat', 'Nau', 'Do gach'],
};

const numbersByElement: Record<Element, number[]> = {
  Kim: [6, 7, 8],
  Moc: [3, 4],
  Thuy: [1, 6],
  Hoa: [9, 3],
  Tho: [2, 5, 8],
};

export const calculateElement = (birthYear: number): Element => {
  const mod = Math.abs(birthYear) % 5;
  return elementByMod[mod];
};

export const getGoodDirections = (element: string): string[] => {
  return directionsByElement[element as Element] ?? [];
};

export const getLuckyColors = (element: string): string[] => {
  return colorsByElement[element as Element] ?? [];
};

export const getLuckyNumbers = (element: string): number[] => {
  return numbersByElement[element as Element] ?? [];
};

