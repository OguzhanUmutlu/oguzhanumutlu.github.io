const {round, floor, abs, random, PI, sin, cos, acos, sqrt} = Math;
const rand = (a, b) => floor(random() * (b - a + 1)) + a;
const query = new URLSearchParams(location.href);
const DEV_MODE = query.has("DEV_MODE");
const $ = r => document.querySelector(r);
// TODO: custom cursor
addEventListener("contextmenu", ev => {
    // TODO: custom context menu
    ev.preventDefault();
});
// TODO: particles will have a path behind them that is disappearing
// TODO: electrical particles
// TODO: make a separate mobile version of it
// TODO: pressing Tab makes a buggy thing
// addEventListener("keydown", ev => ev.preventDefault());

await new Promise(r => addEventListener("load", r));
const containerDiv = $(".container");
containerDiv.style.display = "";
const wait = t => new Promise(r => setTimeout(r, t));
if (!DEV_MODE) await wait(2000);
const startContainerDiv = $(".start-container");
startContainerDiv.style.opacity = "0";
containerDiv.style.pointerEvents = "all";
containerDiv.style.translate = "";
containerDiv.style.opacity = "1";
setTimeout(() => {
    startContainerDiv.style.display = "none";
}, 1000);
setInterval(() => {
    const cursorDiv = $(".cursor");
    cursorDiv.hidden = !cursorDiv.hidden;
}, 500);
const animatedInfo = async () => {
    if (sec !== 0) return setTimeout(animatedInfo);
    const animatedInfoDiv = $(".animated-info");
    const texts = [
        "a full stack web developer.",
        "an app developer.",
        "a 2D/3D web game developer.",
        "a math fan.",
        "a physics addict.",
        "a student.",
        "and much more..."
    ];
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        for (let j = 0; j < text.length; j++) {
            const c = text[j];
            animatedInfoDiv.innerHTML += c;
            await wait(70);
        }
        await wait(2000);
        while (animatedInfoDiv.innerHTML) {
            animatedInfoDiv.innerHTML = animatedInfoDiv.innerHTML.split("").reverse().slice(1).reverse().join("");
            await wait(20);
        }
        await wait(1000);
    }
    setTimeout(animatedInfo);
};
const particleCanvas = $(".particle-effect");
let particles = [];
const bounceCanvas = $(".bounce-effect");
const pCtx = particleCanvas.getContext("2d");
const bCtx = bounceCanvas.getContext("2d");
const bounceCircles = [-20, -10, 0, 10, 20].map(i => ({x: i, r: 25}));
let ref = [innerWidth * .5, innerHeight * .5];
const len = [600, 10];
let radius = innerHeight * .4;
bounceCircles.forEach(i => {
    // update
    i._collisions = () => bounceCircles.filter(j => i !== j).map(j => ({
        dist: sqrt((i._x() - j._x()) ** 2 + (i._y() - j._y()) ** 2) - i.r - j.r,
        tile: j
    })).filter(i => i.dist < 0);
    i._x = () => ref[0] + i.x;
    i._y = () => ref[1] + sin(acos(i.x / radius)) * radius;
});
let bounceCache = {first: true};
const animate = () => {
    ref = [innerWidth * .5, innerHeight * .4];
    radius = innerHeight * .4;
    particleCanvas.width = innerWidth;
    particleCanvas.height = innerHeight * (maxSec + 1);
    bounceCanvas.width = innerWidth;
    bounceCanvas.height = innerHeight;
    const diff = scrollTarget - scrollY;
    if (round(diff) === 0) scrollCooldown = true;
    else {
        if (abs(diff / 10) < 1) scrollTo(0, scrollY + (diff > 0 ? 1 : -1));
        else scrollTo(0, scrollY + diff / 10);
    }
    //particleCanvas.style.top = scrollY + "px";
    particles = particles.filter(i => !i.bornDone || i.opacity >= 0.01);
    if (particles.length < 100) {
        particles.push({
            x: rand(0, particleCanvas.width),
            y: rand(0, particleCanvas.height),
            velocity: [rand(-2, 2) || 1, rand(-2, 2) || 1],
            bornOpacity: rand(5, 10) / 10,
            bornDone: false,
            opacity: 0.01,
            radius: rand(4, 10)
        });
    }
    particles.forEach(i => {
        if (i.opacity < 0.01) return;
        i.x += i.velocity[0];
        i.y += i.velocity[1];
        if (i.bornDone) {
            i.opacity -= 0.01;
        } else {
            i.opacity += 0.01;
            if (i.opacity >= i.bornOpacity) i.bornDone = true;
        }
        pCtx.save();
        pCtx.beginPath();
        pCtx.fillStyle = "#8bf5cc";
        pCtx.globalAlpha = i.opacity;
        pCtx.arc(i.x, i.y, i.radius, 0, PI * 2);
        pCtx.fill();
        pCtx.closePath();
        pCtx.restore();
    });
    if (!scrollCooldown) updateSkillPositions();
    bCtx.fillRect(ref[0] - len[0] / 2, ref[1] - len[1] / 2, len[0], len[1]);
    bounceCircles.forEach((i, j) => {
        // update
        if (j === 2) return;
        i._t = (i._t || 0) + 1;
        if (i._t > 60 && j !== 0 && j !== 4) return;
        const collisions = i._collisions();
        const nearest = collisions.sort((a, b) => a.dist - b.dist)[0];
        if (nearest) i.x += abs(nearest.dist) * (nearest.tile.x > i.x ? -1 : 1) / 8;
        if (!i._v) i._v = 0;
        const g = 1.5;
        const v0 = 20;
        if (j === 0 && bounceCache.first) {
            i._v -= g;
            i.x -= i._v;
            if (i._collisions().length) {
                bounceCache.first = false;
                i._v = v0;
            }
        } else if (j === bounceCircles.length - 1 && !bounceCache.first) {
            i._v -= g;
            i.x += i._v;
            if (i._collisions().length) {
                bounceCache.first = true;
                i._v = v0;
            }
        }
    });
    bounceCircles.forEach(i => {
        // render
        const x = i._x();
        const y = i._y();
        bCtx.beginPath();
        bCtx.strokeStyle = "#8d8d8d";
        bCtx.moveTo(ref[0], ref[1]);
        bCtx.lineTo(x, y);
        bCtx.stroke();
        bCtx.closePath();
        bCtx.beginPath();
        bCtx.fillStyle = "#945d3a";
        bCtx.arc(x, y, i.r, 0, PI * 2);
        bCtx.fill();
        bCtx.closePath();
    });
    requestAnimationFrame(animate);
};
let scrollCooldown = true;
let scrollTarget = (query.get("scrollTo") * 1 || 0) * innerHeight;
let sec = query.get("scrollTo") * 1 || 0;
let maxSec = 3;
addEventListener("wheel", ev => {
    if (!scrollCooldown) return;
    if (ev.deltaY > 0) sec++;
    else sec--;
    if (sec < 0) sec = 0;
    if (sec > maxSec) sec = maxSec;
    scrollTarget = innerHeight * sec;
    scrollCooldown = false;
});
addEventListener("resize", () => {
    scrollTarget = innerHeight * sec;
    scrollCooldown = false;
    updateSkillPositions();
});
const skills = {
    Languages: [
        "C++", "Rust", "Java", "PHP", "JavaScript", "Python", "Shell", "Node.JS", "Bun"
    ],
    Databases: [
        "SQLite", "Mongo"
    ],
    Frameworks: [
        "Electron", "JavaFX", "React", "ReactNative", "three.js", "matter.js", "p5.js"
    ],
    Tools: [
        "JetBrains", "Git", "Linux"
    ]
};
const skillLinks = {
    "C++": "https://isocpp.org/",
    "Rust": "https://www.rust-lang.org/",
    "Java": "https://www.oracle.com/technetwork/java/",
    "PHP": "https://www.php.net/",
    "JavaScript": "https://www.ecma-international.org/publications-and-standards/standards/ecma-262/",
    "Python": "https://python.org/",
    "Shell": "https://en.wikipedia.org/wiki/Shell_script/",
    "Node.JS": "https://nodejs.org/",
    "Bun": "https://bun.sh/",
    "SQLite": "https://sqlite.org/",
    "Mongo": "https://mongodb.com/",
    "Electron": "https://www.electronjs.org/",
    "JavaFX": "https://wiki.openjdk.org/display/OpenJFX/Main",
    "React": "https://reactjs.org/",
    "ReactNative": "https://reactnative.dev/",
    "three.js": "https://threejs.org/",
    "matter.js": "https://brm.io/matter-js/",
    "p5.js": "https://p5js.org/",
    "JetBrains": "https://www.jetbrains.com/",
    "Git": "https://git-scm.com/",
    "Linux": "https://kernel.org/"
};
window.s = skills;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

