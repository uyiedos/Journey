// Comprehensive Biblical Knowledge Base for Virgo AI
// Focus: Divine conversation with extensive scripture references

export interface LifeSituation {
  situation: string;
  scriptures: string[];
  description?: string;
}

export interface PsalmInfo {
  number: number;
  title: string;
  description: string;
  category?: string;
}

export interface BiblePrayer {
  id: number;
  person: string;
  reference: string;
  words: number;
  content: string;
  answered: boolean;
  notes?: string;
}

export const LIFE_SITUATIONS_SCRIPTURES: LifeSituation[] = [
  {
    situation: "Afraid",
    scriptures: ["Psa 34:4", "Matt 10:28", "II Tim 1:7", "Heb 13:5,6"],
    description: "When fear overwhelms your heart, remember that God is your refuge and strength."
  },
  {
    situation: "Anxious",
    scriptures: ["Psa 46", "Matt 6:19-34", "Phil 4:6", "I Peter 5:6,7"],
    description: "Cast your anxieties upon the Lord, for He cares for you deeply."
  },
  {
    situation: "Backsliding",
    scriptures: ["Psa 51", "I John 1:4-9"],
    description: "Return to the Lord with all your heart, for He is merciful and forgiving."
  },
  {
    situation: "Bereaved",
    scriptures: ["Matt 5:4", "II Cor 1:3,4"],
    description: "Blessed are those who mourn, for they shall be comforted by the God of all comfort."
  },
  {
    situation: "Bitter or Critical",
    scriptures: ["I Cor 13"],
    description: "Let love replace bitterness, for love covers all offenses."
  },
  {
    situation: "Conscious of Sin",
    scriptures: ["Prov 28:13"],
    description: "He who conceals his sins will not prosper, but he who confesses and forsakes them finds mercy."
  },
  {
    situation: "Defeated",
    scriptures: ["Rom 8:31-39"],
    description: "In all things we are more than conquerors through Him who loved us."
  },
  {
    situation: "Depressed",
    scriptures: ["Psa 34"],
    description: "The Lord is near to the brokenhearted and saves the crushed in spirit."
  },
  {
    situation: "Disaster Threatens",
    scriptures: ["Psa 91", "Psa 118:5,6", "Luke 8:22-25"],
    description: "God is our refuge and fortress, our shield in times of trouble."
  },
  {
    situation: "Discouraged",
    scriptures: ["Psa 23", "Psa 42:6-11", "Psa 55:22", "Matt 5:11,12", "II Cor 4:8-18", "Phil 4:4-7"],
    description: "Be strong and courageous, for the Lord your God is with you wherever you go."
  },
  {
    situation: "Doubting",
    scriptures: ["Matt 8:26", "Heb 11"],
    description: "Blessed are those who have not seen and yet have believed."
  },
  {
    situation: "Facing a Crisis",
    scriptures: ["Psa 121", "Matt 6:25-34", "Heb 4:16"],
    description: "Let us then approach God's throne of grace with confidence in our time of need."
  },
  {
    situation: "Faith Fails",
    scriptures: ["Psa 42:5", "Heb 11"],
    description: "Why are you downcast, O my soul? Put your hope in God."
  },
  {
    situation: "Friends Fail",
    scriptures: ["Psa 41:9-13", "Luke 17:3,4", "Rom 12:14,17,19,21", "II Tim 4:16-18"],
    description: "Even if friends forsake you, the Lord will receive you."
  },
  {
    situation: "Leaving Home",
    scriptures: ["Psa 121", "Matt 10:16-20"],
    description: "The Lord will keep you from all harm as you journey to new places."
  },
  {
    situation: "Lonely",
    scriptures: ["Psa 23", "Heb 13:5,6"],
    description: "Never will I leave you; never will I forsake you, says the Lord."
  },
  {
    situation: "Needing God's Protection",
    scriptures: ["Psa 27:1-6", "Psa 91", "Phil 4:19"],
    description: "The Lord is my light and my salvation—whom shall I fear?"
  },
  {
    situation: "Needing Guidance",
    scriptures: ["Psa 32:8", "Prov 3:5,6"],
    description: "I will instruct you and teach you in the way you should go."
  },
  {
    situation: "Needing Peace",
    scriptures: ["John 14:1-4", "John 16:33", "Rom 5:1-5", "Phil 4:6,7"],
    description: "Peace I leave with you; my peace I give you."
  },
  {
    situation: "Needing Rules for Living",
    scriptures: ["Rom 12"],
    description: "Offer your bodies as living sacrifices, holy and pleasing to God."
  },
  {
    situation: "Overcome",
    scriptures: ["Psa 6", "Rom 8:31-39", "I John 1:4-9"],
    description: "Through Christ we have overcome the world."
  },
  {
    situation: "Prayerful",
    scriptures: ["Psa 4, 42", "Luke 11:1-13", "John 17", "1 John 5:14,15"],
    description: "Pray without ceasing, for the prayer of a righteous person is powerful."
  },
  {
    situation: "Protected",
    scriptures: ["Psa 18:1-3", "Psa 34:7"],
    description: "The angel of the Lord encamps around those who fear Him."
  },
  {
    situation: "Sick or in Pain",
    scriptures: ["Psa 38", "Matt 26:39", "Rom 5:3-5", "II Cor 12:9,10", "I Pet 4:12,13,19"],
    description: "My grace is sufficient for you, for my power is made perfect in weakness."
  },
  {
    situation: "Sorrowful",
    scriptures: ["Psa 51", "Matt 5:4", "John 14", "II Cor 1:3,4", "I Thess 4:13-18"],
    description: "Weeping may endure for a night, but joy comes in the morning."
  },
  {
    situation: "Tempted",
    scriptures: ["Psa 1", "Psa 139:23,24", "Matt 26:41", "1 Cor 10:12-14", "Phil 4:8"],
    description: "God will not let you be tempted beyond what you can bear."
  },
  {
    situation: "Thankful",
    scriptures: ["Psa 100", "I Thess 5:18", "Heb 13:15"],
    description: "Give thanks in all circumstances, for this is God's will for you."
  },
  {
    situation: "Traveling",
    scriptures: ["Psa 121"],
    description: "The Lord will watch over your coming and going both now and forevermore."
  },
  {
    situation: "Trouble",
    scriptures: ["Psa 16", "Psa 31", "John 14:1-4", "Heb 7:25"],
    description: "In this world you will have trouble, but take heart! I have overcome the world."
  },
  {
    situation: "Weary",
    scriptures: ["Psa 90", "Matt 11:28-30", "I Cor 15:58", "Gal 6:9,10"],
    description: "Come to me, all you who are weary and burdened, and I will give you rest."
  },
  {
    situation: "Worried",
    scriptures: ["Matt 6:19-34", "I Pet 5:6,7"],
    description: "Cast all your anxiety on Him because He cares for you."
  }
];

