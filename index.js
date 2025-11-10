import puppeteer from 'puppeteer';

// Use a Set to store visited URLs for efficient lookup and to prevent loops
const visitedUrls = new Set();
// Define a maximum depth to prevent infinite crawling
const MAX_DEPTH = 3; 

// The starting URL will be passed in the initial call
const START_URL = 'https://www.wikipedia.org/'; 

/**
 * Recursively crawls a page, selects a random link, and follows it.
 * @param {string} url The URL to crawl.
 * @param {number} depth The current depth of the crawl.
 */
async function crawlPage(url, depth) {
    if (depth > MAX_DEPTH) {
        console.log(`\n🛑 Max depth (${MAX_DEPTH}) reached. Stopping crawl.`);
        return;
    }

    if (visitedUrls.has(url)) {
        console.log(`\n➡️ Already visited: ${url}. Skipping.`);
        return;
    }

    console.log(`\n---------------------------------`);
    console.log(`🚀 Crawling (Depth ${depth}): ${url}`);
    visitedUrls.add(url);
    
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Increase timeout for potentially slow loading pages
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); 

        // Extract all unique 'a' element hrefs that aren't javascript
        const links = await page.$$eval('a', anchors => {
            const allHrefs = anchors
                .map(anchor => anchor.href)
                .filter(href => href && !href.startsWith('javascript:') && href.startsWith('http'));
            
            // Return only unique, absolute URLs starting with http/https
            return [...new Set(allHrefs)]; 
        });

        console.log(`✅ Found ${links.length} unique links on the page.`);
        
        if (links.length === 0) {
            console.log("No valid links to follow. Stopping this branch of the crawl.");
            return;
        }

        // 1. Choose a random link
        const randomIndex = Math.floor(Math.random() * links.length);
        const nextUrl = links[randomIndex];
        
        console.log(`\n✨ Randomly chosen link (${randomIndex + 1}/${links.length}): ${nextUrl}`);
        
        // Close the browser for this page before starting the next one
        await browser.close();

        // 2. Continue the crawl recursively with the new link and increased depth
        await crawlPage(nextUrl, depth + 1);

    } catch (error) {
        console.error(`\n❌ Error crawling ${url}: ${error.message}`);
        // Ensure browser is closed even if an error occurs
        if (browser) {
            await browser.close();
        }
    }
}

// Start the crawl process
crawlPage(START_URL, 1);