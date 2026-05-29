// Configuration
const config = {
    shortcutIdPrefix: "AppToggler1",
    apps: [
        {"shortcut": "Meta+X", "query": "firefox", "resourceName": "firefox", "caption": "firefox"},
        {"shortcut": "Meta+B", "query": "chromium", "resourceName": "chromium", "caption": "Chromium", "desktopOnly": true},
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

function getToggleAppFunction(resName, caption, krunnerQuery, excludeCaptions, desktopOnly) {
    return function () {
        //console.error("TOGGLER – shortcut triggered for", resName || caption);
        const currentDesktop = workspace.currentDesktop;
        //console.error("TOGGLER – current desktop:", currentDesktop);

        const clients = workspace.windowList();
        //console.error("TOGGLER – total windows:", clients.length);

        const client = clients.find(function (client) {
            // Match resource name or caption
            const matchesResource = (resName && client.resourceName === resName) ||
                                    (caption && client.caption.includes(caption));
            if (!matchesResource) return false;

            // Exclude unwanted captions (e.g. popups)
            if (excludeCaptions && excludeCaptions.length > 0) {
                const isExcluded = excludeCaptions.some(excludePattern =>
                    client.caption.includes(excludePattern)
                );
                if (isExcluded) return false;
            }

            // Desktop‑only filtering
            if (desktopOnly) {
                // A window is on the current desktop if its desktops array is empty
                // (on all desktops) or contains the current desktop number.
                const onDesktop = client.desktops.length === 0 ||
                                    client.desktops.includes(currentDesktop);
                if (!onDesktop) {
                    //console.error("TOGGLER – skipping window (wrong desktop):", client.caption);
                    return false;
                }
            }

            return true;
        });

        if (client) {
            //console.error("TOGGLER – matched window:", client.caption,
                            "minimized:", client.minimized,
                            "active:", workspace.activeWindow === client);
            if (workspace.activeWindow === client && !client.minimized) {
                //console.error("TOGGLER – minimizing");
                client.minimized = true;
            } else {
                //console.error("TOGGLER – activating");
                client.minimized = false;
                workspace.activeWindow = client;
            }
        } else {
            //console.error("TOGGLER – no window on current desktop, calling KRunner");
            callDBus("org.kde.krunner", "/App", "org.kde.krunner.App", "query", krunnerQuery);
        }
    };
}

function registerAppShortcuts() {
    shortcuts.forEach(shortcut => {
        const shortcutDescription = "App toggler for " + (shortcut.resourceName || shortcut.caption);
        registerShortcut(
            shortcut.shortcutId,
            shortcutDescription,
            shortcut.shortcut,
            getToggleAppFunction(
                shortcut.resourceName,
                shortcut.caption,
                shortcut.query,
                shortcut.excludeCaptions,
                shortcut.desktopOnly
            )
        );
    });
}

registerAppShortcuts();
