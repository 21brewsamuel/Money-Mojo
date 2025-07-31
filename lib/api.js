// Centralized API client with error handling
class ApiClient {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // Plaid API methods
  async createLinkToken() {
    return this.request('/api/auth/plaid/create_link_token', {
      method: 'POST',
    });
  }

  async exchangePublicToken(publicToken) {
    return this.request('/api/auth/plaid/exchange_public_token', {
      method: 'POST',
      body: JSON.stringify({ public_token: publicToken }),
    });
  }

  async getTransactions(accessToken) {
    return this.request(`/api/auth/plaid/transactions?access_token=${accessToken}`);
  }

  async getAccounts(accessToken) {
    return this.request(`/api/auth/plaid/accounts?access_token=${accessToken}`);
  }
}

export const apiClient = new ApiClient();