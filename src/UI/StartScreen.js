import Menu from "./elements/Menu";

export default class StartScreen {
    constructor() {
        const container = document.createElement('div');
        container.className = 'full-screen-menu';
        document.body.appendChild(container);
        
        const title = document.createElement('h1');
        title.textContent = 'Game Title Placeholder';
        title.className = 'game-title';
        container.appendChild(title);

        const menuOptions = [
            { 
                text: 'Continue', 
                onClick: (menuItem) => {
                    menuItem.stateChanged('continueSelected');
                } 
            },
            { 
                text: 'Options', 
                onClick: (menuItem) => {
                    menuItem.stateChanged('optionsSelected');
                } 
            }
        ];
        const menu = new Menu(menuOptions)
        container.appendChild(menu.container);
    }

    hide() {
        document.querySelector('.full-screen-menu').classList.add('hidden');
    }
}
