import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../app/config/reducers';

export const selectConfigDomain = (state: GlobalState) => state.config;

export const selectContentfulConfig = createSelector(selectConfigDomain, (state) => state.contentfulConfig);
export const selectTermsAndConditions = createSelector(selectContentfulConfig, (config) => config?.termsAndConditions);
export const selectPrivacyPolicy = createSelector(selectContentfulConfig, (config) => config?.privacyPolicy);