export const PSALMS_KNOWLEDGE: PsalmInfo[] = [
  {
    number: 1,
    title: "The Two Ways",
    description: "Contrasts the path of the righteous with the way of the wicked, one leading to heaven, the other to hell."
  },
  {
    number: 8,
    title: "Wonders of Creation",
    description: "Meditation on God's majesty displayed in creation and humanity's place in it."
  },
  {
    number: 19,
    title: "Natural and Supernatural Revelation",
    description: "God reveals Himself through nature (general revelation) and through His Word (special revelation)."
  },
  {
    number: 22,
    title: "The Cross Psalm",
    description: "David's prophetic foretelling of the Crucifixion, part of the trilogy with Psalms 23-24."
  },
  {
    number: 23,
    title: "The Shepherd Psalm",
    description: "The Crook Psalm - symbolized by the shepherd's crook, suitable for all occasions of life."
  },
  {
    number: 24,
    title: "The Crown Psalm",
    description: "Welcomes the King of Glory, completing the cross-crook-crown trilogy."
  },
  {
    number: 32,
    title: "Joy of Forgiveness",
    description: "The blessedness of the one whose sins are forgiven."
  },
  {
    number: 34,
    title: "Rescue from Danger",
    description: "Deliverance from the 'tiger's mouth' and the blessings of fearing the Lord."
  },
  {
    number: 39,
    title: "Sickness and Vanity",
    description: "How illness reminds us of the brevity and vanity of life."
  },
  {
    number: 42,
    title: "Psalm for the Depressed",
    description: "For the soul that thirsts for God in times of spiritual drought."
  },
  {
    number: 43,
    title: "Send Out Light and Truth",
    description: "Prayer for God's guidance and truth to lead to worship."
  },
  {
    number: 46,
    title: "Luther's Fortress Psalm",
    description: "God is our refuge and strength, an ever-present help in trouble."
  },
  {
    number: 49,
    title: "Psalm for the Rich Fool",
    description: "Warning against placing trust in riches rather than God."
  },
  {
    number: 50,
    title: "Examination of the Church Goer",
    description: "God's critique of empty religious ritual and call for genuine worship."
  },
  {
    number: 51,
    title: "Penitential Psalm",
    description: "David's prayer of repentance after his sin with Bathsheba."
  },
  {
    number: 53,
    title: "David vs Atheism",
    description: "The folly of denying God's existence, similar to Psalm 14."
  },
  {
    number: 90,
    title: "Moses' Psalm of Life",
    description: "Reflection on the brevity of life and the wisdom of numbering our days."
  },
  {
    number: 91,
    title: "God is Our Shield",
    description: "Divine protection and security for those who dwell in the Most High."
  },
  {
    number: 92,
    title: "Psalm for the Sabbath",
    description: "A song for the Sabbath day, praising God's works and faithfulness."
  },
  {
    number: 100,
    title: "Call to Worship",
    description: "A universal call to joyful worship and thanksgiving to God."
  },
  {
    number: 101,
    title: "Psalm of the Christian Home",
    description: "Guidelines for godly living and family life."
  },
  {
    number: 103,
    title: "Thanksgiving Reminder",
    description: "David's praise for God's mercy, forgiveness, and compassion."
  },
  {
    number: 115,
    title: "Psalm against Idols",
    description: "Contrast between the living God and powerless idols."
  },
  {
    number: 121,
    title: "Travelers' Psalm",
    description: "Divine protection for journeys and daily life."
  },
  {
    number: 122,
    title: "Exhortation to Church",
    description: "Call to gather in God's house for worship."
  },
  {
    number: 126,
    title: "Encouragement to Beginners",
    description: "Joy of those who sow in tears and reap with songs of joy."
  },
  {
    number: 127,
    title: "House Blessing",
    description: "God's blessing on the home and family."
  },
  {
    number: 133,
    title: "Christian Unity",
    description: "The beauty and blessing of unity among believers."
  },
  {
    number: 139,
    title: "God's Omnipresence",
    description: "The omniscience, omnipresence, omnipotence, and perfection of God."
  }
];

