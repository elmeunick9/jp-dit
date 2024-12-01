type ConjugationForm = {
    name: string;
    forms: string[];
};

type VerbEntry = {
    word: string;
    found: string;
    verbType: string;
};

const conjugationForms: ConjugationForm[] = [
    // Add conjugation forms here (same as the provided list).
    { name: "polite affirmative", forms: ["います", "きます", "ぎます", "します", "ちます", "みます", "びます", "にます", "ります", "ます"] },
    { name: "plain negative", forms: ["わない", "かない", "がない", "さない", "たない", "まない", "ばない", "なない", "らない", "ない"] },
    { name: "polite negative", forms: ["いません", "きません", "ぎません", "しません", "ちません", "みません", "びません", "にません", "りません", "ません"] },
    { name: "curt negative (archaic)", forms: ["わん", "かん", "がん", "さん", "たん", "まん", "ばん", "なん", "らん", "ん"] },
    { name: "polite negative (archaic)", forms: ["いませぬ", "きませぬ", "ぎませぬ", "しませぬ", "ちませぬ", "みませぬ", "びませぬ", "にませぬ", "りませぬ", "ませぬ"] },

    // past tense: 6-9
    { name: "past tense", forms: ["った", "いた", "いだ", "した", "った", "んだ", "んだ", "んだ", "った", "た"] },
    { name: "polite affirmative", forms: ["いました", "きました", "ぎました", "しました", "ちました", "みました", "びました", "にました", "りました", "ました"] },
    { name: "plain negative", forms: ["わなかった", "かなかった", "がなかった", "さなかった", "たなかった", "まなかった", "ばなかった", "ななかった", "らなかった", "なかった"] },
    { name: "polite negative", forms: ["いませんでした", "きませんでした", "ぎませんでした", "しませんでした", "ちませんでした", "みませんでした", "びませんでした", "にませんでした", "りませんでした", "ませんでした"] },

    // perfect: 10
    { name: "negative perfect", forms: ["わず(に)", "かず(に)", "がず(に)", "さず(に)", "たず(に)", "まず(に)", "ばず(に)", "なず(に)", "らず(に)", "ず(に)"] },

    // ta form: 11
    { name: "representative", forms: ["ったり", "いたり", "いだり", "したり", "ったり", "んだり", "んだり", "んだり", "ったり", "たり"] },

    // renyoukei: 12-13
    { name: "conjunctive", forms: ["い-", "き-", "ぎ-", "し-", "ち-", "み-", "び-", "に-", "り-", "-"] },
    { name: "way of doing", forms: ["いかた", "きかた", "ぎかた", "しかた", "ちかた", "みかた", "びかた", "にかた", "りかた", "かた"] },

    // te forms: 14-22
    { name: "te form", forms: ["って", "いて", "いで", "して", "って", "んで", "んで", "んで", "って", "て"] },
    { name: "te iru", forms: ["っている", "いている", "いでいる", "している", "っている", "んでいる", "んでいる", "んでいる", "っている", "ている"] },
    { name: "simplified te iru", forms: ["ってる", "いてる", "いでる", "してる", "ってる", "んでる", "んでる", "んでる", "ってる", "てる"] },
    { name: "te aru", forms: ["ってある", "いてある", "いである", "してある", "ってある", "んである", "んである", "んである", "ってある", "てある"] },
    { name: "simplified te ageru", forms: ["ったげる", "いたげる", "いだげる", "したげる", "ったげる", "んだげる", "んだげる", "んだげる", "ったげる", "たげる"] },
    { name: "te oru", forms: ["っておる", "いておる", "いでおる", "しておる", "っておる", "んでおる", "んでおる", "んでおる", "っておる", "ておる"] },
    { name: "simplified te oru", forms: ["っとる", "いとる", "いどる", "しとる", "っとる", "んどる", "んどる", "んどる", "っとる", "とる"] },
    { name: "te oku", forms: ["っておく", "いておく", "いでおく", "しておく", "っておく", "んでおく", "んでおく", "んでおく", "っておく", "ておく"] },
    { name: "simplified te oku", forms: ["っとく", "いとく", "いどく", "しとく", "っとく", "んどく", "んどく", "んどく", "っとく", "とく"] },

    // tai/tageru: 23-24
    { name: "desire", forms: ["いたい", "きたい", "ぎたい", "したい", "ちたい", "みたい", "びたい", "にたい", "りたい", "たい"] },
    { name: "other's desire", forms: ["いたがる", "きたがる", "ぎたがる", "したがる", "ちたがる", "みたがる", "びたがる", "にたがる", "りたがる", "たがる"] },

    // pseudo-futurum forms: 25-30
    { name: "pseudo futurum", forms: ["おう", "こう", "ごう", "そう", "とう", "もう", "ぼう", "のう", "ろう", "よう"] },
    { name: "polite presumptive", forms: ["うでしょう", "くでしょう", "ぐでしょう", "すでしょう", "つでしょう", "むでしょう", "ぶでしょう", "ぬでしょう", "るでしょう", "るでしょう"] },
    { name: "plain presumptive", forms: ["うだろう", "くだろう", "ぐだろう", "すだろう", "つだろう", "むだろう", "ぶだろう", "ぬだろう", "るだろう", "るだろう"] },
    { name: "polite negative presumptive", forms: ["わないだろう", "かないだろう", "がないだろう", "さないだろう", "たないだろう", "まないだろう", "ばないだろう", "なないだろう", "らないだろう", "ないだろう"] },
    { name: "plain negative presumptive", forms: ["うまい", "くまい", "ぐまい", "すまい", "つまい", "むまい", "ぶまい", "ぬまい", "るまい", "まい"] },
    { name: "past presumptive", forms: ["ったろう", "いたろう", "いだろう", "したろう", "ったろう", "んだろう", "んだろう", "んだろう", "った", "たろう"] },

    // izenkei / kateikei: 31-32
    { name: "hypothetical", forms: ["えば", "けば", "げば", "せば", "てば", "めば", "べば", "ねば", "れば", "れば"] },
    { name: "past hypothetical", forms: ["ったら", "いたら", "いだら", "したら", "ったら", "んだら", "んだら", "んだら", "ったら", "たら"] },
    { name: "short potential", forms: ["える", "ける", "げる", "せる", "てる", "める", "べる", "ねる", "れる", ""] },

    // saserareru: 33-35
    { name: "passive", forms: ["われる", "かれる", "がれる", "される", "たれる", "まれる", "ばれる", "なれる", "られる", "られる"] },
    { name: "causative", forms: ["わせる", "かせる", "がせる", "させる", "たせる", "ませる", "ばせる", "なせる", "らせる", "させる"] },
    { name: "causative passive", forms: ["わせられる", "かせられる", "がせられる", "させられる", "たせられる", "ませられる", "ばせられる", "なせられる", "らせられる", "させられる"] },

    // commands: 36-41
    { name: "requesting", forms: ["ってください", "いてください", "いでください", "してください", "ってください", "んでください", "んでください", "んでください", "ってください", "てください"] },

    { name: "commanding", forms: ["え", "け", "げ", "せ", "て", "め", "べ", "ね", "れ", "ろ"] },
    { name: "authoritative", forms: ["いなさい", "きなさい", "ぎなさい", "しなさい", "ちなさい", "みなさい", "びなさい", "になさい", "りなさい", "なさい"] },
    { name: "advisory", forms: ["", "", "", "", "", "", "", "", "", "よ"] },
    { name: "negative request", forms: ["わないでください", "かないでください", "がないでください", "さないでください", "たないでください", "まないでください", "ばないでください", "なないでください", "らないでください", "ないでください"] },
    { name: "negative imperative", forms: ["うな", "くな", "ぐな", "すな", "つな", "むな", "ぶな", "ぬな", "るな", "るな"] },

    // belief about [...]ness: 42-44
    { name: "looks to be the case", forms: ["いそう", "きそう", "ぎそう", "しそう", "ちそう", "みそう", "びそう", "にそう", "りそう", "そう"] },
    { name: "claimed to be the case", forms: ["うそう", "くそう", "ぐそう", "すそう", "つそう", "むそう", "ぶそう", "ぬそう", "るそう", "るそう"] },
    { name: "apparently the case", forms: ["うらしい", "くらしい", "ぐらしい", "すらしい", "つらしい", "むらしい", "ぶらしい", "ぬらしい", "るらしい", "るらしい"] }
];

