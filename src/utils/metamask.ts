import { BrowserProvider, Contract } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface CreateDealParams {
  contractAddress: string;
  abi: any[];
  sellerAddress: string;
  buyerAddress: string;
  propertyId: string;
  price: bigint; // giá theo đơn vị bạn quy ước trong smart contract
  isRent: boolean;
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
      // Đã ở đúng mạng Hardhat local
      return;
    }

    // Thử switch sang Hardhat
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
    });
  } catch (switchError: any) {
    // 4902: chain chưa được add → add rồi switch lại
    if (switchError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: HARDHAT_CHAIN_ID_HEX,
              chainName: HARDHAT_NAME,
              rpcUrls: [HARDHAT_RPC_URL],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError: any) {
        console.error('Không thể thêm mạng Hardhat Local vào MetaMask:', addError);
        throw new Error('Vui lòng tự thêm mạng Hardhat Local (http://127.0.0.1:8545, chainId 31337) trong MetaMask.');
      }
    } else {
      console.warn('Không thể tự động switch mạng MetaMask:', switchError);
      // Không throw ở đây để vẫn cho user tiếp tục trên mạng hiện tại nếu họ muốn
    }
  }
}

/**
 * Kết nối MetaMask và trả về địa chỉ ví hiện tại của user.
 * Đồng thời cố gắng chuyển MetaMask sang mạng Hardhat local (31337) để demo an toàn.
 */
export async function connectMetaMask(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask chưa được cài trên trình duyệt');
  }

  // Thử đảm bảo MetaMask đang ở mạng dev local
  await ensureHardhatNetwork();

  const accounts: string[] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('Không lấy được tài khoản MetaMask');
  }

  return accounts[0];
}

/**
 * Gọi hàm createDeal(...) trên smart contract (ví dụ RealEstateEscrow)
 * bằng MetaMask. Trả về transaction hash để gửi về BE.
 */
export async function sendCreateDealTx(params: CreateDealParams): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask chưa được cài trên trình duyệt');
  }

  // Đảm bảo (tốt nhất có thể) đang ở mạng Hardhat local trước khi gửi tx
  await ensureHardhatNetwork();

  try {
    const provider = new BrowserProvider(window.ethereum);
    
    // Test RPC connection before proceeding
    try {
      await provider.getBlockNumber();
    } catch (rpcError: any) {
      if (rpcError?.code === -32002 || rpcError?.message?.includes('RPC endpoint') || rpcError?.message?.includes('too many errors')) {
        throw new Error('RPC_ENDPOINT_ERROR: RPC endpoint đang gặp vấn đề. Vui lòng kiểm tra Hardhat node có đang chạy không (npx hardhat node)');
      }
      throw rpcError;
    }
    
    const signer = await provider.getSigner();

    const contract = new Contract(params.contractAddress, params.abi, signer);

    // Tuỳ smart contract thực tế của bạn, chỉnh lại tên hàm và tham số cho đúng
    const tx = await contract.createDeal(
      params.sellerAddress,
      params.buyerAddress,
      params.propertyId,
      params.price,
      params.isRent
    );

    const receipt = await tx.wait();
    return receipt.hash ?? tx.hash;
  } catch (error: any) {
    // Re-throw with better error messages
    if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
      throw new Error('USER_REJECTED: Bạn đã từ chối giao dịch trong MetaMask');
    }
    if (error?.message?.includes('insufficient funds') || error?.message?.includes('insufficient balance')) {
      throw new Error('INSUFFICIENT_FUNDS: Số dư không đủ để thực hiện giao dịch');
    }
    if (error?.message?.includes('RPC_ENDPOINT_ERROR')) {
      throw error; // Re-throw RPC errors as-is
    }
    throw error;
  }
}


