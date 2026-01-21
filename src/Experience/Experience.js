import * as THREE from 'three';

import Debug from './Utils/Debug.js';
import Sizes from './Utils/Sizes.js';
import Time from './Utils/Time.js';
import Camera from './Camera.js';
import Renderer from './Renderer.js';
import World from './World/World.js';
import Resources from './Utils/Resources.js';
import State from './Utils/State.js';

import UserInput from './Utils/UserInput.js';

import sources from './sources.js';

import StartScreen from '../UI/StartScreen.js';

import { Point3D, UI } from '@alienkitty/space.js/three';

let instance = null;

export default class Experience {
    constructor(_canvas) {
        // Singleton
        if(instance) {
            return instance;
        }
        instance = this;
        
        // Global access
        window.experience = this;

        // Options
        this.canvas = _canvas;

        // Setup
        this.debug = new Debug();
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.resources = new Resources(sources);
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.world = new World();

        // Space.js UI
        this.ui = new UI();
        this.ui.animateIn();
        document.body.appendChild(this.ui.element);
        Point3D.init(this.renderer.instance, this.camera.instance, this.scene);

        // User input handler (wait for fox to be ready)
        this.userInput = null;
        this.resources.on('ready', () => {
            // World.fox is created after resources are ready
            this.userInput = new UserInput(this.world);
        });

        this.state = new State('LOADING');

        this.uiController = new StartScreen();

        // Resize event
        this.sizes.on('resize', () => {
            this.resize();
        });

        // Time tick event
        this.time.on('tick', () => {
            this.update();
        });

        // State change event
        this.state.on('continueSelected', () => {
            this.continueSelected();
        });

    }

    continueSelected() {
        console.log('Continue selected');
        this.state.setState('EXPERIENCE');
        this.uiController.hide();
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();
    }

    update() {
        this.camera.update();
        this.world.update();
        this.renderer.update();
        
        // Update Point3D tracking system
        Point3D.update(this.time.elapsed * 0.001);
        this.ui.update();
    }

    destroy() {
        if (this.userInput) {
            this.userInput.destroy();
        }
        this.sizes.off('resize')
        this.time.off('tick')
        this.state.off('continueSelected')

        // Traverse the whole scene
        this.scene.traverse((child) => {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh) {
                child.geometry.dispose();

                // Loop through the material properties
                for(const key in child.material) {
                    const value = child.material[key];

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function') {
                        value.dispose();
                    }
                }
            }
        });

        this.camera.controls.dispose();
        this.renderer.instance.dispose();

        if(this.debug.active)
            this.debug.ui.destroy();
    }
}
