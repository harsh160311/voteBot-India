// VoteBot India — Frontend Script

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

const topicsHi = [
  { emoji: '🗳️', label: 'मतदान कैसे करें', query: 'भारत में मतदान की प्रक्रिया क्या है? चरण दर चरण बताएं।' },
  { emoji: '⚡', label: 'EVM और VVPAT', query: 'EVM (इलेक्ट्रॉनिक वोटिंग मशीन) क्या है और यह कैसे काम करती है?' },
  { emoji: '🪪', label: 'मतदाता पहचान पत्र', query: 'मतदाता के रूप में पंजीकरण कैसे करें और भारत में मतदाता पहचान पत्र कैसे प्राप्त करें?' },
  { emoji: '🏛️', label: 'चुनाव आयोग', query: 'भारत का चुनाव आयोग क्या है और वह क्या करता है?' },
  { emoji: '📜', label: 'आदर्श आचार संहिता', query: 'भारतीय चुनावों में आदर्श आचार संहिता क्या है?' },
  { emoji: '🏟️', label: 'लोकसभा / राज्यसभा', query: 'लोकसभा और राज्यसभा चुनाव क्या हैं?' },
  { emoji: '⚖️', label: 'आरक्षण प्रणाली', query: 'भारतीय चुनावों में आरक्षण प्रणाली क्या है?' },
  { emoji: '📊', label: 'मतगणना', query: 'भारत में चुनाव परिणाम कैसे गिने और घोषित किए जाते हैं?' },
];

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

  // Update topic buttons if Hindi
  if (lang === 'hi') {
    const chips = document.querySelectorAll('.topic-chip');
    chips.forEach((chip, i) => {
      if (topicsHi[i]) {
        chip.querySelector('span').textContent = topicsHi[i].label;
        chip.setAttribute('onclick', `askTopic('${topicsHi[i].query}')`);
      }
    });
  } else {
    // Restore English topics
    const topicsEn = [
      { emoji: '🗳️', label: 'How to Vote', query: 'How does voting work in India? Step by step process.' },
      { emoji: '⚡', label: 'EVM & VVPAT', query: 'What is EVM (Electronic Voting Machine) and how does it work?' },
      { emoji: '🪪', label: 'Voter ID / EPIC', query: 'How do I register as a voter and get Voter ID card in India?' },
      { emoji: '🏛️', label: 'Election Commission', query: 'What is the Election Commission of India and what does it do?' },
      { emoji: '📜', label: 'Model Code', query: 'What is Model Code of Conduct in Indian elections?' },
      { emoji: '🏟️', label: 'Lok Sabha / RS', query: 'What are Lok Sabha and Rajya Sabha elections?' },
      { emoji: '⚖️', label: 'Reservation', query: 'What is the reservation system in Indian elections?' },
      { emoji: '📊', label: 'Vote Counting', query: 'How are election results counted and declared in India?' },
    ];
    const chips = document.querySelectorAll('.topic-chip');
    chips.forEach((chip, i) => {
      if (topicsEn[i]) {
        chip.querySelector('span').textContent = topicsEn[i].label;
        chip.setAttribute('onclick', `askTopic('${topicsEn[i].query}')`);
      }
    });
  }
}

function askTopic(query) {
  document.querySelector('.chat-textarea').value = query;
  sendMessage();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function addMessage(role, content) {
  const window = document.getElementById('chat-window');

  const msg = document.createElement('div');
  msg.className = `msg ${role === 'bot' ? 'bot-msg' : 'user-msg'}`;

  if (role === 'bot') {
    msg.innerHTML = `
      <div class="bot-avatar">☸</div>
      <div class="msg-bubble">${formatText(content)}</div>
    `;
  } else {
    msg.innerHTML = `<div class="msg-bubble">${escapeHtml(content)}</div>`;
  }

  window.appendChild(msg);
  window.scrollTop = window.scrollHeight;
  return msg;
}

function showTyping() {
  const window = document.getElementById('chat-window');
  const typing = document.createElement('div');
  typing.className = 'msg bot-msg';
  typing.id = 'typing-indicator';
  typing.innerHTML = `
    <div class="bot-avatar">☸</div>
    <div class="msg-bubble">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  window.appendChild(typing);
  window.scrollTop = window.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function formatText(text) {
  // Bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Bullet points
  text = text.replace(/^[-•]\s(.+)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  // Line breaks
  text = text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  return text;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendMessage() {
  if (isLoading) return;

  const textarea = document.querySelector('.chat-textarea');
  const message = textarea.value.trim();
  if (!message) return;

  textarea.value = '';
  textarea.style.height = 'auto';
  isLoading = true;

  document.getElementById('send-btn').disabled = true;

  // Add user message
  addMessage('user', message);
  chatHistory.push({ role: 'user', content: message });

  // Show typing
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
  document.getElementById('send-btn').disabled = false;
  textarea.focus();
}
