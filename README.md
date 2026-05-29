# Зачем этот форк
На моей системе конфиг из отдельного файла не грузился вообще.

# Бонусы
Параметр `desktopOnly` для хоткея позволяет использовать хоткей только на активном рабочем столе (т.е. можно иметь два окна chromium на двух разных рабочих столах и Win+B будет активировать только chromium на текущем рабочем столе).

# Hotkeys
Не всегда нормально чистятся хоткеи, см. `~/.config/kglobalshortcutsrc`

# Надёжно зарелоадить скрипт можно так
- выключаем в KWin
- `kpackagetool6 -t KWin/Script --remove toggleTheApp`
- вычищаем хоткеи из `~/.config/kglobalshortcutsrc`
- `kpackagetool6 -t KWin/Script --install .`
- выключаем в KWin

-----


# Plasma windows toggler

A KWin script that provides quick keyboard shortcuts to toggle application windows. Press a shortcut to bring an application window to focus, or minimize it if it's already active. If the application isn't running, it will be launched automatically via KRunner.

## Features

- **Smart Window Toggling**: Press a shortcut to activate a window or minimize it if already active
- **Auto-launch**: Automatically opens applications via KRunner if they're not running
- **Configurable**: Easy JSON-based configuration for apps and shortcuts
- **Window Filtering**: Support for excluding specific window captions (useful for browsers with multiple web apps)

## Installation

1. Clone or download this repository

2. **Important**: Copy the example config file and customize it:
   ```bash
   cp contents/code/config.json.example contents/code/config.json
   ```

   **Note**: `config.json` is ignored by git so you can customize it for your personal setup without affecting the repository.

3. Edit `contents/code/config.json` to add your applications and shortcuts (see Configuration section below)

4. Install the KWin script:
   ```bash
   kpackagetool6 -t KWin/Script --install .
   ```

5. Enable the script in KDE System Settings:
   - Go to **System Settings** → **Window Management** → **KWin Scripts**
   - Enable "Apps toggler"
   - Click **Apply**

## Configuration

Edit `contents/code/config.json` to configure your applications:

```json
{
  "shortcutIdPrefix": "AppToggler",
  "apps": [
    {"shortcut": "Meta+M", "query": "firefox", "resourceName": "firefox"},
    {"shortcut": "Meta+T", "query": "Terminal", "caption": "Terminal"},
    {"shortcut": "Meta+C", "query": "code", "resourceName": "code"}
  ]
}
```

### Configuration Fields

- **shortcutIdPrefix**: A unique identifier for the shortcuts (see "Updating Shortcuts" below)
- **apps**: Array of application configurations with the following fields:
  - **shortcut**: The keyboard shortcut (e.g., "Meta+M", "Ctrl+Alt+T")
  - **query**: The KRunner query to launch the app if it's not running
  - **resourceName** (optional): The X11 resource name of the window (use `xprop` to find it)
  - **caption** (optional): Match windows by their title/caption
  - **excludeCaptions** (optional): Array of caption patterns to exclude (useful for filtering specific tabs in browsers)

### Finding Window Properties

To find the `resourceName` for your applications:

```bash
# Click on the window you want to identify
xprop | grep WM_CLASS
```

The second value in `WM_CLASS` is typically the `resourceName`.

## Usage

After installation and configuration:

1. Press your configured shortcut (e.g., `Meta+M`) to:
   - Focus the application window if it's open but not active
   - Minimize the window if it's already focused
   - Launch the application if it's not running

2. Customize shortcuts in **System Settings** → **Shortcuts** → **KWin** if needed

## How It Works

The script uses KWin's JavaScript API to:

1. **Listen for shortcuts**: Registers global keyboard shortcuts via KWin
2. **Find windows**: Searches through all open windows by `resourceName` or `caption`
3. **Toggle state**: Activates windows that are minimized or inactive, minimizes windows that are already focused
4. **Launch apps**: Uses KRunner's DBus interface to launch applications if not found

Window matching priority:
1. First tries to match by `resourceName` (exact match)
2. Falls back to `caption` (substring match)
3. Applies `excludeCaptions` filter if specified

## Updating Shortcuts

If you modify your shortcuts or configuration, you may need to update the `shortcutIdPrefix` value in `config.json`. KDE caches shortcuts using their IDs, so changing the prefix (e.g., from "AppToggler2" to "AppToggler3") forces KDE to re-register them.

**When to update the prefix:**
- After changing keyboard shortcut bindings
- When shortcuts aren't responding after configuration changes
- After reinstalling the script

After updating the prefix:
1. Remove the old script:
   ```bash
   kpackagetool6 -t KWin/Script --remove toggleTheApp
   ```

2. Reinstall the script:
   ```bash
   kpackagetool6 -t KWin/Script --install .
   ```

3. Re-enable the script in KDE System Settings:
   - Go to **System Settings** → **Window Management** → **KWin Scripts**
   - Disable "Apps toggler"
   - Click **Apply**
   - Enable "Apps toggler"
   - Click **Apply**

## Uninstalling

```bash
kpackagetool6 -t KWin/Script --remove toggleTheApp
```

## Debugging

To view script logs:

```bash
journalctl -f | grep -i kwin
```

Uncomment the `console.error()` lines in `main.js` for detailed logging.

## Reloading the Script

If you make changes to the script, use the included reload script:

```bash
./contents/code/reload-apptoggler.sh
```

Or manually:
```bash
kpackagetool6 -t KWin/Script --remove toggleTheApp
kpackagetool6 -t KWin/Script --install .
qdbus org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript "$(pwd)/contents/code/main.js"
```

