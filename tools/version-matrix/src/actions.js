import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchServices = createAsyncThunk(
    'services/fetch',
    async ({envName, services}) => {
        return Promise.all(
            services.map(
                serviceName => fetch(`${process.env.REACT_APP_VERSIONS_BASE_URL}/${envName}-${serviceName}.json`).then(r => r.json())
            )
        );
    }
);

export const fetchVersions = createAsyncThunk(
    'versions/fetch',
    async (_, thunkAPI) => {
        const response = await fetch(`${process.env.REACT_APP_VERSIONS_BASE_URL}/versions.json`);
        const versions = await response.json();

        versions.forEach(version => {
            thunkAPI.dispatch(fetchServices({envName: version.name, services: version.services}));
        });

        return versions;
    }
)
