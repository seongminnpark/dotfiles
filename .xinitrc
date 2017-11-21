PATH="$HOME/scripts:$PATH"


xrandr --output eDP1 --mode 2400x1600
xrandr --output eDP1 --dpi 192

xmodmap ~/.Xmodmap

# Make touchpad work on Pixelbook.
synclient FingerLow=1 FingerHigh=5

# Disable right clock on right half of trackpad.
synclient RightButtonAreaLeft=0
synclient RightButtonAreaTop=0

exec i3
