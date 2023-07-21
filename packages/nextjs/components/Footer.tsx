import { hardhat } from "wagmi/chains";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <div className="min-h-0 p-5 mb-11 lg:mb-0">
      <div className="fixed flex justify-between items-center w-full z-20 p-4 bottom-0 left-0 pointer-events-none">
        <SwitchTheme className="pointer-events-auto" />
      </div>

      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            Built with <HeartIcon className="inline-block h-4 w-4" /> at 🏰{" "}
            <a href="https://buidlguidl.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              BuidlGuidl
            </a>
          </div>
        </ul>
      </div>
    </div>
  );
};
