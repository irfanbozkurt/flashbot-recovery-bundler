import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

/**
 * Site header
 */
export const Header = () => {
  const [, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6"></Link>
      </div>
    </div>
  );
};
