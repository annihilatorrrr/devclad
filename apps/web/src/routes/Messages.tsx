import React from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { PaperClipIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Channel, DefaultGenerics, StreamChat } from 'stream-chat';
import toast from 'react-hot-toast';
import { classNames, useDocumentTitle } from '@devclad/lib';
import {
	useCircleUsernames,
	useConnected,
	useProfile,
	useStreamUID,
} from '@/services/socialHooks.services';
import { useAuth } from '@/services/useAuth.services';
import { badge } from '@/lib/Buttons.lib';
import { Profile } from '@/lib/InterfacesStates.lib';
import { MessagesLoading } from '@/components/LoadingStates';
import { Error } from '@/components/Feedback';
import { useStreamContext } from '@/context/Stream.context';

const activeClass = `bg-neutral-50 dark:bg-darkBG2
                    hover:text-neutral-700 dark:hover:text-orange-400
                    border-[1px] border-neutral-200 dark:border-neutral-800
                    dark:text-orange-300
                    text-orange-700`;

function MessagesNav({ user }: { user: string }): JSX.Element {
	const { pathname } = useLocation();
	const connected = useConnected(user);

	if (connected) {
		return (
			<NavLink
				preventScrollReset
				key={user}
				to={`/messages/${user}/`}
				className={classNames(
					`/messages/${user}/` === pathname
						? activeClass
						: 'dark:hover:bg-darkBG text-neutral-900 hover:bg-white hover:text-neutral-900 dark:text-neutral-100 dark:hover:text-white',
					'group flex items-center rounded-md px-3 py-2 text-sm'
				)}
				aria-current={pathname === user ? 'page' : undefined}
			>
				{/* <item.icon className="-ml-1 mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" /> */}
				<div className="flex-1 space-y-1">
					<div className="flex items-center justify-between">
						<span className="truncate">{user}</span>
						<div>
							<span>{badge('3 unread', 'bg-darkBG')}</span>
							<span className="ml-2 text-xs text-neutral-400 dark:text-neutral-600">1h ago</span>
						</div>
					</div>
				</div>
			</NavLink>
		);
	}
	return <div />;
}

export default function Messages() {
	useDocumentTitle('Messages');
	const { usernames: circle } = useCircleUsernames() as {
		usernames: string[];
	};
	return (
		<div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
			<aside className="py-0 px-0 sm:py-6 sm:px-6 lg:col-span-4 lg:py-0 lg:px-0">
				<nav
					className="scrollbar dark:bg-darkBG2 hidden space-y-2 overflow-auto rounded-md border-[1px]
        p-4 dark:border-neutral-800 md:block lg:max-h-[77vh]"
				>
					{circle.map((user) => (
						<MessagesNav key={user} user={user} />
					))}
				</nav>
			</aside>
			<Outlet />
		</div>
	);
}

export interface MessageProps {
	self: boolean;
	username: string;
	avatarURL: string;
	message: string;
}

export function Message({ self, username, avatarURL, message }: MessageProps) {
	return (
		<div className={classNames(self ? 'flex-row-reverse' : '', 'flex items-center space-x-2')}>
			{!self && (
				<div className="flex-shrink-0">
					<img className="h-10 w-10 rounded-full" src={avatarURL} alt="" />
				</div>
			)}
			<div className={classNames(self ? 'flex-row' : 'flex-row-reverse')}>
				<div className="flex items-center space-x-2">
					<div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
						<span className="text-orange-400">@</span>
						<span className="text-orange-400">
							<Link preventScrollReset to={`/profile/${username}`}>
								{username}
							</Link>
						</span>
					</div>
					<div className="text-xs text-neutral-400 dark:text-neutral-600">
						<span>1h ago</span>
					</div>
				</div>
				<div className="mt-2 max-w-sm rounded-xl bg-neutral-900 p-3 text-sm text-neutral-100">
					<span>{message}</span>
				</div>
			</div>
		</div>
	);
}