Object.keys(skills).forEach(i => $(".options").innerHTML += `<div>${i}</div>`);
let _lsC = 0;
shuffleArray(Object.values(skills).flat()).forEach(i => {
    let ls;
    while (!ls || _lsC === ls) ls = rand(1, 4);
    _lsC = ls;
    const div = document.createElement("div");
    div.classList.add("sl-" + ls);
    div.innerText = i;
    div.addEventListener("click", () => open(skillLinks[i]));
    $(".skills-list").appendChild(div);
});
const updateSkillPositions = () => {
    const _tmp = [];
    document.querySelector(".skills-list").classList.add("skills-list-a");
    const sp = (a, b, c) => a.style[b] === c || (a.style.setProperty(b, c));
    document.querySelectorAll(".skills-list > div").forEach(i => {
        sp(i, "position", "");
        sp(i, "left", "");
        sp(i, "top", "");
    });
    document.querySelectorAll(".skills-list > div").forEach(i => {
        const rect = i.getBoundingClientRect();
        _tmp.push([i, rect]);
    });
    _tmp.forEach(i => {
        sp(i[0], "position", "absolute");
        sp(i[0], "left", i[1].left + "px");
        sp(i[0], "top", i[1].top + "px");
    });
    document.querySelector(".skills-list-a").classList.remove("skills-list-a");
};
/*const obv = new MutationObserver(r => r);
obv.observe(document.querySelector(".skills-list"), {attributes: true});
addEventListener("resize", updateSkillPositions);*/

