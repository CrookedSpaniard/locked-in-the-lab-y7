/* Content for "Locked in the Lab" (Year 7 · Collaborating online respectfully).
   Every lock gives one letter. The letters spell the secret word. */
window.SECRET = 'RESPECT';

window.LOCKS = [
  /* ───────────── R · Lesson 1 ───────────── */
  {
    id: 'r', letter: 'R', name: 'Password Lock', icon: '🔑', color: 'var(--c1)', lesson: 'Lesson 1 · Passwords',
    tasks: [
      {
        type: 'choice',
        todo: 'Tap the strongest password.',
        q: 'Which password is the strongest? 💪',
        hint: 'Look for the one that uses random words AND numbers. Long is strong!',
        options: [
          { t: 'Secure1', why: 'Too short and easy to guess.' },
          { t: '2MyStudioCardboard9', ok: true, why: 'Random words + numbers = long and very hard to guess!' },
          { t: 'Password1234', why: 'Hackers always try “password” first!' },
          { t: 'P@ssword123', why: 'Changing a to @ does not fool hackers.' },
          { t: 'enter', why: 'One short, common word. Very easy to guess.' },
        ],
      },
      {
        type: 'sort',
        todo: 'For each sentence, tap 👍 or 👎. Then tap Check.',
        q: 'Passwords are like underpants! 🩲 Is this good advice or bad advice?',
        hint: 'Underpants: never share them, change them often, keep them private!',
        bins: ['👍 Good advice', '👎 Bad advice'],
        items: [
          { t: 'Never share your password.', bin: 0 },
          { t: 'Change your password often.', bin: 0 },
          { t: 'Use three random words.', bin: 0 },
          { t: 'Use your pet’s name.', bin: 1, why: 'People can find out your pet’s name easily.' },
          { t: 'Tell your best friend your password.', bin: 1, why: 'Keep it private, even from friends.' },
          { t: 'Use “qwerty”.', bin: 1, why: 'It is one of the most common passwords in the world!' },
          { t: 'Stick your password on your screen.', bin: 1, why: 'Anyone walking past can read it.' },
        ],
      },
      {
        type: 'build',
        todo: 'Tap 3 words and 1 number to make a strong password.',
        q: 'Make a strong password with three random words 🧩',
        hint: 'Choose any 3 words (they don’t need to go together) and then 1 number.',
        words: ['fish', 'cloud', 'road', 'banana', 'rocket', 'pencil', 'tiger', 'moon', 'sock'],
        numbers: ['7', '9', '23', '42'],
      },
    ],
  },

  /* ───────────── E · Lesson 1 ───────────── */
  {
    id: 'e1', letter: 'E', name: 'Lab Safety Lock', icon: '⚠️', color: 'var(--c2)', lesson: 'Lesson 1 · The computing lab',
    tasks: [
      {
        type: 'spot',
        todo: 'Tap each thing in the picture that is NOT safe.',
        q: 'Find all 7 hazards in the computing lab 🔍',
        hint: 'Look at the floor, the desk, the plugs and the door!',
      },
      {
        type: 'sort',
        todo: 'For each rule, tap ✅ or ❌. Then tap Check.',
        q: 'Should this be a rule in our computing lab?',
        hint: 'A good rule keeps people and computers safe.',
        bins: ['✅ Good rule', '❌ No way!'],
        items: [
          { t: 'Keep food and drinks away from the computers.', bin: 0 },
          { t: 'Put your bag under the desk.', bin: 0 },
          { t: 'Log off when you finish.', bin: 0 },
          { t: 'Tell the teacher if something is broken.', bin: 0 },
          { t: 'Run to the door when the bell rings.', bin: 1, why: 'You could trip on a cable or a bag.' },
          { t: 'Share your login with a friend.', bin: 1, why: 'Your login is only for you.' },
          { t: 'Play with the cables and plugs.', bin: 1, why: 'Electricity is dangerous!' },
        ],
      },
    ],
  },

  /* ───────────── S · Lesson 2 ───────────── */
  {
    id: 's', letter: 'S', name: 'Email Lock', icon: '✉️', color: 'var(--c3)', lesson: 'Lesson 2 · Respectful emails',
    tasks: [
      {
        type: 'sort',
        todo: 'Read each email. Tap 😊 or 😠. Then tap Check.',
        q: 'Is this email respectful?',
        hint: 'A respectful email is polite, kind and clear. It has a subject, a greeting and a sign-off.',
        bins: ['😊 Respectful', '😠 Not respectful'],
        items: [
          { from: 'Becky', subject: 'Hi Miss!', t: 'Can we not have any homework this week because I didn’t like the last one and I wanted to play online instead. Soz. Lol.', bin: 1, why: 'Too chatty and rude for a teacher (“Soz. Lol.”).' },
          { from: 'Mr Bordwell', subject: 'Today in class', t: 'The work that you produced today was dreadful. Don’t bother turning up next time.', bin: 1, why: 'Unkind and hurtful.' },
          { from: 'Melissa', subject: 'Jacob’s hair LOL!!!', t: 'Did you see his hair today! He looked like a scarecrow. Here is his school picture…', bin: 1, why: 'It laughs at Jacob and shares his photo.' },
          { from: 'Mr Hopper', subject: 'Homework for Monday 8th', t: 'Dear Class, this is a reminder that your volcano project is due on Monday 8th. Many thanks, Mr Hopper', bin: 0 },
          { from: 'Sunny', subject: 'RE: Homework for Monday 8th', t: 'Dear Mr Hopper, could you tell me if we need to draw a volcano or just write about it? Thank you, Sunny', bin: 0 },
        ],
      },
      {
        type: 'fill',
        todo: 'Tap the best choice in each yellow box. Then tap Check.',
        q: 'Mia’s email to her history teacher needs fixing! ✏️',
        hint: 'Send it only to the teacher, give it a clear subject, and start with “Dear…”.',
        parts: [
          { label: 'To:', options: ['everyone@school (the whole school)', 'Mr Smith (her history teacher)'], answer: 1 },
          { label: 'Subject:', options: ['(empty)', 'Hi', 'History homework question'], answer: 2 },
          { label: 'Start:', options: ['Hey!', 'Dear Mr Smith,', 'Yo teacher'], answer: 1 },
          { text: 'I missed the history homework yesterday. Could you tell me what it was, please?' },
          { label: 'End:', options: ['Soz lol', '😜😜😜', 'Thank you, Mia'], answer: 2 },
        ],
      },
      {
        type: 'choice',
        todo: 'Tap the right answer.',
        q: 'Who can read your school emails? 👀',
        hint: 'Your school looks after its email system…',
        options: [
          { t: 'Only me.', why: 'Not quite. Other people can see them too.' },
          { t: 'Only me and the person I send it to.', why: 'Not quite. Someone else can check them.' },
          { t: 'The school can check them too.', ok: true, why: 'Yes! School emails can be monitored. Only write emails you are happy for anyone to read.' },
        ],
      },
    ],
  },

  /* ───────────── P · Lesson 3 ───────────── */
  {
    id: 'p', letter: 'P', name: 'Comment Lock', icon: '💬', color: 'var(--c4)', lesson: 'Lesson 3 · Kind comments',
    tasks: [
      {
        type: 'sort',
        todo: 'For each comment, tap 💬 or 💥. Then tap Check.',
        q: 'Your classmate made slides about their dog 🐶. Is each comment kind and helpful?',
        hint: 'A helpful comment is friendly and says HOW to make the work better.',
        bins: ['💬 Kind & helpful', '💥 Unkind / not helpful'],
        items: [
          { t: '“I like the hearts, but maybe have fewer of them?”', bin: 0 },
          { t: '“I hate green. It’s a horrible colour.”', bin: 1, why: 'Unkind, and it doesn’t say how to improve.' },
          { t: '“Use capital letters for your name.”', bin: 0 },
          { t: '“I think your dog is ugly.”', bin: 1, why: 'Hurtful, and not about the work.' },
          { t: '“Try to keep it simple. Maybe make the dog picture bigger?”', bin: 0 },
          { t: '“Wow, amazing work… NOT! 🙄”', bin: 1, why: 'Sarcasm is mean and hard to understand online.' },
          { t: '“I would make the title bigger so it stands out.”', bin: 0 },
        ],
      },
      {
        type: 'order',
        todo: 'Tap the sentences to put them in the sandwich, from top to bottom.',
        q: 'Make a feedback sandwich 🥪',
        hint: 'Bread = something nice. Filling (the middle) = something to improve.',
        slots: ['🍞 Top: something nice', '🥬 Middle: something to improve', '🍞 Bottom: something nice'],
        items: ['Your pictures are really fun! 😊', 'Maybe make the title bigger so it is easy to read.', 'I learnt a lot about your dog. Great job!'],
        answers: [[0, 1, 2], [2, 1, 0]],
      },
      {
        type: 'choice',
        todo: 'Tap the BAD tip.',
        q: 'Which tip is NOT good advice for comments online?',
        hint: 'One of these is hard to understand when you can’t see someone’s face.',
        options: [
          { t: 'Keep it friendly.', why: 'That is good advice!' },
          { t: 'Be specific.', why: 'That is good advice!' },
          { t: 'Use sarcasm to be funny.', ok: true, why: 'Right! Sarcasm is hard to understand online. People may think you are being mean.' },
          { t: 'Ask a question to start a chat.', why: 'That is good advice!' },
        ],
      },
    ],
  },

  /* ───────────── E · Lesson 3 ───────────── */
  {
    id: 'e2', letter: 'E', name: 'Feedback Lock', icon: '📝', color: 'var(--c5)', lesson: 'Lesson 3 · Getting feedback',
    tasks: [
      {
        type: 'order',
        todo: 'Tap the 5 steps in the right order, from 1 to 5.',
        q: 'Someone left a comment on your work. What do you do?',
        hint: 'First you READ it. Last, you REMEMBER why feedback is useful.',
        slots: ['1', '2', '3', '4', '5'],
        items: [
          '📖 READ – Read the comment carefully.',
          '✋ STOP – Don’t get angry. They want to help.',
          '🙏 APPRECIATE – Say “thank you”.',
          '🤔 DECIDE – Do you agree? Ask a question if you are not sure.',
          '🧠 REMEMBER – Feedback helps you improve.',
        ],
        answers: [[0, 1, 2, 3, 4]],
      },
      {
        type: 'choice',
        todo: 'Tap the best answer.',
        q: 'Sam comments on your slides: “Your title is hard to read.” What should you do?',
        hint: 'Remember the steps: read, stop, say thank you…',
        options: [
          { t: 'Reply: “Your slides are worse!”', why: 'That would hurt Sam. Sam wants to help.' },
          { t: 'Delete the comment.', why: 'The comment could help you improve.' },
          { t: 'Say thank you and make the title clearer.', ok: true, why: 'Great! Feedback is there to help you.' },
          { t: 'Tell everyone that Sam is mean.', why: 'Assume good intentions. Sam was trying to help.' },
        ],
      },
    ],
  },

  /* ───────────── C · Lessons 4–5 ───────────── */
  {
    id: 'c', letter: 'C', name: 'Cyberbullying Lock', icon: '🛡️', color: 'var(--c6)', lesson: 'Lessons 4–5 · Cyberbullying',
    tasks: [
      {
        type: 'choice',
        todo: 'Tap the right answer.',
        q: 'What is cyberbullying?',
        hint: 'It happens with technology, and it happens again and again.',
        options: [
          { t: 'A friendly joke that everyone laughs at.', why: 'Not quite. Cyberbullying hurts someone.' },
          { t: 'Using phones, games or messages to hurt or upset someone again and again.', ok: true, why: 'Yes! Cyberbullying is bullying with technology.' },
          { t: 'Arguing once with a friend and then saying sorry.', why: 'That is a normal argument, not bullying.' },
          { t: 'Playing an online game with friends.', why: 'That is just having fun!' },
        ],
      },
      {
        type: 'sort',
        todo: 'For each action, tap 👍 or 👎. Then tap Check.',
        q: 'Stop 🛑 Speak 🗣️ Support 🤝 — does this help or make it worse?',
        hint: 'Good actions tell an adult or help the person being bullied.',
        bins: ['👍 Helps', '👎 Makes it worse'],
        items: [
          { t: 'Tell a trusted adult.', bin: 0 },
          { t: 'Block and report the bully.', bin: 0 },
          { t: 'Keep screenshots as proof.', bin: 0 },
          { t: 'Send a kind message to the person being bullied.', bin: 0 },
          { t: 'Share the mean post with more people.', bin: 1, why: 'More people see it, so it hurts more.' },
          { t: 'Reply with something nasty.', bin: 1, why: 'That makes the bullying bigger.' },
          { t: '“Like” the mean comment.', bin: 1, why: 'A like tells the bully you agree.' },
        ],
      },
      {
        type: 'choice',
        todo: 'Tap the best answer.',
        q: 'In your class group chat, someone posts an unkind photo of Jacob. What do you do?',
        hint: 'Stop it spreading, speak to an adult, support Jacob.',
        options: [
          { t: 'Laugh and share it.', why: 'Sharing it hurts Jacob even more.' },
          { t: 'Do nothing.', why: 'Jacob needs help. You can do something.' },
          { t: 'Don’t share it, tell a trusted adult and check that Jacob is OK.', ok: true, why: 'Brilliant: stop, speak and support!' },
          { t: 'Post another funny photo of Jacob.', why: 'That is cyberbullying too.' },
        ],
      },
    ],
  },

  /* ───────────── T · Lessons 4–5 ───────────── */
  {
    id: 't', letter: 'T', name: 'Slide Lock', icon: '🖥️', color: 'var(--c7)', lesson: 'Lessons 4–5 · Great presentations',
    tasks: [
      {
        type: 'sort',
        todo: 'For each sentence, tap ✅ True or ❌ False. Then tap Check.',
        q: 'Presentations: true or false?',
        hint: 'Good slides are simple: a few words, one big picture, easy colours.',
        bins: ['✅ True', '❌ False'],
        items: [
          { t: 'Use one big picture that matches your message.', bin: 0 },
          { t: 'Use as many colours as possible.', bin: 1, why: 'Too many colours are messy. Keep the same colours on every slide.' },
          { t: 'Fill every slide with lots of text.', bin: 1, why: 'Use short bullet points. YOU say the details.' },
          { t: 'Add animations to everything.', bin: 1, why: 'Too many animations are distracting.' },
          { t: 'Use bold, italic AND underline at the same time.', bin: 1, why: 'Choose just one to make a word stand out.' },
          { t: 'Use a simple (sans serif) font, like this one.', bin: 0 },
          { t: 'Use dark text on a light, pastel background.', bin: 0 },
        ],
      },
      {
        type: 'choice',
        todo: 'Tap the better slide.',
        q: 'Your audience is your class. Which slide is better?',
        hint: 'Which one can you read from the back of the classroom?',
        cols: true,
        options: [
          { html: '<div class="mini bad"><b>What is cyberbullying???</b><p>Cyberbullying is when someone uses technology such as phones, tablets, computers, games consoles, social media, messages and apps to hurt, upset, scare or embarrass another person again and again and it can happen at any time of the day or night and…</p><span>🌈⭐🔥🎉💥</span></div>', label: 'Slide A', why: 'Too much text, too many emojis and colours that are hard to read.' },
          { html: '<div class="mini good"><b>What is cyberbullying?</b><span class="big">📱💬</span><ul><li>Hurting someone online</li><li>Again and again</li><li>Tell an adult</li></ul></div>', label: 'Slide B', ok: true, why: 'Yes! Short points, one big picture and easy colours.' },
        ],
      },
      {
        type: 'choice',
        todo: 'Tap the right answer.',
        q: 'You need a picture for your slides. Which one can you use?',
        hint: 'Look for pictures that say you are allowed to reuse them.',
        options: [
          { t: 'Any picture from a Google search.', why: 'Many pictures belong to someone. You need permission.' },
          { t: 'A picture labelled for reuse (Creative Commons).', ok: true, why: 'Yes! These pictures are free to reuse.' },
          { t: 'A photo of a classmate, without asking.', why: 'Always ask before you use someone’s photo.' },
          { t: 'A screenshot from a film.', why: 'Films belong to someone. You need permission.' },
        ],
      },
    ],
  },
];

