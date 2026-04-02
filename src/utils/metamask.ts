import { BrowserProvider, Contract, parseEther } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface DepositEscrowParams {
  contractAddress: string;
  abi: any[];
  sellerAddress: string;
  propertyId: string;
  price: bigint; // wei
  isRent: boolean;
}

export interface EscrowActionParams {
  contractAddress: string;
  abi: any[];
  dealId: number;
}

const HARDHAT_CHAIN_ID_HEX = '0x7a69'; // 31337 in hex
const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';
const HARDHAT_NAME = 'Hardhat Local';

async function ensureHardhatNetwork() {
  if (!window.ethereum) {
    throw new Error('MetaMask chưa được cài trên trình duyệt');
  }

  try {
    const currentChainId: string = await window.ethereum.request({
      method: 'eth_chainId',
    });

    if (currentChainId?.toLowerCase() === HARDHAT_CHAIN_ID_HEX) {
      return;
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
    });
  } catch (switchError: any) {
    if (switchError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: HARDHAT_CHAIN_ID_HEX,
              chainName: HARDHAT_NAME,
              rpcUrls: [HARDHAT_RPC_URL],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            },
          ],
        });
      } catch (addError: any) {
        throw new Error('Vui lòng tự thêm mạng Hardhat Local (http://127.0.0.1:8545, chainId 31337) trong MetaMask.');
      }
    }
  }
}

export async function connectMetaMask(): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask chưa được cài trên trình duyệt');
  await ensureHardhatNetwork();
  const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) throw new Error('Không lấy được tài khoản MetaMask');
  return accounts[0];
}

/** Helper to get contract instance with signer */
async function getContract(contractAddress: string, abi: any[]) {
  if (!window.ethereum) throw new Error('MetaMask chưa được cài trên trình duyệt');
  await ensureHardhatNetwork();
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(contractAddress, abi, signer);
}

/** Handle errors uniformly */
function handleTxError(error: any): never {
  if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
    throw new Error('Bạn đã từ chối giao dịch trong MetaMask');
  }
  if (error?.message?.includes('insufficient funds')) {
    throw new Error('Số dư không đủ để thực hiện giao dịch');
  }
  throw new Error(error?.message || 'Giao dịch thất bại');
}

/** Gửi tiền cọc (Deposit) */
export async function depositToEscrow(params: DepositEscrowParams): Promise<{ txHash: string; dealId: number }> {
  try {
    const contract = await getContract(params.contractAddress, params.abi);
    // Yêu cầu chuyển đúng số ETH value = price (wei)
    const tx = await contract.createDeal(
      params.sellerAddress,
      params.propertyId,
      params.price,
      params.isRent,
      { value: params.price }
    );
    const receipt = await tx.wait();
    
    // Parse Event DealCreated để lấy dealId
    let dealId = -1;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog?.name === 'DealCreated') {
          dealId = Number(parsedLog.args.dealId);
          break;
        }
      } catch (e) {} // ignore logs not from this contract
    }
    
    return { txHash: receipt.hash, dealId };
  } catch (error: any) {
    handleTxError(error);
  }
}

/** Xác nhận nhận nhà (Transfer tiền cho chủ nhà) */
export async function confirmHandover(params: EscrowActionParams): Promise<string> {
  try {
    const contract = await getContract(params.contractAddress, params.abi);
    const tx = await contract.confirmHandover(params.dealId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error: any) {
    handleTxError(error);
  }
}

/** Yêu cầu hoàn tiền (Refund) */
export async function refundEscrow(params: EscrowActionParams): Promise<string> {
  try {
    const contract = await getContract(params.contractAddress, params.abi);
    const tx = await contract.refund(params.dealId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error: any) {
    handleTxError(error);
  }
}
