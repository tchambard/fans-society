import * as _ from 'lodash';
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import BaseLayout from './layouts/BaseLayout';
import SuspenseLoader from './components/SuspenseLoader';
import SidebarLayout from './layouts/SidebarLayout';
import ProjectWrapper from './content/project/components/ProjectWrapper';

const Loader = (Component) => (props) =>
	(
		<Suspense fallback={<SuspenseLoader />}>
			<Component {...props} />
		</Suspense>
	);

const Home = Loader(lazy(() => import('src/content/home/components/Home')));

const ProjectHome = Loader(
	lazy(() => import('src/content/project/components/ProjectHome')),
);

const Status404 = Loader(lazy(() => import('src/content/not-found')));

export class Routes {
	public static ROOT = `/`;
	public static HOME = `/home`;

	public static PROJECT_LIST = `/projects`;
}

export function buildRoute(route: string, params?: any) {
	return _.reduce(
		params,
		(_route, value, key) => {
			return _route.replace(new RegExp(`:${key}`, 'g'), value);
		},
		route,
	);
}

export const routes: RouteObject[] = [
	{
		path: Routes.ROOT,
		element: <BaseLayout />,
		children: [
			{
				path: '/',
				element: <Navigate to={Routes.HOME} replace />,
			},
			{
				path: '*',
				element: <Status404 />,
			},
		],
	},
	{
		path: 'home',
		element: <SidebarLayout />,
		children: [
			{
				path: Routes.HOME,
				element: <Home />,
			},
		],
	},
	{
		path: 'projects',
		element: <SidebarLayout />,
		children: [
			{
				path: Routes.PROJECT_LIST,
				element: (
					<ProjectWrapper>
						<ProjectHome />
					</ProjectWrapper>
				),
			},
		],
	},
];
