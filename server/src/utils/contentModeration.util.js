import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Convert data to a safe string
 * @param {any} value - Value to convert
 * @returns {string} - Converted string
 */
const safeToString = (value) => {
  if (value === null || value === undefined) return '';
  
  // Handle special cases
  if (typeof value === 'object') {
    try {
      // Try to convert object to JSON string
      return JSON.stringify(value);
    } catch (error) {
      console.error('Error when converting object to string:', error);
      return '';
    }
  }
  
  // For all other cases, convert to string safely
  return String(value);
};

/**
 * Analyze text semantics using OpenAI API
 * @param {string} text - Text to analyze
 * @returns {object} - Analysis results
 */
export const analyzeContentWithOpenAI = async (text) => {
  try {
    const safeText = safeToString(text);
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", // Can use a more powerful model if needed
        messages: [
          {
            role: "system",
            content: `You are a content analysis system. Your task is to check if content contains inappropriate language, culturally insensitive words, or negative context.
            
            Pay special attention to:
            1. Detect profanity, offensive or culturally insensitive language (in English or Vietnamese)
            2. Detect language related to violence, racial discrimination, or threats
            3. Detect pornographic or sexual content
            4. Detect content related to drugs, gambling, or fraud
            5. Detect stylized writing intended to bypass filters (replacing letters with numbers, adding symbols, etc.)
            6. Detect ambiguous words being used with negative meanings
            7. Detect sarcastic or satirical language with negative intent
            
            If the content has NO issues, return JSON:
            {"isInappropriate": false}
            
            If the content HAS issues, return JSON:
            {"isInappropriate": true, "categories": ["list of violation types"], "examples": ["violating words or phrases"]}`
          },
          {
            role: "user",
            content: safeText
          }
        ],
        temperature: 0.2, // Set low temperature for consistent results
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    const result = JSON.parse(response.data.choices[0].message.content);
    
    if (result.isInappropriate) {
      return {
        isInappropriate: true,
        inappropriateWords: result.examples || [],
        categories: result.categories || [],
        source: 'ai_semantic_analysis'
      };
    }
    
    return {
      isInappropriate: false,
      inappropriateWords: [],
      categories: []
    };
    
  } catch (error) {
    console.error('Error using OpenAI API for semantic analysis:', error);
    return {
      isInappropriate: false,
      error: 'Unable to perform semantic analysis'
    };
  }
};

/**
 * Moderate content using OpenAI Moderation API
 * @param {string} text - Content to moderate
 * @returns {Object} - Moderation results
 */
