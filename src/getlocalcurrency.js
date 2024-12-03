function getCurrencyFromURL(url) {
  // Map of country codes to currencies
  const countryToCurrency = {
    us: "USD", // United States
    jp: "JPY", // Japan
    gb: "GBP", // United Kingdom
    eu: "EUR", // European Union
    in: "INR", // India
    au: "AUD", // Australia
    ca: "CAD", // Canada
    cn: "CNY", // China
    de: "EUR", // Germany
    fr: "EUR", // France
  };

  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Extract the country code from the TLD
    const tld = hostname.split('.').pop().toLowerCase();

    // Match the country code to a currency
    const currency = countryToCurrency[tld];
    if (currency) {
      return currency;
    } else {
      return "Currency not found for this domain.";
    }
  } catch (error) {
    return "Invalid URL.";
  }
}
