import EventEmitter from "./EventEmitter";

export default class State extends EventEmitter {

    static STATES = {
        LOADING: 'LOADING',
        MENU: 'MENU',
        EXPERIENCE: 'EXPERIENCE',
        RESTART: 'RESTART',
        EXPERIENCE_END: 'END',
        SECTION_END: 'SECTION_END',
        SECTION_START: 'SECTION_START',
    };

    constructor(STARTING_STATE = null) {
        super();

        this.setState(STARTING_STATE);
    }

    setState(state) {
        // check if state is in the enum of states
        if (Object.values(State.STATES).includes(state)) {
            this.state = state;
        } else {
            console.error('State not found in enum');
        }
    }

    getState() {
        return this.state;
    }

    logEvent(eventName, data) {
        console.log(`Event: ${eventName}, Data: ${data}`);
    }
}
