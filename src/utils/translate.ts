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
  
  export async function explainText(text: string): Promise<string> {
    console.log(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "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"

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat",
        "messages": [
          {
            "role": "user",
            "content": `I'm an intermediate level japanese student. Please explain the meaning of the following text. Provide a short and clear explanation of every part of the sentence, including word meanings and pronunciations. ${text}`
          }
        ]
      })
    });
  
    if (!response.ok) {
      console.error(JSON.stringify(response));
      throw new Error('Failed to fetch explanation, response: ' + JSON.stringify(response));
    }
  
    const data = await response.json();
    // Extract the explanation from the response
    const explanation = data.choices[0].message.content;
    return explanation;
  }