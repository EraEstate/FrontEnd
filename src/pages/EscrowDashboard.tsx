import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { connectMetaMask, confirmHandover, refundEscrow } from '../utils/metamask';
import { escrowAPI, type EscrowTransaction } from '../api/escrow';
import { toast } from 'react-toastify';
import { connectWebSocket, subscribeToEscrow, isConnected as isWsConnected, type EscrowUpdatePayload } from '../services/websocket';
import {
  Loader2, ShieldCheck, ArrowRightLeft, CheckCircle2, XCircle,
  Wallet, TrendingUp, Lock, RefreshCw, ExternalLink, Copy,
  Filter, Clock, ArrowUpRight, Shield, Landmark, AlertTriangle
} from 'lucide-react';
import ABI from '../blockchain/RealEstateEscrow.json';
import { REALESTATE_CONTRACT_ADDRESS, BLOCKCHAIN_EXPLORER_URL, BLOCKCHAIN_NETWORK_NAME } from '../config/blockchain';

const CONTRACT_ADDRESS = REALESTATE_CONTRACT_ADDRESS || import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

type StatusFilter = 'ALL' | 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'PENDING';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  LOCKED: { label: 'Đã khoá cọc', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Lock className="w-3.5 h-3.5" /> },
  RELEASED: { label: 'Đã giải ngân', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
  PENDING: { label: 'Chờ xử lý', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <Clock className="w-3.5 h-3.5" /> },
};

