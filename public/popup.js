document.addEventListener('DOMContentLoaded', () => {
  const toCurrency = document.getElementById('toCurrency');
  const convertBtn = document.getElementById('convertBtn');
  const result = document.getElementById('result');

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
  let wholePrice = document.querySelectorAll('span._cDEzb_p13n-sc-price_3mJ9Z');
  // if (wholePrice) {
  //     const nestedElement = wholePrice.querySelector('.a-price-decimal');
  //     if (nestedElement) {
  //       nestedElement.remove();
  //     }
  // }
  // let fractionPrice = document.querySelector('span.a-price-fraction');
  // alert(wholePrice.innerHTML + " " + fractionPrice.innerHTML);


    // get the exchange rate
    // const converter = new CurrencyConverter("fca_live_7StwYRzj3RL0A37DlMs9lXtScviEgSRhaff0yP7a");
    // CurrencyConverter monmor("fca_live_7StwYRzj3RL0A37DlMs9lXtScviEgSRhaff0yP7a");
    // var rate = converter.fetchLatestRate();
    let currencyMap = new Map([
        ['USD', 1],
        ['EUR', 0.92],
        ['GBP', 0.77],
        ['JPY', 151.83],
        ['AUD', 1.51],
        ['CAD', 1.39],
        ['CHF', 0.87],
        ['CNY', 7.12]
    ]);
    chrome.storage.local.get(['preferredCurrency'], function(result) {
        const currency = result.preferredCurrency;
        const rate = currencyMap.get(currency);
        if (!rate) {
            console.error('Currency rate not found for:', currency);
            return;
        }
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
                const symbol = symbols[currency] || currency;
                wholePrice[i].innerHTML = `${symbol}${converted.toFixed(2)} (${originalPrice})`;
            } catch (error) {
                console.error('Error converting price:', error);
            }
        }
    });
};