import { useEffect, useState } from 'react';

type VersionValue = {
  label: string;
  value: string;
};

type Version = {
  envs: Array<{
    name: string;
    version: string;
    builtAt: string;
    values: VersionValue[];
  }>;
  services: Record<
    string,
    Array<{
      name: string;
      version: string;
      builtAt: string;
      values: VersionValue[];
    }>
  >;
};

export const useFetchVersions = () => {
  const [versions, setVersions] = useState<Version>({ envs: [], services: {} });
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const fetchVersions = async () => {
    setIsFetching(true);
    setError(undefined);

    try {
      const baseUrl = process.env.NX_VERSIONS_BASE_URL;
      const response = await fetch(`${baseUrl}/versions.json`);
      const envs = await response.json();

      const services = await Promise.all(
        envs.map(async (env) =>
          Promise.all(
            env.services.map(async (serviceName) =>
              fetch(`${baseUrl}/${env.name}-${serviceName}.json`).then(
                async (r) => ({
                  envName: env.name,
                  ...(await r.json()),
                })
              )
            )
          )
        )
      );

      const servicesMap = services.reduce((out, envServices) => {
        return envServices.reduce((mapped, service) => {
          mapped[service.envName] = mapped[service.envName] ?? {};
          mapped[service.envName][service.name] = service;
          return mapped;
        }, out);
      }, {});

      setVersions({
        envs,
        services: servicesMap,
      });
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  return { versions, isFetching, error };
};
