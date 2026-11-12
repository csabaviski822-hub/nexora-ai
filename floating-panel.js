(() => {
  const hu = document.documentElement.lang === "hu";

  const t = hu ? {
    title: "NEXORA AI",
    subtitle: "A jövő egy érintésre.",
    install: "Web App telepítése",
    apk: "Android APK – hamarosan",
    visitors: "Látogatottság",
    pending: "Statisztika beállítás alatt",
    help: "Nyisd meg a böngésző menüjét, és válaszd a Hozzáadás a kezdőképernyőhöz lehetőséget.",
    close: "Bezárás"
  } : {
    title: "NEXORA AI",
    subtitle: "The future at your fingertips.",
    install: "Install Web App",
    apk: "Android APK – coming soon",
    visitors: "Visitors",
    pending: "Statistics being configured",
    help: "Open your browser menu and choose Add to Home screen.",
    close: "Close"
  };

  const launcher = document.createElement("button");
  launcher.id = "nexora-launcher";
  launcher.type = "button";
  launcher.textContent = "N";
  launcher.setAttribute("aria-label", "NEXORA menu");

  const panel = document.createElement("section");
  panel.id = "nexora-panel";
  panel.hidden = true;

  const heading = document.createElement("h3");
  heading.textContent = t.title;

  const subtitle = document.createElement("p");
  subtitle.textContent = t.subtitle;

  const install = document.createElement("button");
  install.className = "nexora-action";
  install.textContent = t.install;

  const apk = document.createElement("button");
  apk.className = "nexora-action";
  apk.textContent = t.apk;
  apk.disabled = true;

  const visitors = document.createElement("button");
  visitors.className = "nexora-action";
  visitors.textContent = t.visitors + ": " + t.pending;
  visitors.disabled = true;

  const help = document.createElement("p");
  help.textContent = t.help;
  help.hidden = true;

  const close = document.createElement("button");
  close.className = "nexora-action";
  close.textContent = t.close;

  panel.append(heading, subtitle, install, apk, visitors, help, close);
  document.body.append(launcher, panel);

  launcher.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
  });

  close.addEventListener("click", () => {
    panel.hidden = true;
  });

  let installPrompt = null;

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
  });

  install.addEventListener("click", async () => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      help.textContent = hu
        ? "A NEXORA AI már telepítve van."
        : "NEXORA AI is already installed.";
      help.hidden = false;
      return;
    }

    if (!installPrompt) {
      help.hidden = false;
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
  });
})();
