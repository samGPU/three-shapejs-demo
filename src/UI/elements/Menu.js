import MenuItem from './MenuItem';

export default class Menu {
    constructor(options) {
        this.options = options;
        this.currentIndex = 0;

        // Create menu container
        this.container = document.createElement('div');
        this.container.classList.add('menu-container');

        // Create menu items
        this.items = options.map((option, index) => {
            const menuItem = new MenuItem(option, index, (selectedIndex) => {
                this.updateSelection(selectedIndex);
            });

            if (index === this.currentIndex) {
                menuItem.setSelected(true);
            }

            this.container.appendChild(menuItem.element);
            return menuItem;
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp') {
                this.updateSelection(this.currentIndex - 1);
            } else if (event.key === 'ArrowDown') {
                this.updateSelection(this.currentIndex + 1);
            } else if (event.key === 'Enter') {
                this.items[this.currentIndex].element.click();
            }
        });
    }

    updateSelection(newIndex) {
        // Normalize index
        const normalizedIndex =
            (newIndex + this.items.length) % this.items.length;

        // Update selection
        this.items[this.currentIndex].setSelected(false);
        this.items[normalizedIndex].setSelected(true);
        this.currentIndex = normalizedIndex;
    }
}
