function convertHtml2JsonAndSet() {
  const htmlTextAreaValue = document.getElementById("html").value;
  const jsonObj = html2json(htmlTextAreaValue);
  const jsonArea = document.getElementById("json");
  jsonArea.textContent = JSON.stringify(jsonObj, null, 2);
}

function html2json(htmlText) {
  if (typeof htmlText !== "string") return [];

  const SELF_CLOSING_TAGS = new Set([
    "area","base","br","col","embed","hr","img","input",
    "link","meta","param","source","track","wbr",
  ]);

  const document = {
    type: "document",
    children: [],
  };

  const stack = [document];
  let i = 0;

  const decodeHtmlEntities = (text) => {
    const map = {
      "&copy;": "©",
      "&lt;": "<",
      "&gt;": ">",
      "&amp;": "&",
      "&nbsp;": " ",
    };

    return text.replace(/&[a-zA-Z]+;/g, (m) => map[m] ?? m);
  };

  while (i < htmlText.length) {
    try {

      if (htmlText.startsWith("<!--", i)) {
        const end = htmlText.indexOf("-->", i + 4);
        if (end === -1) break;

        const content = htmlText.slice(i + 4, end).trim();

        if (content) {
          stack[stack.length - 1].children.push({
            type: "comment",
            content,
          });
        }

        i = end + 3;
        continue;
      }

      if (htmlText.slice(i, i + 9).toLowerCase() === "<!doctype") {
        const end = htmlText.indexOf(">", i);
        if (end === -1) break;

        const raw = htmlText.slice(i + 9, end).trim();
        const name = raw.split(/\s+/)[0] || "html";

        stack[stack.length - 1].children.push({
          type: "doctype",
          name: name.toLowerCase(),
        });

        i = end + 1;
        continue;
      }

      if (htmlText[i] === "<") {
        const endTag = htmlText.indexOf(">", i);
        if (endTag === -1) break;

        let tagContent = htmlText.slice(i + 1, endTag).trim();

        if (tagContent[0] === "/") {
          const tagName = tagContent.slice(1).trim().toLowerCase();

          while (stack.length > 1) {
            const node = stack.pop();
            if (node.tag === tagName) break;
          }

          i = endTag + 1;
          continue;
        }

        const tagName = tagContent.split(/\s+/)[0].toLowerCase();
        const isSelfClosing =
          tagContent.endsWith("/") || SELF_CLOSING_TAGS.has(tagName);

        const attrString = tagContent.slice(tagName.length);
        const attrRegex =
          /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

        let match;
        let attributes = null;

        while ((match = attrRegex.exec(attrString))) {
          if (!attributes) attributes = {};
          const name = match[1];
          const value = match[2] ?? match[3] ?? match[4] ?? true;
          attributes[name] = value;
        }

        if (tagName === "textarea") {
          const closeTag = "</textarea>";
          const closeIndex = htmlText.toLowerCase().indexOf(closeTag, endTag);

          const element = {
            type: "element",
            tag: "textarea",
            ...(attributes ? { attributes } : {}),
          };

          if (closeIndex !== -1) {
            element.value = decodeHtmlEntities(
              htmlText.slice(endTag + 1, closeIndex)
            );
            i = closeIndex + closeTag.length;
          } else {
            element.value = "";
            i = endTag + 1;
          }

          stack[stack.length - 1].children.push(element);
          continue;
        }

        const element = {
          type: "element",
          tag: tagName,
          ...(attributes ? { attributes } : {}),
          children: [],
        };

        stack[stack.length - 1].children.push(element);

        if (!isSelfClosing) {
          stack.push(element);
        }

        i = endTag + 1;
        continue;
      }

      let nextTag = htmlText.indexOf("<", i);
      if (nextTag === -1) nextTag = htmlText.length;

      const rawText = htmlText.slice(i, nextTag);

      if (rawText) {
        const text = rawText.trim();

        if (text) {
          stack[stack.length - 1].children.push({
            type: "text",
            content: decodeHtmlEntities(text),
          });
        }
      }

      i = nextTag;
    } catch (e) {
      i++;
    }
  }

  return document.children;
}



function showExample1() {
  const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport">
    <title>Sample HTML</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the home section of the webpage.</p>
        </section>
        <section id="about">
            <h2>About Section</h2>
            <p>This is the about section of the webpage.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
`;
  const jsonContent = {
    "Comment 1":
      "You have to think about how to take into account various html inputs so your json structure will cover them all and handle different cases.",
    "Comment 2":
      "When you make any choice in terms of selecting specific json structure for conversion - be ready to provide reasoning behind such choice.",
  };

  document.getElementById("html").value = htmlExample;
  document.getElementById("json").textContent = JSON.stringify(
    jsonContent,
    null,
    2,
  );
}

function showExample2() {
  const htmlExample = `<div>
<p>Hello world!</p>
  <button>Click me!</button>
  <textarea>Some very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long string.</textarea>
</div>
`;
  const jsonContent = {
    "Comment 1":
      "You have to think about how to take into account various html inputs so your json structure will cover them all and handle different cases.",
    "Comment 2":
      "When you make any choice in terms of selecting specific json structure for conversion - be ready to provide reasoning behind such choice.",
  };

  document.getElementById("html").value = htmlExample;
  document.getElementById("json").textContent = JSON.stringify(
    jsonContent,
    null,
    2,
  );
}