const EscrowDashboard: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const unsubEscrowRef = useRef<(() => void) | null>(null);

  const connectWallet = async () => {
    try {
      setConnectingWallet(true);
      const address = await connectMetaMask();
      setWalletAddress(address);
      fetchTransactions(address);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setConnectingWallet(false);
    }
  };

  const fetchTransactions = async (address: string) => {
    setLoading(true);
    try {
      const data = await escrowAPI.getUserTransactions(address);
      setTransactions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      toast.error('Lỗi khi tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmHandover = async (tx: EscrowTransaction) => {
    try {
      setProcessingId(tx.id);
      await confirmHandover({ contractAddress: CONTRACT_ADDRESS, abi: ABI.abi, dealId: tx.id });
      await escrowAPI.updateTransaction({ txHash: tx.transactionHash, status: 'RELEASED' });
      toast.success('Xác nhận nhận nhà thành công! Tiền đã chuyển cho chủ nhà.');
      fetchTransactions(walletAddress);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi xác nhận');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefund = async (tx: EscrowTransaction) => {
    try {
      setProcessingId(tx.id);
      await refundEscrow({ contractAddress: CONTRACT_ADDRESS, abi: ABI.abi, dealId: tx.id });
      await escrowAPI.updateTransaction({ txHash: tx.transactionHash, status: 'REFUNDED' });
      toast.success('Hoàn tiền thành công!');
      fetchTransactions(walletAddress);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi hoàn tiền');
    } finally {
      setProcessingId(null);
    }
  };

  // ─── REALTIME: WebSocket subscription ───
  const handleEscrowWsUpdate = useCallback((payload: EscrowUpdatePayload) => {
    // Escrow WS realtime update received

    setTransactions(prev => {
      const existingIdx = prev.findIndex(t => t.transactionHash === payload.transactionHash);

      if (existingIdx >= 0) {
        // Update existing transaction status
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status: payload.status, updatedAt: payload.updatedAt || updated[existingIdx].updatedAt };
        return updated;
      } else if (payload.type === 'NEW_DEPOSIT') {
        // New deposit, add to beginning of list
        const newTx: EscrowTransaction = {
          id: payload.id,
          transactionHash: payload.transactionHash,
          propertyId: payload.propertyId,
          buyerAddress: payload.buyerAddress,
          sellerAddress: payload.sellerAddress,
          amount: payload.amount,
          status: payload.status,
          createdAt: payload.updatedAt || new Date().toISOString(),
          updatedAt: payload.updatedAt || new Date().toISOString(),
        };
        return [newTx, ...prev];
      }
      return prev;
    });

    // Show toast notification
    const eventMessages: Record<string, string> = {
      NEW_DEPOSIT: `💰 Tiền cọc mới cho BĐS #${payload.propertyId}`,
      HANDOVER_CONFIRMED: `✅ Xác nhận nhận nhà BĐS #${payload.propertyId} — Đã giải ngân!`,
      REFUNDED: `↩️ Hoàn tiền BĐS #${payload.propertyId}`,
      STATUS_CHANGED: `🔄 Cập nhật trạng thái BĐS #${payload.propertyId}: ${payload.status}`,
    };
    const msg = eventMessages[payload.type] || `Cập nhật Escrow BĐS #${payload.propertyId}`;
    toast.info(msg, { autoClose: 4000 });
  }, []);

  useEffect(() => {
    if (!walletAddress) return;

    // Connect WebSocket if not already connected
    const setupWs = () => {
      if (!isWsConnected()) {
        connectWebSocket(
          () => {
            setWsConnected(true);
            // Subscribe after connected
            unsubEscrowRef.current = subscribeToEscrow(walletAddress, handleEscrowWsUpdate);
          },
          (err) => {
            // WS connection error handled silently
            setWsConnected(false);
          }
        );
      } else {
        setWsConnected(true);
        unsubEscrowRef.current = subscribeToEscrow(walletAddress, handleEscrowWsUpdate);
      }
    };

    setupWs();

    return () => {
      if (unsubEscrowRef.current) {
        unsubEscrowRef.current();
        unsubEscrowRef.current = null;
      }
    };
  }, [walletAddress, handleEscrowWsUpdate]);

  const filteredTx = useMemo(() => {
    if (filter === 'ALL') return transactions;
    return transactions.filter(tx => tx.status === filter);
  }, [transactions, filter]);

  const stats = useMemo(() => {
    const locked = transactions.filter(t => t.status === 'LOCKED');
    const released = transactions.filter(t => t.status === 'RELEASED');
    const refunded = transactions.filter(t => t.status === 'REFUNDED');
    const totalLocked = locked.reduce((s, t) => s + Number(t.amount), 0);
    const totalReleased = released.reduce((s, t) => s + Number(t.amount), 0);
    return { total: transactions.length, locked: locked.length, released: released.length, refunded: refunded.length, totalLocked, totalReleased };
  }, [transactions]);

  const shortenAddr = (addr: string) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
  const shortenHash = (hash: string) => hash ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : '';

  const buildExplorerUrl = (txHash: string) => {
    if (!BLOCKCHAIN_EXPLORER_URL) return '';
    return `${BLOCKCHAIN_EXPLORER_URL.replace(/\/$/, '')}/tx/${txHash}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Đã sao chép!', { autoClose: 1500 });
  };

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return dateStr; }
  };

  // ─── NOT CONNECTED ───
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="max-w-lg mx-auto px-4 py-20">
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-blue-100/40 p-10 text-center overflow-hidden">
            {/* Decorative gradient orb */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-400/15 to-cyan-400/15 blur-3xl" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">Escrow Dashboard</h1>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                Quản lý giao dịch đặt cọc an toàn qua Smart Contract.<br />
                Kết nối ví MetaMask để bắt đầu.
              </p>

              <button
                onClick={connectWallet}
                disabled={connectingWallet}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {connectingWallet ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Đang kết nối…</>
                ) : (
                  <><Wallet className="w-5 h-5" /> Kết nối MetaMask</>
                )}
              </button>

              <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-slate-500">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50/80">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Khoá cọc</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Giải ngân</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50/80">
                  <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                  <span>Hoàn tiền</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── CONNECTED ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              Escrow Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              Hợp đồng thông minh · {BLOCKCHAIN_NETWORK_NAME || 'Hardhat Local'}
              {wsConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Realtime
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  Offline
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTransactions(walletAddress)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="bg-white/80 backdrop-blur border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block leading-none">Ví kết nối</span>
                <span className="font-mono font-medium text-slate-800 text-sm">{shortenAddr(walletAddress)}</span>
              </div>
              <button onClick={() => copyToClipboard(walletAddress)} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Landmark className="w-5 h-5" />} label="Tổng giao dịch" value={stats.total} color="blue" />
          <StatCard icon={<Lock className="w-5 h-5" />} label="Đang khoá cọc" value={stats.locked} subtitle={stats.totalLocked > 0 ? `${stats.totalLocked.toFixed(4)} ETH` : undefined} color="amber" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Đã giải ngân" value={stats.released} subtitle={stats.totalReleased > 0 ? `${stats.totalReleased.toFixed(4)} ETH` : undefined} color="emerald" />
          <StatCard icon={<ArrowRightLeft className="w-5 h-5" />} label="Đã hoàn tiền" value={stats.refunded} color="slate" />
        </div>

        {/* ── FILTER BAR ── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(['ALL', 'LOCKED', 'RELEASED', 'REFUNDED'] as StatusFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'ALL' ? 'Tất cả' : statusConfig[f]?.label || f}
              {f === 'ALL' && ` (${transactions.length})`}
              {f !== 'ALL' && ` (${transactions.filter(t => t.status === f).length})`}
            </button>
          ))}
        </div>

        {/* ── TRANSACTION LIST ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Đang tải giao dịch…</p>
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur rounded-2xl border border-slate-100 shadow-sm">
            <ShieldCheck className="w-14 h-14 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {filter === 'ALL' ? 'Chưa có giao dịch ký quỹ nào.' : `Không có giao dịch "${statusConfig[filter]?.label}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTx.map((tx, idx) => {
              const isBuyer = tx.buyerAddress.toLowerCase() === walletAddress.toLowerCase();
              const isSeller = tx.sellerAddress.toLowerCase() === walletAddress.toLowerCase();
              const cfg = statusConfig[tx.status] || statusConfig.PENDING;

              return (
                <div
                  key={tx.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="p-5 sm:p-6">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                          <Landmark className="w-3 h-3" />
                          BĐS #{tx.propertyId}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${cfg.bg} border ${cfg.border} ${cfg.color} text-xs font-semibold`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        {isBuyer && <span className="text-[10px] font-medium uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">Người thuê</span>}
                        {isSeller && !isBuyer && <span className="text-[10px] font-medium uppercase tracking-wider text-purple-500 bg-purple-50 px-2 py-0.5 rounded-md">Chủ nhà</span>}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Số tiền cọc</p>
                        <p className="text-xl font-bold text-slate-900">{Number(tx.amount).toFixed(4)} <span className="text-sm font-semibold text-slate-500">ETH</span></p>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50/80 rounded-xl px-4 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Người gửi (Buyer)</p>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${isBuyer ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                            {shortenAddr(tx.buyerAddress)}
                          </span>
                          <button onClick={() => copyToClipboard(tx.buyerAddress)} className="p-0.5 hover:bg-slate-200 rounded transition-colors">
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                          {isBuyer && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">BẠN</span>}
                        </div>
                      </div>
                      <div className="bg-slate-50/80 rounded-xl px-4 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Chủ nhà (Seller)</p>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${isSeller ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                            {shortenAddr(tx.sellerAddress)}
                          </span>
                          <button onClick={() => copyToClipboard(tx.sellerAddress)} className="p-0.5 hover:bg-slate-200 rounded transition-colors">
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                          {isSeller && !isBuyer && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">BẠN</span>}
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: Hash + Date + Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <ExternalLink className="w-3 h-3" />
                          {buildExplorerUrl(tx.transactionHash) ? (
                            <a href={buildExplorerUrl(tx.transactionHash)} target="_blank" rel="noreferrer" className="font-mono text-blue-600 hover:text-blue-700 hover:underline">
                              {shortenHash(tx.transactionHash)}
                            </a>
                          ) : (
                            <button onClick={() => copyToClipboard(tx.transactionHash)} className="font-mono text-blue-600 hover:underline">
                              {shortenHash(tx.transactionHash)}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(tx.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {tx.status === 'LOCKED' && (
                        <div className="flex items-center gap-2">
                          {isBuyer && (
                            <button
                              onClick={() => handleConfirmHandover(tx)}
                              disabled={processingId === tx.id}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === tx.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Xác Nhận Nhận Nhà
                            </button>
                          )}
                          {isSeller && (
                            <button
                              onClick={() => handleRefund(tx)}
                              disabled={processingId === tx.id}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === tx.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                              Hoàn Tiền
                            </button>
                          )}
                        </div>
                      )}
                      {tx.status === 'RELEASED' && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất
                        </span>
                      )}
                      {tx.status === 'REFUNDED' && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Đã hoàn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FOOTER INFO ── */}
        <div className="mt-10 bg-white/60 backdrop-blur rounded-2xl border border-slate-100 p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">Lưu ý quan trọng</p>
            <p>Giao dịch trên Blockchain là <strong>không thể đảo ngược</strong>. Hãy kiểm tra kỹ thông tin trước khi xác nhận. Smart Contract chỉ hỗ trợ minh bạch hóa giao dịch, <strong>không thay thế</strong> hợp đồng công chứng theo quy định pháp luật.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card Component ───
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle?: string;
  color: 'blue' | 'amber' | 'emerald' | 'slate';
}

const colorMap = {
  blue:    { bg: 'bg-blue-50',    iconBg: 'bg-blue-500',    shadow: 'shadow-blue-500/20' },
  amber:   { bg: 'bg-amber-50',   iconBg: 'bg-amber-500',   shadow: 'shadow-amber-500/20' },
  emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
  slate:   { bg: 'bg-slate-50',   iconBg: 'bg-slate-500',   shadow: 'shadow-slate-500/20' },
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, color }) => {
  const c = colorMap[color];
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center text-white shadow-md ${c.shadow}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default EscrowDashboard;
