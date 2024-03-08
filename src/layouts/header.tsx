import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import ProfileMenu from "./profilemenu";
import { Container } from "@/components";
import { Flex, Image, Link } from "@/components";
import { MENU_ICON_LIST, MENU_LIST } from "@/utils/constants";
import { useConnect, useMenu, useContextLocalStorage } from "@/contexts";
// icons
import clsx from "clsx";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { MdOutlineSearch as Search, MdOutlineMenu as Menu } from "react-icons/md";
import { Autocomplete } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useDetectClickOutside } from "react-detect-click-outside";
import { useDomainDetails } from "@/utils/web3/useDomainDetails";
import { useContextFavorite } from "@/contexts/FavoriteProvider";

export default function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isConnect } = useConnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const { showMenu, setShowMenu } = useMenu();
  const { localstorage } = useContextLocalStorage();
  const { favorite } = useContextFavorite();
  const [unScrolled, setUnScrolled] = useState(true);
  const { openConnectModal } = useConnectModal();

  const [searchedDomain, setSearchedDomain] = useState<string>("");
  const [domainStatus, setDomainStatus] = useState<boolean>(false);
  const { domainData, domainQuery } = useDomainDetails(searchedDomain);
  const [AutocompleteOpen, setAutocompleteOpen] = useState<boolean>(true);
  const timeoutId = useRef<undefined | ReturnType<typeof setTimeout>>(undefined);

  const closeDropdown = () => setShowDropdown(false);

  const ref = useDetectClickOutside({ onTriggered: closeDropdown });

  const options = [
    {
      label: searchedDomain,
      status: searchedDomain === "" ? "" : domainStatus
    }
  ];

  useEffect(() => {
    if ((domainData as { domainName: string })?.domainName === "") {
      setDomainStatus(true);
    } else {
      setDomainStatus(false);
    }
  }, [domainData]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;

    clearTimeout(timeoutId.current);
    setSearchedDomain(inputText);

    timeoutId.current = setTimeout(async () => {
      // const domainData = await fetchDomainDetails(inputText);
      queryClient.invalidateQueries({ queryKey: domainQuery });
    }, 300);
  };

  const handleButtonClick = () => {
    setAutocompleteOpen(false);
    setSearchedDomain("");
    router.push({
      pathname: `register`,
      query: { domain: searchedDomain }
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setUnScrolled(document.documentElement.scrollTop === 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 z-50 w-full ${unScrolled ? "" : "bg-transparent backdrop-blur-xl"} ${!showMenu ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <Container>
        <Flex align="items-center" justifyContent="justify-between" className="py-5">
          <Link href="/" className="cursor-pointer">
            <Image src="/img/zns-logo.png" alt="ZNS Connect logo" width={59} height={59} />
          </Link>
          <Flex align="items-center" className="space-x-7 desktop:space-x-4 laptop:hidden">
            {MENU_LIST.map((menu, index) => {
              return (
                <Link
                  key={`navbar_menu_${index}`}
                  href={menu.link}
                  className={clsx(
                    router.asPath === menu.link ? "text-[16px] font-700 text-primary" : "text-[14px] font-400",
                    "cursor-pointer"
                  )}
                >
                  {menu.name}
                </Link>
              );
            })}
          </Flex>
          <Flex align="items-center" justifyContent="justify-between" className="space-x-7">
            <div className="relative border border-white-200 bg-black-400 rounded-full mobile:hidden">
              <Autocomplete
                open={searchedDomain !== "" && AutocompleteOpen}
                onBlur={() => setAutocompleteOpen(false)}
                onFocus={() => setAutocompleteOpen(true)}
                options={options}
                renderOption={(props, option) => {
                  return (
                    <Flex
                      key={option.label}
                      justifyContent="justify-between"
                      className="px-6 font-space_grotesk cursor-pointer hover:bg-gray-200/40"
                      action={() => handleButtonClick()}
                    >
                      <p className="text-5- font-600 text-main-300">{option.label}</p>
                      <p className={`text-4 font-500 ${!option.status ? "text-red-500" : "text-blue-500"}`}>
                        {option.status === "" ? "" : option.status ? "Available" : "Not Available"}
                      </p>
                    </Flex>
                  );
                }}
                renderInput={(params) => (
                  <div ref={params.InputProps.ref}>
                    <input
                      {...params.inputProps}
                      value={searchedDomain}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleButtonClick();
                      }}
                      placeholder="Search"
                      className="max-w-[238px] w-[238px] desktop:w-full h-[38px] px-4 py-[10px] text-[12px] font-400 placeholder:text-white-500 border-none outline-none bg-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 bg-primary p-2 rounded-full text-center"
                      onClick={handleButtonClick}
                    >
                      <Search className="text-black w-5 h-5" />
                    </button>
                  </div>
                )}
              />
            </div>
            <Flex className="relative space-x-7 desktop:space-x-3 small:hidden">
              {MENU_ICON_LIST.map((menu, index) => (
                <div key={`navbar_menu_icon_${index}`} className="relative">
                  <Link href={menu.link} className="cursor-pointer">
                    {<menu.icon className="w-6 h-6" />}
                  </Link>
                  {menu.link === "/settings?tab=favorite" && JSON.parse(favorite).length != 0 && (
                    <span className="absolute -right-2 -top-[10px] bg-verified rounded-full h-[15px] w-[15px] inline-flex items-center justify-center text-[10px]">
                      {JSON.parse(favorite).length}
                    </span>
                  )}
                  {menu.link === "/cart" && JSON.parse(localstorage).length != 0 && (
                    <span className="absolute -right-2 -top-[10px] bg-verified rounded-full h-[15px] w-[15px] inline-flex items-center justify-center text-[10px]">
                      {JSON.parse(localstorage).length}
                    </span>
                  )}
                </div>
              ))}
            </Flex>

            {!isConnect ? (
              <button
                onClick={openConnectModal}
                className="w-[141px] h-10 text-black bg-primary rounded-full laptop:hidden"
              >
                Connect
              </button>
            ) : (
              <button ref={ref} onClick={() => setShowDropdown(!showDropdown)}>
                <Image
                  src={"/img/profile.png"}
                  alt={"profile"}
                  fill
                  className="w-[44px] h-[44px] shrink-0 rounded-full"
                />
              </button>
            )}

            <button className="hidden laptop:block" onClick={() => setShowMenu(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </Flex>
        </Flex>
        <ProfileMenu showDropdown={showDropdown} closeDropdown={closeDropdown} />
      </Container>
    </div>
  );
}
