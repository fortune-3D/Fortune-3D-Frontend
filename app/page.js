'use client'

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import 'typeface-poppins';
import './globals.css';

const Sphere = () => {
  const containerRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const cameraRef = useRef(null);
  const fontRef = useRef(null);
  const planetsRef = useRef([])
  const [isSphereClicked, setIsSphereClicked] = useState(false);





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
    camera.position.z = 40;
    camera.position.y = 20;
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
    const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
    const sunTextureLoader = new THREE.TextureLoader();
    const sunTexture = sunTextureLoader.load('2k_sun.jpg'); // Replace with the path to your sun texture
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0); // Place the sun at the center (0, 0, 0)
    scene.add(sun);
    planetsRef.current.push(sun);

    // Create Mercury
    const mercuryGeometry = new THREE.SphereGeometry(0.38, 64, 64);
    const mercuryTextureLoader = new THREE.TextureLoader();
    const mercuryTexture = mercuryTextureLoader.load('2k_mercury.jpg'); // Replace with the path to your sun texture
    const mercuryMaterial = new THREE.MeshBasicMaterial({ map: mercuryTexture });
    const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.set(5, 0, 0); // Place the sun at the center (0, 0, 0)
    scene.add(mercury);
    planetsRef.current.push(mercury);
    mercury.rotationSpeed = 0.01

    // Create Venus
    const venusGeometry = new THREE.SphereGeometry(0.95, 64, 64);
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

    // Create Mars
    const marsGeometry = new THREE.SphereGeometry(0.53, 64, 64);
    const marsTextureLoader = new THREE.TextureLoader();
    const marsTexture = marsTextureLoader.load('2k_mars.jpg'); // Replace with the path to your sun texture
    const marsMaterial = new THREE.MeshBasicMaterial({ map: marsTexture });
    const mars = new THREE.Mesh(marsGeometry, marsMaterial);
    mars.position.set(10, 10, 10); // Place the sun at the center (0, 0, 0)
    scene.add(mars);
    planetsRef.current.push(mars);
    mars.rotationSpeed = 0.007

    // Create Jupiter
    const jupiterGeometry = new THREE.SphereGeometry(4.3, 64, 64);
    const jupiterTextureLoader = new THREE.TextureLoader();
    const jupiterTexture = jupiterTextureLoader.load('2k_jupiter.jpg'); // Replace with the path to your sun texture
    const jupiterMaterial = new THREE.MeshBasicMaterial({ map: jupiterTexture });
    const jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
    jupiter.position.set(10, 10, 10); // Place the sun at the center (0, 0, 0)
    scene.add(jupiter);
    planetsRef.current.push(jupiter);
    jupiter.rotationSpeed = 0.007

    // Create Saturn
    const saturnGeometry = new THREE.SphereGeometry(3.9, 64, 64);
    const saturnTextureLoader = new THREE.TextureLoader();
    const saturnTexture = saturnTextureLoader.load('2k_saturn.jpg'); // Replace with the path to your sun texture
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    saturn.position.set(10, 10, 10); // Place the sun at the center (0, 0, 0)
    scene.add(saturn);
    planetsRef.current.push(saturn);
    saturn.rotationSpeed = 0.007

    // Create Uranus
    const uranusGeometry = new THREE.SphereGeometry(1.6, 64, 64);
    const uranusTextureLoader = new THREE.TextureLoader();
    const uranusTexture = uranusTextureLoader.load('2k_uranus.jpg'); // Replace with the path to your sun texture
    const uranusMaterial = new THREE.MeshBasicMaterial({ map: uranusTexture });
    const uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
    uranus.position.set(10, 10, 10); // Place the sun at the center (0, 0, 0)
    scene.add(uranus);
    planetsRef.current.push(uranus);
    uranus.rotationSpeed = 0.007

    // Create Neptune
    const neptuneGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const neptuneTextureLoader = new THREE.TextureLoader();
    const neptuneTexture = neptuneTextureLoader.load('2k_neptune.jpg'); // Replace with the path to your sun texture
    const neptuneMaterial = new THREE.MeshBasicMaterial({ map: neptuneTexture });
    const neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
    neptune.position.set(10, 10, 10); // Place the sun at the center (0, 0, 0)
    scene.add(neptune);
    planetsRef.current.push(neptune);
    neptune.rotationSpeed = 0.007


    const mercuryOrbit = createOrbit(11, 0xffffff, "Mercury", -7);
    const venusOrbit = createOrbit(28, 0xffffff, "Venus", 3.39);
    const earthOrbit = createOrbit(44, 0xffffff, "Earth", 0);
    const marsOrbit = createOrbit(59, 0xffffff, "Mars", 1.85);
    const jupiterOrbit = createOrbit(80, 0xffffff, "Jupiter", 1.3);
    const saturnOrbit = createOrbit(89, 0xffffff, "Saturn", 2.49);
    const uranusOrbit = createOrbit(96, 0xffffff, "Uranus", 0.77);
    const neptuneOrbit = createOrbit(100, 0xffffff, "Neptune", 1.77);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    // const handleMouseWheel = (event) => {
    //   const zoomSpeed = 0.01;
    //   const minZoom = 2;
    //   const maxZoom = 50;
    //
    //   const deltaY = event.deltaY;
    //   let zoom = camera.position.z + deltaY * zoomSpeed;
    //   zoom = Math.max(zoom, minZoom);
    //   zoom = Math.min(zoom, maxZoom);
    //   camera.position.z = zoom;
    // };

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

      const orbitDistances = [11, 28, 44, 59, 80, 89, 96, 100];

      for (let i = 1; i < planetsRef.current.length; i++) {
        const planet = planetsRef.current[i];
        const orbitAngle = time * rotationSpeed * (i + 1);
        const orbitRadius = orbitDistances[i - 1]
        calculatePlanetPosition(planet, orbitRadius, orbitAngle);
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


    let clickCount = 0;


const handleSphereClick = (event) => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Calculate the mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set the raycaster origin and direction based on the mouse position
  raycaster.setFromCamera(mouse, cameraRef.current);

  // Find all intersected objects
  const intersects = raycaster.intersectObjects(scene.children, true);

  // Check if the sphere is clicked
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object === sun) {
      clickCount++;

      const zoomSpeed = 0.1;
      const minZoom = 10;
      const maxZoom = 40;

      if (clickCount % 2 === 1) {
        // Odd click count, zoom in and show input form
        const targetZoom = minZoom;

        const currentZoom = cameraRef.current.position.z;
        const zoomDistance = targetZoom - currentZoom;


        const maxFrames = 60; // Maximum number of frames for the animation
        let frameCount = 0; // Counter for the frames elapsed

        const animateZoomIn = () => {
          if (frameCount >= maxFrames) {
            // Stop the animation when the maximum number of frames is reached
            cameraRef.current.position.z = targetZoom;
            controls.update();
            // Show input form here
            setIsSphereClicked(true);
            return;
          }

          // Calculate the progress based on the current frame count and the maximum number of frames
          const progress = frameCount / maxFrames;

          // Calculate the new zoom value based on the progress and the current position and target zoom
          const newZoom = currentZoom + zoomDistance * progress;

          // Calculate the new camera position
          const cameraPosition = new THREE.Vector3(0, 0, newZoom);
          cameraPosition.applyQuaternion(cameraRef.current.quaternion);

          // Update the camera position and target of OrbitControls
          cameraRef.current.position.copy(cameraPosition);
          controls.target = sun.position;

          controls.update(); // Update the controls to apply the changes

          // Render the scene with the updated camera position
          renderer.render(scene, cameraRef.current);

          // Increase the frame count
          frameCount++;

          // Call the next frame of the animation
          requestAnimationFrame(animateZoomIn);
        };

        // Start the zoom in animation
        animateZoomIn();
      } else {
        // Even click count, zoom out and hide input form
        const targetZoom = maxZoom;

        const currentZoom = cameraRef.current.position.z;
        const zoomDistance = targetZoom - currentZoom;


        const maxFrames = 60; // Maximum number of frames for the animation
        let frameCount = 0; // Counter for the frames elapsed

        const animateZoomOut = () => {
          if (frameCount >= maxFrames) {
            // Stop the animation when the maximum number of frames is reached
            cameraRef.current.position.z = targetZoom;
            controls.update();
            // Hide input form here
            setIsSphereClicked(false);
            return;
          }

          // Calculate the progress based on the current frame count and the maximum number of frames
          const progress = frameCount / maxFrames;

          // Calculate the new zoom value based on the progress and the current position and target zoom
          const newZoom = currentZoom + zoomDistance * progress;

          // Calculate the new camera position
          const cameraPosition = new THREE.Vector3(0, 0, newZoom);
          cameraPosition.applyQuaternion(cameraRef.current.quaternion);

          // Update the camera position and target of OrbitControls
          cameraRef.current.position.copy(cameraPosition);
          controls.target = sun.position;

          controls.update(); // Update the controls to apply the changes

          // Render the scene with the updated camera position
          renderer.render(scene, cameraRef.current);

          // Increase the frame count
          frameCount++;

          // Call the next frame of the animation
          requestAnimationFrame(animateZoomOut);
        };

        // Start the zoom out animation
        animateZoomOut();
      }

      break;
    }
  }
};


    window.addEventListener('resize', handleResize);
    containerRef.current.addEventListener('click', handleSphereClick);
    // window.addEventListener('wheel', handleMouseWheel);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      // window.removeEventListener('wheel', handleMouseWheel);
      renderer.dispose();
    };
  }, [] // useEffect ends here
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
      {isSphereClicked && ( // Render the input form only if the sphere is clicked
        <div className='oracle'>
          <div className='label'>
            <label className='text-white' htmlFor="questionInput">
              Please enter your question for the Space Oracle below:
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
      )}
      <div className="container" ref={containerRef}/>
    </div>
  );


  // return (
  //  <div>
  //     <div className='oracle'>
  //       <div className='label'>
  //         <label className='text-white' htmlFor="questionInput">Please enter your question for the Space Oracle below:
  //         </label>
  //       </div>
  //       <div className='questionInput'>
  //         <input
  //           id="questionInput"
  //           type="text"
  //           value={question}
  //           onChange={handleQuestionChange}
  //
  //         />
  //         <button className='text-white pl-2' onClick={handleAskQuestion}>Ask</button>
  //       </div>
  //       <p className='text-white'>{response}</p>
  //     </div>
  //     <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
  //   </div>
  //
  // );
};

export default Sphere;