'use client'

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import 'typeface-poppins';
import './globals.css';

const Sphere = () => {
  const containerRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const cameraRef = useRef(null);
  // const [showUI, setShowUI] = useState(false);
  // const [uiPosition, setUIPosition] = useState({ x: 0, y: 0 });
  const fontRef = useRef(null);
  const planetsRef = useRef([])


  const calculatePlanetPosition = (planet, orbitRadius, angle) => {
  const x = Math.cos(angle) * orbitRadius;
  const z = Math.sin(angle) * orbitRadius;
  planet.position.set(x, 0, z);
};


  useEffect(() => {
    const scene = new THREE.Scene();

    //Orbit

    const createOrbit = (radius, color = 0xffffff, label, tiltAngle = 0) => {
      const orbitGroup = new THREE.Group();

      const curve = new THREE.EllipseCurve(0, 0, radius, radius);
      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const orbit = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color })
      );

      orbitGroup.rotation.z = THREE.MathUtils.degToRad(tiltAngle);
      orbitGroup.add(orbit);

      orbit.rotation.x = -Math.PI * 0.5;
      orbitGroup.add(orbit);

      if (label) {
        const labelSprite = createLabelSprite(label);
        labelSprite.position.set(radius, 0, 0);
        orbitGroup.add(labelSprite);
      }

      scene.add(orbitGroup);
      return orbitGroup;
    };

    //Labels

    const createLabelSprite = (text) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const fontSize = 12;
    const fontFace = "Arial";
    const textColor = "#ffffff";

    context.font = `${fontSize}px ${fontFace}`;
    const textWidth = context.measureText(text).width;

    canvas.width = textWidth;
    canvas.height = fontSize;

    context.font = `${fontSize}px ${fontFace}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = textColor;
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(2, 1, 1);

    return sprite;
  };

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
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

     // Animation variables
    const orbitRadius = 5; // Adjust the orbit radius as needed
    const rotationSpeed = 0.75; // Adjust the rotation speed as needed

    // Create the Sun
    const sunGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sunTextureLoader = new THREE.TextureLoader();
    const sunTexture = sunTextureLoader.load('2k_sun.jpg'); // Replace with the path to your sun texture
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0); // Place the sun at the center (0, 0, 0)
    scene.add(sun);
    planetsRef.current.push(sun);

    // Create Mercury
    const mercuryGeometry = new THREE.SphereGeometry(1, 64, 64);
    const mercuryTextureLoader = new THREE.TextureLoader();
    const mercuryTexture = mercuryTextureLoader.load('2k_mercury.jpg'); // Replace with the path to your sun texture
    const mercuryMaterial = new THREE.MeshBasicMaterial({ map: mercuryTexture });
    const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.set(5, 0, 0); // Place the sun at the center (0, 0, 0)
    scene.add(mercury);
    planetsRef.current.push(mercury);
    mercury.rotationSpeed = 0.01

    // Create Venus
    const venusGeometry = new THREE.SphereGeometry(1, 64, 64);
    const venusTextureLoader = new THREE.TextureLoader();
    const venusTexture = venusTextureLoader.load('2k_venus_surface.jpg'); // Replace with the path to your sun texture
    const venusMaterial = new THREE.MeshBasicMaterial({ map: venusTexture });
    const venus = new THREE.Mesh(venusGeometry, venusMaterial);
    venus.position.set(10, 10, 10); // Place the sun at the center (0, 0, 0)
    scene.add(venus);
    planetsRef.current.push(venus);
    venus.rotationSpeed = 0.007

    // Earth
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.set(15,0,0)
    planetsRef.current.push(sphere);
    sphere.rotationSpeed = 0.005

    // Create Moon
    const moonGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    const moonTextureLoader = new THREE.TextureLoader();
    const moonTexture = moonTextureLoader.load('2k_moon.jpg');
    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(2, 0, 0); // Adjust the position relative to Venus
    sphere.add(moon); // Add the moon as a child of Venus

    // Update moon's position in the animation loop
    const moonOrbitRadius = 2; // Adjust the moon's orbit radius as needed
    const moonRotationSpeed = 25; // Adjust the moon's rotation speed as needed


    const mercuryOrbit = createOrbit(10, 0xffffff, "Mercury", -7);
    const venusOrbit = createOrbit(15, 0xffffff, "Venus", 3.39);
    const earthOrbit = createOrbit(20, 0xffffff, "Earth", 0);
    // const marsOrbit = createOrbit(20, 0xff3300, "Mars");

    function createPlanetLabel(text) {
      const labelCanvas = document.createElement('canvas');
      const context = labelCanvas.getContext('2d');
      context.font = '12px Arial';
      const textWidth = context.measureText(text).width;

      labelCanvas.width = textWidth;
      labelCanvas.height = 16;

      context.font = '12px Arial';
      context.fillStyle = 'white';
      context.fillText(text, 0, 12);

      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });

      const labelSprite = new THREE.Sprite(labelMaterial);
      labelSprite.scale.set(1, 0.5, 1);
      labelSprite.position.set(0, 1.5, 0); // Adjust the label position relative to the planet

      return labelSprite;
    }

    // // Create the Oracle
    // const planetGeometry1 = new THREE.SphereGeometry(0.1, 64, 64);
    // const planetMaterial1 = new THREE.MeshPhongMaterial({
    //   color: 0xffffff, // Specify the color for the planet
    //   shininess: 50,
    // });
    // const planet1 = new THREE.Mesh(planetGeometry1, planetMaterial1);
    // planet1.position.set(-2, 0, 0); // Set the position of the planet
    // scene.add(planet1); // Add the planet to the scene
    // planetsRef.current.push(planet1);



    // // Create the material for the emitting sphere
    // const emittingMaterial = new THREE.MeshStandardMaterial({
    //   color: 0xffffff,
    //   emissive: 0xffff00, // Set the emissive color to white
    //   emissiveIntensity: 1, // Adjust the intensity as needed
    // });
    //
    // // Create the emitting sphere geometry
    // const emittingGeometry = new THREE.SphereGeometry(0.2, 64, 64);
    // const emittingSphere = new THREE.Mesh(emittingGeometry, emittingMaterial);
    // emittingSphere.position.set(-2, 0, 0);
    // scene.add(emittingSphere);
    //
    // // Create a render pass
    // const renderPass = new RenderPass(scene, camera);
    //
    // // Create an unreal bloom pass for the glow effect
    // const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    // bloomPass.threshold = 0;
    // bloomPass.strength = 3;
    // bloomPass.radius = 1;
    //
    // // Create an effect composer and add the passes
    // const composer = new EffectComposer(renderer);
    // composer.addPass(renderPass);
    // composer.addPass(bloomPass);


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

      const time = Date.now() * 0.0001;

      for (let i = 1; i < planetsRef.current.length; i++) {
        const planet = planetsRef.current[i];
        const orbitAngle = time * rotationSpeed * (i + 1);
        calculatePlanetPosition(planet, orbitRadius * (i + 1), orbitAngle);
      }

      const moonOrbitAngle = time * moonRotationSpeed;
      calculatePlanetPosition(moon, moonOrbitRadius, moonOrbitAngle);

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
      renderer.dispose();
    };
  }, []
        // [showUI, uiPosition]
  );



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
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        responseText.position.set(0, 0.3, -2); // Adjust the position as needed
        scene.add(responseText);
      })
      .catch((error) => console.error(error));
  };

  console.log(planetsRef.current)

  return (
   <div>
      <div className='oracle'>
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