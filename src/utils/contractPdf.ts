import { jsPDF } from 'jspdf';
import type { KycVerification } from '../api/kyc';

export interface ContractPdfData {
  transactionId: string;
  propertyTitle: string;
  propertyAddress?: string;
  propertyArea?: number;
  totalAmount: number;
  sellerAmount: number;
  taxAmount?: number;
  serviceFee?: number;
  paymentMethod: string;
  isRent: boolean;
  contractDate: string;
  // Parties
  sellerName: string;
  sellerEmail?: string;
  sellerKyc?: KycVerification | null;
  buyerName: string;
  buyerEmail?: string;
  buyerKyc?: KycVerification | null;
  // Signatures (PNG base64)
  sellerSignature?: string | null;
  buyerSignature?: string | null;
  // Blockchain
  blockchainTxHash?: string;
  blockchainNetwork?: string;
}

const formatVndPrice = (price: number): string => {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ VND`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu VND`;
  return price.toLocaleString('vi-VN') + ' VND';
};

const paymentMethodLabel = (method: string): string => {
  const map: Record<string, string> = {
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    VNPAY: 'Cổng thanh toán VNPay',
    MOMO: 'Ví MoMo',
    ZALOPAY: 'ZaloPay',
    CASH: 'Tiền mặt',
  };
  return map[method] || method;
};

/**
 * Generate a legal contract PDF from transaction data.
 * Uses jsPDF with built-in Helvetica font (ASCII-safe Vietnamese via transliteration fallback).
 */
