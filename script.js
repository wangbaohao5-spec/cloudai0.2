const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const copyForm = document.querySelector('[data-copy-form]');
const resultText = document.querySelector('[data-result-text]');
const resultCard = document.querySelector('[data-result-card]');
const resultStatus = document.querySelector('[data-result-status]');
const copyButton = document.querySelector('[data-copy-button]');
const regenerateButton = document.querySelector('[data-regenerate-button]');

let lastPrompt = null;

const syncHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 8);
};

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

navToggle?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('is-open') ?? false;
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const platformIntros = {
  小红书: '适合小红书发布，开头抓住痛点，结尾引导收藏与互动。',
  抖音: '适合抖音短视频口播，节奏快、钩子强，方便直接拍摄。',
  微信公众号: '适合微信公众号推文，结构清晰，兼顾观点、价值和行动建议。',
  Instagram: 'Built for Instagram: concise, visual, hashtag-friendly, and easy to scan.',
  Facebook: 'Built for Facebook: community-oriented, benefit-led, and conversation-ready.'
};

const toneLines = {
  专业: ['以清晰逻辑建立信任', '突出能力、场景与结果', '让用户快速理解价值'],
  营销: ['放大核心卖点', '制造立即行动的理由', '用强 CTA 推动转化'],
  幽默: ['用轻松表达降低距离感', '把复杂功能讲得更有趣', '让用户会心一笑后记住你'],
  简洁: ['减少废话，直达重点', '用短句表达清楚价值', '让信息更利落、更好读']
};

const lengthGuides = {
  100: '短版文案：适合快速发布与测试创意。',
  300: '标准文案：适合完整介绍亮点、场景和行动号召。',
  500: '长版文案：适合深度说明背景、优势、使用方式和转化理由。'
};

const endings = [
  '现在就把想法交给 CloudAI，让内容生产进入高速模式。',
  '如果你也想少花时间反复打磨，不妨从今天的第一条文案开始试试。',
  '让创意不再卡壳，让每一次发布都更稳定、更好看、更有说服力。'
];

const pick = (items) => items[Math.floor(Math.random() * items.length)];

const buildCopy = ({ topic, platform, tone, length }) => {
  const lines = toneLines[tone];
  const intro = platformIntros[platform];
  const guide = lengthGuides[length];
  const paragraphs = [
    `【${platform}｜${tone}风格｜约${length}字】`,
    `${topic}，不只是一个新想法，而是一次让用户更快获得价值的机会。${intro}`,
    `${pick(lines)}：围绕「效率、质感、可信赖」三个关键词，把产品亮点转化为用户能立刻感知的收益。`,
    `${guide} 你可以从真实使用场景切入：用户遇到什么问题、为什么旧方法不够好、CloudAI 如何用 AI 文案与视觉能力提供更顺滑的解决方案。`,
    `${pick(endings)}`
  ];

  if (length === '100') {
    return paragraphs.slice(0, 4).join('\n\n');
  }

  if (length === '300') {
    return paragraphs.join('\n\n');
  }

  return [
    ...paragraphs,
    '建议搭配发布结构：一句强钩子 + 三个核心卖点 + 一个真实应用场景 + 明确行动号召。这样既能保持现代科技感，也能让用户知道下一步该做什么。',
    '可选标签：#AI文案 #智能创作 #效率工具 #CloudAI'
  ].join('\n\n');
};

const renderResult = (text) => {
  if (!resultText || !resultCard || !resultStatus || !copyButton || !regenerateButton) return;
  resultText.textContent = text;
  resultCard.classList.add('has-result');
  resultStatus.textContent = '已生成';
  copyButton.disabled = false;
  regenerateButton.disabled = false;
};

copyForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(copyForm);
  const topic = String(formData.get('topic') || '').trim();

  if (!topic) {
    resultStatus.textContent = '请输入主题';
    return;
  }

  lastPrompt = {
    topic,
    platform: String(formData.get('platform')),
    tone: String(formData.get('tone')),
    length: String(formData.get('length'))
  };

  renderResult(buildCopy(lastPrompt));
});

regenerateButton?.addEventListener('click', () => {
  if (lastPrompt) {
    renderResult(buildCopy(lastPrompt));
  }
});

const copyGeneratedText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const fallbackInput = document.createElement('textarea');
  fallbackInput.value = text;
  fallbackInput.setAttribute('readonly', '');
  fallbackInput.style.position = 'fixed';
  fallbackInput.style.opacity = '0';
  document.body.appendChild(fallbackInput);
  fallbackInput.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(fallbackInput);
  return copied;
};

copyButton?.addEventListener('click', async () => {
  if (!resultText?.textContent) return;

  const originalLabel = copyButton.textContent;

  try {
    const copied = await copyGeneratedText(resultText.textContent);
    copyButton.textContent = copied ? '已复制' : '复制失败';
  } catch (error) {
    copyButton.textContent = '复制失败';
  }

  setTimeout(() => {
    copyButton.textContent = originalLabel;
  }, 1400);
});
