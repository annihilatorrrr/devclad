import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { QueryClient } from '@tanstack/react-query';
import { delMany } from 'idb-keyval';
import { NewUser, User } from '@/lib/InterfacesStates.lib';
import { tokenQuery } from '@/lib/queriesAndLoaders';
import serverlessCookie from '@/lib/serverlessCookie.lib';

export const API_URL = import.meta.env.VITE_API_URL;
export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

const headers = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
};

const qc = new QueryClient();

// const twoHour = new Date(new Date().getTime() + ((120 * 60) * 1000));

export const checkTokenType = (token: string | undefined | null) => {
	if (
		typeof token === 'string' &&
		token.length > 0 &&
		token !== 'undefined' &&
		token !== 'null'
	) {
		return true;
	}
	return false;
};

export const verifyEmail = async (key: string) => {
	const url = `${API_URL}/auth/registration/verify-email/`;
	const response = await axios.post(url, { key }, { headers });
	return response.data;
};

export const passwordReset = async (
	password1: string,
	password2: string,
	uid: string,
	token: string
) => {
	const url = `${API_URL}/auth/password/reset/confirm/`;
	const response = await axios.post(
		url,
		{
			new_password1: password1,
			new_password2: password2,
			uid,
			token,
		},
		{ headers }
	);
	return response.data;
};

export const passwordChange = async (token: string, password1: string, password2: string) => {
	const url = `${API_URL}/auth/password/change/`;
	if (checkTokenType(token)) {
		const response = await axios.post(
			url,
			{
				new_password1: password1,
				new_password2: password2,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			}
		);
		return response;
	}
	return null;
};

export const changeEmail = (token: string, email: string) => {
	const url = `${API_URL}/users/change-email/`;
	if (checkTokenType(token)) {
		return axios({
			method: 'PATCH',
			url,
			data: { email },
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});
	}
	return null;
};

export const checkVerified = (token: string) => {
	const url = `${API_URL}/users/change-email/`;
	if (checkTokenType(token)) {
		return axios({
			method: 'GET',
			url,
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});
	}
	return null;
};

export const forgotPassword = async (email: string) => {
	const url = `${API_URL}/auth/password/reset/`;
	const response = await axios.post(url, { email }, { headers });
	return response.data;
};

export const resendEmail = async (email: string) => {
	const url = `${API_URL}/auth/registration/resend-email/`;
	const response = await axios.post(url, { email }, { headers });
	return response.data;
};

export function verifyToken(token: string): Promise<boolean> {
	const url = `${API_URL}/auth/token/verify/`;
	return axios({
		method: 'POST',
		url,
		data: { token },
		headers: { 'Content-Type': 'application/json' },
	})
		.then((resp) => {
			if (resp.status === 200) {
				return true;
			}
			return false;
		})
		.catch(() => false);
}

export async function refreshToken() {
	const url = `${API_URL}/auth/token/refresh/`;
	const refresh = await serverlessCookie<string>('refresh');
	if (checkTokenType(refresh)) {
		return axios
			.post(url, {
				refresh,
				headers: {
					Authorization: `Bearer ${refresh}`,
				},
				credentials: 'same-origin',
			})
			.then((resp) => {
				serverlessCookie<string>('token', resp.data.access, 60 * 60 * 36, false)
					.then(() => {
						serverlessCookie<string>(
							'refresh',
							resp.data.refresh,
							60 * 60 * 24 * 28,
							false
						);
					})
					.then(() => {
						window.location.reload();
					});
			});
	}
	return null;
	// .catch(() => {
	// 	delMany(['loggedInUser', 'profile']);
	// 	Cookies.remove('token');
	// });
}

export async function getUser(token: string): Promise<AxiosResponse<User> | null> {
	const url = `${API_URL}/auth/user/`;
	// todo: store this in jotai instead of passing props
	const refresh = await serverlessCookie<string>('refresh');
	let isVerified = false;
	// check if token is a string
	if (checkTokenType(token) && checkTokenType(refresh)) {
		isVerified = await verifyToken(token);
	}
	if (isVerified) {
		return axios
			.get(url, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((resp) => resp)
			.catch(() => null);
	}
	if ((!checkTokenType(token) || !isVerified) && checkTokenType(refresh)) {
		await refreshToken();
	}
	return null;
}

export function updateUser(
	token: string,
	first_name?: string,
	last_name?: string,
	username?: string
) {
	if (checkTokenType(token)) {
		return axios.patch(
			`${API_URL}/auth/user/`,
			{ first_name, last_name, username },
			{ headers: { Authorization: `Bearer ${token}` } }
		);
	}
	return null;
}

export function SignUp(user: NewUser) {
	return axios
		.post(`${API_URL}/auth/registration/`, {
			first_name: user.firstName,
			last_name: user.lastName,
			email: user.email,
			password1: user.password1,
			password2: user.password2,
			headers,
		})
		.then((resp) => {
			serverlessCookie<string>('token', resp.data.access_token, 60 * 60 * 36, false);
			serverlessCookie<string>('refresh', resp.data.refresh_token, 60 * 60 * 24 * 28, false);
			return resp;
		})
		.catch((err) => err);
}

export async function logIn(email: string, password: string) {
	const url = `${API_URL}/auth/login/`;
	let token;
	const response = await axios
		.post(url, {
			email,
			password,
			headers,
			credentials: 'include',
		})
		.then((resp) => {
			serverlessCookie<string>('token', resp.data.access_token, 60 * 60 * 24, false);
			serverlessCookie<string>('refresh', resp.data.refresh_token, 60 * 60 * 24 * 14, false);
			token = qc.refetchQueries(tokenQuery().queryKey);
			Cookies.set('loggedIn', 'true', {
				path: '/',
				sameSite: 'Strict',
			});
		});
	return { response, token };
}

export async function logOut() {
	const refresh = await serverlessCookie<string>('refresh');
	const url = `${API_URL}/auth/logout/`;

	if (refresh) {
		const response = serverlessCookie<string>('token', '', 0, true)
			.then(() => {
				Cookies.remove('loggedIn');
				serverlessCookie<string>('refresh', '', 0, true);
			})
			.then(async () => {
				await axios
					.post(url, {
						refresh,
						headers,
						credentials: 'same-origin',
					})
					.then(async () => {
						await delMany(['loggedInUser', 'profile'])
							.then(() => {
								qc.invalidateQueries();
							})
							.then(() => {
								window.location.reload();
							});
					})
					.catch(() => window.location.reload());
			});
		return response;
	}
	return null;
}
