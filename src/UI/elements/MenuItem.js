import EventEmitter from "../../Experience/Utils/EventEmitter";
import SoundEffect from "../../Experience/Utils/SoundEffect";

export default class MenuItem extends EventEmitter {
    constructor(option, index, onSelect) {
        super();
        this.option = option;
        this.index = index;
        this.onSelect = onSelect;

        // Create sound effect
        this.menuChangeSound = new SoundEffect('audio/menuChange.ogg');
        this.gameStartSound = new SoundEffect('audio/gameStart.ogg');

        // Create the DOM element
        this.element = document.createElement('div');
        this.element.classList.add('menu-item');
        this.element.textContent = option.text;

        // Wrap the onClick function to bind the correct context
        const boundOnClick = () => {
            if (this.option.onClick) {
                this.option.onClick(this); // Pass the MenuItem instance
            }
        };

        // Bind click event
        this.element.onclick = boundOnClick;

        // Bind touch event
        this.element.addEventListener('touchstart', boundOnClick);

        // Bind hover event
        this.element.addEventListener('mouseenter', () => {
            this.onSelect(this.index);
        });
    }

    setSelected(isSelected) {
        if (isSelected) {
            this.element.classList.add('selected');
            this.menuChangeSound.play();
        } else {
            this.element.classList.remove('selected');
        }
    }
    
    stateChanged(eventName) {
        this.gameStartSound.play();
        window.experience.state.trigger(eventName);
    }
}
