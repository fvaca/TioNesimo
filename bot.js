require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require("openai");
const fs = require('node:fs/promises');

// Load environment variables
const token = process.env.TELEGRAM_TOKEN;
const openAiApiKey = process.env.OPENAI_API_KEY;
const LOGFILE = process.env.LOGFILE;

// Create a new Telegram bot
const bot = new TelegramBot(token, { polling: true });

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: openAiApiKey
  });

  
async function exists(f) {
    try {
      await fs.promises.stat(f);
      return true;
    } catch {
      return false;
    }
}

async function logOutput(msg) {
    try {
      const content = msg;
      if (exists(LOGFILE)) {
        await fs.appendFile(LOGFILE, content);
      } else {
        await fs.writeFile(LOGFILE, content);
      }      
      console.log(content);
    } catch (err) {
      console.log(err);
    }
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userText = msg.text;
    const Author = msg.from.first_name;
    const chatType = msg.chat.type;
    const chatTitle = msg.chat.title;
    const messagetime = msg.date;
    //console.log("Author: " + Author +" ||| "+ "Message: " + userText);
    logOutput(messagetime + " | ID: " + chatId +  " | Type" + chatType + " | Author: " + Author +" | Message: " + userText);
  
   // Check if the message is not empty
  if (userText) {
    try {

      // messages: [{"role": "system", "content": "You are a helpful assistant."},
      //   {"role": "user", "content": "Who won the world series in 2020?"},
      //   {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
      //   {"role": "user", "content": "Where was it played?"}],

      // messages: [{ role: "system", content: userText }],
      const gptResponse = await openai.chat.completions.create({
        messages: [{"role": "user", "content": "reply with a sarcastic response in spanish"},
                  {role: "assistant", content: "I'm a helpful comedian."}
        ],
        model: "gpt-4o",
      });
      
      const replyText = gptResponse.choices[0].message.content.trim();
      //console.log("Author: GPT"+" ||| "+ "Message: " + replyText)
      logOutput(messagetime + " | ID: " + chatId +  " | Type" + chatType + " | Author: " + Author +" | Message: " + replyText);

      await bot.sendMessage(chatId, replyText);
    } catch (error) {
      //console.error(error);
      logOutput(error);
      await bot.sendMessage(chatId, "Sorry, I couldn't process your request.");
    }
  }

  });


  


