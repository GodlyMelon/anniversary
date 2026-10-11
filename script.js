const scanner = document.getElementById('scanner');
const scanPage = document.getElementById('scanPage');
const surprise = document.getElementById('surprise');
const transition = document.getElementById('heartTransition');
const label = document.getElementById('progressLabel');
const hint = document.getElementById('hint');

let timer = null;
let progress = 0;
let finished = false;
let rainTimer = null;
let finaleTimer = null;

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

      // ให้หัวใจหมุนก่อนเริ่มเอฟเฟกต์รวบรวม
      finaleTimer = setTimeout(() => {
        transition.classList.add('grand-finale');

        launchLoveExplosion().then(() => {
          // เข้าหน้าเซอร์ไพรส์ทันทีที่เอฟเฟกต์จบ
          transition.classList.add('hidden');
          transition.classList.remove('grand-finale');
          transition.querySelector('.love-explosion')?.remove();

          surprise.classList.remove('hidden');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          startHeartRain();
        });
      }, 2200);
    }
  }, 100);
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

async function launchLoveExplosion() {
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

  // สร้างหัวใจกระจายทั่วหน้าจอ
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

  // รวมหัวใจเข้ากลาง ใช้เวลา 1.5 วินาที
  const gatherAnimations = particles.map(({ element, startX, startY }) => {
    const moveX = centerX - startX;
    const moveY = centerY - startY;

    return element.animate(
      [
        {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1
        },
        {
          transform: `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(.35)`,
          opacity: 1
        }
      ],
      {
        duration: 1500,
        easing: 'ease-in-out',
        fill: 'forwards'
      }
    );
  });

  await Promise.all(gatherAnimations.map(animation => animation.finished));

  // ล้างตำแหน่งจากแอนิเมชันเดิม แล้ววางหัวใจไว้ตรงกลางจริง ๆ
  gatherAnimations.forEach(animation => animation.cancel());

  particles.forEach(({ element }) => {
    element.style.left = `${centerX}px`;
    element.style.top = `${centerY}px`;
    element.style.transform = 'translate(-50%, -50%)';
    element.style.opacity = '0';
  });

  // ซ่อนหัวใจพักตรงกลาง 0.8 วินาที
  await new Promise(resolve => setTimeout(resolve, 800));

  // ระเบิดออกเป็นหัวใจ ไม่มีวงกลมพุ่งออกมา
  const maxDistance = Math.hypot(rect.width, rect.height);

  const burstAnimations = particles.map(({ element }) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = maxDistance * (0.7 + Math.random() * 0.7);
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;
    const rotation = Math.random() * 360 - 180;

    return element.animate(
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
          transform: `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) rotate(${rotation}deg) scale(.5)`,
          opacity: 0
        }
      ],
      {
        duration: 2600 + Math.random() * 500,
        delay: Math.random() * 150,
        easing: 'ease-out',
        fill: 'forwards'
      }
    );
  });

  await Promise.all(burstAnimations.map(animation => animation.finished));
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

  surprise.classList.add('hidden');
  transition.classList.add('hidden');
  transition.classList.remove('grand-finale');
  scanPage.classList.remove('hidden');
  scanner.classList.remove('scanning');

  label.textContent = 'แตะค้าง';
  hint.textContent = 'แตะค้างที่ลายนิ้วมือเพื่อเริ่มสแกน 💓';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('editToggle')?.addEventListener('click', () => {
  document.getElementById('dateForm')?.classList.toggle('hidden');
});