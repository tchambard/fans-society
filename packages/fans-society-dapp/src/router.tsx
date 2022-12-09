import * as _ from 'lodash';
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import BaseLayout from './layouts/BaseLayout';
import SuspenseLoader from './components/SuspenseLoader';
import SidebarLayout from './layouts/SidebarLayout';
import ContainerWrapper from './components/ContainerWrapper';

const Loader = (Component) => (props) =>
	(
		<Suspense fallback={<SuspenseLoader />}>
			<Component {...props} />
		</Suspense>
	);

const Home = Loader(lazy(() => import('src/content/home/components/Home')));

const ProjectList = Loader(
	lazy(
		() => import('src/content/projects/components/list/ProjectListContainer'),
	),
);
const Project = Loader(
	lazy(() => import('src/content/projects/components/detail/ProjectContainer')),
);

const TokenList = Loader(
	lazy(() => import('src/content/tokens/components/list/TokenListContainer')),
);
const Token = Loader(
	lazy(() => import('src/content/tokens/components/detail/TokenContainer')),
);

const Dashboard = Loader(
	lazy(() => import('src/content/dashboard/components/DashboardContainer')),
);

const Status404 = Loader(lazy(() => import('src/content/not-found')));

export class Routes {
	public static ROOT = `/`;
	public static HOME = `/home`;

	public static PROJECT_LIST = `/projects`;
	public static PROJECT_DETAIL = `${Routes.PROJECT_LIST}/:projectId`;

	public static TOKEN_LIST = `/tokens`;
	public static TOKEN_DETAIL = `${Routes.TOKEN_LIST}/:projectId`;
	public static DASHBOARD = `/dashboard`;
}

export function buildRoute(route: string, params?: any, hash?: any) {
	let _route = _.reduce(
		params,
		(_route, value, key) => {
			return _route.replace(new RegExp(`:${key}`, 'g'), value);
		},
		route,
	);
	if (hash) {
		_route += '#' + _.map(hash, (v, k) => `${k}=${v}`).join('&');
	}
	return _route;
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
				element: <ProjectList />,
			},
			{
				path: Routes.PROJECT_DETAIL,
				element: <Project />,
			},
		],
	},
	{
		path: 'tokens',
		element: <SidebarLayout />,
		children: [
			{
				path: Routes.TOKEN_LIST,
				element: <TokenList />,
			},
			{
				path: Routes.TOKEN_DETAIL,
				element: <Token />,
			},
		],
	},
	{
		path: 'dashboard',
		element: <SidebarLayout />,
		children: [
			{
				path: Routes.DASHBOARD,
				element: <Dashboard />,
			},
		],
	},
];
