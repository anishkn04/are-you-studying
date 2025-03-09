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
For vague information like YouTube (not any exact video), Google Drive (No specific file), categorize it as "study-related" if the user is searching for educational content (e.g., using keywords related to courses, tutorials, or lessons). 
If the page is likely to contain non-educational, entertainment-based content, categorize it as "non-study-related" to minimize distractions.
Give back the response in a json format as given: 
{
"content": "Basic overview of what kind of content the page might have",
"study": true or false
} STRICTLY JSON FORMAT, nothing else`,
                stream: false
            }),
            mode: "cors",
            cache: "no-store",
            "credentials": "omit"
        });

        if (!response.ok) {
            console.error("Error from Ollama:", response.status, response.statusText);
            return {
                content: "Error from Ollama, no idea",
                study: true
            }; // Default to not-blocking unknown sites
        }

        const text = await response.text();
        console.log("Ollama response:", text);

        if (!text) {
            console.error("Empty response from Ollama");
            return {
                content: "No response from Ollama, no idea",
                study: true
            };
        }

        const data = JSON.parse(text);
        return JSON.parse(data.response);
    } catch (error) {
        console.error("Error analyzing website:", error);
        return {
            content: error,
            study: true
        }; // Default to not-blocking if AI fails
    }
}


// Listen for content script sending site content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "analyze") {
        analyzeWebsite(message.title, message.url).then(isStudyRelated => {
            sendResponse({ res: isStudyRelated });
        });
    }
    return true;
});
