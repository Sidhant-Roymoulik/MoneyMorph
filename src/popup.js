import { API_KEY } from "./secrets.js";
import { CurrencyConverter } from "./converter.js";
import { getCurrencyFromURL } from "./getlocalcurrency.js";

document.addEventListener('DOMContentLoaded', async () => {
  // detect the local currency
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]; // Get the active tab
    if (currentTab && currentTab.url) {
      let currencyCode = getCurrencyFromURL(currentTab.url); // Pass the URL to the function
      chrome.storage.local.set({ localCurrency: currencyCode }, () => {
        console.log(`Local currency has been saved locally to ${currencyCode}.`);
      });
    } else {
      chrome.storage.local.set({ localCurrency: "USD" }, () => {
        console.log("Local currency has been set by default to USD.");
      });
    }
  });

  // get the exchange rates
  const converter = new CurrencyConverter(API_KEY);

  await chrome.storage.local.get(['localCurrency'], async function (result) {
    let rates = await converter.fetchLatestRate(result.localCurrency, 'USD,EUR,JPY,GBP,AUD,CAD,CHF,CNY,HKD,NZD,SEK,KRW,SGD,NOK,MXN,INR,TRY,RUB,ZAR,BRL,DKK,PLN,THB,MYR,IDR,HUF,CZK,ILS,RON,PHP,ISK,HRK,BGN');
    chrome.storage.local.set({ rates });
  });

  // UI Elements
  const toCurrency = document.getElementById('toCurrency');
  const convertBtn = document.getElementById('convertBtn');

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

  function extractPrices(priceString) {
    // Regular expression to match numbers with potential currency symbols, commas, and spaces
    const regex = /[^\d.,]?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})[^\d.,]?/g;

    // Extract matches
    const matches = [...priceString.matchAll(regex)];

    // Convert matches to floats
    const prices = matches.map(match => {
      let price = match[1];

      // Determine the role of '.' and ',' based on their positions
      const hasComma = price.indexOf(',') !== -1;
      const hasDot = price.indexOf('.') !== -1;

      if (hasComma && hasDot) {
        if (price.indexOf(',') > price.indexOf('.')) {
          // Comma is the decimal separator
          price = price.replace('.', '').replace(',', '.');
        } else {
          // Dot is the decimal separator
          price = price.replace(/,/g, '');
        }
      } else if (hasComma && !hasDot) {
        // Only a comma is present, so it’s the decimal separator
        price = price.replace(',', '.');
      } else if (!hasComma && hasDot) {
        // Only a dot is present, so no changes are needed
        price = price;
      }

      return parseFloat(price);
    });

    return prices;
  }

  let alibaba_htmlTags = ['.price span', '.price-item span', '.normal'];
  let amazon_htmlTags = ['._cDEzb_p13n-sc-price_3mJ9Z', '.p13n-sc-price'];
  let ebay_htmlTags = ['.vlp-merch-price span[role="text"]', '.ux-textspans', 'span.textual-display.bsig__price.bsig__price--displayprice', 'span.textual-display.bsig__generic.bsig__previousPrice.strikethrough'];

  chrome.storage.local.get(['preferredCurrency', 'rates', 'localCurrency'], function (result) {
    const currency = result.preferredCurrency;
    const rates = result.rates;
    const localCurrency = result.localCurrency;

    if (!rates || !currency) {
      console.error('Rates or preferred currency not found');
      return;
    }
  
    const VAT_RATES = {
        "USD": 0,     // US - no VAT
        "EUR": 21,    // EU standard
        "JPY": 10,    // Japan
        "GBP": 20,    // UK
        "AUD": 10,    // Australia
        "CAD": 5,     // Canada
        "CHF": 7.7,   // Switzerland
        "CNY": 13,    // China
        "HKD": 0,     // Hong Kong
        "NZD": 15,    // New Zealand
        "SEK": 25,    // Sweden
        "KRW": 10,    // South Korea
        "SGD": 7,     // Singapore
        "NOK": 25,    // Norway
        "MXN": 16,    // Mexico
        "INR": 18,    // India
        "TRY": 20,    // Turkey
        "RUB": 20,    // Russia
        "ZAR": 15,    // South Africa
        "BRL": 17,    // Brazil
        "DKK": 25,    // Denmark
        "PLN": 23,    // Poland
        "THB": 7,     // Thailand
        "MYR": 10,    // Malaysia
        "IDR": 11,    // Indonesia
        "HUF": 27,    // Hungary
        "CZK": 21,    // Czech Republic
        "ILS": 17,    // Israel
        "RON": 19,    // Romania
        "PHP": 12,    // Philippines
        "ISK": 24,    // Iceland
        "HRK": 25,    // Croatia
        "BGN": 20     // Bulgaria
    }

    const rate = rates[currency];
    const vat_rate = VAT_RATES[localCurrency]; 

    if (!rate) {
      console.error('Currency rate not found for:', currency);
      return;
    }

    [...alibaba_htmlTags, ...amazon_htmlTags, ...ebay_htmlTags].forEach(htmlTag => {
      let wholePrice = document.querySelectorAll(htmlTag);

      for (let i = 0; i < wholePrice.length; i++) {
        try {
          let priceText = wholePrice[i].innerHTML;
          let originalPrice;

          if (priceText.includes('(')) { // Get the original price from parentheses
            originalPrice = priceText.split('(')[1].split(')')[0];
          }
          else { // For first conversion, save the original price
            originalPrice = priceText;
          }

          console.log(originalPrice, extractPrices(originalPrice));
          let numberOnly = extractPrices(originalPrice)[0];

          if (numberOnly) {
            const converted = numberOnly * rate;
            const vat_price = (converted * vat_rate / 100).toFixed(2);
            const converted_price = Number(converted).toLocaleString(undefined, { style: 'currency', currency: currency });
            if (vat_rate == 0) {
              wholePrice[i].innerHTML = `${converted_price} (${originalPrice.trim()})`;
            } else {
              wholePrice[i].innerHTML = `${converted_price} + ${vat_price} (${originalPrice.trim()})`;
            }
          }

        } catch (error) {
          console.error('Error converting price:', error);
        }
      }
    });
  });
};
