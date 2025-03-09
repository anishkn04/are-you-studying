chrome.runtime.onInstalled.addListener(() => {
    console.log("Are you studying? Extension Installed!");
});

// Function to analyze website content using locally hosted Ollama
async function analyzeWebsite(title, url) {
    try {
        const response = await fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3", // Replace with your model name
                prompt: `The title of a webpage is "${title}" and the URL is "${url}". Based on the title and URL, categorize the webpage as either "study-related" or "non-study-related". 
If the page is an educational resource, such as a tutorial or informative article, coding, software engineering, developing, categorize it as "study-related".
If the page is a general platform like YouTube, mark it as "study-related" only if the URL contains search terms or keywords related to educational topics (like a specific course, tutorial, or learning resource). 
Mark the homepage of YouTube or similar platforms as "non-study-related" due to the risk of distraction. Is the site study realted?
Only respond with either "yes" or "no".`,
                stream: false
            }),
            mode: "cors",
            cache: "no-store",
            "credentials": "omit"
        });

        if (!response.ok) {
            console.error("Error from Ollama:", response.status, response.statusText);
            return true; // Default to not-blocking unknown sites
        }

        const text = await response.text();
        console.log("Ollama response:", text);

        if (!text) {
            console.error("Empty response from Ollama");
            return false;
        }

        const data = JSON.parse(text);
        return data.response.toLowerCase().includes("yes");
    } catch (error) {
        console.error("Error analyzing website:", error);
        return true; // Default to not-blocking if AI fails
    }
}


// Listen for content script sending site content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "analyze") {
        analyzeWebsite(message.title, message.url).then(isStudyRelated => {
            sendResponse({ allowed: isStudyRelated });
        });
    }
    return true;
});
