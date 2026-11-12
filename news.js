const NEWS_URL = "/nexora-ai/data/news.json";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("news-list");
  const status = document.getElementById("news-status");

  if (!container) return;

  const hu = document.documentElement.lang === "hu";

  try {
    const response = await fetch(NEWS_URL);
    if (!response.ok) throw new Error("News unavailable");

    const data = await response.json();
    const articles = [...data.news]
      .sort((a, b) => new Date(b.published) - new Date(a.published))
      .slice(0, 12);

    container.replaceChildren();

    articles.forEach(article => {
      const card = document.createElement("article");
      card.className = "card news-card";

      const category = document.createElement("p");
      category.className = "tag";
      category.textContent = article.category;

      const title = document.createElement("h3");
      title.textContent = article.title;

      const summary = document.createElement("p");
      summary.textContent = article.summary || "";

      const source = document.createElement("p");
      source.className = "news-source";
      source.textContent = article.source;

      const link = document.createElement("a");
      link.href = article.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = hu ? "Eredeti cikk →" : "Read original →";

      card.append(category, title, summary, source, link);
      container.append(card);
    });

    const date = new Date(data.updated);
    status.textContent = (hu ? "Utoljára frissítve: " : "Last updated: ")
      + date.toLocaleString(hu ? "hu-HU" : "en-GB");

  } catch (error) {
    status.textContent = hu
      ? "A hírek jelenleg nem érhetők el. Próbáld újra később."
      : "News are temporarily unavailable. Please try again later.";
    console.error("NEXORA News:", error);
  }
});
