PATH="$HOME/scripts:$HOME/genymotion:$PATH"

xrandr --output eDP1 --mode 2400x1600
xrandr --output eDP1 --dpi 192

xmodmap ~/.Xmodmap

# Make touchpad work on Pixelbook.
synclient FingerLow=1 FingerHigh=5

# Allow horizontal scroll.
synclient HorizTwoFingerScroll=1

# Disable right clock on right half of trackpad.
synclient RightButtonAreaLeft=0
synclient RightButtonAreaTop=0

# Make touchpad less sensitive
synclient VertScrollDelta=-300 HorizScrollDelta=300

xrdb -merge ~/.Xresources

fcitx

exec i3
