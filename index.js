const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


const openaiKey = process.env.OPENAI_KEY;
// console.log(openaiKey);
const generate_image_apikey = process.env.IMAGE_OPENAI_KEY;

app.post("/generate", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({
            success: false,
            message: "prompt required"
        });
        return;
    }
    const reqUrl = "https://api.openai.com/v1/images/generations";
    const reqBody = {
        prompt,
        n: 2,
        size: "1024x1024"
    };

    try {
        const response = await axios.post(reqUrl, reqBody, {
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${generate_image_apikey}`,
            }
        });
        console.log(response.data.data);
        const ans=response.data.data;
        // const data = response.data;
        // const answer = data.choices[0].text.trim();
        // console.log(answer);

        res.status(200).json({
            success: true,
            ans,
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "something went wrong",
            error: e,
        });
    }



})

app.post("/chat", async (req, res) => {
    const { messages } = req.body;
    console.log(messages);

    if (!Array.isArray(messages) || !messages.length) {
        res.status(400).json({
            success: false,
            message: "messages required"
        });
        return;
    }

    let requiredPrompt = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n" +
        messages.map((item) => `${item.from == "ai" ? "AI: " : "Human: "} ${item.text}`).join('\n') + "\nAI: ";
    console.log(requiredPrompt);

    const reqUrl = "https://api.openai.com/v1/completions";
    const reqBody = {
        model: "text-davinci-003",
        prompt: requiredPrompt,
        max_tokens: 200,
        temperature: 0.6,

    };
    try {
        const response = await axios.post(reqUrl, reqBody, {
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${openaiKey}`,
            }
        });
        // console.log("request lagi...");
        // console.log(response);
        const data = response.data;
        const answer = data.choices[0].text.trim();
        // console.log(answer);

        res.status(200).json({
            success: true,
            answer,
        });
    }
    catch (e) {
        // console.log(e);
        res.status(500).json({
            success: false,
            message: e.message || "something went wrong",
            error: e,
        });
    }

});

app.listen(5000, () => {
    console.log("Server is listening at port 5000");
})
