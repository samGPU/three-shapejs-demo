import AnimatedObject from './AnimatedObject.js'
import InteractiveObject from './InteractiveObject.js'

/**
 * Fox character - extends AnimatedObject with Fox-specific customizations
 */
export default class Fox extends AnimatedObject {
    constructor() {
        super({
            resourceName: 'foxModel',
            name: 'Fox Model',
            type: 'Animated Character',
            scale: 0.02,
            defaultAnimation: 'survey', // First animation in the fox model
            debugFolderName: 'fox'
        })

        this.addSound('bark', '/audio/bark.ogg', { volume: 0.3 })
    }

    /**
     * Add Fox-specific panel items (in addition to auto-generated animation controls)
     */
    getCustomPanelItems() {
        return [
            InteractiveObject.divider(),
            InteractiveObject.label('Actions'),
            InteractiveObject.link('Run', 'Run', () => {
                this.playAnimation('run')
            }),
            InteractiveObject.link('Walk', 'Walk', () => {
                this.playAnimation('walk')
            }),
            InteractiveObject.link('Idle', 'Idle', () => {
                this.playAnimation('survey')
            }),
            InteractiveObject.divider(),
            InteractiveObject.linkWithSound('Fox Says Hello', 'Hello', function() {
                console.log('Fox says hello!')
            }, 'bark')
        ]
    }
}
