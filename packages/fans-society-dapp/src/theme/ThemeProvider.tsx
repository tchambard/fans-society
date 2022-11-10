import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material';
import { themeCreator } from './base';
import { StylesProvider } from '@mui/styles';

export const ThemeContext = React.createContext((themeName: string): void => {
	// noop
});

const ThemeProviderWrapper: React.FC = (props) => {
	const curThemeName = localStorage.getItem('appTheme') || 'NebulaFighterTheme';
	const [themeName, _setThemeName] = useState(curThemeName);
	const theme = themeCreator(themeName);
	const setThemeName = (_themeName: string): void => {
		localStorage.setItem('appTheme', _themeName);
		_setThemeName(_themeName);
	};

	return (
		<StylesProvider injectFirst>
			<ThemeContext.Provider value={setThemeName}>
				<ThemeProvider theme={theme}>{props.children}</ThemeProvider>
			</ThemeContext.Provider>
		</StylesProvider>
	);
};

export default ThemeProviderWrapper;
