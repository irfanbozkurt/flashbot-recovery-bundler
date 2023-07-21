import { useEffect } from "react";
import { useDarkMode, useIsMounted } from "usehooks-ts";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { isDarkMode, toggle } = useDarkMode();
  const isMounted = useIsMounted();

  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme", isDarkMode ? "scaffoldEthDark" : "scaffoldEthDark");
  }, [isDarkMode]);

  return (
    <div style={{ display: "none" }} className={`flex space-x-2 text-sm ${className}`}>
      <input
        id="theme-toggle"
        type="checkbox"
        className="toggle toggle-primary bg-primary"
        onChange={toggle}
        checked={isDarkMode}
      />
    </div>
  );
};
