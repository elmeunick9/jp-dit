import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const filePath = path.join(process.cwd(), 'mnemonics.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { kanji, mnemonic } = req.body;

    // Validate input
    if (!kanji || !mnemonic) {
      return res.status(400).json({ error: "Kanji and mnemonic are required." });
    }

    // Load existing data
    let data: {[k:string]: string} = {};
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // Save new mnemonic
    data[kanji] = mnemonic as string;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Saved mnemonic for ${kanji}: ${mnemonic}`);

    return res.status(200).json({ message: "Mnemonic saved successfully!" });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
