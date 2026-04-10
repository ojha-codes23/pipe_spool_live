// import { createRoot } from 'react-dom/client';
// import './index.css';
// import App from './App.jsx';
// import { Provider } from 'react-redux';
// import { store } from './redux/store.js';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// createRoot(document.getElementById('root')).render(
//   <>
//    <Provider store={store}>
//       <App />
//     </Provider> 
  
//    <ToastContainer
//       position="top-right"
//       autoClose={2000}
//     />
//     </>

// )


import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
    <Toaster
      position="top-right"
      />
  </Provider>
);
