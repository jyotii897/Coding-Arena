import React from 'react';
import Select from 'react-select';
import './Navbar.css';

const Navbar = ({ userLang, setUserLang, userTheme, setUserTheme, fontSize, setFontSize }) => {
    const languages = [
        { value: "c", label: "C" },
        { value: "cpp", label: "C++" },
        { value: "python", label: "Py" },
        { value: "java", label: "Java" },
        { value: "javascript", label: "JavaScript" },
        { value: "typescript", label: "TypeScript" },
        { value: "rust", label: "Rust" },
        { value: "go", label: "Go" },
        { value: "php", label: "PHP" },
        { value: "ruby", label: "Ruby" }
    ];

    const themes = [
        { value: "vs-dark", label: "Dark" },
        { value: "vs", label: "Light" },
        { value: "hc-black", label: "High Contrast" }
    ];

    function clearSavedSettings() {
        localStorage.removeItem('savedLang');
        localStorage.removeItem('savedTheme');
        localStorage.removeItem('savedFontSize');
        
        setUserLang('cpp');
        setUserTheme('vs-dark');
        setFontSize(20);
    }

    return (
        <div className="navbar">
            <h1 className="logo">Coding Arena</h1>
            <Select 
                options={languages} 
                value={languages.find(lang => lang.value === userLang)}
                onChange={(e) => setUserLang(e.value)}
                placeholder={userLang} 
            />
            <Select 
                options={themes} 
                value={themes.find(theme => theme.value === userTheme)}
                onChange={(e) => setUserTheme(e.value)}
                placeholder={userTheme} 
            />
            <label className="slider">Font Size</label>
            <input 
                type="range" 
                min="18" 
                max="30"
                value={fontSize} 
                step="0.09"
                onChange={(e) => { setFontSize(Number(e.target.value)) }} 
            />
            <button class="reset" onClick={clearSavedSettings}>Reset Settings</button>
        </div>
    );
};

export default Navbar;
