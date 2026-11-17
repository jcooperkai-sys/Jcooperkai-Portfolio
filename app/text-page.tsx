type Block = { kind: "heading" | "paragraph"; text: string } | { kind: "list"; items: string[] };

function sentenceCase(text: string) {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function parse(source: string) {
  const chunks = source.replace(/\r/g, "").split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean);
  const title = sentenceCase(chunks[0].split("\n")[0].split(",")[0]);
  let updated = "";
  const blocks: Block[] = [];
  for (const chunk of chunks.slice(1)) {
    const lines = chunk.split("\n");
    if (/^Last updated:/i.test(chunk)) {
      updated = chunk;
    } else if (lines.length === 1 && /^[A-Z][A-Z ,'&-]+$/.test(chunk)) {
      blocks.push({ kind: "heading", text: sentenceCase(chunk) });
    } else if (lines[0].startsWith("- ")) {
      blocks.push({ kind: "list", items: chunk.split(/\n(?=- )/).map((i) => i.replace(/^- /, "").replace(/\s*\n\s*/g, " ")) });
    } else {
      blocks.push({ kind: "paragraph", text: chunk.replace(/\s*\n\s*/g, " ") });
    }
  }
  return { title, updated, blocks };
}

export function TextPage({ source, plain }: { source: string; plain: string }) {
  const { title, updated, blocks } = parse(source);
  return (
    <>
      <div className="sky" aria-hidden="true">
        <div className="sky-a" />
        <div className="sky-b" />
        <div className="sky-c" />
      </div>
      <div className="frame">
        <header className="top">
          <a className="brand" href="/">jcooperkai</a>
        </header>
        <main className="doc" id="main">
          <h1 className="label">{title}</h1>
          {updated && <p className="doc-updated">{updated}</p>}
          {blocks.map((block, i) =>
            block.kind === "heading" ? (
              <h2 key={i}>{block.text}</h2>
            ) : block.kind === "list" ? (
              <ul key={i}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={i}>{block.text}</p>
            ),
          )}
          <p className="doc-links">
            <a className="link-button" href="/">Back home</a>
            <a className="link-button" href={plain}>Plain text version</a>
          </p>
        </main>
      </div>
    </>
  );
}
