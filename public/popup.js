import parseCurrency from 'parsecurrency';
import countryToCurrency from "country-to-currency";

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



  for (let i = 0; i < wholePrice.length; i++) {
    console.log(wholePrice[i].innerHTML);
    console.log(getCurrencyInfo(wholePrice[i].innerHTML));

    wholePrice[i].innerHTML = "123";
  }

};

// Method get currency info from string
function getCurrencyInfo(price_string) {
  var info = parseCurrency(price_string);

  // If currency code is not present in price, use website country code
  // if (info.currency == "") {
  //   // Checks for sites of type (https://amazon.de, https://amazon.co.uk)
  //   var country_code = location.host.replace(/^.*\./, "");

  //   // Checks for sites of type (https://export.ebay.com/in/)
  //   if (!country_code || country_code.length != 2) {
  //     var rxGetCountryCode = /^.{8}[^\/]*\/([^\/]*)/;
  //     country_code = rxGetCountryCode.exec(location.host)[1];
  //   }

  //   // Get currency code from country code
  //   currency_code = countryToCurrency(country_code.toUpperCase());

  //   // Replace value in currency info
  //   info.currency = currency_code;
  // }

  return info;
}