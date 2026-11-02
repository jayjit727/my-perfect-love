// ===== BIRTHDAY SURPRISE — TYPE DEFINITIONS =====

export interface Photo {
  id: string;
  data: string; // URL path or base64 data URL
  caption: string;
  order: number;
}

export interface SiteContent {
  // Section 1: My Love — Opening Envelope
  preHeading: string;
  mainHeading: string;
  subHeading: string;

  // Section 2: Love Letter
  letterDate: string;
  letterGreeting: string;
  letterParagraphs: string[];
  letterClosing: string;
  letterPhoto: string | null; // Data URL or URL

  // Section 3: One Surprise — MJB Mystery
  mysteryInitials: string;
  mysteryMessage: string;
  mysteryPhoto: string | null; // Data URL or URL

  // Section 4: Our Photo Album
  albumTitle: string;
  albumSubtitle: string;

  // Section 6: Final Birthday Message
  finalHeading: string;
  finalParagraphs: string[];
  finalLove: string;

  // Music configuration
  musicVolume: number;
}

export type PageId = 'envelope' | 'letter' | 'message' | 'cake' | 'mystery' | 'album' | 'final';

export const INITIAL_PHOTOS: Photo[] = [
  { id: 'p1', data: 'photos/photo1.jpg', caption: 'Connected across any distance — your smile always brightens my day. 📱💕', order: 0 },
  { id: 'p2', data: 'photos/photo2.jpg', caption: 'Holding your hand on September 4th… a moment I never wanted to let go of. 🤝❤️', order: 1 },
  { id: 'p3', data: 'photos/photo3.jpg', caption: 'The sweetest comfort in the world — just being right here beside you. 🥰✨', order: 2 },
  { id: 'p4', data: 'photos/photo4.jpg', caption: 'Your pure laughter and joyful smile mean everything to me. 💖🌸', order: 3 },
  { id: 'p5', data: 'photos/photo5.jpg', caption: 'Standing by your side, ready to walk through life together. 👫💫', order: 4 },
  { id: 'p6', data: 'photos/photo6.jpg', caption: 'September 5th — our hands intertwined, red bangles and a bond so special. 🌹✨', order: 5 },
  { id: 'p7', data: 'photos/photo7.jpg', caption: 'Yellow roses for the most beautiful girl in my life. 💐💛', order: 6 },
  { id: 'p8', data: 'photos/photo8.jpg', caption: 'Our cozy cafe date — lost in conversation, laughter, and your eyes. ☕❤️', order: 7 },
  { id: 'p9', data: 'photos/photo9.jpg', caption: 'Walking ahead and holding my hand… wherever you lead, I will follow. 🚶‍♂️❤️', order: 8 },
  { id: 'p10', data: 'photos/photo10.jpg', caption: 'Every little ride and silly adventure with you is my favourite journey. 🛺🧢💕', order: 9 },
  { id: 'p11', data: 'photos/photo11.jpg', caption: 'September 25th — Sitting together with your favourite sunflowers. 🌻💖', order: 10 },
  { id: 'p12', data: 'photos/photo12.jpg', caption: 'The gentle little moments of caring for each other. 💄💕', order: 11 },
  { id: 'p13', data: 'photos/photo13.jpg', caption: 'Sheltered under the umbrella, caught in our own little world. ☔😘', order: 12 },
  { id: 'p14', data: 'photos/photo14.jpg', caption: 'A quiet kiss in the park, lost in the sweetest dream. 🌳🌸', order: 13 },
  { id: 'p15', data: 'photos/photo15.jpg', caption: 'October 1st — Warm hugs and smiles at the playground swings. 🎠❤️', order: 14 },
  { id: 'p16', data: 'photos/photo16.jpg', caption: 'Holding you close from behind… wishing time would simply stand still. 🕊️💫', order: 15 },
  { id: 'p17', data: 'photos/photo17.jpg', caption: 'Your adorable smile wearing your cap in the afternoon breeze. 🧢🌷', order: 16 },
  { id: 'p18', data: 'photos/photo18.jpg', caption: 'Hijli Eco Park adventures with my favourite travel partner! 🌲✌️❤️', order: 17 },
  { id: 'p19', data: 'photos/photo19.jpg', caption: 'Chasing the sunset light together on another fun auto ride. 🛺✨', order: 18 },
  { id: 'p20', data: 'photos/photo20.jpg', caption: 'Our hands raised high at Kharagpur Station — making memories everywhere. 🚉🤝❤️', order: 19 },
  { id: 'p21', data: 'photos/photo21.jpg', caption: 'Walking beside the platform train, hand in hand into the future. 🚆💕', order: 20 },
  { id: 'p22', data: 'photos/photo22.jpg', caption: 'October 14th — Looking breathtakingly gorgeous in your saree and bindi. 🥻🌹', order: 21 },
  { id: 'p23', data: 'photos/photo23.jpg', caption: 'I could look at you forever and never get tired of your beauty. 👀❤️', order: 22 },
  { id: 'p24', data: 'photos/photo24.jpg', caption: 'Resting your head on my shoulder — my heart’s safest home. 🥺💖', order: 23 },
  { id: 'p25', data: 'photos/photo25.jpg', caption: 'Two hands, one heart — our love story in one frame. 🫶❤️', order: 24 },
  { id: 'p26', data: 'photos/photo26.jpg', caption: 'Embracing the sunflowers with the purest peace on your face. 🌻🤍', order: 25 },
  { id: 'p27', data: 'photos/photo27.jpg', caption: 'Adoring your flowers — you are more radiant than any blossom. 🌻💫', order: 26 },
  { id: 'p28', data: 'photos/photo28.jpg', caption: 'Gajra in your hair and elegance in every single detail. 🌸🌿', order: 27 },
  { id: 'p29', data: 'photos/photo29.jpg', caption: 'Campus moments together, dressed up and proud to have you beside me. 🏛️❤️', order: 28 },
  { id: 'p30', data: 'photos/photo30.jpg', caption: 'Sitting side by side on the lawn garden, talking about our dreams. 🌿💑', order: 29 },
  { id: 'p31', data: 'photos/photo31.jpg', caption: 'Forehead to forehead, whispered promises that will last a lifetime. 🤍✨', order: 30 },
  { id: 'p32', data: 'photos/photo32.jpg', caption: 'A queen in gold — Moumita, you take my breath away every time. 👑✨', order: 31 },
  { id: 'p33', data: 'photos/photo33.jpg', caption: 'Holding my arm as we walk together, now and forever. 👫💍', order: 32 },
  { id: 'p34', data: 'photos/photo34.jpg', caption: 'No matter where we are, seeing you smile makes every day complete. 📱🌸❤️', order: 33 },
];

