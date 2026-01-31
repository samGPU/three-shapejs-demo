import * as THREE from 'three'
import { Point3D, PanelItem } from '@alienkitty/space.js/three'

import Experience from '../Experience.js'

export default class InteractiveObject {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        
        this.point = null
        this.trackingMesh = null
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

    getPanelItems() {
        return []
    }

    initializePanelItems() {
        const items = this.getPanelItems()
        if (items.length > 0) {
            this.addPanelItems(items)
        }
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
}