export const BIBLE_STRUCTURE = {
  divisions: {
    oldTestament: {
      books: 39,
      sections: {
        law: {
          name: "The Law (Pentateuch)",
          books: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
          description: "Also called the books of Moses, containing the foundation of God's covenant."
        },
        history: {
          name: "Historical Books",
          books: ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"],
          description: "The history of Israel from conquest to exile and return."
        },
        poetry: {
          name: "Poetical Books",
          books: ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"],
          description: "Wisdom literature and poetic expressions of faith."
        },
        majorProphets: {
          name: "Major Prophets",
          books: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"],
          description: "Longer prophetic books addressing Israel and future events."
        },
        minorProphets: {
          name: "Minor Prophets",
          books: ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
          description: "Shorter prophetic books with focused messages."
        }
      }
    },
    newTestament: {
      books: 27,
      sections: {
        gospels: {
          name: "Gospels",
          books: ["Matthew", "Mark", "Luke", "John"],
          description: "The life, ministry, death, and resurrection of Jesus Christ."
        },
        history: {
          name: "Acts",
          books: ["Acts"],
          description: "The early church and the spread of the gospel."
        },
        paulineEpistles: {
          name: "Pauline Epistles",
          books: ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews"],
          description: "Letters written by Paul (and Hebrewas) to churches and individuals."
        },
        generalEpistles: {
          name: "General Epistles",
          books: ["James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude"],
          description: "Letters written by other apostles to the wider church."
        },
        prophecy: {
          name: "Revelation",
          books: ["Revelation"],
          description: "Apocalyptic prophecy about end times and the ultimate victory of Christ."
        }
      }
    }
  },
  totalBooks: 66,
  jewishDivisions: {
    law: "The Law (first five books)",
    prophets: "The Prophets (historical and prophetic books)",
    writings: "The Writings (poetical books, five rolls, and other books)"
  }
};

