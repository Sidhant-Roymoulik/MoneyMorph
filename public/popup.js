document.addEventListener('DOMContentLoaded', async () => {
  const toCurrency = document.getElementById('toCurrency');
  const convertBtn = document.getElementById('convertBtn');
  const result = document.getElementById('result');

  // get the exchange rates
  const converter = new CurrencyConverter("fca_live_7StwYRzj3RL0A37DlMs9lXtScviEgSRhaff0yP7a");

  let rates = await converter.fetchLatestRate('USD', 'USD,EUR,GBP,JPY,AUD,CAD,CHF,CNY');
  chrome.storage.local.set({ rates });

  // Load saved currency preference when popup opens
  chrome.storage.local.get(['preferredCurrency'], function (result) {
    if (result.preferredCurrency) {
      toCurrency.value = result.preferredCurrency;
    }
  });

  convertBtn.addEventListener('click', async () => {
    // Save currency preference when converting
    chrome.storage.local.set({
      preferredCurrency: toCurrency.value
    });
  });
});

let priceScrapper = document.getElementById('convertBtn')
priceScrapper.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: getSpanText,
  });
})

// Function to get text content of a span element with class "hello"
function getSpanText() {

  chrome.storage.local.get(['preferredCurrency', 'rates'], function (result) {
    const currency = result.preferredCurrency;
    const rates = result.rates;

    if (!rates || !currency) {
      console.error('Rates or preferred currency not found');
      return;
    }

    const rate = rates[currency];

    if (!rate) {
      console.error('Currency rate not found for:', currency);
      return;
    }

    let wholePrice = document.querySelectorAll('span._cDEzb_p13n-sc-price_3mJ9Z');

    for (let i = 0; i < wholePrice.length; i++) {
      try {
        let priceText = wholePrice[i].innerHTML;
        let numberOnly;
        let originalPrice;
        if (priceText.includes('(')) { // Get the original price from parentheses
          originalPrice = priceText
            .split('(')[1]
            .split(')')[0];
          numberOnly = parseFloat(originalPrice.replace('$', ''));
        } else { // For first conversion, save the original price with $ sign

          originalPrice = priceText;
          numberOnly = parseFloat(priceText.replace('$', ''));
        }
        // numberOnly = parseFloat(priceText.replace('$', ''));
        let converted = numberOnly * rate;

        const symbols = {
          'USD': '$',
          'EUR': '€',
          'GBP': '£',
          'JPY': '¥',
          'CNY': '¥',
        };
        const symbol = symbols[currency] || currency + ' $';
        wholePrice[i].innerHTML = `${symbol}${converted.toFixed(2)} (${originalPrice})`;
      } catch (error) {
        console.error('Error converting price:', error);
      }
    }
  });
};

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
