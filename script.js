const scanner = document.getElementById('scanner');
const scanPage = document.getElementById('scanPage');
const surprise = document.getElementById('surprise');
const transition = document.getElementById('heartTransition');
const label = document.getElementById('progressLabel');
const hint = document.getElementById('hint');

const loveQuestionText = document.getElementById('loveQuestionText');
const loveAnswerButtons = document.getElementById('loveAnswerButtons');
const loveYes = document.getElementById('loveYes');
const loveNo = document.getElementById('loveNo');

let timer = null;
let progress = 0;
let finished = false;
let rainTimer = null;
let finaleTimer = null;
let noClickCount = 0;

function beginScan() {
  if (finished || timer) return;

  scanner.classList.add('scanning');
  hint.textContent = 'กำลังสแกนความรัก…';
  progress = 0;
  label.textContent = '0%';

  timer = setInterval(() => {
    progress = Math.min(100, progress + 5);
    label.textContent = progress + '%';

    if (progress >= 100) {
      clearInterval(timer);
      timer = null;
      finished = true;

      scanPage.classList.add('hidden');
      transition.classList.remove('hidden');

      // ให้หัวใจหมุนก่อนเริ่มรวบรวม
      finaleTimer = setTimeout(() => {
        transition.classList.add('grand-finale');
        launchLoveExplosion(showSurprise);
      }, 2200);
    }
  }, 100);
}

function showSurprise() {
  transition.classList.add('hidden');
  transition.classList.remove('grand-finale');
  transition.querySelector('.love-explosion')?.remove();

  surprise.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  startHeartRain();
}

function stopScan() {
  if (!timer) return;

  clearInterval(timer);
  timer = null;

  if (progress < 100) {
    scanner.classList.remove('scanning');
    progress = 0;
    label.textContent = 'แตะค้าง';
    hint.textContent = 'แตะค้างที่ลายนิ้วมือเพื่อเริ่มสแกน 💓';
  }
}