export const BIBLE_PRAYERS: BiblePrayer[] = [
  // Genesis Prayers
  { id: 1, person: "Abraham", reference: "Gen 15:2-3", words: 40, content: "Prayer for an heir", answered: true, notes: "Answered because God had promised" },
  { id: 2, person: "Abraham", reference: "Gen 17:18", words: 7, content: "Prayer for Ishmael to be heir", answered: false, notes: "Not in harmony with God's plan" },
  { id: 3, person: "Abraham", reference: "Gen 18:23-32", words: 176, content: "Intercession for Sodom", answered: false, notes: "10 righteous not found" },
  { id: 4, person: "Eliezer", reference: "Gen 24:12-14", words: 110, content: "Prayer for bride for Isaac", answered: true, notes: "According to God's word" },
  { id: 5, person: "Jacob", reference: "Gen 28:20-22", words: 0, content: "Vow and blessing prayer", answered: true },
  { id: 6, person: "Jacob", reference: "Gen 32:9-12", words: 130, content: "Deliverance from Esau", answered: true, notes: "God's word and plan" },
  
  // Exodus Prayers
  { id: 7, person: "Moses", reference: "Ex 4:13", words: 16, content: "Aaron to go with him", answered: true },
  { id: 8, person: "Moses", reference: "Ex 5:22-23", words: 42, content: "Complaint for deliverance", answered: true },
  { id: 9, person: "Moses", reference: "Ex 32:31-32", words: 39, content: "Forgiveness for Israel", answered: true },
  { id: 10, person: "Moses", reference: "Ex 33:12-16", words: 138, content: "God's presence to go with Israel", answered: true },
  
  // Numbers Prayers (continuing pattern...)
  { id: 11, person: "Aaron", reference: "Num 6:24-26", words: 32, content: "Priestly blessing", answered: true },
  { id: 12, person: "Moses", reference: "Num 10:35-36", words: 27, content: "Blessing on journey", answered: true },
  { id: 13, person: "Moses", reference: "Num 11:10-15", words: 136, content: "Complaint about burden", answered: true },
  { id: 14, person: "Moses", reference: "Num 11:21-22", words: 56, content: "Show what to do for flesh", answered: true },
  { id: 15, person: "Moses", reference: "Num 12:13", words: 8, content: "Healing of Miriam", answered: true },
  { id: 16, person: "Moses", reference: "Num 14:13-19", words: 208, content: "Spare Israel and uphold honor", answered: true },
  { id: 17, person: "Moses", reference: "Num 16:15", words: 20, content: "Judgment on sin", answered: true },
  { id: 18, person: "Israel", reference: "Num 21:7", words: 25, content: "Forgiveness of sin", answered: true },
  { id: 19, person: "Moses", reference: "Num 27:16-17", words: 56, content: "New leader for Israel", answered: true },
  
  // New Testament Prayers
  { id: 177, person: "Jesus", reference: "Matt 6:9-13", words: 66, content: "The Lord's Prayer", answered: true },
  { id: 178, person: "Leper", reference: "Matt 8:2", words: 9, content: "Healing", answered: true },
  { id: 179, person: "Centurion", reference: "Matt 8:6-9", words: 73, content: "Healing servant", answered: true },
  { id: 180, person: "Disciples", reference: "Matt 8:25", words: 5, content: "Help from drowning", answered: true },
  { id: 181, person: "Demons", reference: "Matt 8:29-31", words: 37, content: "Temporary liberty", answered: true },
  { id: 182, person: "Ruler", reference: "Matt 9:18", words: 18, content: "Healing", answered: true },
  { id: 183, person: "Woman", reference: "Matt 9:21", words: 11, content: "Healing", answered: true },
  { id: 184, person: "Blind men", reference: "Matt 9:27", words: 8, content: "Healing", answered: true },
  { id: 185, person: "Jesus", reference: "Matt 11:25", words: 38, content: "Thanksgiving to God", answered: true },
  { id: 186, person: "Peter", reference: "Matt 14:28", words: 13, content: "Walk on water", answered: true },
  { id: 187, person: "Peter", reference: "Matt 14:30", words: 3, content: "Help from drowning", answered: true },
  { id: 188, person: "Woman", reference: "Matt 15:22-27", words: 36, content: "Healing daughter", answered: true },
  { id: 189, person: "Man", reference: "Matt 17:15-16", words: 39, content: "Healing son", answered: true },
  { id: 190, person: "Mother", reference: "Matt 20:21", words: 23, content: "Exalt sons", answered: false, notes: "Wrong motive" },
  { id: 191, person: "Blind men", reference: "Matt 20:30-33", words: 27, content: "Healing", answered: true },
  { id: 192, person: "Jesus", reference: "Matt 26:39-44", words: 62, content: "Garden prayer", answered: true },
  { id: 193, person: "Jesus", reference: "Matt 27:46", words: 9, content: "On the cross", answered: true },
  
  // John's Gospel
  { id: 203, person: "Nobleman", reference: "John 4:49", words: 7, content: "Healing child", answered: true },
  { id: 204, person: "People", reference: "John 6:34", words: 6, content: "Living bread", answered: true },
  { id: 205, person: "Jesus", reference: "John 11:41-43", words: 40, content: "Resurrect Lazarus", answered: true },
  { id: 206, person: "Jesus", reference: "John 12:27-28", words: 19, content: "Glorification", answered: true },
  { id: 207, person: "Jesus", reference: "John 17", words: 638, content: "High priestly prayer", answered: true },
  
  // Acts
  { id: 208, person: "Disciples", reference: "Acts 1:24-25", words: 41, content: "Successor to Judas", answered: true },
  { id: 209, person: "Peter", reference: "Acts 3:6", words: 12, content: "Healing lame man", answered: true },
  { id: 210, person: "Disciples", reference: "Acts 4:24-30", words: 178, content: "Boldness and power", answered: true },
  { id: 211, person: "Stephen", reference: "Acts 7:59-60", words: 13, content: "For enemies", answered: true },
  { id: 212, person: "Paul", reference: "Acts 9:5-6", words: 12, content: "Instruction", answered: true },
  { id: 213, person: "Peter", reference: "Acts 9:40", words: 2, content: "Resurrect Tabitha", answered: true },
  
  // Revelation
  { id: 215, person: "Elders", reference: "Rev 4:11", words: 27, content: "Worship", answered: true },
  { id: 216, person: "Angels", reference: "Rev 5:12", words: 22, content: "Worship", answered: true },
  { id: 217, person: "All creatures", reference: "Rev 5:13", words: 22, content: "Worship", answered: true },
  { id: 218, person: "Martyrs", reference: "Rev 6:10", words: 22, content: "Vengeance", answered: true },
  { id: 219, person: "Great multitude", reference: "Rev 7:10", words: 13, content: "Worship", answered: true },
  { id: 220, person: "Angels", reference: "Rev 7:12", words: 23, content: "Worship", answered: true },
  { id: 221, person: "Glorified saints", reference: "Rev 19:1-6", words: 56, content: "Worship", answered: true },
  { id: 222, person: "John", reference: "Rev 22:20", words: 5, content: "Second coming", answered: true }
];

