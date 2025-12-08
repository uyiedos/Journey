// Red Letter Bible - Books and chapters containing Jesus' words
// New Testament books that contain direct quotes from Jesus

export interface JesusWordsRange {
  book: string;
  chapters: {
    [chapter: number]: {
      startVerse?: number;
      endVerse?: number;
      verses?: number[]; // Specific verses
    }[];
  };
}

// Comprehensive mapping of Jesus' words in the New Testament
export const JESUS_WORDS_DATA: JesusWordsRange[] = [
  {
    book: 'Matthew',
    chapters: {
      3: [{ startVerse: 15, endVerse: 17 }], // John the Baptist's testimony about Jesus
      4: [{ startVerse: 4, endVerse: 11 }], // Temptation of Jesus
      5: [{ startVerse: 1, endVerse: 48 }], // Sermon on the Mount (Beatitudes, etc.)
      6: [{ startVerse: 1, endVerse: 34 }], // Sermon on the Mount continued
      7: [{ startVerse: 1, endVerse: 29 }], // Sermon on the Mount conclusion
      8: [{ startVerse: 5, endVerse: 13 }], // Healing and discipleship
      9: [{ startVerse: 2, endVerse: 38 }], // Various healings and teachings
      10: [{ startVerse: 5, endVerse: 42 }], // Sending out the twelve
      11: [{ startVerse: 2, endVerse: 30 }], // Jesus and John the Baptist
      12: [{ startVerse: 1, endVerse: 50 }], // Lord of the Sabbath
      13: [{ startVerse: 1, endVerse: 58 }], // Parables
      14: [{ startVerse: 13, endVerse: 33 }], // Feeding the 5000
      15: [{ startVerse: 1, endVerse: 20 }], // Traditions and defilement
      16: [{ startVerse: 1, endVerse: 28 }], // Peter's confession
      17: [{ startVerse: 1, endVerse: 27 }], // Transfiguration
      18: [{ startVerse: 1, endVerse: 35 }], // Church discipline
      19: [{ startVerse: 3, endVerse: 30 }], // Divorce and wealth
      20: [{ startVerse: 1, endVerse: 34 }], // Workers in the vineyard
      21: [{ startVerse: 1, endVerse: 46 }], // Triumphal entry
      22: [{ startVerse: 1, endVerse: 46 }], // Parables and teachings
      23: [{ startVerse: 1, endVerse: 39 }], // Woes to the Pharisees
      24: [{ startVerse: 1, endVerse: 51 }], // Signs of the end times
      25: [{ startVerse: 1, endVerse: 46 }], // Parables of the kingdom
      26: [{ startVerse: 21, endVerse: 75 }], // Last Supper and betrayal
      27: [{ startVerse: 11, endVerse: 54 }], // Trial and crucifixion
      28: [{ startVerse: 16, endVerse: 20 }], // Great Commission
    }
  },
  {
    book: 'Mark',
    chapters: {
      1: [{ startVerse: 16, endVerse: 20 }, { startVerse: 21, endVerse: 28 }], // Beginning ministry
      2: [{ startVerse: 5, endVerse: 12 }, { startVerse: 15, endVerse: 22 }, { startVerse: 23, endVerse: 28 }], // Healings and teachings
      3: [{ startVerse: 13, endVerse: 19 }, { startVerse: 23, endVerse: 35 }], // Calling disciples
      4: [{ startVerse: 1, endVerse: 20 }, { startVerse: 21, endVerse: 41 }], // Parables
      5: [{ startVerse: 1, endVerse: 43 }], // Healing the demon-possessed
      6: [{ startVerse: 1, endVerse: 13 }, { startVerse: 31, endVerse: 56 }], // Sending disciples
      7: [{ startVerse: 1, endVerse: 23 }], // Traditions
      8: [{ startVerse: 11, endVerse: 21 }, { startVerse: 27, endVerse: 38 }], // Feeding 4000
      9: [{ startVerse: 2, endVerse: 50 }], // Transfiguration
      10: [{ startVerse: 13, endVerse: 31 }, { startVerse: 42, endVerse: 52 }], // Marriage and wealth
      11: [{ startVerse: 1, endVerse: 33 }], // Triumphal entry
      12: [{ startVerse: 1, endVerse: 44 }], // Parables and authorities
      13: [{ startVerse: 1, endVerse: 37 }], // Signs of the end
      14: [{ startVerse: 22, endVerse: 65 }], // Last Supper
      15: [{ startVerse: 1, endVerse: 47 }], // Trial and crucifixion
      16: [{ startVerse: 14, endVerse: 20 }], // Resurrection
    }
  },
  {
    book: 'Luke',
    chapters: {
      2: [{ startVerse: 41, endVerse: 52 }], // Boy Jesus in temple
      4: [{ startVerse: 1, endVerse: 30 }], // Temptation and ministry start
      5: [{ startVerse: 1, endVerse: 39 }], // Calling disciples
      6: [{ startVerse: 1, endVerse: 49 }], // Sermon on the Plain
      7: [{ startVerse: 1, endVerse: 50 }], // Centurion's servant
      8: [{ startVerse: 4, endVerse: 21 }], // Parables of the kingdom
      9: [{ startVerse: 1, endVerse: 62 }], // Sending the twelve
      10: [{ startVerse: 1, endVerse: 42 }], // Mission of the seventy
      11: [{ startVerse: 2, endVerse: 54 }], // Lord's Prayer and teachings
      12: [{ startVerse: 13, endVerse: 59 }], // Rich fool and anxiety
      13: [{ startVerse: 6, endVerse: 59 }], // Repentance and parables
      14: [{ startVerse: 1, endVerse: 35 }], // Parables of the lost
      15: [{ startVerse: 1, endVerse: 32 }], // Lost sheep and coins
      16: [{ startVerse: 1, endVerse: 31 }], // Parable of the shrewd manager
      17: [{ startVerse: 1, endVerse: 37 }], // Sin and forgiveness
      18: [{ startVerse: 1, endVerse: 43 }], // Persistent widow
      19: [{ startVerse: 1, endVerse: 48 }], // Rich man and Lazarus
      20: [{ startVerse: 9, endVerse: 47 }], // Greatest in the kingdom
      21: [{ startVerse: 1, endVerse: 38 }], // Widow's offering
      22: [{ startVerse: 7, endVerse: 71 }], // Last Supper
      23: [{ startVerse: 26, endVerse: 56 }], // Trial and crucifixion
      24: [{ startVerse: 1, endVerse: 53 }], // Resurrection appearances
    }
  },
  {
    book: 'John',
    chapters: {
      1: [{ startVerse: 35, endVerse: 51 }], // First disciples
      2: [{ startVerse: 1, endVerse: 11 }], // Wedding at Cana
      3: [{ startVerse: 1, endVerse: 21 }], // Nicodemus
      4: [{ startVerse: 1, endVerse: 42 }], // Samaritan woman
      5: [{ startVerse: 1, endVerse: 47 }], // Healing at the pool
      6: [{ startVerse: 1, endVerse: 71 }], // Feeding 5000 and bread of life
      7: [{ startVerse: 1, endVerse: 53 }], // Teaching at the feast
      8: [{ startVerse: 1, endVerse: 59 }], // Woman caught in adultery
      9: [{ startVerse: 1, endVerse: 41 }], // Man born blind
      10: [{ startVerse: 1, endVerse: 42 }], // Good shepherd
      11: [{ startVerse: 1, endVerse: 57 }], // Raising Lazarus
      12: [{ startVerse: 20, endVerse: 50 }], // Predicts death
      13: [{ startVerse: 1, endVerse: 38 }], // Washes disciples' feet
      14: [{ startVerse: 1, endVerse: 31 }], // Way, truth, life
      15: [{ startVerse: 1, endVerse: 27 }], // Vine and branches
      16: [{ startVerse: 1, endVerse: 33 }], // Holy Spirit promised
      17: [{ startVerse: 1, endVerse: 26 }], // High priestly prayer
      18: [{ startVerse: 1, endVerse: 40 }], // Arrest
      19: [{ startVerse: 1, endVerse: 37 }], // Trial before Pilate
      20: [{ startVerse: 1, endVerse: 31 }], // Resurrection
      21: [{ startVerse: 1, endVerse: 25 }], // Post-resurrection appearances
    }
  },
  {
    book: 'Acts',
    chapters: {
      1: [{ startVerse: 4, endVerse: 11 }], // Ascension (Jesus speaking)
      9: [{ startVerse: 4, endVerse: 6 }], // Jesus speaking to Saul
      22: [{ startVerse: 6, endVerse: 21 }], // Paul's testimony about Jesus speaking to him
      26: [{ startVerse: 12, endVerse: 18 }], // Paul recounts Jesus speaking
    }
  }
];

