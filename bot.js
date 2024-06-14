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
    const botName = (await bot.getMe()).username;
    const botFirstName = "nesimo";
   
    const regex_botname = RegExp('@'+botName, 'i')
    const regex_firstname = RegExp(botFirstName.toLowerCase(), 'i')
    logOutput("bot name: " + botName + "Name: "+ botFirstName);  
    logOutput(messagetime + " | ID: " + chatId +  " | Type: " + chatType + " | Author: " + Author +" | Message: " + userText);
   
    // Check if the message is not empty and the bot is mentioned
    isGroup = chatType == "group" || chatType == "supergroup";
    const shallReply = userText && ((chatType == "private" && userText) 
    || (isGroup && regex_botname.exec(userText.trim())) 
    || (isGroup && regex_firstname.exec(userText.trim().toLowerCase())));
   if (shallReply) {
      try {

        // messages: [{"role": "system", "content": "You are a helpful assistant."},
        //   {"role": "user", "content": "Who won the world series in 2020?"},
        //   {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
        //   {"role": "user", "content": "Where was it played?"}],

        // messages: [{ role: "system", content: userText }],
        // [{"role": "user", "content": "reply with a sarcastic in spanish in respose to the following message: " + userText},
        //   {role: "assistant", content: "I'm a helpful comedian."}

      //   messages=[
      //     {"role": "system", "content": "Respond as a pirate."},
      //     {"role": "user", "content": "What is it like to sail?"},
      //     {"role": "assistant", "content": "Rrrr, sailing be about adventure!"},
      //     {"role": "user", "content": "How do you do it?"}
      // ]

    //   messages=[
    //     {"role": "system", "content": "Eres una asistente útil que responde como un Venezolano."},
    //     {"role": "user", "content": userText}
    // ]
        
        const gptResponse = await openai.chat.completions.create({
          messages: [{ role: "system", content: "Eres una asistente útil que responde como un Venezolano." },
                    {"role": "user", "content": userText}
              ],
          model: "gpt-4o",
        });
        
        const replyText = gptResponse.choices[0].message.content.trim();
        logOutput(messagetime + " | ID: " + chatId +  " | Type" + chatType + " | Author: " + Author +" | Message: " + replyText);

        await bot.sendMessage(chatId, replyText);


      } catch (error) {
        logOutput(error);
        await bot.sendMessage(chatId, "Sorry, I couldn't process your request.");
      }
    }

  });


  


