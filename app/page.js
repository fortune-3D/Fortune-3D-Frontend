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
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [isSphereClicked, setIsSphereClicked] = useState(false); // New state variable

  


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
    // const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF });
    // const stars = new THREE.Points(starsGeometry, starsMaterial);
    // scene.add(stars);

    // const light = new THREE.PointLight(0xFFFFFF);
    // light.position.set(10, 10, 10);
    // scene.add(light);


    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('earth_texture.jpg');

    // Create the material with shading and the texture
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 100,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

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

    //   const deltaY = event.deltaY;
    //   let zoom = camera.position.z + deltaY * zoomSpeed;
    //   zoom = Math.max(zoom, minZoom);
    //   zoom = Math.min(zoom, maxZoom);
    //   camera.position.z = zoom;
    // };

    
    // const handleSphereClick = (event) => {
    //   if (event.target === sphere)
    //   setIsSphereClicked(true);
    // };

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
    if (intersects[i].object === sphere) {
      clickCount++;

      const zoomSpeed = 0.1;
      const minZoom = 3;
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
          controls.target = sphere.position;

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
          controls.target = sphere.position;

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
    // window.addEventListener('wheel', handleMouseWheel);
    containerRef.current.addEventListener('click', handleSphereClick);

    const animate = () => {
      requestAnimationFrame(animate);

      // Move the stars
      const positions = starsGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.1;
        if (positions[i + 1] < -1000) {
         positions[i + 1] = 1000;
        }

      }
      starsGeometry.attributes.position.needsUpdate = true;

      // Rotate the sphere
      sphere.rotation.x += 0.000028;
      sphere.rotation.y += 0.001;



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
    // window.addEventListener('wheel', handleMouseWheel);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleMouseWheel);
      renderer.dispose();
    };
  }, []);

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
};

export default Sphere;