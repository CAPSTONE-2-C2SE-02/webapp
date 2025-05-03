const badWords = [
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'bastard',
  'đụ', 'đéo', 'địt', 'lồn', 'cặc', 'đĩ', 'cave', 'thằng chó', 'con chó','dcm', 'đcm', 'cl', 'cc','xoạc','bú lồn', 'thủ dâm',
  'giết', 'đánh', 'chém', 'kill', 'murder', 'violence','giết người', 'máu me', 'tự tử', 'tự sát',
  'nigger', 'chink', 'gook',
  'heroin', 'cocaine', 'meth', 'cần sa', 'ma túy', 'thuốc lắc',
  'khiêu dâm', 'sex', 'porn', 'xxx'
];

// Cải thiện regex để bắt chính xác hơn và tránh false positives
const createBadWordRegex = (word) => {
  // Escape các ký tự đặc biệt trong regex
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Xử lý từ có dấu cách (như "thằng chó")
  if (escaped.includes(' ')) {
    return new RegExp(`\\b${escaped}\\b`, 'ui');
  }
  
  // Xử lý từ đơn
  return new RegExp(`\\b${escaped}\\b`, 'ui');
};

// Tạo các regex từ danh sách từ ngữ
const badWordRegexes = badWords.map(word => createBadWordRegex(word));

/**
 * Chuẩn hóa văn bản để kiểm tra
 * @param {string} text - Văn bản cần chuẩn hóa
 * @returns {string} - Văn bản đã chuẩn hóa
 */
const normalizeText = (text) => {
  if (text === null || text === undefined) return '';
  
  // Đảm bảo là chuỗi
  let normalizedText = String(text);
  
  // Loại bỏ các ký tự đặc biệt mà người dùng có thể dùng để lách kiểm duyệt
  normalizedText = normalizedText
    .replace(/\s+/g, ' ')          // Chuẩn hóa khoảng trắng
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Giữ lại chữ cái, số và khoảng trắng
    .trim();
    
  return normalizedText;
};

/**
 * Kiểm tra nội dung có chứa từ ngữ không phù hợp hay không
 * @param {string} text - Văn bản cần kiểm tra
 * @returns {object} - Kết quả kiểm tra: {isInappropriate, inappropriateWords}
 */
export const checkInappropriateContent = (text) => {
  if (!text) return { isInappropriate: false, inappropriateWords: [] };

  // Chuẩn hóa văn bản
  const normalizedText = normalizeText(text);
  if (!normalizedText) return { isInappropriate: false, inappropriateWords: [] };

  const foundBadWords = [];

  for (let i = 0; i < badWordRegexes.length; i++) {
    if (badWordRegexes[i].test(normalizedText)) {
      foundBadWords.push(badWords[i]);
    }
  }

  return {
    isInappropriate: foundBadWords.length > 0,
    inappropriateWords: foundBadWords
  };
};

/**
 * Kiểm tra một mảng các văn bản hoặc một văn bản đơn
 * @param {string|string[]|object} input - Mảng các văn bản, văn bản đơn hoặc đối tượng cần kiểm tra
 * @returns {object} - Kết quả kiểm tra: {isInappropriate, inappropriateWords}
 */
const checkArrayOrSingleText = (input) => {
  if (!input) {
    return { isInappropriate: false, inappropriateWords: [] };
  }

  const allInappropriateWords = [];

  // Xử lý mảng văn bản
  if (Array.isArray(input)) {
    for (const item of input) {
      // Nếu là object, chuyển thành chuỗi
      const text = typeof item === 'object' ? JSON.stringify(item) : String(item);
      const result = checkInappropriateContent(text);
      if (result.isInappropriate) {
        allInappropriateWords.push(...result.inappropriateWords);
      }
    }
  } 
  // Xử lý đối tượng
  else if (typeof input === 'object' && input !== null) {
    const result = checkInappropriateContent(JSON.stringify(input));
    if (result.isInappropriate) {
      allInappropriateWords.push(...result.inappropriateWords);
    }
  }
  // Xử lý văn bản đơn
  else {
    const result = checkInappropriateContent(String(input));
    if (result.isInappropriate) {
      allInappropriateWords.push(...result.inappropriateWords);
    }
  }

  // Loại bỏ trùng lặp
  const uniqueInappropriateWords = [...new Set(allInappropriateWords)];

  return {
    isInappropriate: uniqueInappropriateWords.length > 0,
    inappropriateWords: uniqueInappropriateWords
  };
};

/**
 * Hàm chính để kiểm tra tất cả nội dung của bài đăng
 * @param {object} postData - Dữ liệu bài đăng
 * @returns {object} - Kết quả kiểm tra: {isInappropriate, inappropriateWords, source}
 */
export const moderatePostContent = (postData) => {
  if (!postData) {
    return {
      isInappropriate: false,
      inappropriateWords: [],
      source: null
    };
  }

  // Kiểm tra caption
  if (postData.caption) {
    const captionResult = checkInappropriateContent(postData.caption);
    if (captionResult.isInappropriate) {
      return {
        isInappropriate: true,
        inappropriateWords: captionResult.inappropriateWords,
        source: 'caption'
      };
    }
  }

  // Kiểm tra hashtag - xử lý cả trường hợp là string và array
  if (postData.hashtag) {
    const hashtagResult = checkArrayOrSingleText(postData.hashtag);
    if (hashtagResult.isInappropriate) {
      return {
        isInappropriate: true, 
        inappropriateWords: hashtagResult.inappropriateWords,
        source: 'hashtag'
      };
    }
  }

  // Kiểm tra nội dung - xử lý cả trường hợp là string và array
  if (postData.content) {
    const contentResult = checkArrayOrSingleText(postData.content);
    if (contentResult.isInappropriate) {
      return {
        isInappropriate: true,
        inappropriateWords: contentResult.inappropriateWords,
        source: 'content'
      };
    }
  }


  return {
    isInappropriate: false,
    inappropriateWords: [],
    source: null
  };
};