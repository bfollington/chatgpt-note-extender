import * as dotenv from "dotenv";
import * as fs from "fs";
import { ChatGPTAPI } from "chatgpt";

dotenv.config();

async function ask(query) {
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const res = await api.sendMessage(query);
  console.log(res.text);
}

// example();

function getAllNoteTitles() {
  const files = fs.readdirSync("./notes");
  return files.map((f) => f.replace(".subtext", ""));
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
  const files = fs.readdirSync("./notes");
  const randomFile = files[Math.floor(Math.random() * files.length)];

  // read file content
  const text = fs.readFileSync(`./notes/${randomFile}`, "utf-8");
  const note = processNote(text);

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
  const files = fs.readdirSync("./notes");
  const randomFile = files[Math.floor(Math.random() * files.length)];

  // read file content
  const text = fs.readFileSync(`./notes/${randomFile}`, "utf-8");
  const note = processNote(text);

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
  const files = fs.readdirSync("./notes");
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const randomFile2 = files[Math.floor(Math.random() * files.length)];

  // read file content
  const text = fs.readFileSync(`./notes/${randomFile}`, "utf-8");
  const note = processNote(text);

  const text2 = fs.readFileSync(`./notes/${randomFile2}`, "utf-8");
  const note2 = processNote(text2);

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
  const files = fs.readdirSync("./notes");
  const randomFile = files[Math.floor(Math.random() * files.length)];

  // read file content
  const text = fs.readFileSync(`./notes/${randomFile}`, "utf-8");
  const note = processNote(text);

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

extendNote();
