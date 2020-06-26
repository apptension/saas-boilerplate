export function fetchVersions() {
    return async function (dispatch) {
        const response = await fetch(process.env.REACT_APP_VERSIONS_JSON_URL);
        const versions = await response.json();
        
        dispatch({
            type: 'VERSIONS_RECEIVED',
            versions,
        });
    }
}
