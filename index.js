import * as dotenv from "dotenv";
import * as fs from "fs";
import { ChatGPTAPI } from "chatgpt";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function ask(query) {
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const res = await api.sendMessage(query);
  console.log(res.text);
}

function getAllNoteFilenames() {
  return fs.readdirSync("./notes").filter((f) => f.endsWith(".subtext"));
}

function getAllNoteTitles() {
  const files = getAllNoteFilenames();
  return files.map((f) => f.replace(".subtext", ""));
}

function readNoteBody(filename) {
  const text = fs.readFileSync(`./notes/${filename}`, "utf-8");
  const note = processNote(text);
  return note;
}

function extendTitles() {
  const lines = getAllNoteTitles();
  console.log(lines.length);

  // shuffle the list
  const shuffled = lines.sort(() => 0.5 - Math.random());
  // take the first 10 items
  const selected = shuffled.slice(0, 25);

  const query = `
  The following is a list of notes from an author's personal notebook:

  ${selected.join("\n")}

  Suggest 10 more titles that could appear in this author's notes.
  `;

  console.log(query);
  console.log("---");
  ask(query);
}

function processNote(note) {
  const lines = note.split(/[\r\n]+/);
  // remove all lines with a colon
  const filtered = lines.filter((line) => !line.includes(":"));
  // return joined list
  return filtered.join("\n");
}

function rewordNote() {
  // select random file in folder
  const files = getAllNoteFilenames();
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const note = readNoteBody(randomFile);

  if (note.length < 5) {
    console.warn("Note too short, skipping");
    return;
  }

  const query = `
  The following is a note from an author's personal notebook. The title is on the first line and ends with the suffix .subtext, the remainder of the document is the body:

  ${randomFile}
  ${note}

  Reword this note in the voice of Kanye West.
  `;
  console.log(query);
  console.log("---");
  ask(query);
}

function howAreTheseRelated() {
  const lines = getAllNoteTitles();

  // shuffle the list
  const shuffled = lines.sort(() => 0.5 - Math.random());
  // take the first 10 items
  const selected = shuffled.slice(0, 3);

  const query = `
   The following is a list of notes from an author's personal notebook:
 
   ${selected.join("\n")}
 
    Write a haiku inspired by these titles.
   `;

  console.log(query);
  console.log("---");
  ask(query);
}

function addSlashlinks() {
  // select random file in folder
  const files = getAllNoteFilenames();
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const note = readNoteBody(randomFile);

  if (note.length < 5) {
    console.warn("Note too short, skipping");
    return;
  }

  const query = `
  The following is a note from an author's personal notebook. The title is on the first line and ends with the suffix .subtext, the remainder of the document is the body:

  ${randomFile}
  ${note}

  Key terms in these notes appear in the form of slashlinks, e.g. /hello-world. Replace key terms with slashlinks in the above note.
  `;
  console.log(query);
  console.log("---");
  ask(query);
}

function connect() {
  // select random file in folder
  const files = getAllNoteFilenames();
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const randomFile2 = files[Math.floor(Math.random() * files.length)];

  // read file content
  const note = readNoteBody(randomFile);
  const note2 = readNoteBody(randomFile2);

  if (note.length < 5 || note2.length < 5) {
    console.warn("Note too short, skipping");
    return;
  }

  const query = `
  The following are two notes from an author's personal notebook. The title is on the first line and ends with the suffix .subtext, the remainder of the document is the body:

  ${randomFile}
  ${note}

  ${randomFile2}
  ${note2}

  Extend the author's thinking by finding the connection between these ideas.
  `;
  console.log(query);
  console.log("---");
  ask(query);
}

function extendNote() {
  // select random file in folder
  const files = getAllNoteFilenames();
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const note = readNoteBody(randomFile);

  if (note.length < 5) {
    console.warn("Note too short, skipping");
    return;
  }

  const query = `
  The following is a note from an author's personal notebook. The title is on the first line and ends with the suffix .subtext, the remainder of the document is the body:

  ${randomFile}
  ${note}

  Capture the ideas of this note in a single sentence poem.
  `;
  console.log(query);
  console.log("---");
  ask(query);
}

async function getEmbedding(text) {
  const res = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: text,
  });

  const embedding = res.data.data.find((o) => o.object === "embedding");
  return embedding;
}

function cosinesim(A, B) {
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < A.length; i++) {
    // here you missed the i++
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  let similarity = dotproduct / (mA * mB); // here you needed extra brackets
  return similarity;
}

async function getEmbeddingForRandomNoteTitle() {
  // select random file in folder
  const files = getAllNoteFilenames();
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const processedName = randomFile.replace(".subtext", "").replace(/-/g, " ");

  console.log(processedName);
  return await getEmbedding(processedName);
}

// const a = await getEmbeddingForRandomNoteTitle();
// const b = await getEmbeddingForRandomNoteTitle();
// console.log(cosinesim(a.embedding, b.embedding));

async function getEmbeddings(max) {
  let files = fs.readdirSync("./notes").filter((f) => f.endsWith(".subtext"));
  const cache = loadCachedEmbeddings();

  files = files.slice(0, max);

  for (let f of files) {
    if (cache[f]) continue;

    const processedName = f.replace(".subtext", "").replace(/-/g, " ");
    const text = fs.readFileSync(`./notes/${f}`, "utf-8");
    const note = processNote(text);
    const combined = `${processedName}\n\n${note}`;
    console.log(combined);

    const embedding = await getEmbedding(combined);

    cache[f] = embedding;
  }

  const json = JSON.stringify(cache);
  // save to disk
  console.log(json);
  fs.writeFileSync("./embeddings.json", json);
}

function loadCachedEmbeddings() {
  try {
    const data = fs.readFileSync("./embeddings.json");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function findRelatedNotes(text, count = 10, threshold = 0.75) {
  const cache = loadCachedEmbeddings();
  const embedding = await getEmbedding(text);
  let related = [];

  for (let f in cache) {
    const similarity = cosinesim(embedding.embedding, cache[f].embedding);
    if (similarity > threshold) {
      related.push({ file: f, similarity });
    }
  }

  related.sort((a, b) => b.similarity - a.similarity);
  related = related.slice(0, count);

  console.log(related);
  return related;
}

// getEmbeddings(135);

// get cli args
const args = process.argv.slice(2);
findRelatedNotes(args.join(" "), 5, 0.75);