// Helper functions for Virgo AI
export const getScriptureForSituation = (situation: string): LifeSituation | null => {
  return LIFE_SITUATIONS_SCRIPTURES.find(
    item => item.situation.toLowerCase().includes(situation.toLowerCase()) ||
            situation.toLowerCase().includes(item.situation.toLowerCase())
  ) || null;
};

export const getPsalmInfo = (psalmNumber: number): PsalmInfo | null => {
  return PSALMS_KNOWLEDGE.find(psalm => psalm.number === psalmNumber) || null;
};

export const getPrayerById = (id: number): BiblePrayer | null => {
  return BIBLE_PRAYERS.find(prayer => prayer.id === id) || null;
};

export const getPrayersByPerson = (person: string): BiblePrayer[] => {
  return BIBLE_PRAYERS.filter(prayer => 
    prayer.person.toLowerCase().includes(person.toLowerCase())
  );
};

export const searchScriptures = (query: string): LifeSituation[] => {
  const lowercaseQuery = query.toLowerCase();
  return LIFE_SITUATIONS_SCRIPTURES.filter(item =>
    item.situation.toLowerCase().includes(lowercaseQuery) ||
    item.description?.toLowerCase().includes(lowercaseQuery) ||
    item.scriptures.some(scripture => 
      scripture.toLowerCase().includes(lowercaseQuery)
    )
  );
};
