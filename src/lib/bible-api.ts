// Bible API integration using bible-api.com
// Documentation: https://bible-api.com/

export interface BibleVerse {
  reference: string;
  verses: {
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export interface BibleChapter {
  reference: string;
  verses: {
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export interface BibleBook {
  name: string;
  testament: 'old' | 'new';
  chapters: number;
}

// Available translations
export const TRANSLATIONS = {
  kjv: 'kjv',      // King James Version
  asv: 'asv',      // American Standard Version
  web: 'web',      // World English Bible
  bbe: 'bbe',      // Bible in Basic English
  ylt: 'ylt',      // Young's Literal Translation
  dra: 'dra',      // Douay-Rheims American
  darby: 'darby',  // Darby Bible
  'oeb-us': 'oeb-us', // Open English Bible, US Edition
  'oeb-cw': 'oeb-cw', // Open English Bible, Commonwealth Edition
} as const;

export const TRANSLATION_DISPLAY_NAMES = {
  kjv: 'King James Version (KJV)',
  asv: 'American Standard Version (ASV)',
  web: 'World English Bible (WEB)',
  bbe: 'Bible in Basic English (BBE)',
  ylt: 'Young\'s Literal Translation (YLT)',
  dra: 'Douay-Rheims American (DRA)',
  darby: 'Darby Bible (DARBY)',
  'oeb-us': 'Open English Bible - US (OEB-US)',
  'oeb-cw': 'Open English Bible - CW (OEB-CW)',
} as const;

export type Translation = typeof TRANSLATIONS[keyof typeof TRANSLATIONS];

// Book name mapping (standard names to API format)
const BOOK_NAME_MAP: Record<string, string> = {
  'Genesis': 'Genesis',
  'Exodus': 'Exodus',
  'Leviticus': 'Leviticus',
  'Numbers': 'Numbers',
  'Deuteronomy': 'Deuteronomy',
  'Joshua': 'Joshua',
  'Judges': 'Judges',
  'Ruth': 'Ruth',
  '1 Samuel': '1 Samuel',
  '2 Samuel': '2 Samuel',
  '1 Kings': '1 Kings',
  '2 Kings': '2 Kings',
  '1 Chronicles': '1 Chronicles',
  '2 Chronicles': '2 Chronicles',
  'Ezra': 'Ezra',
  'Nehemiah': 'Nehemiah',
  'Esther': 'Esther',
  'Job': 'Job',
  'Psalm': 'Psalm',
  'Psalms': 'Psalms',
  'Proverbs': 'Proverbs',
  'Ecclesiastes': 'Ecclesiastes',
  'Song of Solomon': 'Song of Solomon',
  'Isaiah': 'Isaiah',
  'Jeremiah': 'Jeremiah',
  'Lamentations': 'Lamentations',
  'Ezekiel': 'Ezekiel',
  'Daniel': 'Daniel',
  'Hosea': 'Hosea',
  'Joel': 'Joel',
  'Amos': 'Amos',
  'Obadiah': 'Obadiah',
  'Jonah': 'Jonah',
  'Micah': 'Micah',
  'Nahum': 'Nahum',
  'Habakkuk': 'Habakkuk',
  'Zephaniah': 'Zephaniah',
  'Haggai': 'Haggai',
  'Zechariah': 'Zechariah',
  'Malachi': 'Malachi',
  'Matthew': 'Matthew',
  'Mark': 'Mark',
  'Luke': 'Luke',
  'John': 'John',
  'Acts': 'Acts',
  'Romans': 'Romans',
  '1 Corinthians': '1 Corinthians',
  '2 Corinthians': '2 Corinthians',
  'Galatians': 'Galatians',
  'Ephesians': 'Ephesians',
  'Philippians': 'Philippians',
  'Colossians': 'Colossians',
  '1 Thessalonians': '1 Thessalonians',
  '2 Thessalonians': '2 Thessalonians',
  '1 Timothy': '1 Timothy',
  '2 Timothy': '2 Timothy',
  'Titus': 'Titus',
  'Philemon': 'Philemon',
  'Hebrews': 'Hebrews',
  'James': 'James',
  '1 Peter': '1 Peter',
  '2 Peter': '2 Peter',
  '1 John': '1 John',
  '2 John': '2 John',
  '3 John': '3 John',
  'Jude': 'Jude',
  'Revelation': 'Revelation',
};

class BibleAPI {
  private baseUrl = 'https://bible-api.com';
  private defaultTranslation: Translation = 'kjv';

  /**
   * Get a specific verse
   */
  async getVerse(book: string, chapter: number, verse: number, translation: Translation = this.defaultTranslation): Promise<BibleVerse> {
    const bookName = BOOK_NAME_MAP[book] || book;
    const url = `${this.baseUrl}/${encodeURIComponent(bookName)}+${chapter}:${verse}?translation=${translation}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch verse: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get multiple verses
   */
  async getVerses(book: string, chapter: number, startVerse: number, endVerse: number, translation: Translation = this.defaultTranslation): Promise<BibleVerse> {
    const bookName = BOOK_NAME_MAP[book] || book;
    const url = `${this.baseUrl}/${encodeURIComponent(bookName)}+${chapter}:${startVerse}-${endVerse}?translation=${translation}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch verses: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get an entire chapter
   */
  async getChapter(book: string, chapter: number, translation: Translation = this.defaultTranslation): Promise<BibleChapter> {
    const bookName = BOOK_NAME_MAP[book] || book;
    const url = `${this.baseUrl}/${encodeURIComponent(bookName)}+${chapter}?translation=${translation}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get a random verse
   */
  async getRandomVerse(translation: Translation = this.defaultTranslation): Promise<BibleVerse> {
    const url = `${this.baseUrl}/random?translation=${translation}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch random verse: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Search for verses containing text
   */
  async search(query: string, translation: Translation = this.defaultTranslation): Promise<BibleVerse> {
    const url = `${this.baseUrl}/${encodeURIComponent(query)}?translation=${translation}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to search: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const bibleAPI = new BibleAPI();
