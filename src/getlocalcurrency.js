export function getCurrencyFromURL(url) {
  // Map of country codes to currencies
  const countryToCurrency = {
    COM : "USD",
    UK : "GBP",
    FR : "EUR",
    DE : "EUR",
    EU : "EUR",
    ES : "EUR",
    IN : "INR",
    JP : "JPY",
    CN : "CNY",
    HK : "CNY",
    KR : "KRW"
  };

  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Extract the country code from the TLD
    const tld = hostname.split('.').pop().toUpperCase();

    // Match the country code to a currency
    const currency = countryToCurrency[tld];
    if (currency) {
      return currency;
    } else {
      return "USD";
      // return "Currency not found for this domain.";
    }
  } catch (error) {
    console.log("Invalid URL.");
  }
}