export const moderateWithOpenAI = async (text) => {
  try {
    // Ensure text is a string
    const safeText = safeToString(text);
    
    const response = await axios.post(
      'https://api.openai.com/v1/moderations',
      { input: safeText },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    const result = response.data.results[0];
    
    // Check if policy violations exist
    if (result.flagged) {
      // Get violation categories
      const flaggedCategories = Object.keys(result.categories)
        .filter(category => result.categories[category] === true);
        
      return {
        isInappropriate: true,
        inappropriateWords: [], // This API doesn't return specific words
        categories: flaggedCategories,
        source: 'openai_moderation'
      };
    }
    
    return {
      isInappropriate: false,
      inappropriateWords: [],
      categories: []
    };
    
  } catch (error) {
    console.error('Error using OpenAI Moderation API:', error);
    return {
      isInappropriate: false,
      error: 'Unable to moderate content'
    };
  }
};

/**
 * Extract text from post data
 * @param {Object} postData - Post data
 * @returns {string} - Extracted text
 */
const extractTextFromPostData = (postData) => {
  if (!postData) return '';
  
  // Create an array to store text parts for checking
  const textParts = [];
  
  // Process caption
  if (postData.caption) {
    textParts.push(safeToString(postData.caption));
  }
  
  // Process hashtags
  if (postData.hashtag) {
    if (Array.isArray(postData.hashtag)) {
      textParts.push(postData.hashtag.map(tag => safeToString(tag)).join(' '));
    } else {
      textParts.push(safeToString(postData.hashtag));
    }
  }
  
  // Process content
  if (postData.content) {
    if (Array.isArray(postData.content)) {
      textParts.push(postData.content.map(item => safeToString(item)).join(' '));
    } else {
      textParts.push(safeToString(postData.content));
    }
  }
  
  // Log data for debugging
  console.log('Post Data:', postData);
  console.log('Extracted Text:', textParts.join(' '));
  
  return textParts.join(' ');
};

/**
 * Analyze content with context awareness using OpenAI
 * @param {string} text - Text to analyze
 * @returns {object} - Analysis results
 */
export const analyzeContextWithOpenAI = async (text) => {
  try {
    const safeText = safeToString(text);
    
    // Use chat completions API with special prompt for context analysis
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content: `You are an advanced context analysis system. Your tasks are:
            
            1. Detect inappropriate content even when written indirectly or with hidden meanings
            2. Understand and analyze the context of the language, not just vocabulary
            3. Detect evasive writing, parodies, or variations of inappropriate words
            4. Distinguish between academic/educational contexts and offensive/vulgar contexts
            5. Evaluate the harm level of content if issues are detected

            Analyze in detail and return results in JSON format.
            
            If the content is completely appropriate, return:
            {"isInappropriate": false}
            
            If the content has issues, return:
            {"isInappropriate": true, "explanation": "reason", "severity": "low|medium|high", "offendingElements": ["problematic content parts"]}`
          },
          {
            role: "user",
            content: safeText
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    const result = JSON.parse(response.data.choices[0].message.content);
    
    if (result.isInappropriate) {
      return {
        isInappropriate: true,
        explanation: result.explanation || 'Content is inappropriate based on context analysis',
        severity: result.severity || 'medium',
        offendingElements: result.offendingElements || [],
        source: 'context_analysis'
      };
    }
    
    return {
      isInappropriate: false
    };
    
  } catch (error) {
    console.error('Error during context analysis:', error);
    return {
      isInappropriate: false,
      error: 'Unable to perform context analysis'
    };
  }
};

/**
 * Comprehensive moderation function - using AI only
 * @param {Object} postData - Post data
 * @returns {Object} - Moderation results
 */
export const moderatePostContent = async (postData) => {
  if (!postData) {
    return {
      isInappropriate: false,
      inappropriateWords: [],
      source: null
    };
  }

  try {
    // Extract and normalize text from postData
    const extractedText = extractTextFromPostData(postData);
    
    // Step 1: Check with OpenAI Moderation API
    const moderationResult = await moderateWithOpenAI(extractedText);
    
    if (moderationResult.isInappropriate) {
      return {
        ...moderationResult,
        message: 'Inappropriate content detected by moderation system'
      };
    }

    // Step 2: Semantic analysis
    const semanticResult = await analyzeContentWithOpenAI(extractedText);
    
    if (semanticResult.isInappropriate) {
      return {
        ...semanticResult,
        message: 'Inappropriate content detected by semantic analysis'
      };
    }

    // Step 3: In-depth context analysis (only applied to longer content)
    if (extractedText.length > 100) {
      const contextResult = await analyzeContextWithOpenAI(extractedText);
      
      if (contextResult.isInappropriate) {
        return {
          isInappropriate: true,
          explanation: contextResult.explanation,
          severity: contextResult.severity,
          offendingElements: contextResult.offendingElements,
          source: 'context_analysis',
          message: 'Inappropriate content detected by context analysis'
        };
      }
    }

    // No issues detected through all checks
    return {
      isInappropriate: false,
      inappropriateWords: [],
      source: null
    };
    
  } catch (error) {
    console.error('Error during moderation process:', error);
    // Return default result when error occurs
    return {
      isInappropriate: false,
      error: 'An error occurred during the moderation process'
    };
  }
};