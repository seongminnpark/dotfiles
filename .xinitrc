PATH="$HOME/scripts:$PATH"


xrandr --output eDP1 --mode 2400x1600
xrandr --output eDP1 --dpi 192

xmodmap ~/.Xmodmap
synclient FingerLow=1 FingerHigh=5

exec i3
