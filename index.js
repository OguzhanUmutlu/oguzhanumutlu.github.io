const cursor = document.querySelector(".cursor");
const particles = document.querySelector(".particles");
const sections = document.querySelectorAll("section");
const skillList = document.querySelector(".skill-list");
const skillOptions = document.querySelector(".skill-options");
const repositories = document.querySelector(".repositories");
const textCursor = document.querySelector(".text-cursor");
const REPO_AMOUNT = 11;
const USERNAME = "OguzhanUmutlu";
const mouse = {x: Infinity, y: Infinity, down: false};
let isMobile = checkMobile();
let sectionMoveEnd = 0;
let section = 0;
let projectScroll = 0;
let repoTouch = false;
let hasRendered = false;
const mobileStyle = document.createElement("link");
mobileStyle.rel = "stylesheet";
mobileStyle.type = "text/css";
mobileStyle.href = "./mobile.css";
const query = new URLSearchParams(location.search);

const SkillsMap = {
    Languages: [
        "C", "C++", "C#", "Rust", "Java", "PHP", "JavaScript", "Python", "Shell", "Node.JS", "Bun"
    ],
    Databases: [
        "SQLite", "Mongo"
    ],
    Frameworks: [
        "Electron", "JavaFX", "React", "ReactNative", "three.js", "matter.js", "p5.js"
    ],
    Tools: [
        "JetBrains", "VSC", "Git", "Linux", "Windows"
    ]
};

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function renderTracker() {
    requestAnimationFrame(renderTracker);
    hasRendered = true;
}

function loadSkills() {
    const skills = [];

    skillOptions.children[0].onclick = () => toggleSkills(() => true);

    for (const k in SkillsMap) {
        for (const skill of SkillsMap[k]) {
            skills.push({type: k, value: skill});
        }
        const div = document.createElement("div");
        div.innerText = k;
        div.onclick = () => {
            toggleSkills(el => el.getAttribute("data-skill") === k);
        };
        skillOptions.appendChild(div);
    }

    for (let i = 0; i < skills.length; i++) {
        const j = Math.floor(Math.random() * skills.length);
        const tmp = skills[i];
        skills[i] = skills[j];
        skills[j] = tmp;
    }

    for (const skill of skills) {
        const div = document.createElement("div");
        div.innerText = skill.value;
        div.setAttribute("data-skill", skill.type);
        div.classList.add("sl-" + Math.floor(Math.random() * 4));
        skillList.appendChild(div);
    }
}

function toggleSkills(show) {
    skillList.childNodes.forEach(skill => {
        skill.style.opacity = show(skill) ? "1" : "0";
    });
}

function checkMobile() {
    return innerWidth < innerHeight;
}

function onSectionMove(movement, force = false) { // movement is -1 or 1
    if (sectionMoveEnd > Date.now() && !force) return;
    const oldSection = sections[section];
    const oS = section;
    section += movement;
    if (section < 0 || section >= sections.length) return section = oS;
    document.querySelectorAll(".scroll-more").forEach(el => el.style.opacity = "0");
    const time = 1000;
    sectionMoveEnd = Date.now() + time;
    const newSection = sections[section];
    if (movement === 1) {
        oldSection.style.translate = `-${oS * 100}% -100%`;
        oldSection.style.scale = "0";
        newSection.style.translate = `-${section * 100}% 0`;
        newSection.style.scale = "1";
    } else {
        oldSection.style.translate = `-${section * 100}% 0`;
        oldSection.style.scale = "0";
        newSection.style.translate = `-${section * 100}% 0`;
        newSection.style.scale = "1";
    }
    applyForceToParticles(0, movement * 100, Infinity);
    setTimeout(() => {
        document.querySelectorAll(".scroll-more").forEach(el => el.style.opacity = "0.5");
    }, time * 1.2);
}