// Helper function to check if a verse contains Jesus' words
export function isJesusWords(book: string, chapter: number, verse: number): boolean {
  const bookData = JESUS_WORDS_DATA.find(b => b.book.toLowerCase() === book.toLowerCase());
  if (!bookData) return false;

  const chapterData = bookData.chapters[chapter];
  if (!chapterData) return false;

  return chapterData.some(range => {
    if (range.verses) {
      return range.verses.includes(verse);
    }
    if (range.startVerse && range.endVerse) {
      return verse >= range.startVerse && verse <= range.endVerse;
    }
    return false;
  });
}

// Helper function to get Jesus' words ranges for a chapter
export function getJesusWordsRanges(book: string, chapter: number): Array<{start: number, end: number}> {
  const bookData = JESUS_WORDS_DATA.find(b => b.book.toLowerCase() === book.toLowerCase());
  if (!bookData) return [];

  const chapterData = bookData.chapters[chapter];
  if (!chapterData) return [];

  return chapterData.map(range => {
    if (range.verses) {
      return range.verses.map(v => ({ start: v, end: v }));
    }
    if (range.startVerse && range.endVerse) {
      return [{ start: range.startVerse, end: range.endVerse }];
    }
    return [];
  }).flat();
}

// Books that contain Jesus' direct quotes
export const JESUS_WORDS_BOOKS = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts'
];
