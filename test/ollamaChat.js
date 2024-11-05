import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Initialize the chat model with Ollama
const chat = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default Ollama endpoint
    model: "llama3.2", // Or any other model you have pulled
    temperature: 0.7
});

// Create a prompt template
const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant."],
    ["human", "{input}"]
]);

// Create a basic chain
const chain = promptTemplate
    .pipe(chat)
    .pipe(new StringOutputParser());

// Example usage
async function main() {
    try {
        // Make sure Ollama is running locally before executing
        const response = await chain.invoke({
            input: "What is the capital of France?"
        });
        console.log("Response:", response);
    } catch (error) {
        console.error("Error:", error);
    }
}

// Example with streaming
async function streamExample() {
    try {
        const stream = await chain.stream({
            input: "Write a short poem about AI"
        });

        for await (const chunk of stream) {
            process.stdout.write(chunk);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Advanced example with multiple messages
const advancedPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a knowledgeable assistant who speaks multiple languages."],
    ["human", "My name is {name}"],
    ["assistant", "Nice to meet you, {name}!"],
    ["human", "{message}"]
]);

const advancedChain = advancedPrompt
    .pipe(chat)
    .pipe(new StringOutputParser());

async function advancedExample() {
    try {
        const response = await advancedChain.invoke({
            name: "Alice",
            message: "Translate 'Hello World' to French"
        });
        console.log("Advanced Response:", response);
    } catch (error) {
        console.error("Error:", error);
    }
}
async function callAll() {
    console.log("--   Main Example   --");
    console.log("----------------------");
    await main();
    console.log("--  Stream Example  --");
    console.log("----------------------");
    await streamExample();
    console.log("-- Advanced Example --");
    console.log("----------------------");
    await advancedExample();
}

callAll();