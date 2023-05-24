// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
import React from "react";

export default function Page() {
  return (
    <div className="bg-black text-white p-4">
      <h1 className="pb-4 text-xl">About Us:</h1>
        <article>
            <h2 className="pb-2">Tyler Huntley</h2>
              <p className="pl-4"><a href="https://www.linkedin.com/in/tyler-huntley76/">~LinkedIn~</a></p>
              <ul className="p-4">
                  <li>- Software developer, manager, salesman, and gamer</li>
                  <li>- Specialty in Python</li>
                  <li>- United States Air Force veteran</li>
                  <li>- Over 9 years in HVAC: troubleshooting, repairing, and maintaining heating equipment</li>
                  <li>- Building great client relationships</li>
                  <li>- Managing large projects</li>
                  <li>- Attention to detail</li>
              </ul>
        </article>
        <article>
            <h2 className="pb-2">Darran Holmes</h2>
              <p className="pl-4"><a href="https://www.linkedin.com/in/darrandholmes/">~LinkedIn~</a></p>
              <ul className="p-4">
                  <li>- United States Air Force Veteran</li>
                  <li>- Love to Travel</li>
                  <li>- Gamer</li>
                  <li>- Software Developer</li>
                  <li>- Aspiring Game Developer</li>
                  <li>- Currently learning THREE.js Unreal Engine and Blender</li>
              </ul>
        </article>
        <article>
            <h2 className="pb-2">Dominick Martin</h2>
              <p className="pl-4"><a href="https://www.linkedin.com/in/dominickmartin/">~LinkedIn~</a></p>
              <ul className="p-4">
                  <li>- Live in Seattle, but hail from California</li>
                  <li>- Family of 5 with 6 cats</li>
                  <li>- Market research background, but code curious</li>
                  <li>- Interest in AR/VR Software Development</li>
                  <li>- United States Marine Corps Veteran</li>
              </ul>
            <h2 className="pb-2">Sheldon Pierce</h2>
              <p className="pl-4"><a href="https://www.linkedin.com/in/sheldon-pierce/">~LinkedIn~</a></p>
              <ul className="p-4">
                  <li>- Customer-Obsessed Software Developer making applications for the people.</li>
              </ul>
        </article>
        <article>
          <p className="pt-4 text-xl">
            Thank you for visiting our website. We hope you have enjoyed the experience!
              <ul className="pt-4">
                  <li>&copy; Fortune-3D 2023</li>
              </ul>
          </p>
        </article>
    </div>
  );
}