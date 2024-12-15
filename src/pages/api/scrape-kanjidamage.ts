import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import { KanjiDamageEntry } from '@/types/kanji';

const filePath = path.join(process.cwd(), 'src/dict/kanjidamage.json');

const cleanText = (text?: string|null) => {
    if (!text) return null;
    const t = text.trim().replace('(', '').replace(')', '');
    if (t.endsWith("\n +")) {
        return t.slice(0, -3);
    }
    return t;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {

        const mainPageResponse = await fetch("http://www.kanjidamage.com/kanji")
        if (!mainPageResponse.ok) {
            return res.status(500).json({ error: "Failed to fetch main page" });
        }

        const mainPage = await mainPageResponse.text();
        const kanjiMatches = mainPage.matchAll(/<td style='text-align: center; width: 20px;'><a href="\/kanji\/(.+)">(.+)<\/a>/g);
        const result: { [key: string]: KanjiDamageEntry } = {};

        let i = 0;
        // @ts-ignore
        for (const match of kanjiMatches) {
            i += 1;
            // if (i > 20) {
            //     break;
            // }
            const kanji = match[1];
            const kanjiName = match[2];
            console.log(`Scraping kanji: ${kanjiName}, ${kanji}`);
            const kanjiPageResponse = await fetch(`http://www.kanjidamage.com/kanji/${kanji}`);
            if (!kanjiPageResponse.ok) {
                return res.status(500).json({ error: `Failed to fetch kanji page for ${kanjiName}` });
            }
            const kanjiPage = await kanjiPageResponse.text();
            const dom = new JSDOM(kanjiPage);
            const rows = dom.window.document.querySelectorAll(`.container`)[1].querySelectorAll(".row");
            const components = rows[1].querySelectorAll(".col-md-8 a.component");
            const definitions = rows[2].querySelectorAll(".col-md-12")[0].querySelectorAll(".definition");

            const mnemonic = (definitions.length === 3) ? definitions[1].textContent?.trim() : "";

            result[kanjiName] = {
                components: Array.from(components).map(x => ({
                    literal: x.innerHTML.trim(),
                    meaning: cleanText(x.nextSibling?.textContent),
                })),
                mnemonic,
            }

            console.log(JSON.stringify(result[kanjiName], null, 2));
        }

        fs.writeFileSync(filePath, JSON.stringify(result));

        return res.status(200).json({ message: "Scraped successfully!" });
    } else {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}
