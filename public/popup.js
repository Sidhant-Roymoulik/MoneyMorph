

let priceScrapper = document.getElementById('convertBtn')
priceScrapper.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active:true, currentWindow:true}); 
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
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
    alert(wholePrice.innerHTML + " " + fractionPrice.innerHTML);

};