export async function generateContractPdf(data: ContractPdfData): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addLine = (text: string, opts?: { bold?: boolean; size?: number; align?: 'center' | 'left' | 'right'; color?: [number, number, number] }) => {
    const size = opts?.size || 10;
    const style = opts?.bold ? 'bold' : 'normal';
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(30, 30, 30);

    const align = opts?.align || 'left';
    const x = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;

    // Word wrap
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, x, y, { align });
      y += size * 0.45;
    }
    y += 1;
  };

  const addSpacer = (h = 4) => { y += h; };
  const addHr = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3;
  };

  // === Header ===
  addLine('CONG HOA XA HOI CHU NGHIA VIET NAM', { bold: true, size: 13, align: 'center' });
  addLine('Doc lap - Tu do - Hanh phuc', { size: 10, align: 'center' });
  addLine('---oOo---', { size: 10, align: 'center', color: [150, 150, 150] });
  addSpacer(6);

  // === Contract Title ===
  const contractTitle = data.isRent
    ? 'HOP DONG CHO THUE BAT DONG SAN'
    : 'HOP DONG DAT COC / MUA BAN BAT DONG SAN';
  addLine(contractTitle, { bold: true, size: 15, align: 'center', color: [180, 30, 30] });
  addLine(`(Ma hop dong: ${data.transactionId})`, { size: 8, align: 'center', color: [120, 120, 120] });
  addLine(`Ngay ky: ${data.contractDate}`, { size: 9, align: 'center', color: [100, 100, 100] });
  addSpacer(6);
  addHr();

  // === Parties ===
  addLine('DIEU 1. CAC BEN THAM GIA', { bold: true, size: 11 });
  addSpacer(2);

  addLine('BEN A (Ben ban / Cho thue):', { bold: true, size: 10 });
  addLine(`Ho va ten: ${data.sellerName}`);
  if (data.sellerKyc) {
    addLine(`So CCCD: ${data.sellerKyc.cccdNumber}`);
    if (data.sellerKyc.dateOfBirth) addLine(`Ngay sinh: ${data.sellerKyc.dateOfBirth}`);
    if (data.sellerKyc.placeOfResidence) addLine(`Noi cu tru: ${data.sellerKyc.placeOfResidence}`);
  }
  if (data.sellerEmail) addLine(`Email: ${data.sellerEmail}`);
  addSpacer(3);

  addLine('BEN B (Ben mua / Thue):', { bold: true, size: 10 });
  addLine(`Ho va ten: ${data.buyerName}`);
  if (data.buyerKyc) {
    addLine(`So CCCD: ${data.buyerKyc.cccdNumber}`);
    if (data.buyerKyc.dateOfBirth) addLine(`Ngay sinh: ${data.buyerKyc.dateOfBirth}`);
    if (data.buyerKyc.placeOfResidence) addLine(`Noi cu tru: ${data.buyerKyc.placeOfResidence}`);
  }
  if (data.buyerEmail) addLine(`Email: ${data.buyerEmail}`);
  addSpacer(4);
  addHr();

  // === Property Info ===
  addLine('DIEU 2. THONG TIN BAT DONG SAN', { bold: true, size: 11 });
  addSpacer(2);
  addLine(`Ten: ${data.propertyTitle}`);
  if (data.propertyAddress) addLine(`Dia chi: ${data.propertyAddress}`);
  if (data.propertyArea) addLine(`Dien tich: ${data.propertyArea} m2`);
  addSpacer(4);
  addHr();

  // === Payment Terms ===
  addLine('DIEU 3. GIA TRI VA PHUONG THUC THANH TOAN', { bold: true, size: 11 });
  addSpacer(2);
  addLine(`Tong gia tri giao dich: ${formatVndPrice(data.totalAmount)}${data.isRent ? ' / thang' : ''}`);
  addLine(`So tien ben ban nhan: ${formatVndPrice(data.sellerAmount)}`);
  if (data.taxAmount && data.taxAmount > 0) addLine(`Thue: ${formatVndPrice(data.taxAmount)}`);
  if (data.serviceFee && data.serviceFee > 0) addLine(`Phi dich vu: ${formatVndPrice(data.serviceFee)}`);
  addLine(`Phuong thuc thanh toan: ${paymentMethodLabel(data.paymentMethod)}`);
  addSpacer(4);
  addHr();

  // === Key Clauses (simplified) ===
  const clauses = [
    ['DIEU 4. QUYEN VA NGHIA VU BEN A', 'Ben A dam bao quyen so huu hop phap bat dong san, ban giao dung tien do thoa thuan.'],
    ['DIEU 5. QUYEN VA NGHIA VU BEN B', 'Ben B cam ket thanh toan day du, dung han va su dung bat dong san dung muc dich.'],
    ['DIEU 6. DIEU KHOAN PHAT VI PHAM', 'Ben vi pham chiu phat 8% gia tri hop dong. Moi tranh chap giai quyet tai toa an co tham quyen.'],
    ['DIEU 7. HIEU LUC HOP DONG', 'Hop dong co hieu luc ke tu ngay ca hai ben ky ten va duoc ghi nhan tren he thong ERA Estate.'],
  ];
  for (const [title, content] of clauses) {
    addLine(title, { bold: true, size: 10 });
    addLine(content, { size: 9 });
    addSpacer(3);
  }
  addHr();

  // === Blockchain Proof ===
  if (data.blockchainTxHash) {
    addLine('XAC NHAN BLOCKCHAIN', { bold: true, size: 11, color: [30, 100, 60] });
    addSpacer(2);
    addLine(`Transaction Hash: ${data.blockchainTxHash}`, { size: 8 });
    if (data.blockchainNetwork) addLine(`Network: ${data.blockchainNetwork}`, { size: 8 });
    addLine('Ma hash cua ban hop dong nay da duoc luu vet tren blockchain, dam bao tinh toan ven va khong the sua doi.', { size: 8, color: [100, 100, 100] });
    addSpacer(4);
    addHr();
  }

  // === Signatures Section ===
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  addLine('CHU KY CAC BEN', { bold: true, size: 12, align: 'center' });
  addSpacer(6);

  const sigWidth = 60;
  const sigHeight = 24;
  const leftSigX = margin + 10;
  const rightSigX = pageWidth / 2 + 10;

  // Labels
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BEN A (Ben ban)', leftSigX + sigWidth / 2, y, { align: 'center' });
  doc.text('BEN B (Ben mua)', rightSigX + sigWidth / 2, y, { align: 'center' });
  y += 5;

  // Signature images
  if (data.sellerSignature) {
    try {
      doc.addImage(data.sellerSignature, 'PNG', leftSigX, y, sigWidth, sigHeight);
    } catch { /* skip if invalid */ }
  } else {
    doc.setDrawColor(200);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(leftSigX, y, sigWidth, sigHeight);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('(Chua ky)', leftSigX + sigWidth / 2, y + sigHeight / 2 + 2, { align: 'center' });
  }

  if (data.buyerSignature) {
    try {
      doc.addImage(data.buyerSignature, 'PNG', rightSigX, y, sigWidth, sigHeight);
    } catch { /* skip if invalid */ }
  } else {
    doc.setDrawColor(200);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(rightSigX, y, sigWidth, sigHeight);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('(Chua ky)', rightSigX + sigWidth / 2, y + sigHeight / 2 + 2, { align: 'center' });
  }

  y += sigHeight + 4;

  // Names under signatures
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(data.sellerName, leftSigX + sigWidth / 2, y, { align: 'center' });
  doc.text(data.buyerName, rightSigX + sigWidth / 2, y, { align: 'center' });

  y += 10;

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Hop dong dien tu sinh tu dong boi ERA Estate | ${new Date().toISOString()}`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  return doc.output('blob');
}

/**
 * Compute SHA-256 hash of a Blob (contract PDF)
 */
export async function computeContractHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
