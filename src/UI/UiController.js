import StartScreen from './StartScreen.js'

export default class UiController {
    constructor() {
        this.startScreen = new StartScreen();
    }

    hide() {
        this.startScreen.hide();
    }
}
