import { Fragment, useEffect, lazy } from 'react';
import {
  Route,
  Routes,
  Navigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import SharedLayout from './SharedLayout';
import 'react-toastify/dist/ReactToastify.css';
import routes from 'utils/routes';
import HomeView from 'views/HomeView';
import { PublicRoute } from './PublicRoute/PublicRoute';
import { PrivateRoute } from './PrivateRoute/PrivateRoute';
import { useDispatch, useSelector } from 'react-redux';
import { authHeader } from 'service/kapustaAPI';
import { authOperations } from 'redux/auth/auth-operations';
import { googleAuth } from 'redux/auth/auth-slice';
import { isLoadingSelector } from 'redux/currentPeriod/period-selectors';
import Loader from './Loader';
import Personage from './Personage/Personage';

const Balance = lazy(() => import('./Balance'));
const TransactionsView = lazy(() => import('views/TransactionsView'));
const ReportView = lazy(() => import('views/ReportView'));

const { home, app, reports, transactions } = routes;

export const App = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const isLoading = useSelector(isLoadingSelector);

  useEffect(() => {
    dispatch(authOperations.fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const sid = searchParams.get('sid');

    if (!accessToken) {
      return;
    }

    authHeader.set(accessToken);
    dispatch(googleAuth({ accessToken, refreshToken, sid }));
    dispatch(authOperations.getUserData());
  }, [dispatch, searchParams]);
  const location = useLocation();
  const isReportPage = !location.pathname.endsWith('transactions')
    ? true
    : false;

  return (
    <Fragment>
      <Routes>
        <Route
          path={home}
          element={
            <PublicRoute>
              {!isReportPage && <Personage />}

              <SharedLayout />
            </PublicRoute>
          }
        >
          <Route
            index
            element={
              <PublicRoute restricted navTo={`${app}/${transactions}`}>
                <HomeView />
              </PublicRoute>
            }
          />
          <Route
            path={app}
            element={
              <PrivateRoute>
                <Balance />
              </PrivateRoute>
            }
          >
            <Route
              path={transactions}
              element={
                <PrivateRoute>
                  <TransactionsView />
                </PrivateRoute>
              }
            ></Route>
            <Route
              path={reports}
              element={
                <PrivateRoute>
                  {isLoading ? <Loader /> : <ReportView />}
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to={home} />} />
        </Route>
        <Route path="*" element={<Navigate to={home} />} />
      </Routes>
      <ToastContainer />
    </Fragment>
  );
};