export const DEFAULT_CONTENT: SiteContent = {
  preHeading: '',
  mainHeading: 'My Love',
  subHeading: 'behind the scenes of my happiness',

  letterDate: '14th August, 2026 — A Date I Will Always Keep Close to My Heart. ❤️',
  letterGreeting: 'Moumita,',
  letterParagraphs: [
    "14th August, 2026, will always be one of the most special dates in my life. It is close to my heart because that was the day I found you again after reactivating my Instagram account after almost three years. I never imagined that coming back to an old account could lead me to someone who would become so important to me. Sometimes, the most beautiful things in life happen when we least expect them, and meeting you again is one of those moments I will always be grateful for.",
    "That day, I shared my feelings with you, everything that was in my heart. I wanted you to know what I felt, how special you were becoming to me, and how sincerely I wanted to know you. But at the same time, I knew that loving someone was not just about expressing feelings. It was also about giving that person time, understanding their thoughts, respecting their past, accepting their present, and learning about their dreams and the little things that make them who they are. That is why I wanted to give myself more time to understand you, your life, your emotions, your happiness, and even the things you don't always express through words.",
    "Through you, I have started understanding what true love means to me. I have realised that love is not only about saying \"I love you\" every day. It is about caring for someone even in the smallest moments, listening when they need to be heard, understanding them when they are upset, being patient when things are difficult, and choosing to stay emotionally connected even when everything is not perfect. You have taught me that loving someone is also about growing together, learning from each other, and becoming better people along the way.",
    "Every day, I genuinely try to improve myself and become a better person. Not because I want to pretend to be someone else, but because I want to become someone who can give you the love, respect, patience, care, and emotional support you deserve. I want to become a good life partner for you, someone you can trust, someone with whom you can share your happiest moments and your difficult days without hesitation. I know I am not perfect, and I still have many things to learn about myself and about relationships. But I promise that I will keep making sincere efforts to grow, understand, and become better every single day.",
    "You know what? I genuinely love watching you laugh and smile. Sometimes, your little actions, your funny reactions, your way of talking, and your endless conversations make my entire day better. Even the smallest things you do can bring a smile to my face. I love listening to you, even when you keep talking about so many different things. I don't feel bored, and honestly, I don't think I could ever get tired of spending time with you. There are so many things I still want to talk about, so many stories I want to hear from you, and so many ordinary moments I want to experience together.",
    "I also love the way you look at me and the way you make me understand things whenever I need it. Sometimes, you explain something in your own little way, and it makes me think differently. I love how your presence can make me feel understood. Your expressions, your reactions, your sense of humour, and the way you handle conversations have become some of my favourite things about you.",
    "And I have to admit something: I really love your sense of humour. 😂❤️ Before you came into my life, I was quite simple, a little boring, and not always expressive. But being with you has brought out a different side of me. I have started laughing more, enjoying little things more, expressing myself more, and looking at life a little differently. I have learned so many things from you, sometimes without you even realising it. You have brought a kind of happiness and liveliness into my everyday life that I genuinely appreciate.",
    "I know that sometimes I have tried to provoke you or tease you in ways that may have irritated you. Looking back, I understand that not every joke or action is funny to the other person, especially when feelings are involved. I don't want to keep repeating those things or make you feel uncomfortable just for the sake of a joke. I want to be more thoughtful about your feelings, understand your limits, and respect the moments when you need patience rather than teasing. I cannot promise that I will never make a mistake, because I am human too, but I can promise that I will take responsibility, learn from it, and make a genuine effort not to repeat the same behaviour.",
    "Moumita, I don't just love the happy and funny side of you. I want to understand every side of you — your excitement, your silence, your mood swings, your dreams, your fears, your little complaints, and even those days when you don't feel like talking much. You don't always have to be happy around me or pretend that everything is fine. I want you to feel comfortable being yourself with me. I want to be someone you can talk to freely, laugh with without thinking twice, and lean on when life feels a little difficult.",
    "I don't know exactly what every day of our future will look like, but I know what I sincerely wish for. I want to keep learning about you, keep creating memories with you, celebrate your achievements, support your dreams, and stand beside you through the ordinary and extraordinary moments of life. I want us to grow together, understand each other better with time, and never stop making efforts for one another.",
    "And one thing I want you to know from the deepest part of my heart: I truly love you, Moumita, and I genuinely want you to be my future wife. ❤️",
    "I don't say this just because it sounds beautiful or romantic. I say it because when I think about the future, I want to imagine building a life with you — sharing responsibilities, making decisions together, laughing over silly things, supporting each other through difficult times, and finding happiness in the simplest moments.",
    "I cannot promise you a perfect life, because no relationship or person is perfect. But I can promise you sincerity, loyalty, respect, patience, and a heart that genuinely wants to choose you every day. I want my actions to make you feel as loved as my words say you are.",
    "Thank you for coming into my life and bringing so many beautiful changes with you. Thank you for your laughter, your talks, your humour, your patience, and all those little things that make you uniquely you. I hope I can keep giving you reasons to smile, just as you have given me so many.",
    "From the day I found you again on 14th August, 2026, to all the days that are yet to come, I want to keep choosing you, understanding you, growing with you, and loving you a little better every day.",
    "I love you, Moumita. Not just for the person you are today, but for the person you are becoming and for the beautiful life I hope we can build together.",
  ],
  letterClosing: 'You are someone I want beside me, not just for a moment, but for a lifetime. ❤️ ♾️\nYour beloved Jb 🧿',
  letterPhoto: null,

  mysteryInitials: 'MJB',
  mysteryMessage: 'Every moment with you feels like a beautiful dream I never want to wake up from. You are my sunshine, my happiness, my everything. ❤️',
  mysteryPhoto: null,

  albumTitle: 'Our Memories',
  albumSubtitle: 'A collection of beautiful moments ❤️',

  finalHeading: 'Happy Birthday Once Again, My Moumita! ❤️',
  finalParagraphs: [
    'May your life always be filled with happiness, beautiful memories, success, and endless smiles.',
    'No matter how many photographs we take or how many memories we create, there will always be more beautiful moments waiting for us.',
  ],
  finalLove: 'I love you. ❤️♾️',

  musicVolume: 0.35,
};
