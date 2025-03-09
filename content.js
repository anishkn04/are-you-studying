const pageContent = document.body.innerText.slice(0, 5000); // Limit content to avoid long requests

chrome.runtime.sendMessage({
    type: "analyze",
    url: window.location.href,
    title: document.title
}, (response) => {
    console.log(response)
    if (!response.allowed) {
        document.body.innerHTML = "<h1 style='text-align:center;color:white;background-color:black;height:100%;'>🚫 Blocked! Stay Focused! 🚫</h1>";
    }
});
