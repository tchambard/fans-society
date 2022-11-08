import App from './App';
import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import 'nprogress/nprogress.css';
import * as serviceWorker from './serviceWorker';
import { SidebarProvider } from './contexts/SidebarContext';
import store from './store/index';

const Root = () => {
	return (
		<HelmetProvider>
			<SidebarProvider>
				<Provider store={store}>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</Provider>
			</SidebarProvider>
		</HelmetProvider>
	);
};

ReactDOM.render(<Root />, document.getElementById('root'));

serviceWorker.unregister();
