import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_API_KEY,
});
type Payload = {
  messages: { role: 'user' | 'system'; content: string }[];
};

export const chatCompletion = async ({ messages }: Payload) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-4-1106-preview',
      response_format: {
        type: 'json_object',
      },
    });
    return completion.choices[0].message;
  } catch (error) {
    console.log(error);
  }
};
