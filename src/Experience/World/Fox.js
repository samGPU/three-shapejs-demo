import * as THREE from 'three'
import Experience from '../Experience.js'

import { MaterialPanelController, Point3D, PanelItem } from '@alienkitty/space.js/three'

export default class Fox {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('fox')
        }

        // Resource
        this.resource = this.resources.items.foxModel

        this.setModel()
        this.setAnimation()
    }

    setPanel() {
        this.point = new Point3D(this.basicBox, {
            name: 'Fox Model',
            type: 'Animated Character'
        })
        this.scene.add(this.point)

        MaterialPanelController.init(this.basicBox, this.point)
        
        // Add custom panel items
        this.addCustomPanelItems()
    }

    setModel() {
        this.model = this.resource.scene
        this.scene.add(this.model)
        this.model.scale.set(0.02, 0.02, 0.02)

        this.model.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })

        // Create basic box mesh the same size as the fox model for Point3D tracking
        // Compute bounding box of the fox model
        const boundingBox = new THREE.Box3().setFromObject(this.model)
        const size = boundingBox.getSize(new THREE.Vector3())
        const center = boundingBox.getCenter(new THREE.Vector3())
        
        this.basicBox = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.MeshBasicMaterial()
        )
        this.basicBox.position.copy(center)
        this.basicBox.visible = false // Make invisible since it's just for tracking
        this.scene.add(this.basicBox)

        this.setPanel()
    }

    addCustomPanelItems() {
        // Add custom controls to the fox panel
        const customItems = [
            {
                type: 'divider'
            },
            {
                name: 'Animation'
            },
            {
                type: 'divider'
            },
            {
                type: 'link',
                name: 'Play Idle',
                callback: () => {
                    this.playIdle()
                }
            },
            {
                type: 'link', 
                name: 'Play Walking',
                callback: () => {
                    this.playWalking()
                }
            },
            {
                type: 'link',
                name: 'Play Running', 
                callback: () => {
                    this.playRunning()
                }
            },
            {
                type: 'slider',
                name: 'Scale',
                min: 0.01,
                max: 0.1,
                step: 0.001,
                value: 0.02,
                callback: (value) => {
                    this.model.scale.setScalar(value)
                }
            }
        ]

        // Add each custom item to the panel
        customItems.forEach(itemData => {
            const panelItem = new PanelItem(itemData)
            this.point.addPanel(panelItem)
        })
    }

    setAnimation() {
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        // Actions
        this.animation.actions = {}
        
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])
        
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        // Debug
        if(this.debug.active) {
            const debugObject = {
                playIdle: () => {
                    this.transitionTo('idle')
                },
                playWalking: () => {
                    this.transitionTo('walking')
                },
                playRunning: () => {
                    this.transitionTo('running')
                }
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playWalking')
            this.debugFolder.add(debugObject, 'playRunning')
        }
    }

    transitionTo(name, fadeDuration = 1) {
        if(
            !this.animation ||
            !this.animation.actions ||
            !this.animation.actions[name] ||
            !this.animation.actions.current
        ) {
            return
        }

        const newAction = this.animation.actions[name]
        const oldAction = this.animation.actions.current

        if(newAction === oldAction) {
            return
        }

        newAction.reset()
        newAction.play()
        newAction.crossFadeFrom(oldAction, fadeDuration, false)

        this.animation.actions.current = newAction
    }

    playIdle() {
        this.transitionTo('idle')
    }

    playWalking() {
        this.transitionTo('walking')
    }

    playRunning() {
        this.transitionTo('running')
    }

    stopAnimations() {
        this.transitionTo('idle', 0.35)
    }

    update() {
        this.animation.mixer.update(this.time.delta * 0.001)
    }
}
