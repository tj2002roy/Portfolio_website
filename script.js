// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// EmailJS init and handler
(function emailjsInit(){
	try {
		if (window.emailjs) {
			const form = document.getElementById('contactForm');
			if (form && form.dataset.emailjs === 'true') {
				const publicKey = form.dataset.emailjsPublicKey;
				const serviceId = form.dataset.emailjsService;
				const templateId = form.dataset.emailjsTemplate;
				if (publicKey) emailjs.init(publicKey);
				form.addEventListener('submit', async (e) => {
					e.preventDefault();
					const submitBtn = form.querySelector('button[type="submit"]');
					if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
					const formData = {
						name: form.name.value,
						email: form.email.value,
						subject: form.subject.value,
						message: form.message.value
					};
					try {
						await emailjs.send(serviceId, templateId, formData);
						alert('Message sent successfully!');
						form.reset();
					} catch (err) {
						console.error(err);
						alert('Failed to send message. Please try again later.');
					} finally {
						if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
					}
				});
			}
		}
	} catch (e) { console.warn('EmailJS init skipped', e); }
})();

// Set dynamic year
(function setYear(){ try{ var y=document.getElementById('year'); if(y){ y.textContent=new Date().getFullYear(); } }catch(e){} })();

// Reduced motion guard
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Theme setup
(function initTheme() {
	const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	const saved = localStorage.getItem('theme');
	const html = document.documentElement;
	const isDark = saved ? saved === 'dark' : prefersDark;
	html.classList.toggle('dark', isDark);
	const toggle = document.getElementById('themeToggle');
	if (toggle) toggle.setAttribute('aria-pressed', String(isDark));
})();

(function bindThemeToggle() {
	const toggle = document.getElementById('themeToggle');
	if (!toggle) return;
	toggle.addEventListener('click', () => {
		const html = document.documentElement;
		const newDark = !html.classList.contains('dark');
		html.classList.toggle('dark', newDark);
		toggle.setAttribute('aria-pressed', String(newDark));
		localStorage.setItem('theme', newDark ? 'dark' : 'light');
	});
})();

// Intro Photo behavior with GSAP timeline
(function introPhotoBehavior(){
	const intro = document.querySelector('.intro-photo');
	if (!intro) return;
	if (prefersReduced) { intro.remove(); return; }
	const bg = intro.querySelector('.intro-photo-bg');
	const img = intro.querySelector('.intro-photo-img');

	// Blur first, then photo
	intro.classList.add('active');
	requestAnimationFrame(() => {
		const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
		tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0)
			.fromTo(intro, { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.65 }, 0)
			.fromTo(img, { opacity: 0, scale: 0.99 }, { opacity: 1, scale: 1.02, duration: 0.8 }, 0.05);
	});

	let pinned = false;
	let hideTimeout = null;
	function fadePinLater() {
		// The actual fade-out duration is controlled via CSS (2.5s). This timeout starts the fade.
		if (hideTimeout) clearTimeout(hideTimeout);
		hideTimeout = setTimeout(() => { intro.classList.add('pin-hidden'); }, 1400);
	}
	function showPinIfTop() { if (window.scrollY === 0) intro.classList.remove('pin-hidden'); }

	function collapse() {
		if (pinned) return;
		pinned = true;
		const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
		tl.to(bg, { opacity: 0, duration: 0.4 }, 0)
			.to(intro, { y: -20, duration: 0.4 }, 0)
			.to(img, { scale: 1, duration: 0.5 }, 0)
			.add(() => { intro.classList.add('pinned'); fadePinLater(); });
	}

	const onFirstScroll = () => { if (window.scrollY > 10) { collapse(); window.removeEventListener('scroll', onFirstScroll); } };
	window.addEventListener('scroll', onFirstScroll, { passive: true });
	document.addEventListener('wheel', collapse, { once: true, passive: true });
	document.addEventListener('touchstart', collapse, { once: true, passive: true });

	// Re-appear pin only at very top
	window.addEventListener('scroll', showPinIfTop, { passive: true });
	window.addEventListener('hashchange', showPinIfTop);
})();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const target = document.querySelector(this.getAttribute('href'));
		if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
});

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
if (navToggle && navMenu) {
	navToggle.addEventListener('click', () => {
		navMenu.classList.toggle('active');
		navToggle.classList.toggle('active');
	});
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
	const navbar = document.querySelector('.navbar');
	if (!navbar) return;
	if (window.scrollY > 100) {
		navbar.style.background = 'rgba(255, 255, 255, 0.02)';
		navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
	} else {
		navbar.style.background = '';
		navbar.style.boxShadow = 'none';
	}
});

