import fs from "fs";

// Small placeholder audio (silent/short)
const base64Audio = "SUQzAwAAAAAAFlRFTkMAAAAMAAADY29kZQAAAAAA"; 

const buffer = Buffer.from(base64Audio, "base64");
fs.writeFileSync("./public/audio/placeholder.mp3", buffer);

console.log("Placeholder audio created at public/audio/placeholder.mp3");