function addParticle() {
    const particle = document.createElement("div");

    const time = (Math.random() + 1) * 2000;
    const x = scrollX + Math.random() * (innerWidth - 32);
    const y = scrollY + Math.random() * (innerHeight - 32);
    const dx = Math.random() * 400 - 200;
    const dy = Math.random() * 400 - 200;
    const size = (Math.random() + 1) * 8;

    particle.classList.add("particle");

    if (Math.random() < 0.001) {
        particle.classList.add("particle-img");
    }

    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.width = particle.style.height = size + "px";
    particle.style.animationDuration = time + "ms";

    particles.appendChild(particle);

    setTimeout(() => {
        particle.style.setProperty("--dx", dx + "px");
        particle.style.setProperty("--dy", dy + "px");
    }, 50);

    setTimeout(() => particle.remove(), time);
}

function applyForceToParticles(fx, fy, distSq) {
    if (!hasRendered) return;
    hasRendered = false;
    particles.childNodes.forEach(particle => {
        const rect = particle.getBoundingClientRect();
        const x = rect.x;
        const y = rect.y;
        const distanceSquared = (x - mouse.x) ** 2 + (y - mouse.y) ** 2;
        if (distanceSquared < distSq) {
            const dx = parseFloat(particle.style.getPropertyValue("--dx").slice(0, -2)) + fx * 10;
            const dy = parseFloat(particle.style.getPropertyValue("--dy").slice(0, -2)) + fy * 10;

            particle.style.setProperty("--dx", dx + "px");
            particle.style.setProperty("--dy", dy + "px");
        }
    });
}

function onMouseMove(x, y) {
    cursor.style.translate = (x - cursor.offsetWidth / 2) + "px "
        + (y - cursor.offsetHeight / 2) + "px";
    cursor.style.opacity = "1";
    let hr = hasRendered;
    if (isFinite(mouse.x)) {
        const boost = mouse.down && !isMobile ? 2 * 2 : 1;
        applyForceToParticles((x - mouse.x) * boost, (y - mouse.y) * boost, isMobile ? 100 * 100 : 200 * 200);
    }
    if (hr && repoTouch) {
        const mov = (x - mouse.x) * 2;
        projectScroll += mov;
        const max = (repositories.getBoundingClientRect().width - innerWidth) / 2 + 30;
        if (Math.abs(projectScroll) > max) projectScroll = max * (projectScroll > 0 ? 1 : -1);
        repositories.style.translate = projectScroll + "px";
    }
    mouse.x = x;
    mouse.y = y;
}

function onMouseDown() {
    cursor.style.opacity = "0.5";
    cursor.style.scale = "0.8";
    mouse.down = true;
}

function onMouseUp() {
    cursor.style.opacity = "1";
    cursor.style.scale = "1";
    mouse.down = false;
    repoTouch = false;
}

const loadRepositories = async () => {
    const repoCache = JSON.parse(localStorage.getItem("__repo_cache__") || "[0, null]");
    let json;
    if (repoCache[0] + 1000 * 60 * 5 > Date.now()) json = repoCache[1];
    else {
        json = await new Promise(res => {
            fetch("https://api.github.com/users/" + USERNAME + "/repos").then(r => r.json().then(r => res(
                r.filter(i => !i["fork"] && i["owner"]["login"] === USERNAME && !i["archived"] && i.visibility === "public")
                    .sort((a, b) => b["stargazers_count"] - a["stargazers_count"]).slice(0, REPO_AMOUNT)
            )).catch(() => res(false))).catch(() => res(false))
        });
        if (!json) {
            json = repoCache[1];
            if (!json) return false;
        } else {
            localStorage.setItem("__repo_cache__", JSON.stringify([Date.now(), json]));
        }
    }
    const centered = [json[0]];
    for (let i = 1; i < json.length; i++) {
        if (i % 2 === 0) centered.unshift(json[i]);
        else centered.push(json[i]);
    }
    repositories.innerHTML = "";
    centered.forEach(i => {
        const div = document.createElement("div");
        div.classList.add("repo");
        div.innerHTML = `
<div class="info">
    <div class="name">${i.name}</div>
    <div class="stars" onclick="window.open('https://github.com/${USERNAME}/${i.name}/stargazers')">
        ${i["stargazers_count"]} <img src="assets/star.png" draggable="false">
    </div>
    <div onclick="window.open('https://github.com/${USERNAME}/${i.name}/network/members')" class="forks">
        ${i["forks"]} <img src="assets/fork.png" draggable="false">
    </div>
</div>
<div class="description">${i.description}</div>
<div class="keywords">${i["topics"].map(i => `<div>${i}</div>`).join("")}</div>`;
        div.classList.add("project");
        let mv = 0;
        let down = false;
        div.onmousedown = ev => {
            if (ev.target.onclick) return;
            mv = 0;
            down = true;
        };

        function onMove() {
            mv += 1; // Math.sqrt((ev.clientX - mouse.x) ** 2 + (ev.clientY - mouse.y) ** 2);
        }

        addEventListener("mousemove", ev => onMove(ev));
        addEventListener("touchmove", ev => onMove(ev));
        addEventListener("mouseup", () => {
            if (!down) return;
            down = false;
            if (!mv) open("https://github.com/" + USERNAME + "/" + i.name);
        });
        addEventListener("blur", () => down = false);
        repositories.appendChild(div);
    });
    return true;
};

