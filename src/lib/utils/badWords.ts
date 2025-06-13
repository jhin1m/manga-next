/**
 * Bad words filtering utility for comment content moderation
 * Supports both Vietnamese and English profanity detection
 */

// Vietnamese bad words list (common profanity)
const VIETNAMESE_BAD_WORDS = [
  'đụ', 'địt', 'đéo', 'đm', 'dm', 'đmm', 'dmm', 'vcl', 'vãi', 'cặc', 'lồn', 'buồi',
  'đĩ', 'điếm', 'cave', 'mẹ', 'gái gọi', 'mẹ kiếp', 'thằng chó', 'con chó', 'súc vật',
  'đồ chó', 'đồ khốn', 'khốn nạn', 'đồ ngu', 'ngu ngốc', 'đần độn', 'óc chó',
  'não cá vàng', 'đồ ngớ ngẩn', 'thằng ngu', 'con ngu', 'đồ khùng', 'điên khùng',
  'đồ điên', 'thằng điên', 'con điên', 'đồ rồ', 'đồ dở hơi', 'não tôm',
  'đồ phản bội', 'đồ bán nước', 'đồ phá hoại', 'đồ xấu xa', 'đồ độc ác',
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'cunt', 'whore'
]

// English bad words list (common profanity)
const ENGLISH_BAD_WORDS = [
  'fuck', 'fucking', 'fucked', 'fucker', 'fck', 'f*ck', 'f**k',
  'shit', 'shitting', 'shitted', 'sh*t', 'sh**',
  'bitch', 'bitching', 'b*tch', 'b**ch',
  'asshole', 'ass', 'a**hole', 'a**',
  'damn', 'damned', 'dammit', 'd*mn',
  'bastard', 'b*stard', 'b**tard',
  'cunt', 'c*nt', 'c**t',
  'whore', 'wh*re', 'wh**e',
  'slut', 'sl*t', 'sl**',
  'piss', 'pissed', 'p*ss',
  'cock', 'c*ck', 'c**k',
  'dick', 'd*ck', 'd**k',
  'pussy', 'p*ssy', 'p**sy',
  'nigger', 'n*gger', 'n**ger', 'nigga', 'n*gga',
  'faggot', 'f*ggot', 'f**got', 'fag', 'f*g'
]

// Spam keywords
const SPAM_KEYWORDS = [
  'click here', 'buy now', 'free money', 'get rich quick', 'make money fast',
  'limited time offer', 'act now', 'call now', 'order now', 'visit now',
  'guaranteed', '100% free', 'no cost', 'risk free', 'money back',
  'earn money', 'work from home', 'business opportunity', 'investment opportunity',
  'casino', 'gambling', 'poker', 'lottery', 'win money', 'jackpot',
  'viagra', 'cialis', 'pharmacy', 'prescription', 'medication',
  'weight loss', 'lose weight', 'diet pills', 'fat burner',
  'dating', 'singles', 'meet women', 'meet men', 'hookup',
  'porn', 'xxx', 'adult', 'sex', 'nude', 'naked'
]

// Combine all bad words
const ALL_BAD_WORDS = [
  ...VIETNAMESE_BAD_WORDS,
  ...ENGLISH_BAD_WORDS,
  ...SPAM_KEYWORDS
].map(word => word.toLowerCase())

/**
 * Check if content contains bad words
 */
export function containsBadWords(content: string): boolean {
  const normalizedContent = content.toLowerCase()
  
  return ALL_BAD_WORDS.some(badWord => {
    // Check for exact word matches (with word boundaries)
    const wordRegex = new RegExp(`\\b${badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return wordRegex.test(normalizedContent)
  })
}

/**
 * Get list of detected bad words in content
 */
export function detectBadWords(content: string): string[] {
  const normalizedContent = content.toLowerCase()
  const detectedWords: string[] = []
  
  ALL_BAD_WORDS.forEach(badWord => {
    const wordRegex = new RegExp(`\\b${badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (wordRegex.test(normalizedContent)) {
      detectedWords.push(badWord)
    }
  })
  
  return detectedWords
}

/**
 * Filter bad words from content by replacing with asterisks
 */
export function filterBadWords(content: string): string {
  let filteredContent = content
  
  ALL_BAD_WORDS.forEach(badWord => {
    const wordRegex = new RegExp(`\\b${badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    const replacement = '*'.repeat(badWord.length)
    filteredContent = filteredContent.replace(wordRegex, replacement)
  })
  
  return filteredContent
}

/**
 * Validation error types for i18n support
 */
export interface ValidationError {
  type: 'inappropriateContent' | 'excessiveCaps' | 'excessiveRepetition' | 'tooManyLinks'
  data?: { words?: string[] }
}

/**
 * Validate comment content for bad words and spam
 */
export function validateCommentContent(content: string): {
  isValid: boolean
  errors: ValidationError[]
  filteredContent?: string
} {
  const errors: ValidationError[] = []

  // Check for bad words
  if (containsBadWords(content)) {
    const detectedWords = detectBadWords(content)
    errors.push({
      type: 'inappropriateContent',
      data: { words: detectedWords }
    })
  }

  // Check for excessive caps (spam indicator)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.7 && content.length > 10) {
    errors.push({ type: 'excessiveCaps' })
  }

  // Check for excessive repetition (spam indicator)
  const words = content.toLowerCase().split(/\s+/)
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })

  const maxRepeats = Math.max(...wordCount.values())
  if (maxRepeats > 5 && words.length > 10) {
    errors.push({ type: 'excessiveRepetition' })
  }

  // Check for suspicious URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const urls = content.match(urlRegex) || []
  if (urls.length > 2) {
    errors.push({ type: 'tooManyLinks' })
  }

  return {
    isValid: errors.length === 0,
    errors,
    filteredContent: errors.length === 0 ? content : filterBadWords(content)
  }
}

/**
 * Clean content by removing bad words and normalizing
 */
export function cleanCommentContent(content: string): string {
  // Filter bad words
  let cleaned = filterBadWords(content)
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // Remove excessive punctuation
  cleaned = cleaned.replace(/[!]{3,}/g, '!!!')
  cleaned = cleaned.replace(/[?]{3,}/g, '???')
  cleaned = cleaned.replace(/[.]{4,}/g, '...')
  
  return cleaned
}