// Initial entrance animations if not reduced motion
if (!prefersReduced) {
	gsap.from('.hero-title .title-line', { duration: 1, y: 100, opacity: 0, stagger: 0.2, ease: 'power3.out' });
	gsap.from('.hero-subtitle', { duration: 1, y: 50, opacity: 0, delay: 0.5, ease: 'power3.out' });
	gsap.from('.hero-cta', { duration: 1, y: 50, opacity: 0, delay: 0.8, ease: 'power3.out' });
}

// Scroll-scrubbed animations
if (!prefersReduced) {
	gsap.to('.hero-aurora', { scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }, yPercent: -15, opacity: 0.7, ease: 'none' });
	const aurora = document.querySelector('.hero-aurora'); if (aurora) { document.addEventListener('mousemove', (e) => { const x = (e.clientX / window.innerWidth - 0.5) * 30; const y = (e.clientY / window.innerHeight - 0.5) * 20; aurora.style.transform = `translate3d(${x}px, ${y}px, 0)`; }); }
	gsap.utils.toArray('.work-item').forEach((card) => { gsap.fromTo(card, { y: 40, opacity: 0.0 }, { scrollTrigger: { trigger: card, start: 'top 85%', end: 'top 50%', scrub: true }, y: 0, opacity: 1, ease: 'power2.out' }); });
	gsap.utils.toArray('.timeline-item').forEach((item) => { gsap.fromTo(item, { y: 40, opacity: 0 }, { scrollTrigger: { trigger: item, start: 'top 90%', end: 'top 70%', scrub: true }, y: 0, opacity: 1, ease: 'power2.out' }); });
	gsap.to('.timeline::after', { scrollTrigger: { trigger: '.timeline', start: 'top 85%', end: 'bottom 10%', scrub: true }, css: { height: '100%' }, ease: 'none' });
}

// Section header reveals (once)
const sections = document.querySelectorAll('section');
sections.forEach(section => { const title = section.querySelector('.section-title'); const line = section.querySelector('.section-line'); if (title) { gsap.from(title, { scrollTrigger: { trigger: section, start: 'top 80%', once: true }, duration: 0.8, y: 50, opacity: 0, ease: 'power3.out' }); } if (line) { gsap.from(line, { scrollTrigger: { trigger: section, start: 'top 80%', once: true }, duration: 0.8, scaleX: 0, opacity: 0, delay: 0.2, ease: 'power3.out' }); } });

// About counters
function getNumeric(text) { const m = String(text).match(/\d+/); return m ? parseInt(m[0], 10) : 0; }
function animateCounter(element, target, duration = 1600) { let start = 0; const totalFrames = Math.max(1, Math.round(duration / 16)); let frame = 0; const step = target / totalFrames; function tick() { frame++; start = Math.min(target, Math.round(step * frame)); element.textContent = start + '+'; if (frame < totalFrames) requestAnimationFrame(tick); } tick(); }
const statsTriggered = new WeakSet();
const statsObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting && !statsTriggered.has(entry.target)) { const statNumber = entry.target.querySelector('.stat-number'); if (statNumber) { const target = getNumeric(statNumber.textContent); statNumber.textContent = '0+'; animateCounter(statNumber, target); statsTriggered.add(entry.target); } } }); }, { threshold: 0.6 });
document.querySelectorAll('.stat-item').forEach(stat => statsObserver.observe(stat));

// Contact section animations
if (!prefersReduced) {
	gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-content', start: 'top 80%', once: true }, duration: 1, x: -100, opacity: 0, ease: 'power3.out' });
	gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-content', start: 'top 80%', once: true }, duration: 1, x: 100, opacity: 0, ease: 'power3.out' });
}

// Loading state class
document.addEventListener('DOMContentLoaded', () => { document.body.classList.add('loaded'); });
