// app/NavBar.js
import Link from 'next/link';

const NavBar = () => {
  return (
    <nav className="bg-black p-4">
      <ul className="flex text-white pl-4">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li className="pl-4">
          <Link href="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;