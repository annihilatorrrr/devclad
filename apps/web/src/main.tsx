/* eslint-disable no-restricted-globals */
import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/root.css';
import '@devclad/ui/fontscss';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/context/Theme.context';
import Root from '@/routes/_root';
import { ForgotPassword, PassReset } from '@/routes/PasswordReset';
import VerifyEmail from '@/routes/VerifyEmail';
import { Onboarding, StepOne, StepTwo } from '@/routes/Onboarding';
import { Settings, AccountProfile, SocialProfile, Password } from '@/routes/Settings';
import Home from '@/routes/Home';
import Login from '@/routes/Login';
import Signup from '@/routes/Signup';
import FourOFour from '@/routes/404';
import { MessagesLoading, ProfileLoading } from '@/components/LoadingStates';
// SOCIAL
import Social from '@/routes/social/Social';
import OneOne from '@/routes/social/OneOne';
import Circle from '@/routes/social/Circle';
import Profile from '@/routes/Profile';
import Messages, { MessageChild } from '@/routes/Messages';
import StreamProvider from '@/context/Stream.context';
import Meetings, { MeetingDetail, MeetingList } from '@/routes/Meetings';
import { UserProvider } from '@/context/User.context';
import { webVitals } from '@/vitals';
import { DEVELOPMENT } from './services/auth.services';

axios.defaults.headers.common.withCredentials = true;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			networkMode: 'online',
		},
	},
});

const analyticsId = import.meta.env.PUBLIC_VERCEL_ANALYTICS_ID;

if (analyticsId) {
	webVitals({
		path: location.pathname,
		params: location.search,
		analyticsId,
		debug: DEVELOPMENT,
	});
}

const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				path: '/',
				element: <Home />,
			},
			{
				path: 'login',
				element: <Login />,
			},
			{
				path: 'signup',
				element: <Signup />,
			},
			{
				path: 'auth/registration/account-confirm-email/:key',
				element: <VerifyEmail />,
			},
			{
				path: 'auth/password/reset/confirm/:uid/:token',
				element: <PassReset />,
			},
			{
				path: 'forgot-password',
				hasErrorBoundary: true,
				element: <ForgotPassword />,
			},
			{
				path: 'onboarding',
				element: <Onboarding />,
				children: [
					{
						index: true,
						hasErrorBoundary: true,
						element: <StepOne />,
					},
					{
						path: '/onboarding/step-two',
						element: <StepTwo />,
						hasErrorBoundary: true,
					},
				],
			},
			{
				path: 'profile/:username',
				hasErrorBoundary: true,
				element: <Profile />,
			},
			{
				path: 'social',
				hasErrorBoundary: true,
				element: <Social />,
				children: [
					{
						index: true,
						hasErrorBoundary: true,
						element: <OneOne />,
					},
					{
						path: '/social/circle',
						hasErrorBoundary: true,
						element: <Circle />,
					},
				],
			},
			{
				path: 'messages',
				hasErrorBoundary: true,
				element: <Messages />,
				children: [
					{
						index: true,
						hasErrorBoundary: true,
						element: <MessagesLoading />,
					},
					{
						path: '/messages/:username',
						hasErrorBoundary: true,
						element: <MessageChild />,
					},
				],
			},
			{
				path: 'meetings',
				hasErrorBoundary: true,
				element: <Meetings />,
				children: [
					{
						index: true,
						hasErrorBoundary: true,
						element: <MeetingList />,
					},
					{
						path: '/meetings/:uid',
						hasErrorBoundary: true,
						element: <MeetingDetail uid={null} />,
					},
				],
			},
			{
				path: 'settings',
				hasErrorBoundary: true,
				element: <Settings />,
				children: [
					{
						index: true,
						hasErrorBoundary: true,
						element: <AccountProfile />,
					},
					{
						path: '/settings/social',
						element: <SocialProfile />,
						hasErrorBoundary: true,
					},
					{
						path: '/settings/password',
						element: <Password />,
					},
				],
			},
		],
	},
	{
		path: '*',
		element: <FourOFour />,
	},
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<UserProvider>
				<StreamProvider>
					<ThemeProvider>
						<RouterProvider router={router} fallbackElement={<ProfileLoading />} />
					</ThemeProvider>
				</StreamProvider>
			</UserProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	</React.StrictMode>
);
