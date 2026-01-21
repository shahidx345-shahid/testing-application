import { apiClient } from "@/lib/api-client";
import { API } from "@/lib/constants";
import { ApiResponse, WalletData } from "@/lib/types";

export const WalletService = {
  /**
   * Get current wallet data
   */
  async getWalletData(): Promise<ApiResponse<WalletData>> {
    return apiClient.get<WalletData>(API.ENDPOINTS.WALLET);
  },

  /**
   * Get transaction history
   */
  async getTransactions(type?: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    let url = API.ENDPOINTS.TRANSACTIONS;
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return apiClient.get<any>(url);
  },
};
