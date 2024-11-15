
// Unit tests for: setRoutes


import { json } from 'body-parser';
import express, { Request, Response } from 'express';
import { LlmController } from '../llmController';



// Mocking external dependencies
jest.mock("fs");
jest.mock("express");
jest.mock("body-parser");
jest.mock("../../utils/zodUtils");
jest.mock("../../utils/machiningExpertChain");

// Mock classes
class MockChatOllama {
  // Mock necessary methods and properties
}

class MockOllamaEmbeddings {
  // Mock necessary methods and properties
}

class MockFaissStore {
  public similaritySearch = jest.fn().mockResolvedValue([{ pageContent: 'mocked content' }] as any);
  public load = jest.fn().mockResolvedValue(this as any);
  public save = jest.fn().mockResolvedValue(undefined as any);
  public mergeFrom = jest.fn().mockResolvedValue(undefined as any);
  public index = { ntotal: 0 };
}

describe('LlmController.setRoutes() setRoutes method', () => {
  let mockChatOllama: MockChatOllama;
  let mockOllamaEmbeddings: MockOllamaEmbeddings;
  let mockFaissStore: MockFaissStore;
  let llmController: LlmController;

  beforeEach(() => {
    mockChatOllama = new MockChatOllama() as any;
    mockOllamaEmbeddings = new MockOllamaEmbeddings() as any;
    mockFaissStore = new MockFaissStore() as any;

    llmController = new LlmController();
    llmController['llama'] = mockChatOllama as any;
    llmController['embeddings'] = mockOllamaEmbeddings as any;
    llmController['faissStore'] = mockFaissStore as any;
  });

  describe('Happy Path', () => {
    it('should return suggested tool on /getToolSuggestion', async () => {
      // Arrange
      const mockRequest = {
        body: {
          keyTerms: 'mock terms',
          query: 'mock query',
          output: [{ key: 'tool', type: 'string', description: 'A tool' }]
        }
      } as Request;

      const mockResponse = {
        json: jest.fn()
      } as unknown as Response;

      const mockRouter = {
        post: jest.fn((path, middleware, handler) => {
          if (path === '/getToolSuggestion') {
            handler(mockRequest, mockResponse);
          }
        })
      };

      jest.spyOn(express, 'Router').mockReturnValue(mockRouter as any);

      // Act

      // Assert
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/getToolSuggestion',
        json(),
        expect.any(Function)
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        suggestedTool: 'mocked content'
      });
    });

    it('should return context pages on /getSimilaritySearch', async () => {
      // Arrange
      const mockRequest = {
        body: {
          keyTerms: 'mock terms'
        }
      } as Request;

      const mockResponse = {
        json: jest.fn()
      } as unknown as Response;

      const mockRouter = {
        post: jest.fn((path, middleware, handler) => {
          if (path === '/getSimilaritySearch') {
            handler(mockRequest, mockResponse);
          }
        })
      };

      jest.spyOn(express, 'Router').mockReturnValue(mockRouter as any);

      // Act

      // Assert
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/getSimilaritySearch',
        json(),
        expect.any(Function)
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        contextPages: [{ pageContent: 'mocked content' }]
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty keyTerms gracefully in /getToolSuggestion', async () => {
      // Arrange
      const mockRequest = {
        body: {
          keyTerms: '',
          query: 'mock query',
          output: [{ key: 'tool', type: 'string', description: 'A tool' }]
        }
      } as Request;

      const mockResponse = {
        json: jest.fn()
      } as unknown as Response;

      const mockRouter = {
        post: jest.fn((path, middleware, handler) => {
          if (path === '/getToolSuggestion') {
            handler(mockRequest, mockResponse);
          }
        })
      };

      jest.spyOn(express, 'Router').mockReturnValue(mockRouter as any);

      // Act

      // Assert
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/getToolSuggestion',
        json(),
        expect.any(Function)
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        suggestedTool: 'mocked content'
      });
    });

    it('should handle missing output fields gracefully in /getToolSuggestion', async () => {
      // Arrange
      const mockRequest = {
        body: {
          keyTerms: 'mock terms',
          query: 'mock query',
          output: []
        }
      } as Request;

      const mockResponse = {
        json: jest.fn()
      } as unknown as Response;

      const mockRouter = {
        post: jest.fn((path, middleware, handler) => {
          if (path === '/getToolSuggestion') {
            handler(mockRequest, mockResponse);
          }
        })
      };

      jest.spyOn(express, 'Router').mockReturnValue(mockRouter as any);

      // Act

      // Assert
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/getToolSuggestion',
        json(),
        expect.any(Function)
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        suggestedTool: 'mocked content'
      });
    });
  });
});

// End of unit tests for: setRoutes
