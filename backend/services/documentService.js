const pdfParse = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extract text from PDF buffer
 */
exports.extractFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
    charCount: data.text.length,
  };
};

/**
 * Scrape text from URL using cheerio
 */
exports.extractFromURL = async (url) => {
  const { data: html } = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (EmbedIQ Bot)' },
  });

  const $ = cheerio.load(html);

  // Remove noise elements
  $('script, style, nav, footer, header, .ad, #ad, iframe, noscript').remove();

  // Extract meaningful text
  const title = $('title').text().trim();
  const body  = $('body').text().replace(/\s+/g, ' ').trim();

  const text = `Title: ${title}\n\n${body}`;
  return { text, charCount: text.length, pageCount: 1 };
};

/**
 * Extract plain text (for manual input)
 */
exports.extractFromText = (text) => ({
  text,
  charCount: text.length,
  pageCount: 1,
});
