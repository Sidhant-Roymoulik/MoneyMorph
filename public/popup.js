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

var currencyMatcher = /^(?:([-+]{1}) ?)?(?:([A-Z]{3}) ?)?(?:([^\d ]+?) ?)?(((?:\d{1,3}([,. ’'\u00A0\u202F]))*?\d{1,})(([,.])\d{1,2})?)(?: ?([^\d]+?))??(?: ?([A-Z]{3}))?$/;
var gr = /^\d{1,3}([,. ’'\u00A0\u202F]\d{3})*$/; // validate groups
var ind = /^\d{1,2}(,\d{2})*(,\d{3})?$/; // exception for Indian number format

function parseCurrency(priceStr) {
  // if (!priceStr || !priceStr.match) return null;
  priceStr = priceStr.trim();
  var match = priceStr.match(currencyMatcher);
  console.log(match);
  // if (!match) return null;
  var groupSeparator = match[6] || '';
  var decimalSeparator = match[8] || '';
  // if (groupSeparator === decimalSeparator && decimalSeparator) {
  //   return null;
  // }
  var integer = match[1] === '-' ? '-' + match[5] : match[5];
  // if (groupSeparator && !match[5].match(gr) && !match[5].match(ind)) {
  //   return null;
  // }
  var value = match[4];
  // if (!value) return null;
  if (groupSeparator) {
    value = value.replace(RegExp('\\' + groupSeparator, 'g'), '');
  }
  if (decimalSeparator) {
    value = value.replace(decimalSeparator, '.');
  }
  var numericVal = match[1] === '-' ? value * -1 : +value;
  // if (typeof numericVal !== 'number' || isNaN(numericVal)) {
  //   return null;
  // }
  return {
    raw: priceStr,
    value: numericVal,
    integer: integer || '',
    decimals: match[7] || '',
    currency: match[2] || match[10] || '',
    symbol: match[3] || match[9] || '',
    decimalSeparator: decimalSeparator,
    groupSeparator: groupSeparator,
    sign: match[1] || ''
  };
};

// Method get currency info from string
function getCurrencyInfo(price_string) {
  var info = parseCurrency(price_string);

  // // If currency code is not present in price, use website country code
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


    // wholePrice[i].innerHTML = "123";
  }

};