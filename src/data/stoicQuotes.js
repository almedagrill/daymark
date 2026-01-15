export const stoicQuotes = [
  {
    text: "When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.",
    author: "Marcus Aurelius"
  },
  {
    text: "You have power over your mind—not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius"
  },
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius"
  },
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca"
  },
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca"
  },
  {
    text: "Luck is what happens when preparation meets opportunity.",
    author: "Seneca"
  },
  {
    text: "Begin at once to live, and count each separate day as a separate life.",
    author: "Seneca"
  },
  {
    text: "He who fears death will never do anything worthy of a man who is alive.",
    author: "Seneca"
  },
  {
    text: "We cannot choose our external circumstances, but we can always choose how we respond to them.",
    author: "Epictetus"
  },
  {
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus"
  },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus"
  },
  {
    text: "No man is free who is not master of himself.",
    author: "Epictetus"
  },
  {
    text: "Make the best use of what is in your power, and take the rest as it happens.",
    author: "Epictetus"
  },
  {
    text: "Don't explain your philosophy. Embody it.",
    author: "Epictetus"
  },
  {
    text: "If it is not right do not do it; if it is not true do not say it.",
    author: "Marcus Aurelius"
  },
  {
    text: "The best revenge is not to be like your enemy.",
    author: "Marcus Aurelius"
  },
  {
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius"
  },
  {
    text: "How long are you going to wait before you demand the best for yourself?",
    author: "Epictetus"
  },
  {
    text: "True happiness is to enjoy the present, without anxious dependence upon the future.",
    author: "Seneca"
  },
  {
    text: "The obstacle is the way.",
    author: "Marcus Aurelius"
  },
  {
    text: "Difficulties strengthen the mind, as labor does the body.",
    author: "Seneca"
  },
  {
    text: "He suffers more than necessary, who suffers before it is necessary.",
    author: "Seneca"
  },
  {
    text: "If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.",
    author: "Marcus Aurelius"
  },
  {
    text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.",
    author: "Marcus Aurelius"
  },
  {
    text: "The soul becomes dyed with the color of its thoughts.",
    author: "Marcus Aurelius"
  },
  {
    text: "Nothing, to my way of thinking, is a better proof of a well-ordered mind than a man's ability to stop just where he is and pass some time in his own company.",
    author: "Seneca"
  },
  {
    text: "Hang on to your youthful enthusiasms—you'll be able to use them better when you're older.",
    author: "Seneca"
  },
  {
    text: "Man conquers the world by conquering himself.",
    author: "Zeno of Citium"
  },
  {
    text: "No person has the power to have everything they want, but it is in their power not to want what they don't have.",
    author: "Seneca"
  },
  {
    text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.",
    author: "Marcus Aurelius"
  }
]

export function getDailyQuote() {
  // Create a seed from today's date for consistent daily randomness
  const today = new Date()
  const dateString = today.toISOString().split('T')[0]
  let seed = 0
  for (let i = 0; i < dateString.length; i++) {
    seed = ((seed << 5) - seed) + dateString.charCodeAt(i)
    seed = seed & seed
  }
  // Use the seed to pick a random quote
  const index = Math.abs(seed) % stoicQuotes.length
  return stoicQuotes[index]
}