function launchLoveExplosion(onFinished) {
  transition.querySelector('.love-explosion')?.remove();

  const layer = document.createElement('div');
  layer.className = 'love-explosion';
  layer.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 99999;
    overflow: hidden;
    pointer-events: none;
  `;
  transition.appendChild(layer);

  const rect = transition.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const symbols = ['💖', '💕', '💗', '💓', '💞', '💘', '❤️', '💝', '🩷'];
  const particles = [];
  const gatherAnimations = [];

  // สร้างหัวใจกระจายทั่วจอ
  for (let i = 0; i < 140; i++) {
    const particle = document.createElement('span');
    const startX = Math.random() * rect.width;
    const startY = Math.random() * rect.height;
    const size = 16 + Math.random() * 24;

    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.cssText = `
      position: absolute;
      left: ${startX}px;
      top: ${startY}px;
      font-size: ${size}px;
      line-height: 1;
      opacity: 1;
      transform: translate(-50%, -50%);
      will-change: transform, opacity;
    `;

    layer.appendChild(particle);
    particles.push({ element: particle, startX, startY });
  }

  let gatherFinishedCount = 0;
  let gatherHandled = false;
  let gatherFallback = null;

  function startOneSecondPause() {
    if (gatherHandled) return;
    gatherHandled = true;

    if (gatherFallback) clearTimeout(gatherFallback);

    // รอให้เบราว์เซอร์วาดเฟรมสุดท้ายก่อนเริ่มนับพัก 1 วินาที
    requestAnimationFrame(() => {
      gatherAnimations.forEach(animation => animation.cancel());

      particles.forEach(({ element }) => {
        element.style.left = `${centerX}px`;
        element.style.top = `${centerY}px`;
        element.style.transform = 'translate(-50%, -50%)';
        element.style.opacity = '0';
      });

      setTimeout(startBurst, 1000);
    });
  }

  // รวมหัวใจเข้ากลาง ใช้เวลา 1.5 วินาที
  particles.forEach(({ element, startX, startY }) => {
    const moveX = centerX - startX;
    const moveY = centerY - startY;

    const animation = element.animate(
      [
        {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1
        },
        {
          transform:
            `translate(-50%, -50%) translate(${moveX}px, ${moveY}px) scale(.35)`,
          opacity: 1
        }
      ],
      {
        duration: 1500,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    );

    animation.onfinish = () => {
      gatherFinishedCount++;

      if (gatherFinishedCount === particles.length) {
        startOneSecondPause();
      }
    };

    gatherAnimations.push(animation);
  });

  // เผื่อเบราว์เซอร์ไม่ส่งเหตุการณ์จบแอนิเมชัน
  gatherFallback = setTimeout(startOneSecondPause, 2000);

  function startBurst() {
    const maxDistance = Math.hypot(rect.width, rect.height);
    let burstFinishedCount = 0;
    let burstHandled = false;
    let burstFallback = null;

    function finishBurst() {
      if (burstHandled) return;
      burstHandled = true;

      if (burstFallback) clearTimeout(burstFallback);
      onFinished();
    }

    // ระเบิดออกเป็นหัวใจ ไม่มีวงกลมพุ่งออกมา
    particles.forEach(({ element }) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = maxDistance * (0.7 + Math.random() * 0.7);
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
      const rotation = Math.random() * 360 - 180;
      const delay = Math.random() * 150;

      const animation = element.animate(
        [
          {
            transform: 'translate(-50%, -50%) scale(.2)',
            opacity: 0
          },
          {
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 1,
            offset: 0.12
          },
          {
            transform:
              `translate(-50%, -50%) translate(${moveX}px, ${moveY}px) rotate(${rotation}deg) scale(.5)`,
            opacity: 0
          }
        ],
        {
          duration: 2600 + Math.random() * 500,
          delay,
          easing: 'ease-out',
          fill: 'forwards'
        }
      );

      animation.onfinish = () => {
        burstFinishedCount++;

        if (burstFinishedCount === particles.length) {
          finishBurst();
        }
      };
    });

    // กันค้างไว้ เผื่อเบราว์เซอร์ไม่ส่งเหตุการณ์จบแอนิเมชัน
    burstFallback = setTimeout(finishBurst, 3500);
  }
}

function startHeartRain() {
  const box = document.getElementById('heartRain');
  if (!box) return;

  if (rainTimer) clearInterval(rainTimer);
  box.replaceChildren();

  function makeHeart() {
    if (surprise.classList.contains('hidden')) return;

    const heart = document.createElement('span');
    heart.className = 'rain-heart';
    heart.textContent = Math.random() > 0.5 ? '♥' : '♡';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = 18 + Math.random() * 26 + 'px';
    heart.style.setProperty('--dur', 5 + Math.random() * 3 + 's');
    heart.style.setProperty('--delay', '0s');

    box.appendChild(heart);
    setTimeout(() => heart.remove(), 9000);
  }

  for (let i = 0; i < 50; i++) {
    setTimeout(makeHeart, i * 60);
  }

  rainTimer = setInterval(makeHeart, 110);
}

scanner.addEventListener('pointerdown', event => {
  event.preventDefault();
  beginScan();

  try {
    scanner.setPointerCapture(event.pointerId);
  } catch (error) {
    // ถ้าจับนิ้วไม่ได้ ก็ยังเริ่มสแกนต่อ
  }
});

scanner.addEventListener('pointerup', stopScan);
scanner.addEventListener('pointercancel', stopScan);
scanner.addEventListener('lostpointercapture', stopScan);

loveYes?.addEventListener('click', event => {
  event.preventDefault();

  if (loveQuestionText) {
    loveQuestionText.textContent = 'เค้าก็ร้ากกเบบี๋มากกๆเหมือนกานน';
  }

  if (loveAnswerButtons) {
    loveAnswerButtons.hidden = true;
  }
});

loveNo?.addEventListener('click', event => {
  event.preventDefault();
  noClickCount++;

  if (noClickCount === 1) {
    loveNo.textContent = 'ไม่รักจริงหรอ';
  } else if (noClickCount === 2) {
    loveNo.textContent = 'แน่ใจหรอ';
  } else {
    loveNo.hidden = true;
  }
});

document.getElementById('again')?.addEventListener('click', () => {
  if (timer) clearInterval(timer);
  if (rainTimer) clearInterval(rainTimer);
  if (finaleTimer) clearTimeout(finaleTimer);

  timer = null;
  rainTimer = null;
  finaleTimer = null;

  document.getElementById('heartRain')?.replaceChildren();
  transition.querySelector('.love-explosion')?.remove();

  finished = false;
  progress = 0;
  noClickCount = 0;

  surprise.classList.add('hidden');
  transition.classList.add('hidden');
  transition.classList.remove('grand-finale');
  scanPage.classList.remove('hidden');
  scanner.classList.remove('scanning');

  if (loveQuestionText) {
    loveQuestionText.textContent = 'เบบี๋ร้ากกเค้าม้ายย';
  }
  if (loveAnswerButtons) {
    loveAnswerButtons.hidden = false;
  }
  if (loveYes) {
    loveYes.hidden = false;
    loveYes.textContent = 'ร้ากกมากกๆ';
  }
  if (loveNo) {
    loveNo.hidden = false;
    loveNo.textContent = 'ไม่รัก';
  }

  label.textContent = 'แตะค้าง';
  hint.textContent = 'แตะค้างที่ลายนิ้วมือเพื่อเริ่มสแกน 💓';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('editToggle')?.addEventListener('click', () => {
  document.getElementById('dateForm')?.classList.toggle('hidden');
});