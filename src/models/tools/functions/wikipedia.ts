import * as cheerio from "cheerio";

const WikipediaSummary = async ({
  query,
}: {
  query: string;
}): Promise<string> => {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    const bestMatchTitle = searchData.query.search[0]?.title;
    console.log("Best match title:", bestMatchTitle);
    if (!bestMatchTitle) {
      return "No matching Wikipedia article found.";
    }

    const pageUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
      bestMatchTitle
    )}&format=json`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();

    const $ = cheerio.load(pageData.parse.text["*"]);
    const paragraphs = $("p")
      .toArray()
      .map((p) => $(p).text().trim())
      .join("\n");
    console.log(paragraphs);
    return paragraphs || "No summary found for the given query.";
  } catch (error) {
    console.error("Wikipedia fetch error for query:", query, error);
    return "An error occurred while fetching the Wikipedia summary.";
  }
};

export default WikipediaSummary;
