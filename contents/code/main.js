// Configuration
const config = {
  shortcutIdPrefix: "AppToggler1",
  apps: [
    {"shortcut": "Meta+X", "query": "firefox", "resourceName": "firefox", "caption": "firefox"},
    {"shortcut": "Meta+B", "query": "chromium", "resourceName": "chromium", "caption": "Chromium"},
    {"shortcut": "Meta+E", "query": "dolphin", "resourceName": "dolphin", "caption": "Dolphin"},
    {"shortcut": "Meta+T", "query": "termius", "resourceName": "termius", "caption": "termius"},
    {"shortcut": "Meta+V", "query": "vscode", "resourceName": "electron code-oss", "caption": "Code - OSS"},
    {"shortcut": "Meta+O", "query": "obsidian", "resourceName": "obsidian", "caption": "Obsidian"},
    {"shortcut": "Meta+F", "query": "telegram", "resourceName": "telegram-desktop", "caption": "Telegram"},
    {"shortcut": "Meta+M", "query": "time", "caption": "Time Web"},
    {"shortcut": "Meta+K", "query": "ktalk", "caption": "Толк"},
    {"shortcut": "Meta+C", "query": "calendar", "caption": "Google Calendar"},
    {"shortcut": "Ctrl+Alt+K", "query": "keepass", "resourceName": "keepassxc KeePassXC", "caption": "KeePassXC"}
  ]
};

const shortcutIdPrefix = config.shortcutIdPrefix || "AppToggler";
const appsToOpen = config.apps;

const shortcuts = appsToOpen.map(function (app) {
    return Object.assign({}, app, {
        shortcutId: shortcutIdPrefix + (app.resourceName || app.caption).replace(/\s/g, "")
    });
});

function getToggleAppFunction(resName, caption, krunnerQuery, excludeCaptions) {
       //console.error("Registering shortcut for", resName || caption);
    return function () {
           //console.error("TOGGLER  Toggling", resName || caption)
        const clients = workspace.windowList();
           //console.error("TOGGLER Total windows found:", clients.length);
        const client = clients.find(function (client) {
               //console.error("TOGGLER Checking window:", client.resourceName, "|||",client.caption);
            const matchesResource = (resName && client.resourceName === resName) ||
                (caption && client.caption.includes(caption));
            if (matchesResource && excludeCaptions && excludeCaptions.length > 0) {
                const isExcluded = excludeCaptions.some(excludePattern => client.caption.includes(excludePattern));
                   //console.error("TOGGLER Exclude check:", isExcluded, "for captions:", excludeCaptions);
                return !isExcluded;
            }
            return matchesResource;
        });

        if (client) {
               //console.error("TOGGLER Window found", resName || caption, "Minimized:", client.minimized);
            if (workspace.activeWindow === client && !client.minimized) {
                   //console.error("TOGGLER Window is active, minimizing");
                client.minimized = true;
            } else {
                   //console.error("TOGGLER Window is not active, activating");
                client.minimized = false;
                workspace.activeWindow = client;
            }
        } else {
               //console.error("TOGGLER Client not found, querying KRunner for", resName || caption);
            callDBus("org.kde.krunner", "/App", "org.kde.krunner.App", "query", krunnerQuery);
        }
    }
}

function registerAppShortcuts() {
    shortcuts.forEach(shortcut => {
        const shortcutDescription = "App toggler for " + (shortcut.resourceName || shortcut.caption);
        registerShortcut(
            shortcut.shortcutId,
            shortcutDescription,
            shortcut.shortcut,
            getToggleAppFunction(shortcut.resourceName, shortcut.caption, shortcut.query, shortcut.excludeCaptions)
        );
    });
}

registerAppShortcuts();
