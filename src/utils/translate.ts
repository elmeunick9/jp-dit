// utils/translate.js

export async function translateText(text: string): Promise<string> {
    const encodedText = encodeURI(text);
  
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodedText}`
    );
  
    if (!response.ok) {
      throw new Error('Failed to fetch translation');
    }
  
    const data = await response.json();
    // Extract the translation from the response
    const translatedText = data[0][0][0];
    return translatedText;
  }
  