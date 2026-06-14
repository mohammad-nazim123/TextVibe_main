const bannedWords = new Set([
  'fuck', 'fucker', 'fucking', 'motherfucker', 'shit', 'bullshit', 'bitch',
  'bastard', 'asshole', 'ass', 'arse', 'crap', 'damn', 'dick', 'dickhead',
  'piss', 'prick', 'cock', 'pussy', 'cunt', 'twat', 'wanker', 'bollocks',
  'bugger', 'slut', 'whore', 'skank', 'douche', 'jackass', 'dumbass',
  'fuk', 'fck', 'phuck', 'azz', 'biatch', 'btch', 'azzhole',
  'sex', 'porn', 'porno', 'nude', 'nudes', 'naked', 'boobs', 'tits', 'titties',
  'penis', 'vagina', 'horny', 'cum', 'orgasm', 'blowjob', 'handjob', 'anal',
  'masturbate', 'dildo', 'rape', 'rapist', 'molest', 'pedophile', 'pedo',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded', 'spic', 'chink',
  'kike', 'wetback', 'tranny', 'dyke', 'coon',
  'kill', 'murder', 'suicide', 'terrorist', 'bomb', 'behead', 'massacre',
  'lynch', 'genocide',
  'cocaine', 'heroin', 'meth', 'weed', 'marijuana',
  'madarchod', 'maderchod', 'bhenchod', 'behenchod', 'bhanchod',
  'chutiya', 'chutiye', 'chutia', 'gandu', 'gaandu',
  'bhosdike', 'bhosdi', 'bhosadike', 'bhadwa', 'bhadwe',
  'harami', 'haramkhor', 'haramzada', 'haramzade',
  'kamina', 'kamine', 'kutti', 'kutiya',
  'lauda', 'lawda', 'chudai', 'chodu',
  'hijra', 'hijda', 'katua',
  'मादरचोद', 'भेनचोद', 'बहनचोद', 'चूतिया', 'चुटिया', 'गांडू', 'रंडी',
  'हरामी', 'हरामखोर', 'हरामज़ादा', 'कमीना', 'कमीने', 'कुतिया',
  'लौड़ा', 'भोसड़ी', 'भोसड़ीके', 'भड़वा', 'चुदाई', 'हिजड़ा',
]);

const exactOnlyWords = new Set([
  'chut', 'gand', 'gaand', 'lund', 'loda', 'raand', 'chod', 'randi',
  'tatti', 'jhant', 'jhaat', 'saala', 'sala',
  'गांड', 'लंड', 'चूत', 'चोद', 'साला', 'रांड', 'टट्टी', 'झांट',
]);

// Threatening sentences. Matched as de-spaced substrings of the normalized text
// (the same trick used for long banned words), so a whole phrase is caught even
// when obfuscated. Covers English and Hindi (romanized + Devanagari).
const threatPhrases = [
  // English
  'kill you', 'kill u', 'i will kill', 'ill kill you', 'gonna kill you', 'going to kill',
  'you are dead', 'youre dead', 'ur dead', 'you will die', 'i will hurt you', 'hurt you',
  'beat you up', 'beat you', 'burn you', 'rape you', 'shoot you', 'stab you', 'hang you',
  'destroy you', 'end you', 'make you suffer', 'hunt you down', 'watch your back',
  'i know where you live', 'i will find you', 'you will pay', 'wipe you out',
  // Hindi (romanized)
  'jaan se maar', 'jaan se mar', 'maar dunga', 'maar dalunga', 'mar dunga',
  'tujhe maar dunga', 'tujhe maardunga', 'tujhe mar dalunga', 'khatam kar dunga',
  'khatm kar dunga', 'zinda nahi chodunga', 'zinda nahi chhodunga', 'dekh lunga tujhe',
  'tujhe dekh lunga', 'tera khoon', 'khoon kar dunga', 'goli maar dunga', 'tujhe goli',
  'tod dunga', 'haddi tod dunga', 'tujhe nahi chodunga', 'uthwa lunga', 'tere tukde kar dunga',
  'gaad dunga', 'jinda nahi rahega',
  // Hindi (Devanagari)
  'जान से मार', 'मार दूंगा', 'मार डालूंगा', 'तुझे मार', 'तुझे मार दूंगा', 'खतम कर दूंगा',
  'खत्म कर दूंगा', 'देख लूंगा', 'तुझे देख लूंगा', 'गोली मार', 'गोली मार दूंगा',
  'जिंदा नहीं छोड़ूंगा', 'खून कर दूंगा', 'तोड़ दूंगा', 'तेरे टुकड़े',
];

// Heuristic for threats not spelled out as a fixed phrase: a strong violent
// verb aimed at a second person ("… and then I'll stab you"). English only —
// the Hindi equivalents (tu/tera + maar) are too common in lyrics to use this
// way, so Hindi threats rely on the phrase list above.
const englishThreatVerbs = new Set([
  'kill', 'murder', 'rape', 'behead', 'stab', 'shoot', 'lynch', 'slaughter', 'strangle', 'choke',
]);
const englishTargets = new Set(['you', 'youre', 'ur', 'yall']);

const leet = {
  0: 'o',
  1: 'i',
  3: 'e',
  4: 'a',
  5: 's',
  6: 'g',
  7: 't',
  8: 'b',
  9: 'g',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '|': 'i',
};

export function normalizeWord(input) {
  const lower = String(input || '').toLowerCase();
  let out = '';
  for (const char of lower) {
    const mapped = leet[char] || char;
    const code = mapped.codePointAt(0);
    if ((code >= 97 && code <= 122) || (code >= 0x0900 && code <= 0x097f)) {
      out += mapped;
    }
  }
  return out.replace(/(.)\1+/gu, '$1');
}

export function moderateText(text) {
  if (!String(text || '').trim()) return { isClean: true, message: null };
  const exact = new Set([...bannedWords, ...exactOnlyWords].map(normalizeWord));

  const tokens = String(text).split(/\s+/u).map(normalizeWord);
  for (const token of tokens) {
    if (exact.has(token)) {
      return { isClean: false, message: 'Please remove inappropriate language.' };
    }
  }

  const joined = normalizeWord(text);
  for (const word of bannedWords) {
    const normalized = normalizeWord(word);
    if (normalized.length >= 5 && joined.includes(normalized)) {
      return { isClean: false, message: 'Please remove inappropriate language.' };
    }
  }

  // Threats: explicit phrases (any language) as de-spaced substrings.
  for (const phrase of threatPhrases) {
    const normalized = normalizeWord(phrase);
    if (normalized && joined.includes(normalized)) {
      return { isClean: false, message: 'Please remove threatening language.' };
    }
  }

  // Threats: a strong violent verb aimed at a second person.
  const tokenSet = new Set(tokens);
  const hasVerb = [...englishThreatVerbs].some((w) => tokenSet.has(normalizeWord(w)));
  const hasTarget = [...englishTargets].some((w) => tokenSet.has(normalizeWord(w)));
  if (hasVerb && hasTarget) {
    return { isClean: false, message: 'Please remove threatening language.' };
  }

  return { isClean: true, message: null };
}
