import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from 'langchain/chains';
import { OutputFixingParser } from 'langchain/output_parsers';

export class MachiningExpertChain {
    private llama: ChatOllama;
    private promptTemplate: PromptTemplate;
    private chain: LLMChain;
    private outputFixingParser: OutputFixingParser<any>;
    constructor(llama: ChatOllama, outputFixingParser: OutputFixingParser<any>) {
        this.llama = llama;
        this.outputFixingParser = outputFixingParser;
        this.promptTemplate = this.createPromptTemplate();
        this.chain = this.createChain(outputFixingParser);
    }

    createPromptTemplate() {
        return new PromptTemplate({
            inputVariables: ['query', 'context'],
            partialVariables: {
                format_instructions: this.outputFixingParser.getFormatInstructions()
            },
            template: `
                You are a machining expert that helps users with suggestions.
                This is your available context information: {context}
                Answer the user's question as best you can and use the available context
                information to make a better decision, but use your own expertise as
                the main driver for the decision:

                {format_instructions}
                {query}
            `
        });
    }

    createChain(outputFixingParser: OutputFixingParser<any>) {
        return new LLMChain({
            llm: this.llama,
            outputKey: 'xoutput',
            outputParser: outputFixingParser,
            prompt: this.promptTemplate
        });
    }

    async getResponse(chatContext: any, query: string) {
        const contextString = this.formatContext(chatContext);
        return await this.chain.call({
            context: contextString,
            query
        });
    }

    formatContext(chatContext: any) {
        return chatContext
            .slice(0, 3)
            .map((ctx: any) => ctx.pageContent)
            .join(' ');
    }
}