import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { kanji, mnemonic } = req.body;

    // Validate input
    if (!kanji || !mnemonic) {
      return res.status(400).json({ error: "Kanji and mnemonic are required." });
    }

    // Simulate saving to a database
    console.log(`Saved mnemonic for ${kanji}: ${mnemonic}`);

    return res.status(200).json({ message: "Mnemonic saved successfully!" });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
