import markdownit from "markdown-it";
import tablesRule from "./tables";

describe("Tables Rule", () => {
  const md = markdownit().use(tablesRule);

  describe("bullet lists in table cells", () => {
    it("should parse bullet list items separated by br tags", () => {
      const result = md.parse(
        "| Header |\n|---|\n| * Item 1<br>* Item 2<br>* Item 3 |",
        {}
      );

      const bulletOpen = result.find((t) => t.type === "bullet_list_open");
      expect(bulletOpen).toBeDefined();

      const listItems = result.filter((t) => t.type === "list_item_open");
      expect(listItems.length).toBe(3);
    });

    it("should parse a single bullet item", () => {
      const result = md.parse("| Header |\n|---|\n| * Just one item |", {});

      const bulletOpen = result.find((t) => t.type === "bullet_list_open");
      expect(bulletOpen).toBeDefined();

      const listItems = result.filter((t) => t.type === "list_item_open");
      expect(listItems.length).toBe(1);
    });

    it("should not convert mixed content to bullet list", () => {
      const result = md.parse(
        "| Header |\n|---|\n| * Item 1<br>Not a bullet |",
        {}
      );

      const bulletOpen = result.find((t) => t.type === "bullet_list_open");
      expect(bulletOpen).toBeUndefined();
    });

    it("should handle dash markers", () => {
      const result = md.parse(
        "| Header |\n|---|\n| - Item 1<br>- Item 2 |",
        {}
      );

      const bulletOpen = result.find((t) => t.type === "bullet_list_open");
      expect(bulletOpen).toBeDefined();

      const listItems = result.filter((t) => t.type === "list_item_open");
      expect(listItems.length).toBe(2);
    });

    it("should handle plus markers", () => {
      const result = md.parse(
        "| Header |\n|---|\n| + Item 1<br>+ Item 2 |",
        {}
      );

      const bulletOpen = result.find((t) => t.type === "bullet_list_open");
      expect(bulletOpen).toBeDefined();

      const listItems = result.filter((t) => t.type === "list_item_open");
      expect(listItems.length).toBe(2);
    });

    it("should resolve inline markdown in bullet items", () => {
      const result = md.parse(
        "| Header |\n|---|\n| * Visit [Google](https://google.com)<br>* **Bold** item |",
        {}
      );

      const bulletOpen = result.find((t) => t.type === "bullet_list_open");
      expect(bulletOpen).toBeDefined();

      // Inline markdown is parsed into children of inline tokens
      const inlineTokens = result.filter(
        (t) => t.type === "inline" && t.content !== "Header"
      );
      const allChildren = inlineTokens.flatMap((t) => t.children ?? []);

      const linkOpen = allChildren.find((t) => t.type === "link_open");
      expect(linkOpen).toBeDefined();

      const strongOpen = allChildren.find((t) => t.type === "strong_open");
      expect(strongOpen).toBeDefined();
    });

    it("should preserve inline text content of bullet items", () => {
      const result = md.parse("| Header |\n|---|\n| * First<br>* Second |", {});

      const inlineTokens = result.filter(
        (t) => t.type === "inline" && t.content !== "Header"
      );
      expect(inlineTokens.length).toBe(2);
      expect(inlineTokens[0].content).toBe("First");
      expect(inlineTokens[1].content).toBe("Second");
    });
  });

  describe("paragraph wrapping", () => {
    it("should wrap plain text in paragraphs", () => {
      const result = md.parse("| Header |\n|---|\n| Plain text |", {});

      const paragraphOpen = result.filter((t) => t.type === "paragraph_open");
      expect(paragraphOpen.length).toBeGreaterThanOrEqual(1);

      const bulletOpen = result.find((t) => t.type === "bullet_list_open");
      expect(bulletOpen).toBeUndefined();
    });
  });

  describe("checkbox parsing", () => {
    it("should still parse checkboxes in table cells", () => {
      const result = md.parse(
        "| Header |\n|---|\n| - [x] Done<br>- [ ] Pending |",
        {}
      );

      const checkboxOpen = result.find((t) => t.type === "checkbox_list_open");
      expect(checkboxOpen).toBeDefined();

      const bulletOpen = result.find((t) => t.type === "bullet_list_open");
      expect(bulletOpen).toBeUndefined();
    });
  });
});
