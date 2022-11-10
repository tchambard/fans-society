import { FC, useState, createContext } from 'react';

interface ISidebarContext {
	sidebarToggle: any;
	toggleSidebar: () => void;
}

export const SidebarContext = createContext<ISidebarContext>(
	{} as ISidebarContext,
);

export const SidebarProvider: FC = ({ children }) => {
	const [sidebarToggle, setSidebarToggle] = useState(false);
	const toggleSidebar = () => {
		setSidebarToggle(!sidebarToggle);
	};

	return (
		<SidebarContext.Provider value={{ sidebarToggle, toggleSidebar }}>
			{children}
		</SidebarContext.Provider>
	);
};
