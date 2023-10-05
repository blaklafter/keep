"use client";
import { Text } from "@tremor/react";
import { Providers, Provider } from "./providers";
import { useEffect, useState } from "react";
import SlidingPanel from "react-sliding-side-panel";
import ProviderForm from "./provider-form";
import ProviderTile from "./provider-tile";
import "./providers-tiles.css";
import "react-sliding-side-panel/lib/index.css";
import { useSearchParams } from "next/navigation";
import { hideOrShowIntercom } from "@/components/ui/Intercom";

const ProvidersTiles = ({
  providers,
  addProvider,
  onDelete,
  installedProvidersMode = false,
}: {
  providers: Providers;
  addProvider: (provider: Provider) => void;
  onDelete: (provider: Provider) => void;
  installedProvidersMode?: boolean;
}) => {
  const searchParams = useSearchParams();
  const [openPanel, setOpenPanel] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const providerType = searchParams?.get("provider_type");
  const providerName = searchParams?.get("provider_name");

  useEffect(() => {
    if (providerType && providerName) {
      // Find the provider based on providerType and providerName
      const provider = providers.find(
        (provider) => provider.type === providerType
      );

      if (provider) {
        setSelectedProvider(provider);
        setFormValues({
          provider_name: providerName,
        });
        setOpenPanel(true);
      }
    }
  }, [providerType, providerName, providers]);

  const handleFormChange = (
    updatedFormValues: Record<string, string>,
    updatedFormErrors: Record<string, string>
  ) => {
    setFormValues(updatedFormValues);
    setFormErrors(updatedFormErrors);
  };

  const handleConnectProvider = (provider: Provider) => {
    hideOrShowIntercom(true);
    setSelectedProvider(provider);
    if (installedProvidersMode) {
      setFormValues({
        provider_name: provider.details.name!,
        ...provider.details?.authentication,
      });
    }
    setOpenPanel(true);
  };

  const handleCloseModal = () => {
    setOpenPanel(false);
    hideOrShowIntercom(false);
    setSelectedProvider(null);
    setFormValues({});
    setFormErrors({});
  };

  const handleConnecting = (isConnecting: boolean, isConnected: boolean) => {
    if (isConnected) handleCloseModal();
  };

  const providersWithConfig = providers
    .filter((provider) => {
      const config = (provider as Provider).config;
      return config && Object.keys(config).length > 0; // Filter out providers with empty config
    })
    .sort(
      (a, b) =>
        Number(b.can_setup_webhook) - Number(a.can_setup_webhook) ||
        Number(b.supports_webhook) - Number(a.supports_webhook) ||
        Number(b.oauth2_url ? true : false) -
          Number(a.oauth2_url ? true : false)
    ) as Providers;

  return (
    <div>
      <Text className="ml-2.5 mt-5">
        {installedProvidersMode ? "Installed Providers" : "Available Providers"}
      </Text>
      <div className="provider-tiles">
        {providersWithConfig.map((provider, index) => (
          <ProviderTile
            key={provider.id}
            provider={provider}
            onClick={() => handleConnectProvider(provider)}
          ></ProviderTile>
        ))}
      </div>
      <SlidingPanel
        type={"right"}
        isOpen={openPanel}
        size={30}
        backdropClicked={handleCloseModal}
        panelContainerClassName="bg-white z-[2000]"
      >
        {selectedProvider && (
          <ProviderForm
            provider={selectedProvider}
            formData={formValues}
            formErrorsData={formErrors}
            onFormChange={handleFormChange}
            onConnectChange={handleConnecting}
            onAddProvider={addProvider}
            closeModal={handleCloseModal}
            installedProvidersMode={installedProvidersMode}
            isProviderNameDisabled={installedProvidersMode}
            onDelete={onDelete}
          />
        )}
      </SlidingPanel>
    </div>
  );
};

export default ProvidersTiles;
