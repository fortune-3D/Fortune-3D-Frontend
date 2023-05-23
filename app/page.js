'use client'

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
// import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import 'typeface-poppins';
import './globals.css';



const Sphere = () => {
  const containerRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const cameraRef = useRef(null);
  const [showUI, setShowUI] = useState(false);
  const [uiPosition, setUIPosition] = useState({ x: 0, y: 0 });
  const fontRef = useRef(null);


  useEffect(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Create a background of stars
    const starCount = 3000;
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 2000;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i3 + 2] = (Math.random() - 0.5) * 2000;
    }

      // Create a custom shader material for the stars
    const starVertexShader = `
      attribute float size;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const starFragmentShader = `
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `;

    const starsMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Light
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Point Light
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(0, 0, 10);
    directionalLight.castShadow = true; // Enable shadow casting
    scene.add(directionalLight);


    // Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;


    // Ground Plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true; // Enable shadow receiving
    scene.add(plane);

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('earth_texture.jpg');

    // Create the material with shading and the texture
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 100,
    });

    // Earth
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);


    // Create the Oracle
    const planetGeometry1 = new THREE.SphereGeometry(0.1, 64, 64);
    const planetMaterial1 = new THREE.MeshPhongMaterial({
      color: 0xffffff, // Specify the color for the planet
      shininess: 50,
    });
    const planet1 = new THREE.Mesh(planetGeometry1, planetMaterial1);
    planet1.position.set(-2, 0, 0); // Set the position of the planet
    scene.add(planet1); // Add the planet to the scene

    // Create the material for the emitting sphere
    const emittingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffff00, // Set the emissive color to white
      emissiveIntensity: 1, // Adjust the intensity as needed
    });

    // Create the emitting sphere geometry
    const emittingGeometry = new THREE.SphereGeometry(0.2, 64, 64);
    const emittingSphere = new THREE.Mesh(emittingGeometry, emittingMaterial);
    emittingSphere.position.set(-2,0,0);
    scene.add(emittingSphere);


    // Create a render pass
    const renderPass = new RenderPass(scene, camera);

    // Create an unreal bloom pass for the glow effect
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 3;
    bloomPass.radius = 1;

    // Create an effect composer and add the passes
    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);


    // Create the second planet
    const planetGeometry2 = new THREE.SphereGeometry(0.3, 16, 16);
    const planetMaterial2 = new THREE.MeshPhongMaterial({
      color: 0x00ff00, // Specify the color for the planet
      shininess: 30,
    });
    const planet2 = new THREE.Mesh(planetGeometry2, planetMaterial2);
    planet2.position.set(2, 0, -20); // Set the position of the planet
    scene.add(planet2); // Add the planet to the scene

    // Create the Sun

    const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
    const sunTextureLoader = new THREE.TextureLoader();
    const sunTexture = sunTextureLoader.load('2k_sun.jpg'); // Replace with the path to your sun texture
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(20,20,300)
    scene.add(sun);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    const handleMouseWheel = (event) => {
      const zoomSpeed = 0.01;
      const minZoom = 2;
      const maxZoom = 50;

      const deltaY = event.deltaY;
      let zoom = camera.position.z + deltaY * zoomSpeed;
      zoom = Math.max(zoom, minZoom);
      zoom = Math.min(zoom, maxZoom);
      camera.position.z = zoom;
    };

    const animate = () => {
      requestAnimationFrame(animate);


    // Move the stars
    const positions = starsGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += 0.1; // Increase the z-coordinate
      if (positions[i + 2] > 1000) {
        positions[i + 2] = -1000;
      }
    }
    starsGeometry.attributes.position.needsUpdate = true;

      // Rotate the sphere
      sphere.rotation.x += 0.000028;
      sphere.rotation.y += 0.001;

      sun.rotation.x += 0.00005;
      sun.rotation.y -= 0.001;

      renderer.render(scene, cameraRef.current);
    };

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 3

    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleMouseWheel);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleMouseWheel);
      window.removeEventListener('mousedown', handleMouseDown);
      renderer.dispose();
    };
  }, [showUI, uiPosition]);


  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleAskQuestion = () => {
    // Make API request with the question and update the response state
    fetch(`https://fortune-backend.vercel.app/api/v1/fortune/`)
      .then((response) => response.json())
      .then((data) => {
        const fortune = data[Math.floor(Math.random() * data.length)].fortune;
        setResponse(fortune);
        const responseText = new THREE.Mesh(
          // new THREE.TextBufferGeometry(fortune, {
          //   font: THREE.FontUtils.faces['helvetiker'],
          //   size: 0.1,
          //   height: 0.02,
          // }),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        responseText.position.set(0, 0.3, -2); // Adjust the position as needed
        scene.add(responseText);
      })
      .catch((error) => console.error(error));
  };

  return (
   <div>
      <div className='oracle'
      // style={{
      //   position: 'fixed',
      //   top: '50%',
      //   left: '50%',
      //   transform: 'translate(-50%, -50%)',
      //   zIndex: 1,
      // }}
      >
        <div className='label'>
          <label className='text-white' htmlFor="questionInput">Please enter your question for the Space Oracle below:
          </label>
        </div>
        <div className='questionInput'>
          <input
            id="questionInput"
            type="text"
            value={question}
            onChange={handleQuestionChange}

          />
          <button className='text-white pl-2' onClick={handleAskQuestion}>Ask</button>
        </div>
        <p className='text-white'>{response}</p>
      </div>
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
};

export default Sphere;