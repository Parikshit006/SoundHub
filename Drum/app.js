
{
    const playingClass = 'playing',
        crashRide = document.getElementById('crash-ride'),
        hiHatTop = document.getElementById('hihat-top');

    const animateCrashOrRide = () => {
        crashRide.style.transform = 'rotate(0deg) scale(1.5)';
    };

    const animateHiHatClosed = () => {
        hiHatTop.style.top = '171px';
    };

    const playSound = keyCode => {
        const keyElement = document.querySelector(`div[data-key="${keyCode}"]`);
        const audioElement = document.querySelector(`audio[data-key="${keyCode}"]`);
        if (!keyElement || !audioElement) return;

        audioElement.currentTime = 0;
        audioElement.play();

        switch (keyCode) {
            case 69:
            case 82:
                animateCrashOrRide();
                break;
            case 75:
                animateHiHatClosed();
                break;
        }

        keyElement.classList.add(playingClass);
    };

    const removeCrashRideTransition = e => {
        if (e.propertyName !== 'transform') return;
        crashRide.style.transform = 'rotate(-7.2deg) scale(1.5)';
    };

    const removeHiHatTopTransition = e => {
        if (e.propertyName !== 'top') return;
        hiHatTop.style.top = '166px';
    };

    const removeKeyTransition = e => {
        if (e.propertyName !== 'transform') return;
        e.target.classList.remove(playingClass);
    };

    const drumKeys = Array.from(document.querySelectorAll('.key'));
    drumKeys.forEach(key => {
        key.addEventListener('transitionend', removeKeyTransition);
        
        // ✅ Add click event listener
        key.addEventListener('click', () => {
            const keyCode = key.getAttribute('data-key');
            playSound(parseInt(keyCode));
        });
    });

    crashRide.addEventListener('transitionend', removeCrashRideTransition);
    hiHatTop.addEventListener('transitionend', removeHiHatTopTransition);

    // ✅ Handle keyboard press
    window.addEventListener('keydown', e => playSound(e.keyCode));
}