async function runAnimatedInfo() {
    const animatedInfoDiv = document.querySelector(".moving-text");
    const texts = [
        "a full stack web developer.",
        "a low-level programming enthusiast.",
        "an app developer.",
        "a 2D/3D web game developer.",
        "a math fan.",
        "a physics addict.",
        "scroll for more..."
    ];
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        textCursor.style.animationName = "none";
        for (let j = 0; j < text.length; j++) {
            const c = text[j];
            animatedInfoDiv.innerHTML += c;
            await wait(70);
        }
        textCursor.style.animationName = "cursor-blink";
        await wait(2000);
        textCursor.style.animationName = "none";
        while (animatedInfoDiv.innerHTML) {
            animatedInfoDiv.innerHTML = animatedInfoDiv.innerHTML.split("").reverse().slice(1).reverse().join("");
            await wait(20);
        }
        textCursor.style.animationName = "cursor-blink";
        await wait(1000);
    }
    setTimeout(runAnimatedInfo);
}

onmousemove = e => onMouseMove(e.clientX, e.clientY);
document.onmouseleave = () => cursor.style.opacity = "0";
document.onmouseenter = () => cursor.style.opacity = "1";
onmousedown = () => onMouseDown();
onmouseup = () => onMouseUp();
addEventListener("touchstart", () => onMouseDown());
addEventListener("touchmove", e => onMouseMove(e.touches[0].clientX, e.touches[0].clientY));
addEventListener("touchend", () => onMouseUp());
onblur = () => onMouseUp();
oncontextmenu = e => e.preventDefault();

setInterval(() => {
    particles.childNodes.forEach(particle => {
        const rect = particle.getBoundingClientRect();
        const x = rect.x;
        const y = rect.y;
        if (
            x < 0
            || y < 0
            || x > innerWidth
            || y > innerHeight
        ) particle.remove();
    });
    while (particles.children.length < (isMobile ? 10 : 50)) addParticle();
});

onwheel = e => {
    if (Math.abs(e.deltaY) <= 30) return;
    onSectionMove(Math.sign(e.deltaY));
};

onresize = () => {
    isMobile = checkMobile();
    if (isMobile) {
        document.body.appendChild(mobileStyle);
    } else mobileStyle.remove();
};

onresize();

document.querySelectorAll(".scroll-more").forEach(el => {
    const sign = el.classList.contains("top") ? -1 : 1;
    el.innerHTML = sign === 1 ? `Scroll for more<br>⯯` : `⯭<br>Scroll back`;
    el.onclick = () => {
        onSectionMove(sign);
    };
});

sections.forEach(el => el.style.scale = "0");
sections.item(0).style.scale = "1";

repositories.addEventListener("mousedown", () => repoTouch = true);
repositories.addEventListener("touchstart", () => repoTouch = true);

loadSkills();

if (query.has("goto")) {
    const g = query.get("goto") * 1;
    if (!isNaN(g) && g > 0 && g <= sections.length) {
        for (let i = 0; i < g; i++) onSectionMove(1, true);
    }
}

renderTracker();

runAnimatedInfo().then(r => r);

if (!(await loadRepositories())) repositories.innerHTML = "Couldn't fetch the repositories due to the internet connection.";
