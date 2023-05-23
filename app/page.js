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

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF });
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

    const geometry = new THREE.SphereGeometry(1, 32, 32);

    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('globe_texture.jpg');

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
    window.addEventListener('wheel', handleMouseWheel);

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