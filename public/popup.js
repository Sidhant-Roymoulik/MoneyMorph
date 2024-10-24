import { CurrencyParser } from "./src/currency_parsing/CurrencyParser";

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
  let wholePrice = document.querySelector('span.a-price-whole');
  if (wholePrice) {
    const nestedElement = wholePrice.querySelector('.a-price-decimal');
    if (nestedElement) {
      nestedElement.remove();
    }
  }
  let fractionPrice = document.querySelector('span.a-price-fraction');
  // alert(wholePrice.innerHTML + " " + fractionPrice.innerHTML);

  var parser = CurrencyParser();
  alert(parser.getCurrencyInfo("$120"));
};