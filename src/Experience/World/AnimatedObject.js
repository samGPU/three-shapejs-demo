import * as THREE from 'three'
import InteractiveObject from './InteractiveObject.js'

export default class AnimatedObject extends InteractiveObject {
    /**
     * @param {Object} options - Configuration options
     * @param {string} options.resourceName - Key for the resource in resources.items
     * @param {string} options.name - Display name for the object
     * @param {string} options.type - Type description (default: 'Animated Object')
     * @param {number|THREE.Vector3} options.scale - Scale factor or Vector3 (default: 1)
     * @param {THREE.Vector3} options.position - Initial position (default: 0,0,0)
     * @param {boolean} options.castShadow - Whether meshes cast shadows (default: true)
     * @param {string} options.defaultAnimation - Name of animation to play on load (default: first animation)
     * @param {string} options.debugFolderName - Name for debug folder (optional)
     */
    constructor(options = {}) {
        super()

        this.options = {
            resourceName: null,
            name: 'Object',
            type: 'Animated Object',
            scale: 1,
            position: new THREE.Vector3(0, 0, 0),
            castShadow: true,
            defaultAnimation: null,
            debugFolderName: null,
            ...options
        }

        // Animation state
        this.animation = null
        this.animationNames = []

        // Validate resource name
        if (!this.options.resourceName) {
            console.error('AnimatedObject: resourceName is required')
            return
        }

        // Get the resource
        this.resource = this.resources.items[this.options.resourceName]
        if (!this.resource) {
            console.error(`AnimatedObject: Resource "${this.options.resourceName}" not found`)
            return
        }

        // Debug folder
        if (this.debug.active && this.options.debugFolderName) {
            this.debugFolder = this.debug.ui.addFolder(this.options.debugFolderName)
        }

        this.setModel()
        this.setAnimations()
    }

    setModel() {
        this.model = this.resource.scene
        this.scene.add(this.model)

        // Apply scale
        if (typeof this.options.scale === 'number') {
            this.model.scale.set(this.options.scale, this.options.scale, this.options.scale)
        } else if (this.options.scale instanceof THREE.Vector3) {
            this.model.scale.copy(this.options.scale)
        }

        // Apply position
        if (this.options.position instanceof THREE.Vector3) {
            this.model.position.copy(this.options.position)
        }

        // Set up shadows
        if (this.options.castShadow) {
            this.model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true
                }
            })
        }

        // Set up the interactive panel
        this.setupPanel(this.model, {
            name: this.options.name,
            type: this.options.type,
            createTrackingBox: true
        })
        this.initializePanelItems()
    }

    setAnimations() {
        if (!this.resource.animations || this.resource.animations.length === 0) {
            return
        }

        this.animation = {
            mixer: new THREE.AnimationMixer(this.model),
            actions: {},
            current: null
        }

        // Dynamically create actions from all animations in the resource
        this.resource.animations.forEach((clip) => {
            const name = this.normalizeAnimationName(clip.name)
            this.animation.actions[name] = this.animation.mixer.clipAction(clip)
            this.animationNames.push(name)
        })

        // Play default animation
        const defaultAnim = this.options.defaultAnimation || this.animationNames[0]
        if (defaultAnim && this.animation.actions[defaultAnim]) {
            this.animation.current = this.animation.actions[defaultAnim]
            this.animation.current.play()
        }

        // Debug controls
        if (this.debug.active && this.debugFolder) {
            this.setupDebugControls()
        }
    }

    normalizeAnimationName(name) {
        // Remove common prefixes/suffixes and convert to lowercase
        return name
            .replace(/^(animation_|anim_|clip_)/i, '')
            .replace(/\|.*$/, '') // Remove anything after pipe (common in some formats)
            .toLowerCase()
            .trim()
    }

    getAnimationDisplayName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1)
    }

    playAnimation(name, fadeDuration = 1) {
        if (!this.animation || !this.animation.actions) {
            return
        }

        const normalizedName = name.toLowerCase()
        const newAction = this.animation.actions[normalizedName]

        if (!newAction) {
            console.warn(`Animation "${name}" not found. Available: ${this.animationNames.join(', ')}`)
            return
        }

        if (newAction === this.animation.current) {
            return
        }

        const oldAction = this.animation.current

        newAction.reset()
        newAction.play()

        if (oldAction) {
            newAction.crossFadeFrom(oldAction, fadeDuration, false)
        }

        this.animation.current = newAction
    }

    stopAnimations(fadeDuration = 0.35) {
        const defaultAnim = this.options.defaultAnimation || this.animationNames[0]
        if (defaultAnim) {
            this.playAnimation(defaultAnim, fadeDuration)
        }
    }

    getAnimationNames() {
        return [...this.animationNames]
    }

    getPanelItems() {
        const items = []

        // Add animation controls if we have animations
        if (this.animationNames.length > 0) {
            items.push(InteractiveObject.divider())
            items.push(InteractiveObject.label('Animation'))
            items.push(InteractiveObject.divider())

            this.animationNames.forEach(name => {
                const displayName = this.getAnimationDisplayName(name)
                items.push(
                    InteractiveObject.link(`Play ${displayName}`, displayName, () => {
                        console.log(`Playing ${name} animation`)
                        this.playAnimation(name)
                    })
                )
            })
        }

        // Add custom items from subclasses
        const customItems = this.getCustomPanelItems()
        if (customItems.length > 0) {
            items.push(...customItems)
        }

        return items
    }

    getCustomPanelItems() {
        return []
    }

    setupDebugControls() {
        const debugObject = {}

        this.animationNames.forEach(name => {
            const displayName = this.getAnimationDisplayName(name)
            debugObject[`play${displayName}`] = () => {
                this.playAnimation(name)
            }
        })

        Object.keys(debugObject).forEach(key => {
            this.debugFolder.add(debugObject, key)
        })
    }

    update() {
        if (this.animation && this.animation.mixer) {
            this.animation.mixer.update(this.time.delta * 0.001)
        }
    }

    dispose() {
        this.disposePanel()

        if (this.animation && this.animation.mixer) {
            this.animation.mixer.stopAllAction()
        }

        if (this.model) {
            this.scene.remove(this.model)
        }
    }
}
