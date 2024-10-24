class CurrencyConverter {
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

  // Method to convert an amount from one currency to another
  async convert(amount, fromCurrency, toCurrency) {
    try {
      const rates = await this.fetchLatestRate(fromCurrency, toCurrency);
      const conversionRate = rates[toCurrency];
      if (!conversionRate) {
        throw new Error(`Unable to find rate for currency: ${toCurrency}`);
      }

      const convertedAmount = amount * conversionRate
      return convertedAmount;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
