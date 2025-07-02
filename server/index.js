const express = require("express");
const cors = require("cors");
const Axios = require("axios");
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

const languageMap = {
    "c": { language: "c", version: "10.2.0" },
    "cpp": { language: "c++", version: "10.2.0" },
    "python": { language: "python", version: "3.10.0" },
    "java": { language: "java", version: "15.0.2" }
};

app.post("/compile", (req, res) => {
    let code = req.body.code;
    let language = req.body.language;
    let input = req.body.input;

    const normalizedLanguage = language.toLowerCase();
    if (!languageMap[normalizedLanguage]) {
        return res.status(400).send({ error: "Unsupported language" });
    }

    let data = {
        "language": languageMap[language].language,
        "version": languageMap[language].version,
        "files": [
            {
                "name": "main",
                "content": code
            }
        ],
        "stdin": input
    };

    let config = {
        method: 'post',
        url: 'https://emkc.org/api/v2/piston/execute',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    Axios(config)
        .then((response) => {
            res.json(response.data.run);
        }).catch((error) => {
            console.error(error);
            res.status(500).send({ error: "Something went wrong" });
        });
});


const fs = require("fs");
const path = require("path");

const savedFilesDir = path.join(__dirname, "saved_files");

try {
    if (!fs.existsSync(savedFilesDir)) {
        fs.mkdirSync(savedFilesDir);
        console.log("'saved_files' folder created successfully.");
    }
} catch (err) {
    console.error("Error creating 'saved_files' folder:", err);
}

app.post("/save", (req, res) => {
    const { fileName, code } = req.body;

    if (!code) {
        return res.status(400).send({ error: "Code content is required" });
    }

    const finalFileName = fileName || `default_${Date.now()}.txt`;

    const filePath = path.join(savedFilesDir, finalFileName);

    fs.writeFile(filePath, code, "utf8", (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: "Error saving file" });
        }

        res.send({ message: `File saved successfully as ${finalFileName}` });
    });
});

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
