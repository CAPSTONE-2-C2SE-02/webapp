import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Chuyển đổi dữ liệu thành chuỗi an toàn
 * @param {any} value - Giá trị cần chuyển đổi 
 * @returns {string} - Chuỗi đã chuyển đổi
 */
const safeToString = (value) => {
  if (value === null || value === undefined) return '';
  
  // Xử lý các trường hợp đặc biệt
  if (typeof value === 'object') {
    try {
      // Thử chuyển đổi object thành JSON string
      return JSON.stringify(value);
    } catch (error) {
      console.error('Lỗi khi chuyển đổi object thành string:', error);
      return '';
    }
  }
  
  // Trường hợp còn lại, chuyển đổi sang string an toàn
  return String(value);
};

/**
 * Phân tích ngữ nghĩa văn bản bằng API OpenAI
 * @param {string} text - Văn bản cần phân tích
 * @returns {object} - Kết quả phân tích
 */
export const analyzeContentWithOpenAI = async (text) => {
  try {
    const safeText = safeToString(text);
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", // Có thể dùng model mạnh hơn nếu cần
        messages: [
          {
            role: "system",
            content: `Bạn là hệ thống phân tích nội dung, nhiệm vụ của bạn là kiểm tra xem nội dung có chứa ngôn từ không phù hợp, những từ thiếu văn hóa, ngữ cảnh tiêu cực hay không. 
            
            Đặc biệt chú ý:
            1. Phát hiện ngôn từ thô tục, xúc phạm, thiếu văn hóa (tiếng Việt hoặc tiếng Anh)
            2. Phát hiện từ ngữ liên quan đến bạo lực, kỳ thị chủng tộc, đe dọa
            3. Phát hiện nội dung khiêu dâm, tình dục
            4. Phát hiện nội dung liên quan đến ma túy, cờ bạc, lừa đảo
            5. Phát hiện từ ngữ được viết cách điệu nhằm lách bộ lọc (thay chữ cái bằng số, thêm dấu, ...)
            6. Phát hiện các từ nhiều nghĩa nhưng đang được sử dụng với nghĩa tiêu cực
            7. Ngôn ngữ mỉa mai, châm biếm với ý xấu
            
            Nếu nội dung KHÔNG có vấn đề, hãy trả về JSON:
            {"isInappropriate": false}
            
            Nếu nội dung CÓ vấn đề, hãy trả về JSON:
            {"isInappropriate": true, "categories": ["danh sách các loại vi phạm"], "examples": ["các từ hoặc cụm từ vi phạm"]}`
          },
          {
            role: "user",
            content: safeText
          }
        ],
        temperature: 0.2, // Đặt nhiệt độ thấp để có kết quả nhất quán
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
    console.error('Lỗi khi sử dụng API OpenAI cho phân tích ngữ nghĩa:', error);
    return {
      isInappropriate: false,
      error: 'Không thể phân tích ngữ nghĩa'
    };
  }
};

/**
 * Kiểm duyệt nội dung sử dụng API của OpenAI Moderation
 * @param {string} text - Nội dung cần kiểm duyệt
 * @returns {Object} - Kết quả kiểm duyệt
 */
