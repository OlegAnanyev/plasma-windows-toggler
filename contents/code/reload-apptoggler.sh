#!/bin/bash
# Script to reload AppToggler configuration

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Touch the reload trigger file
touch "$SCRIPT_DIR/reload-trigger"

# Show notification
if command -v kdialog >/dev/null 2>&1; then
    kdialog --passivepopup "AppToggler configuration reload triggered" 3
elif command -v notify-send >/dev/null 2>&1; then
    notify-send "AppToggler" "Configuration reload triggered" --icon=dialog-information
else
    echo "AppToggler configuration reload triggered"
fi

echo "AppToggler configuration reload triggered"