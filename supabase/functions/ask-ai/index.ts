import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CEREBRAS_API_KEY = Deno.env.get("CEREBRAS_API_KEY");
const AI_SYSTEM_PROMPT = Deno.env.get("AI_SYSTEM_PROMPT");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* функция для принудительного разбиения на чанки */
async function* forceChunkedStream(reader: ReadableStreamDefaultReader<Uint8Array>, chunkSize: number = 2) {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          yield 'data: [DONE]\n\n';
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta || {};
          const content = delta.content;
          const reasoning = delta.reasoning || delta.reasoning_content;

          if (reasoning) {
            yield `data: ${JSON.stringify({
              ...parsed,
              choices: [{
                ...parsed.choices[0],
                delta: { reasoning: reasoning }
              }]
            })}\n\n`;
            continue;
          }

          if (content) {
            let i = 0;
            while (i < content.length) {
              const piece = content.slice(i, i + chunkSize);
              i += chunkSize;

              const newDelta = {
                ...parsed,
                choices: [{
                  ...parsed.choices[0],
                  delta: { content: piece }
                }]
              };

              yield `data: ${JSON.stringify(newDelta)}\n\n`;
              await new Promise(r => setTimeout(r, 10));
            }
          } else {
            yield `data: ${data}\n\n`;
          }
        } catch {
          yield `data: ${data}\n\n`;
        }
      }
    }
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!CEREBRAS_API_KEY) {
      console.error("CEREBRAS_API_KEY missing");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!AI_SYSTEM_PROMPT) {
      console.error("AI_SYSTEM_PROMPT missing — add it in Supabase Secrets");
      return new Response(
        JSON.stringify({ error: "System prompt not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* добавляем system prompt из секретов */
    const messagesWithSystem = [
      { role: "system", content: AI_SYSTEM_PROMPT },
      ...messages
    ];

    const requestBody = {
      model: "gemma-4-31b",
      messages: messagesWithSystem,
      temperature: 0.0,
      top_p: 1,
      stream: true,
      max_tokens: 4000,
      reasoning_format: "parsed",
    };

    console.log("System prompt loaded:", AI_SYSTEM_PROMPT ? "✅" : "❌");

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CEREBRAS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cerebras API Error:", errorText);
      
      let errorMessage = "Cerebras API error";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of forceChunkedStream(reader, 2)) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(customStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});