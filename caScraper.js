const puppeteer = require('puppeteer');

async function scrapeCanada(url) {
  //Initiate Puppeteer browser and direct to the URL
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto(url);

    // Get number of people tested from the government webpage, remove the comma and convert to number
    const tested = await page.evaluate(() => {
      const totalCanada = document.querySelector(
        '#wb-auto-4 > div.col-md-4 > section > p.h2.mrgn-tp-md'
      ).textContent;
      return Number(totalCanada.replace(/,/g, ''));
    });

    // Get total cases from the government webpage, remove the comma and convert to number
    const total = await page.evaluate(() => {
      const totalCanada = document.querySelector(
        '#wb-auto-4 > div:nth-child(2) > section > p.h2.mrgn-tp-md'
      ).textContent;
      return Number(totalCanada.replace(/,/g, ''));
    });

    // Get active cases from the government webpage, remove the comma and convert to number
    const active = await page.evaluate(() => {
      const totalCanada = document.querySelector(
        '#wb-auto-4 > div:nth-child(3) > section > p.h2.mrgn-tp-md'
      ).textContent;
      return Number(totalCanada.replace(/,/g, ''));
    });

    // Get recovered cases from the government webpage, remove the comma and convert to number
    const recovered = await page.evaluate(() => {
      const totalCanada = document.querySelector(
        '#wb-auto-4 > div:nth-child(4) > section > p.h2.mrgn-tp-md'
      ).textContent;
      return Number(totalCanada.replace(/,/g, ''));
    });

    // Get deaths from the government webpage, remove the comma and convert to number
    const deaths = await page.evaluate(() => {
      const totalCanada = document.querySelector(
        '#wb-auto-4 > div:nth-child(5) > section > p.h2.mrgn-tp-md'
      ).textContent;
      return Number(totalCanada.replace(/,/g, ''));
    });

    dataObj = {
      tested,
      total,
      active,
      recovered,
      deaths,
    };
    console.log('data from Canada scraper', dataObj);
  } catch (e) {
    const error = JSON.stringify(e);
    console.log(error);
  }

  //Close Puppeteer browser after scraping data
  await browser.close();
  // Return data object
  return dataObj;
}

scrapeCanada(
  'https://www.canada.ca/en/public-health/services/diseases/coronavirus-disease-covid-19.html'
);

//Export the function to be used in other files.
module.exports = scrapeCanada;
