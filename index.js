import puppeteer from 'puppeteer';

const CRAWL_URL = 'https://news.ycombinator.com/'; // Example website

async function crawlPage() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        console.log(`Navigating to ${CRAWL_URL}...`);
        await page.goto(CRAWL_URL, { waitUntil: 'domcontentloaded' });
        const links = await page.$$eval('a.titlelink', anchors => {
            return anchors.map(anchor => anchor.href);
        });

        console.log(`\nFound ${links.length} links on the page:`);
        
        links.forEach((link, index) => {
            console.log(`${index + 1}. ${link}`);
        });

    } catch (error) {
        console.error('An error occurred during crawling:', error);
    } finally {
        console.log('\nClosing browser.');
        await browser.close();
    }
}

crawlPage();