import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';

interface IBaseLayoutProps {
	children?: ReactNode;
}

const BaseLayout: FC<IBaseLayoutProps> = ({ children }) => {
	return <>{children || <Outlet />}</>;
};

BaseLayout.propTypes = {
	children: PropTypes.node,
};

export default BaseLayout;
