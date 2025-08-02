import WikipediaTitlesRanker from "@/utils/wikiepedia_titles_ranker";
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

    // const bestMatchTitle = searchData.query.search[0]?.title;

    const alternateTitle = await WikipediaTitlesRanker({
      title: query,
      query: searchData,
    });
    console.info("Alternate title from ranker:", alternateTitle);

    if (alternateTitle == "No title found") {
      return "No matching Wikipedia article found.";
    }

    const pageUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
      alternateTitle!
    )}&format=json`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();

    const $ = cheerio.load(pageData.parse.text["*"]);
    const paragraphs = $("p")
      .toArray()
      .map((p) => $(p).text().trim())
      .join("\n");
    console.info(`Extracted paragraphs for ${alternateTitle}\n===============`);
    return paragraphs || "No summary found for the given query.";
  } catch (error) {
    console.error("Wikipedia fetch error for query:", query, error);
    return "An error occurred while fetching the Wikipedia summary.";
  }
};

export default WikipediaSummary;