export const moderateWithOpenAI = async (text) => {
  try {
    // Đảm bảo text là chuỗi
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
    
    // Kiểm tra xem có vi phạm chính sách không
    if (result.flagged) {
      // Lấy các danh mục vi phạm 
      const flaggedCategories = Object.keys(result.categories)
        .filter(category => result.categories[category] === true);
        
      return {
        isInappropriate: true,
        inappropriateWords: [], // API này không trả về từ cụ thể
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
    console.error('Lỗi khi sử dụng API OpenAI Moderation:', error);
    return {
      isInappropriate: false,
      error: 'Không thể kiểm duyệt nội dung'
    };
  }
};

/**
 * Trích xuất văn bản từ dữ liệu bài đăng
 * @param {Object} postData - Dữ liệu bài đăng
 * @returns {string} - Văn bản đã trích xuất
 */
const extractTextFromPostData = (postData) => {
  if (!postData) return '';
  
  // Tạo một mảng chứa các phần văn bản cần kiểm tra
  const textParts = [];
  
  // Xử lý caption
  if (postData.caption) {
    textParts.push(safeToString(postData.caption));
  }
  
  // Xử lý hashtag
  if (postData.hashtag) {
    if (Array.isArray(postData.hashtag)) {
      textParts.push(postData.hashtag.map(tag => safeToString(tag)).join(' '));
    } else {
      textParts.push(safeToString(postData.hashtag));
    }
  }
  
  // Xử lý content
  if (postData.content) {
    if (Array.isArray(postData.content)) {
      textParts.push(postData.content.map(item => safeToString(item)).join(' '));
    } else {
      textParts.push(safeToString(postData.content));
    }
  }
  
  // Log dữ liệu để debug
  console.log('Post Data:', postData);
  console.log('Extracted Text:', textParts.join(' '));
  
  return textParts.join(' ');
};

/**
 * Phân tích nội dung theo ngữ cảnh (context-aware) bằng OpenAI
 * @param {string} text - Văn bản cần phân tích
 * @returns {object} - Kết quả phân tích
 */
export const analyzeContextWithOpenAI = async (text) => {
  try {
    const safeText = safeToString(text);
    
    // Sử dụng chat completions API với prompt đặc biệt cho phân tích ngữ cảnh
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content: `Bạn là hệ thống phân tích ngữ cảnh chuyên sâu, nhiệm vụ của bạn là:
            
            1. Phát hiện nội dung không phù hợp kể cả khi được viết một cách gián tiếp, ẩn ý
            2. Hiểu và phân tích ngữ cảnh của từ ngữ, không chỉ đơn thuần dựa vào từ vựng
            3. Phát hiện các cách viết lách, nhại, biến thể của từ ngữ không phù hợp
            4. Phân biệt được ngữ cảnh học thuật, giáo dục với ngữ cảnh xúc phạm, thô tục
            5. Đánh giá mức độ nguy hại của nội dung nếu phát hiện vấn đề

            Phân tích chi tiết và trả về kết quả ở định dạng JSON.
            
            Nếu nội dung hoàn toàn phù hợp, trả về:
            {"isInappropriate": false}
            
            Nếu nội dung có vấn đề, trả về:
            {"isInappropriate": true, "explanation": "lý do", "severity": "low|medium|high", "offendingElements": ["phần nội dung có vấn đề"]}`
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
        explanation: result.explanation || 'Nội dung không phù hợp dựa trên phân tích ngữ cảnh',
        severity: result.severity || 'medium',
        offendingElements: result.offendingElements || [],
        source: 'context_analysis'
      };
    }
    
    return {
      isInappropriate: false
    };
    
  } catch (error) {
    console.error('Lỗi khi phân tích ngữ cảnh:', error);
    return {
      isInappropriate: false,
      error: 'Không thể phân tích ngữ cảnh'
    };
  }
};

/**
 * Hàm kiểm duyệt tổng hợp - chỉ sử dụng AI
 * @param {Object} postData - Dữ liệu bài đăng
 * @returns {Object} - Kết quả kiểm duyệt
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
    // Trích xuất và chuẩn hóa văn bản từ postData
    const extractedText = extractTextFromPostData(postData);
    
    // Bước 1: Kiểm tra với OpenAI Moderation API
    const moderationResult = await moderateWithOpenAI(extractedText);
    
    if (moderationResult.isInappropriate) {
      return {
        ...moderationResult,
        message: 'Phát hiện nội dung không phù hợp từ hệ thống kiểm duyệt'
      };
    }

    // Bước 2: Phân tích ngữ nghĩa (semantic analysis)
    const semanticResult = await analyzeContentWithOpenAI(extractedText);
    
    if (semanticResult.isInappropriate) {
      return {
        ...semanticResult,
        message: 'Phát hiện nội dung không phù hợp từ phân tích ngữ nghĩa'
      };
    }

    // Bước 3: Phân tích ngữ cảnh chuyên sâu (chỉ áp dụng cho nội dung dài)
    if (extractedText.length > 100) {
      const contextResult = await analyzeContextWithOpenAI(extractedText);
      
      if (contextResult.isInappropriate) {
        return {
          isInappropriate: true,
          explanation: contextResult.explanation,
          severity: contextResult.severity,
          offendingElements: contextResult.offendingElements,
          source: 'context_analysis',
          message: 'Phát hiện nội dung không phù hợp từ phân tích ngữ cảnh'
        };
      }
    }

    // Không phát hiện vấn đề qua tất cả các bước kiểm tra
    return {
      isInappropriate: false,
      inappropriateWords: [],
      source: null
    };
    
  } catch (error) {
    console.error('Lỗi trong quá trình kiểm duyệt:', error);
    // Trả về kết quả mặc định khi có lỗi
    return {
      isInappropriate: false,
      error: 'Có lỗi xảy ra trong quá trình kiểm duyệt'
    };
  }
};