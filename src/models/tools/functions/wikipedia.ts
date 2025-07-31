import * as cheerio from "cheerio";

const WikipediaSummary = async ({
  query,
}: {
  query: string;
}): Promise<string> => {
  try {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${query}&format=json`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch Wikipedia page");
    }
    const data = await response.json();
    const $ = cheerio.load(data.parse.text["*"]);
    const paragraphs = $("p")
      .toArray()
      .map((p) => $(p).text().trim())
      .join("\n");

    return paragraphs || "No summary found for the given query.";
  } catch (error) {
    return "An error occured while fetching the Wikipedia summary";
  }
};

export default WikipediaSummary;
