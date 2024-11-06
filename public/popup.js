document.addEventListener('DOMContentLoaded', async () => {
  const toCurrency = document.getElementById('toCurrency');
  const convertBtn = document.getElementById('convertBtn');
  const result = document.getElementById('result');

  // get the exchange rates
  const converter = new CurrencyConverter("fca_live_7StwYRzj3RL0A37DlMs9lXtScviEgSRhaff0yP7a");

  let rates = await converter.fetchLatestRate('USD', 'USD,EUR,JPY,GBP,AUD,CAD,CHF,CNY,HKD,NZD,SEK,KRW,SGD,NOK,MXN,INR,TRY,RUB,ZAR,BRL,DKK,PLN,THB,MYR,IDR,HUF,CZK,ILS,RON,PHP,ISK,HRK,BGN');
  chrome.storage.local.set({ rates });

  // Load saved currency preference when popup opens
  chrome.storage.local.get(['preferredCurrency'], function (result) {
    if (result.preferredCurrency) {
      toCurrency.value = result.preferredCurrency;
    }
  });

  convertBtn.addEventListener("click", async () => {
    // Save currency preference when converting
    chrome.storage.local.set({
      preferredCurrency: toCurrency.value
    });

    // Execute script to change all prices on webpage
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: changePrices,
    });
  });
});

function changePrices() {
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
        let priceText = wholePrice[i].innerHTML
        let numberOnly, originalPrice;

        if (priceText.includes('(')) { // Get the original price from parentheses
          originalPrice = priceText.split('(')[1].split(')')[0];
          numberOnly = parseFloat(originalPrice.replace('$', ''));

        } else { // For first conversion, save the original price with $ sign
          originalPrice = priceText;
          numberOnly = parseFloat(priceText.replace('$', ''));
        }

        const converted = numberOnly * rate;
        const converted_price = Number(converted).toLocaleString(undefined, { style: 'currency', currency: currency });

        wholePrice[i].innerHTML = `${converted_price} (${originalPrice})`;

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
}
