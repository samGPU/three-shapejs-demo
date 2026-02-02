import * as THREE from 'three'
import { Point3D, PanelItem } from '@alienkitty/space.js/three'

import Experience from '../Experience.js'
import SoundEffect from '../Utils/SoundEffect.js'

export default class InteractiveObject {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        
        this.point = null
        this.trackingMesh = null
        
        // Sound effects map
        this.sounds = new Map()
    }

    setupPanel(targetObject, options = {}) {
        const {
            name = 'Object',
            type = 'Interactive Object',
            createTrackingBox = true
        } = options

        let trackingTarget = targetObject

        // Create a bounding box mesh for tracking if requested
        if (createTrackingBox) {
            const boundingBox = new THREE.Box3().setFromObject(targetObject)
            const size = boundingBox.getSize(new THREE.Vector3())
            const center = boundingBox.getCenter(new THREE.Vector3())

            this.trackingMesh = new THREE.Mesh(
                new THREE.BoxGeometry(size.x, size.y, size.z),
                new THREE.MeshBasicMaterial()
            )
            this.trackingMesh.position.copy(center)
            this.trackingMesh.visible = false
            this.scene.add(this.trackingMesh)

            trackingTarget = this.trackingMesh
        }

        // Create Point3D for 3D tracking
        this.point = new Point3D(trackingTarget, {
            name,
            type
        })
        this.scene.add(this.point)
    }

    addPanelItems(items) {
        if (!this.point) {
            console.warn('Panel not initialized. Call setupPanel() first.')
            return
        }

        items.forEach(itemData => {
            const panelItem = new PanelItem(itemData)
            this.point.addPanel(panelItem)
        })
    }

    static divider() {
        return { type: 'divider' }
    }

    static label(name) {
        return { name }
    }

    static link(name, value, callback) {
        return {
            type: 'link',
            name,
            value,
            callback
        }
    }

    /**
     * Create a link panel item that plays a sound when clicked.
     * @param {string} name - Display name
     * @param {string} value - Value text
     * @param {Function} callback - Click callback (receives the object instance)
     * @param {string} soundName - Name of sound to play (must be registered with addSound)
     * @returns {Function} Returns a function that takes the object instance and returns the link config
     */
    static linkWithSound(name, value, callback, soundName) {
        // Return a factory function that takes the instance
        return (instance) => ({
            type: 'link',
            name,
            value,
            callback: () => {
                if (soundName && instance.sounds.has(soundName)) {
                    instance.playSound(soundName)
                }
                callback.call(instance)
            }
        })
    }

    getPanelItems() {
        return []
    }

    initializePanelItems() {
        const items = this.getPanelItems()
        if (items.length > 0) {
            // Process items - resolve any factory functions
            const resolvedItems = items.map(item => {
                if (typeof item === 'function') {
                    return item(this)
                }
                return item
            })
            this.addPanelItems(resolvedItems)
        }
    }

    /**
     * Register a sound effect for this object.
     * @param {string} name - Unique name to reference this sound
     * @param {string} path - Path to the audio file
     * @param {Object} options - Sound options (volume, loop, etc.)
     */
    addSound(name, path, options = {}) {
        const sound = new SoundEffect(path, options)
        this.sounds.set(name, sound)
        return sound
    }

    /**
     * Play a registered sound by name.
     * @param {string} name - Name of the sound to play
     */
    playSound(name) {
        const sound = this.sounds.get(name)
        if (sound) {
            sound.play()
        } else {
            console.warn(`Sound "${name}" not found. Register it with addSound() first.`)
        }
    }

    /**
     * Stop a registered sound by name.
     * @param {string} name - Name of the sound to stop
     */
    stopSound(name) {
        const sound = this.sounds.get(name)
        if (sound) {
            sound.stop()
        }
    }

    /**
     * Stop all registered sounds.
     */
    stopAllSounds() {
        this.sounds.forEach(sound => sound.stop())
    }

    disposePanel() {
        if (this.point) {
            this.scene.remove(this.point)
            this.point = null
        }

        if (this.trackingMesh) {
            this.scene.remove(this.trackingMesh)
            this.trackingMesh.geometry.dispose()
            this.trackingMesh.material.dispose()
            this.trackingMesh = null
        }
    }

    /**
     * Clean up all sounds.
     */
    disposeSounds() {
        this.stopAllSounds()
        this.sounds.clear()
    }

    /**
     * Full cleanup.
     */
    dispose() {
        this.disposePanel()
        this.disposeSounds()
    }
}