document.querySelectorAll(".options > div").forEach(i => {
    i.addEventListener("click", () => {
        const l = i.innerHTML === "All" ? Object.values(skills).flat() : skills[i.innerHTML];
        document.querySelectorAll(".skills-list > div").forEach(i => {
            i.style.opacity = l.includes(i.innerHTML) ? "1" : "0";
            i.style.cursor = l.includes(i.innerHTML) ? "pointer" : "default";
        });
    });
});
animatedInfo().then(r => r);
animate();
const resizeProjectHandler = () => {
    const l = (innerWidth - 40 - 40 - 60 - 60 - 80) / 3;
    document.querySelectorAll(".project").forEach(i => {
        i.style.minWidth = l + "px";
        i.style.maxWidth = l + "px";
        i.querySelectorAll(".second-part > div").forEach(j => j.style.marginLeft = (l - 20) + "px");
    });
};
addEventListener("resize", resizeProjectHandler);
const handleProjectHovers = () => {
    document.querySelectorAll(".project > .second-part > div").forEach(i => {
        addEventListener("mousemove", ev => {
            if (!ev.composedPath().some(j => j === i) || ev.clientX < i.children.item(0).getBoundingClientRect().left) return i.classList.remove("project-second-hover");
            i.classList.add("project-second-hover");
        });
    });
};
const handleProjectScroll = () => {
    let transform = 0;
    const projectsDiv = $(".projects");
    let down = false;
    projectsDiv.addEventListener("mousedown", () => down = true);
    addEventListener("mousemove", ev => {
        if (!down) return document.body.style.cursor = "grab";
        const mov = ev.movementX;
        transform += mov;
        const max = (projectsDiv.getBoundingClientRect().width - innerWidth) / 2 + 15;
        if (abs(transform) > max) transform -= mov;
        projectsDiv.style.transform = "translateX(" + transform + "px)";
        document.body.style.cursor = "grabbing";
    });
    addEventListener("mouseup", () => down = false);
    addEventListener("blur", () => down = false);
};
handleProjectScroll();
const REPO_AMOUNT = 11;
let _id = 0;
window._public_ = {};
const loadRepositories = async () => {
    const json = Array.from(await (await fetch("https://api.github.com/users/OguzhanUmutlu/repos")).json())
        .filter(i => !i.fork && i.owner.login === "OguzhanUmutlu" && !i.archived && i.visibility === "public")
        .sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, REPO_AMOUNT);
    const centered = [json[0]];
    for (let i = 1; i < json.length; i++) {
        if (i % 2 === 0) centered.unshift(json[i]);
        else centered.push(json[i]);
    }
    $(".projects").innerHTML = "";
    centered.forEach(i => {
        const id = _id++;
        _public_[id] = [i.stargazers_url, i.forks_url];
        const div = document.createElement("div");
        div.innerHTML = `
<div class="second-part">
    <div class="stargazers">
        <div onclick="window.open('https://github.com/OguzhanUmutlu/${i.name}/stargazers')">${i.stargazers_count}</div>
        <img onclick="window.open('https://github.com/OguzhanUmutlu/${i.name}/stargazers')" src="star.png" draggable="false">
    </div>
    <div class="forks">
        <div onclick="window.open('https://github.com/OguzhanUmutlu/${i.name}/network/members')">${i.forks}</div>
        <img onclick="window.open('https://github.com/OguzhanUmutlu/${i.name}/network/members')" src="fork.png" draggable="false">
    </div>
</div>
<div class="name">${i.name}</div>
<div class="description">${i.description}</div>
<div class="tags">${i.topics.map(i => `<div>${i}</div>`).join("")}</div>`;
        div.classList.add("project");
        let mv = 0;
        let down = false;
        div.addEventListener("mousedown", ev => {
            if (ev.target.onclick) return;
            mv = 0;
            down = true;
        });
        addEventListener("mousemove", ev => mv += sqrt(ev.movementX ** 2 + ev.movementY ** 2));
        addEventListener("mouseup", () => {
            if (!down) return;
            down = false;
            if (!mv) open("https://github.com/OguzhanUmutlu/" + i.name);
        });
        addEventListener("blur", () => down = false);
        $(".projects").appendChild(div);
    });
};
await loadRepositories();
handleProjectHovers();
resizeProjectHandler();