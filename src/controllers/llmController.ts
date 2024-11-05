
import express, { Request, Response } from 'express';
import { json } from 'body-parser';
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { z } from  'zod';
import { OutputFixingParser, StructuredOutputParser } from 'langchain/output_parsers';
import { getZodType } from '../utils/zodUtils';
import { MachiningExpertChain } from '../utils/machiningExpertChain';
import { ChainValues } from '@langchain/core/utils/types';


export class LlmController {
    private llama: ChatOllama;
    private embeddings: OllamaEmbeddings;
    private faissStore: FaissStore;
    private docStore: string;

    constructor() {
        this.docStore = './docs';
        this.llama = new ChatOllama({
            // baseUrl: process.env.OPENAI_API_BASE || 'http://localhost:11434/v1',
            model: 'llama3.2:latest',
            temperature: 0.7

        });

        this.embeddings = new OllamaEmbeddings({
            // baseUrl: process.env.OPENAI_API_BASE || 'http://localhost:11434/v1',
            model: 'nomic-embed-text-v1'
        });

        this.prepareEmbeddings();
    }

    private async prepareEmbeddings() {
        const loader = new DirectoryLoader(`${this.docStore}/PDFs`, {
            '.pdf': (path) => new PDFLoader(path)
        });

        const docs = await loader.load();
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });
        const docsSplit = await textSplitter.splitDocuments(docs);
        // add console log with datetime
        console.log(`${new Date().toISOString()} Loaded ${docsSplit.length} documents`);
        const vectorStore = await FaissStore.fromDocuments(docsSplit, this.embeddings);
        console.log(`${new Date().toISOString()} From ${docsSplit.length} documents, created ${vectorStore.index.ntotal} vectors`);
        await vectorStore.save(`${this.docStore}`);
        console.log(`${new Date().toISOString()} Saved vector store to ${this.docStore}`);
        this.faissStore = await FaissStore.load(`${this.docStore}`, this.embeddings);
        console.log(`${new Date().toISOString()} Loaded vector store from ${this.docStore}`);
    }

    public setRoutes() {
        const routes = express.Router();

        routes.post('/chat', json(), async (req: Request, res: Response) => {
            const body = req.body;
            const { query, output } = body;

            const chatContext = await this.faissStore.similaritySearch(query, 10);

            const zodSchema: any = {};

            output.forEach((field: { key: string, type: string; description: string }) => {
                zodSchema[field.key] = getZodType(field.type).describe(field.description);
            });

            const outputParser = StructuredOutputParser.fromZodSchema(
                z.object(zodSchema)
            );

            const outputFixingParser = OutputFixingParser.fromLLM(this.llama, outputParser);

            const expertChain = new MachiningExpertChain(this.llama, outputFixingParser);
            const result: ChainValues = await expertChain.getResponse(chatContext, query);
            // tslint:disable-next-line:no-console
            console.log(result.xoutputKey);
            res.json({
                message: result.xoutputKey
            });
        });
        return routes;
    }
}
