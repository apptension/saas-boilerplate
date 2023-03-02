import { useEffect, useState } from 'react';

type Version = unknown;

export const useFetchVersions = () => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const fetchVersions = async () => {
    setIsFetching(true);
    setError(undefined);

    try {
      const response = await fetch(
        `${process.env.NX_VERSIONS_BASE_URL}/versions.json`
      );
      const versions = await response.json();

      setVersions(versions);
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
