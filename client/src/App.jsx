import { useState, useEffect, useCallback} from 'react';
import './App.css';
import Editor from "@monaco-editor/react";
import Navbar from './components/Navbar';
import Axios from 'axios';
import spinner from './spinner.svg';
import debounce from 'lodash/debounce';

function App() {
    const [userCode, setUserCode] = useState('');
    const [userLang, setUserLang] = useState("cpp");
    const [userTheme, setUserTheme] = useState("vs-dark");
    const [fontSize, setFontSize] = useState(20);
    const [userInput, setUserInput] = useState("");
    const [userOutput, setUserOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const options = {
        fontSize: fontSize,
    };

    const debouncedSaveCode = useCallback(
        debounce((code) => {
            localStorage.setItem("userCode", code);
        }, 1000),
        []
    );

    const debouncedSaveInput = useCallback(
        debounce((input) => {
            localStorage.setItem("userInput", input);
        }, 1000),
        []
    );


    useEffect(() => {
        const savedCode = localStorage.getItem("userCode");
        const savedLang = localStorage.getItem("userLang");
        const savedTheme = localStorage.getItem("userTheme");
        const savedFontSize = localStorage.getItem("fontSize");
        const savedInput = localStorage.getItem("userInput");

        if (savedCode) setUserCode(savedCode);
        if (savedLang) setUserLang(savedLang);
        if (savedTheme) setUserTheme(savedTheme);
        if (savedFontSize) setFontSize(Number(savedFontSize));
        if (savedInput) setUserInput(savedInput);
    }, []);

    useEffect(() => {
        debouncedSaveCode(userCode);
    }, [userCode, debouncedSaveCode]);

    useEffect(() => {
        localStorage.setItem("userLang", userLang);
    }, [userLang]);

    useEffect(() => {
        localStorage.setItem("userTheme", userTheme);
    }, [userTheme]);

    useEffect(() => {
        localStorage.setItem("fontSize", fontSize);
    }, [fontSize]);

    useEffect(() => {
        debouncedSaveInput(userInput);
    }, [userInput, debouncedSaveInput]);

    function compile() {
        setLoading(true);
        if (userCode === '') {
            setUserOutput("Error: Code cannot be empty");
            setLoading(false);
            return;
        }

        Axios.post(`http://localhost:8000/compile`, {
            code: userCode,
            language: userLang,
            input: userInput
        }).then((res) => {
            setUserOutput(res.data.stdout || res.data.stderr);
        }).catch((err) => {
            console.error(err);
            setUserOutput("Error: " + (err.response ? err.response.data.error : err.message));
        }).finally(() => {
            setLoading(false);
        });
    }

    function clearOutput() {
        setUserOutput("");
    }

    function clearCode() {
        setUserCode("");
        localStorage.removeItem("userCode")
    }

    function saveCode() {
        const fileName = prompt("Enter file name (with extension) or leave empty for default:");

        Axios.post("http://localhost:8000/save", {
            fileName: fileName?.trim() || null,
            code: userCode,
        })
            .then((response) => {
                setUserOutput(response.data.message);
            })
            .catch((error) => {
                console.error(error);
                setUserOutput("Error saving file: " + (error.response ? error.response.data.error : error.message));
            });
    }

    function loadCode(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                setUserCode(e.target.result);
            };
            reader.onerror = function (e) {
                setUserOutput("Error loading file: " + e.target.error.message);
            };
            reader.readAsText(file);
        }
    }

    return (
        <div className="App">
            <Navbar
                userLang={userLang} setUserLang={setUserLang}
                userTheme={userTheme} setUserTheme={setUserTheme}
                fontSize={fontSize} setFontSize={setFontSize}
            />
            <div className="main">
                <div className="left-container">
                    <Editor
                        options={options}
                        height="calc(100vh - 50px)"
                        width="100%"
                        theme={userTheme}
                        language={userLang}
                        defaultLanguage="cpp"
                        value={userCode}
                        onChange={(value) => setUserCode(value || '')}
                    />
                    <div className="editor-buttons">
                        <button className="clear1-btn" onClick={clearCode}>
                            Clear
                        </button>
                        <button className="run-btn" onClick={compile}>
                            Run
                        </button>
                        <button className="save-btn" onClick={saveCode}>
                            Save
                        </button>
                        <button
                            className="load-btn"
                            onClick={() => document.getElementById('load-code').click()}
                        >
                            Load
                        </button>
                        <input
                            type="file"
                            id="load-code"
                            style={{ display: "none" }}
                            onChange={loadCode}
                        />
                    </div>
                </div>
                <div className="right-container input-section">
                    <h4>Input:</h4>
                    <div className="input-box">
                        <textarea
                            id="code-inp"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                        ></textarea>
                    </div>
                    <h4>Output:</h4>
                    {loading ? (
                        <div className="spinner-box">
                            <img src={spinner} alt="Loading..." />
                        </div>
                    ) : (
                        <div className="output-box">
                            <pre>{userOutput}</pre>
                            <button
                                onClick={clearOutput}
                                className="clear2-btn"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