/* The hazard picture for the Lab Safety Lock. x / y are in the 800 × 460 picture. */
window.HAZARDS = [
  { e: '📦', x: 78, y: 300, s: 58, why: 'The fire exit is blocked! In an emergency, everyone must get out fast.' },
  { e: '🎒', x: 262, y: 404, s: 58, why: 'A bag on the floor. Someone could trip over it!' },
  { cable: true, x: 610, y: 412, why: 'A loose cable across the floor. Someone could trip!' },
  { e: '🥤', x: 338, y: 226, s: 40, why: 'A drink next to the computer. It could spill and break it, or give an electric shock.' },
  { e: '🍌', x: 470, y: 430, s: 40, why: 'Food and rubbish on the floor. It is slippery and messy!' },
  { e: '🧍', x: 712, y: 262, s: 92, chair: true, why: 'Standing on a chair. You could fall and get hurt!' },
  { plugs: true, x: 430, y: 318, why: 'Too many plugs in one socket. It can get hot and start a fire!' },
];
window.SAFE = [
  { e: '🧑‍🏫', x: 160, y: 392, s: 64, why: 'That’s the teacher. All good! 👍' },
  { e: '📚', x: 448, y: 128, s: 40, why: 'Books on the shelf are safe. 👍' },
  { e: '🪴', x: 512, y: 128, s: 40, why: 'A plant on the shelf is safe. 👍' },
  { e: '🕒', x: 312, y: 62, s: 40, why: 'Just the clock. 👍' },
];
