export default class UserInput {
    constructor(world) {
        this.world = world;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(event) {
        if (!this.world || !this.world.fox) return;
        switch (event.key) {
            case '1':
            case 'i':
            case 'I':
                this.world.fox.playIdle();
                break;
            case '2':
            case 'w':
            case 'W':
                this.world.fox.playWalking();
                break;
            case '3':
            case 'r':
            case 'R':
                this.world.fox.playRunning();
                break;
            case '0':
            case 's':
            case 'S':
                this.world.fox.stopAnimations();
                break;
            default:
                break;
        }
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }
}
