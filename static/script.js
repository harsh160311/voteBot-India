// VoteBot India — Frontend Script (FIXED VERSION)

let currentLang = 'en';
let chatHistory = [];
let isLoading = false;

const translations = {
  en: {
    sidebarTitle: 'Quick Topics',
    infoText: 'Ask me anything about Indian elections — in English or Hindi!',
    placeholder: 'Ask about elections... (English or Hindi)',
    disclaimer: 'VoteBot is neutral and educational. It does not support any political party.',
    welcomeText: 'Jai Hind! 🇮🇳 I\'m <strong>VoteBot India</strong> — your AI guide to understanding Indian elections.<br><br>Ask me about voting, EVM, Voter ID, Election Commission, or any election topic. You can also ask in <strong>Hindi!</strong>',
    errorMsg: 'Sorry, something went wrong. Please try again.',
    thinking: 'Thinking...',
  },
  hi: {
    sidebarTitle: 'त्वरित विषय',
    infoText: 'मुझसे भारतीय चुनावों के बारे में कुछ भी पूछें!',
    placeholder: 'चुनाव के बारे में पूछें...',
    disclaimer: 'VoteBot तटस्थ और शैक्षिक है। यह किसी राजनीतिक दल का समर्थन नहीं करता।',
    welcomeText: 'जय हिंद! 🇮🇳 मैं <strong>VoteBot India</strong> हूं — भारतीय चुनावों को समझने में आपका AI गाइड।<br><br>मुझसे मतदान, EVM, मतदाता पहचान पत्र, चुनाव आयोग या किसी भी चुनाव विषय के बारे में पूछें।',
    errorMsg: 'माफ़ करें, कुछ गलत हुआ। कृपया फिर से प्रयास करें।',
    thinking: 'सोच रहा हूं...',
  }
};

// ========================
// INIT (IMPORTANT FIX)
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-btn");
  const textarea = document.querySelector(".chat-textarea");

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  if (textarea) {
    textarea.addEventListener("keydown", handleKey);
    textarea.addEventListener("input", autoResize);
  }

  console.log("VoteBot JS Loaded Successfully ✅");
});

// ========================
// LANGUAGE SWITCH
// ========================
function setLang(lang) {
  currentLang = lang;
  const t = translations[lang];

  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-hi').classList.toggle('active', lang === 'hi');

  document.getElementById('sidebar-title').textContent = t.sidebarTitle;
  document.getElementById('info-text').textContent = t.infoText;
  document.getElementById('disclaimer').textContent = t.disclaimer;
  document.querySelector('.chat-textarea').placeholder = t.placeholder;
  document.getElementById('welcome-text').innerHTML = t.welcomeText;
}

// ========================
// QUICK TOPIC
// ========================
function askTopic(query) {
  document.querySelector('.chat-textarea').value = query;
  sendMessage();
}

// ========================
// KEYBOARD SUPPORT
// ========================
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ========================
// AUTO RESIZE TEXTAREA
// ========================
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ========================
// ADD MESSAGE
// ========================
function addMessage(role, content) {
  const windowEl = document.getElementById('chat-window');

  const msg = document.createElement('div');
  msg.className = `msg ${role === 'bot' ? 'bot-msg' : 'user-msg'}`;

  msg.innerHTML = role === 'bot'
    ? `
      <div class="bot-avatar">☸</div>
      <div class="msg-bubble">${formatText(content)}</div>
    `
    : `<div class="msg-bubble">${escapeHtml(content)}</div>`;

  windowEl.appendChild(msg);
  windowEl.scrollTop = windowEl.scrollHeight;

  return msg;
}

// ========================
// TYPING INDICATOR
// ========================
function showTyping() {
  const windowEl = document.getElementById('chat-window');

  const typing = document.createElement('div');
  typing.id = 'typing-indicator';
  typing.className = 'msg bot-msg';

  typing.innerHTML = `
    <div class="bot-avatar">☸</div>
    <div class="msg-bubble">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  windowEl.appendChild(typing);
  windowEl.scrollTop = windowEl.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ========================
// TEXT FORMAT
// ========================
function formatText(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/^[-•]\s(.+)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  text = text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  return text;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ========================
// MAIN SEND FUNCTION (FIXED)
// ========================
async function sendMessage() {
  if (isLoading) return;

  const textarea = document.querySelector('.chat-textarea');
  const message = textarea.value.trim();

  if (!message) return;

  textarea.value = '';
  textarea.style.height = 'auto';

  isLoading = true;

  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.disabled = true;

  addMessage('user', message);
  chatHistory.push({ role: 'user', content: message });

  showTyping();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language: currentLang,
        history: chatHistory.slice(-8)
      })
    });

    const data = await response.json();

    removeTyping();

    const reply = data.reply || translations[currentLang].errorMsg;

    addMessage('bot', reply);
    chatHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    removeTyping();
    addMessage('bot', translations[currentLang].errorMsg);
  }

  isLoading = false;

  if (sendBtn) sendBtn.disabled = false;

  textarea.focus();
}