export function MessageChild(): JSX.Element {
	const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
	const scrollToBottom = React.useRef<HTMLDivElement>(null);
	// UID of the other user
	const { username } = useParams() as { username: string };
	const otherUserUID = useStreamUID(username);
	// UID of logged in user
	const { loggedInUser, streamToken } = useAuth();
	const loggedInUserUserName = loggedInUser.username as string;
	const currUserUID = useStreamUID(loggedInUserUserName);
	const [message, setMessage] = React.useState('');
	const [reloadFetch, setReloadFetch] = React.useState(false);

	const [lastMessageID, setlastMessageID] = React.useState<string | undefined>(undefined);
	const { connected, toggleConnection } = useStreamContext();
	const profileData = useProfile(loggedInUserUserName as string) as Profile;

	let channel: Channel<DefaultGenerics> | undefined;
	const channelRef = React.useRef(channel);

	const qc = useQueryClient();
	const state = qc.getQueryState(['profile', loggedInUserUserName as string]);

	type LtOrGtType = 'id_lte' | 'id_gt' | undefined;

	const fetchMessages = React.useCallback(
		async (
			channelVal: Channel<DefaultGenerics> | undefined,
			lastMessageIDVal: string | undefined,
			ltOrGt: LtOrGtType
		) => {
			if (channelVal && lastMessageIDVal) {
				if (ltOrGt === 'id_lte') {
					return channelVal.query({ messages: { limit: 5, id_lte: lastMessageIDVal } });
				}
				return channelVal.query({ messages: { limit: 5, id_gt: lastMessageIDVal } });
			}
			if (channelVal) {
				return channelVal.query({ messages: { limit: 5 } });
			}
			return null;
		},
		[]
	);

	const channelQuery = (
		channelVal: Channel<DefaultGenerics> | undefined,
		channelCID: string,
		lastMessageIDVal: string | undefined,
		ltOrGt: LtOrGtType
	) => ({
		queryKey: ['channel', channelCID],
		queryFn: () => fetchMessages(channelVal, lastMessageIDVal, ltOrGt),
	});

	const {
		data: channelQData,
		isFetching: channelQFetching,
		isPreviousData: channelQPreviousData,
	} = useQuery({
		...channelQuery(
			channelRef.current,
			channelRef.current?.cid as string,
			lastMessageID,
			undefined // defaults to latest messages
		),
		enabled: !!channelRef.current,
		keepPreviousData: true,
	});

	const handleSendMessage = async (text: string) => {
		if (channelRef.current && message.length > 0) {
			await channelRef.current.sendMessage({
				text,
			});
			qc.invalidateQueries(['channel', channelRef.current.cid]);
		}
	};
	React.useEffect(() => {
		if (
			streamToken !== null &&
			loggedInUser !== null &&
			currUserUID !== null &&
			otherUserUID !== null &&
			profileData !== null
		) {
			const CreateChannel = async () => {
				try {
					channelRef.current = client.channel('messaging', {
						members: [currUserUID, otherUserUID],
					});
				} catch (err) {
					toggleConnection(true);
					await client
						.connectUser(
							{
								id: streamToken?.uid as string,
								first_name: loggedInUser.first_name as string,
								last_name: loggedInUser.last_name as string,
								username: loggedInUser.username,
								email: loggedInUser.email,
								image: profileData.avatar as string,
							},
							streamToken?.token as string
						)
						.catch(() => {
							toggleConnection(false);
							toast.custom(<Error error="Cannot connect to Stream. Try refreshing the page." />, {
								id: 'stream-connect-error',
							});
						})
						.then(() => {
							channelRef.current = client.channel('messaging', {
								members: [currUserUID, otherUserUID],
							});
						});
				}
				if (channelRef.current !== undefined) {
					await channelRef.current
						.create()
						.then(async () => {
							await fetchMessages(channelRef.current, undefined, undefined)
								.then((res) => qc.setQueryData(['channel', channelRef.current?.cid as string], res))
								.then(() => {
									setReloadFetch(true);
								});
						})
						.catch(() => {
							toast.custom(<Error error="Error initiating chat." />, {
								id: 'error-channel-create',
							});
						});
				}
			};
			CreateChannel();
		}
	}, [
		client,
		connected,
		currUserUID,
		fetchMessages,
		loggedInUser,
		otherUserUID,
		profileData,
		qc,
		streamToken,
		toggleConnection,
	]);

	if (state?.status === 'loading' || state?.status !== 'success' || profileData === null) {
		return <MessagesLoading />;
	}
	if (channelQData || reloadFetch) {
		return (
			<div className="container mx-auto space-y-6 sm:px-6 lg:col-span-8 lg:px-0">
				<div className="shadow sm:overflow-hidden sm:rounded-md">
					<div
						className="bg-darkBG2 scrollbar flex flex-col space-y-4 overflow-y-scroll
						rounded-md border-[1px] p-4 py-6 px-4 dark:border-neutral-800 sm:p-6
					"
					>
						<div className="flex flex-col justify-end space-y-6 ">
							<div className="flex flex-row justify-center">
								<button
									type="button"
									className="flex flex-row items-center justify-center space-x-2"
									disabled={channelQFetching}
									onClick={() => {
										setlastMessageID(channelQData?.messages[0].id);
										fetchMessages(channelRef.current, channelQData?.messages[0].id, 'id_lte').then(
											(res) => {
												qc.setQueryData(['channel', channelRef.current?.cid as string], res);
											}
										);
									}}
								>
									{channelQPreviousData ? (
										<svg
											className="h-5 w-5 animate-spin text-neutral-500"
											viewBox="0 0
										24 24"
										/>
									) : (
										<svg
											className="h-6 w-6 text-white"
											fill="none"
											viewBox="0
										0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 15l7-7 7 7"
											/>
										</svg>
									)}
								</button>
							</div>
							<div className="flex flex-row justify-center">
								{channelQData?.messages[4].created_at !==
									channelRef.current?.data?.last_message_at && (
									<button
										type="button"
										className="flex flex-row items-center justify-center space-x-2"
										disabled={channelQFetching}
										onClick={() => {
											setlastMessageID(channelQData?.messages[0].id);
											fetchMessages(channelRef.current, channelQData?.messages[3].id, 'id_gt').then(
												(res) => {
													qc.setQueryData(['channel', channelRef.current?.cid as string], res);
												}
											);
										}}
									>
										{channelQPreviousData ? (
											<svg className="h-5 w-5 animate-spin text-neutral-500" viewBox="0 0 24 24" />
										) : (
											<svg
												className="h-6 w-6 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 9
										l-7 7-7-7"
												/>
											</svg>
										)}
									</button>
								)}
							</div>
							{channelQData?.messages.map((msg) => (
								<Message
									key={msg.id}
									username={msg.user?.username as string}
									self={msg.user?.id === currUserUID}
									avatarURL={
										// todo: refactor this
										// eslint-disable-next-line no-nested-ternary
										msg.user
											? import.meta.env.VITE_DEVELOPMENT
												? import.meta.env.VITE_API_URL + msg.user.image
												: msg.user?.image
											: ''
									}
									message={msg.text as string}
								/>
							))}
						</div>
					</div>
				</div>
				<div className="flex items-start sm:space-x-4">
					<div className="flex-shrink-0">
						<img
							className="bg-linen hidden h-10 w-10 rounded-full object-cover sm:inline-block"
							src={
								import.meta.env.VITE_DEVELOPMENT
									? import.meta.env.VITE_API_URL + profileData.avatar
									: profileData.avatar
							}
							alt=""
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="relative">
							<form
								onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
									e.preventDefault();
									const text = e.currentTarget.message.value;
									if (message.length > 0 && text) {
										e.currentTarget.value = '';
										handleSendMessage(text);
									}
								}}
							>
								<div className="bg-darkBG2 overflow-hidden rounded-lg border-[1px] border-neutral-800 shadow-sm placeholder:text-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm">
									<label htmlFor="message">
										<textarea
											rows={2}
											name="message"
											id="message"
											className="bg-darkBG block w-full resize-none p-2 py-3 placeholder:text-gray-500 focus:outline-none sm:text-sm"
											placeholder={`Message ${username}`}
											defaultValue={message}
											onChange={(e) => setMessage(e.target.value)}
											onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													scrollToBottom.current?.scrollIntoView({ behavior: 'smooth' });
													if (message.length > 0) {
														const target = e.target as HTMLTextAreaElement;
														target.value = '';
														handleSendMessage(message);
													}
												}
											}}
										/>
									</label>
									<div className="py-1" aria-hidden="true">
										<div className="py-px">
											<div className="h-9" />
										</div>
									</div>
								</div>

								<div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
									<div className="flex items-center space-x-5">
										<div className="flex items-center">
											<button
												type="submit"
												className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
											>
												<PaperClipIcon className="h-5 w-5" aria-hidden="true" />
												<span className="sr-only">Attach a file</span>
											</button>
										</div>
									</div>
									<div className="flex-shrink-0">
										<button
											type="submit"
											className="bg-darkBG2 hover:bg-darkBG inline-flex items-center rounded-md border-[1px] border-neutral-800
											px-6 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
										>
											Send
											<PaperAirplaneIcon className="ml-2 h-5 w-5" aria-hidden="true" />
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return <MessagesLoading />;
}