conjugationForms.sort((a, b) => b.forms[0].length - a.forms[0].length);

const verbTypes = ["v5u", "v5k", "v5g", "v5s", "v5t", "v5m", "v5b", "v5n", "v5r", "v1"];
const verbEndings = ["う", "く", "ぐ", "す", "つ", "む", "ぶ", "ぬ", "る", "る"];

function process(
    word: string,
    seen: VerbEntry[],
    aggregated: VerbEntry[][],
    entry: ConjugationForm,
    suffix: string,
    j: number
): void {
    if (!suffix.trim()) return;

    const re = new RegExp(`${suffix}$`);
    if (word.match(re)) {
        let newWord = word.replace(re, verbEndings[j]);
        // Special check for する
        if (newWord === "す") newWord = "する";
        // Terminal check for orphan v1
        if (newWord === "る") return;

        // @ts-ignore
        aggregated.push(destep(newWord, [...seen, { word: newWord, found: entry.name, verbType: verbTypes[j] }]));
    }
};

function destep(word: string, seen: VerbEntry[] = []): VerbEntry[][] {
    const aggregated: VerbEntry[][] = [];
    conjugationForms.forEach((entry) =>
        entry.forms.forEach((suffix, j) => process(word, seen, aggregated, entry, suffix, j))
    );
    if (aggregated.length === 0) return [seen];
    return aggregated;
};

export const conjugate = (verb: string, type: string = "v5"): { name: string; form: string }[] => {
    let index: number;
    let verbStem: string;
    const results: { name: string; form: string }[] = [];

    if (type.toLowerCase().includes("v1")) {
        index = verbTypes.indexOf("v1");
        verbStem = verb.slice(0, -1);
    } else {
        const lastChar = verb.slice(-1);
        index = verbEndings.indexOf(lastChar);
        verbStem = verb.slice(0, -1);
    }

    conjugationForms.forEach((form) => {
        const specificForm = form.forms[index];
        if (specificForm !== undefined) {
            results.push({ name: form.name, form: verbStem + specificForm });
        }
    });

    return results;
};

export const unconjugate = (word: string, verbType?: string): VerbEntry[] => {
    return destep(word).flat(99);
};
