export class CurrencyConverter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.freecurrencyapi.com/v1/';
  }

  // Method to fetch the latest exchange rates
  async fetchLatestRate(fromCurrency = 'USD', toCurrency = 'EUR') {
    const url = `${this.baseUrl}latest?apikey=${this.apiKey}&currencies=${toCurrency}&base_currency=${fromCurrency}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching latest rates: ${response.statusText}`);
      }

      const reply = await response.json();
      return reply.data;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
