import WalletConnectProvider from "@walletconnect/web3-provider";
import axios, { AxiosInstance } from "axios";
import { IAssetData, IGasPrices, IParsedTx } from "./types";
import { providers } from "ethers";
import { SUPPORTED_CHAINS } from "./chains"

export class Api {
  private provider: WalletConnectProvider;

  constructor(provider: WalletConnectProvider) {
    this.provider = provider
  }

  public async getAccountAssets(address: string, chainId: number): Promise<IAssetData[]> {
    const web3Provider = new providers.Web3Provider(this.provider);
      const balance = await web3Provider.getBalance(address);
      const balanceFormatted = String(balance)// ethers.utils.formatEther(balance);
      const chain = SUPPORTED_CHAINS.find(i => i.chain_id === chainId);
      if (chain === undefined) {
        return [];
      }
      const nativeCurrency = chain.native_currency;
      nativeCurrency.balance = balanceFormatted;
      return [nativeCurrency];
  }

}

const api: AxiosInstance = axios.create({
  baseURL: "https://ethereum-api.xyz",
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export async function apiGetAccountAssets(address: string, chainId: number): Promise<IAssetData[]> {
  const response = await api.get(`/account-assets?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export async function apiGetAccountTransactions(
  address: string,
  chainId: number,
): Promise<IParsedTx[]> {
  const response = await api.get(`/account-transactions?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export const apiGetAccountNonce = async (address: string, chainId: number): Promise<string> => {
  const response = await api.get(`/account-nonce?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
};

export const apiGetGasPrices = async (): Promise<IGasPrices> => {
  const response = await api.get(`/gas-prices`);
  const { result } = response.data;
  return result;
};
