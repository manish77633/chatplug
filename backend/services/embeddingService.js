const { Pinecone } = require('@pinecone-database/pinecone');
const { HuggingFaceInferenceEmbeddings } = require('@langchain/community/embeddings/hf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Ensure HuggingFace embeddings are correctly initialized
const embeddings = new HuggingFaceInferenceEmbeddings({
  model: 'sentence-transformers/all-MiniLM-L6-v2',
  apiKey: process.env.HUGGINGFACE_API_KEY, // Ensure API key is passed if required
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

/**
 * Split text into chunks and embed into Pinecone under a namespace
 */
exports.embedDocument = async ({ text, documentId, chatbotId, namespace, metadata = {} }) => {
  const index = pinecone.index(process.env.PINECONE_INDEX);
  const ns = index.namespace(namespace);

  // Split into chunks
  const chunks = await splitter.createDocuments([text]);
  
  // FIX: If text is too small for chunking, create at least 1 chunk manually
  if (chunks.length === 0) {
    chunks.push({
      pageContent: text,
      metadata: {}
    });
  }
  
  console.log(`[Embedding] ${chunks.length} chunks for doc ${documentId}`);

  // Generate embeddings in batches of 10 (Gemini rate limit friendly)
  const batchSize = 10;
  const vectorIds = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(c => c.pageContent);
    
    let vectors;
    let retries = 3;
    while (retries > 0) {
      try {
        vectors = await embeddings.embedDocuments(texts);
        break;
      } catch (err) {
        retries--;
        console.warn(`[Embedding] Retry left: ${retries}, Error: ${err.message}`);
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    const upserts = batch.map((chunk, j) => {
      const id = `${documentId}_chunk_${i + j}`;
      vectorIds.push(id);
      return {
        id,
        values: vectors[j],
        metadata: {
          text: chunk.pageContent,
          documentId: documentId.toString(),
          chatbotId: chatbotId.toString(),
          chunkIndex: i + j,
          ...metadata,
        },
      };
    });

    await ns.upsert(upserts);
    // Small delay to respect rate limits
    if (i + batchSize < chunks.length) await new Promise(r => setTimeout(r, 1000));
  }

  return { chunkCount: chunks.length, vectorIds };
};

/**
 * Query Pinecone for relevant chunks
 */
exports.queryEmbeddings = async ({ query, namespace, topK = 5 }) => {
  const index = pinecone.index(process.env.PINECONE_INDEX);
  const ns = index.namespace(namespace);

  const queryVector = await embeddings.embedQuery(query);
  const results = await ns.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  return results.matches.map(m => ({
    text:  m.metadata.text,
    score: m.score,
    documentId: m.metadata.documentId,
  }));
};

/**
 * Delete all vectors for a document from Pinecone
 */
exports.deleteDocumentVectors = async ({ vectorIds, namespace }) => {
  if (!vectorIds?.length) return;
  const index = pinecone.index(process.env.PINECONE_INDEX);
  await index.namespace(namespace).deleteMany(vectorIds);
};

/**
 * Delete entire namespace (when chatbot is deleted)
 */
exports.deleteNamespace = async (namespace) => {
  const index = pinecone.index(process.env.PINECONE_INDEX);
  await index.namespace(namespace).deleteAll();
};
