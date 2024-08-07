import { useAccount } from "wagmi";
export const useContractAddressByChain = () => {
  const { chain } = useAccount();
  const chainID = chain?.id;
  let registryAddress: string | undefined;
  switch (chainID) {
    case 84532:
      registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_BASE_SEPOLIA;
      break;
    case 80001:
      registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_POLYGON_MUMBAI;
      break;
    case 204:
      registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_OPBNB_TESTNET;
      break;
    case 195:
      registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_X1_TESTNET;
      break;
    case 80085:
      registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS_BERACHAIN_ARTIO;
      break;
    default:
      console.error("Chain not supported");
      break;
  }
  return registryAddress;
};
