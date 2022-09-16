import React from 'react';
import {
  NavLink, Outlet, useLoaderData, useLocation,
} from 'react-router-dom';
import {
  UserCircleIcon, KeyIcon,
  CreditCardIcon, UsersIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/solid';
import ToggleTheme from '@/components/ToggleTheme';
import UpdateProfileForm, { AvatarUploadForm } from '@/components/forms/Profile.forms';
import UpdateUserForm from '@/components/forms/UpdateUser.forms';
import useDocumentTitle from '@/lib/useDocumentTitle.lib';
import SocialProfileForm from '@/components/forms/SocialProfile.forms';
import PasswordResetForm from '@/components/forms/ResetPassword.forms';
import ChangeEmailForm from '@/components/forms/ChangeEmail.forms';
import { socialProfileLoader } from '@/lib/queriesAndLoaders';

const navigation = [
  {
    name: 'Account/Profile', href: '/settings', icon: UserCircleIcon,
  },
  {
    name: 'Social/Preferences', href: '/settings/social', icon: UsersIcon,
  },
  {
    name: 'Email/Password', href: '/settings/password', icon: KeyIcon,
  },
  {
    name: 'Plan & Billing', href: '/billing', icon: CreditCardIcon,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const activeClass = `bg-gray-50 dark:bg-raisinBlack2
                    hover:text-gray-700 dark:hover:text-fuchsia-400
                    dark:text-fuchsia-300
                    text-orange-700`;

export function Settings() {
  useDocumentTitle('Settings');
  const { pathname } = useLocation();
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
      <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
        <nav className="space-y-1 dark:bg-darkBG2 bg-snow rounded-xl p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={classNames(
                (item.href === pathname) || (`${item.href}/` === pathname)
                  ? activeClass
                  : 'text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white dark:hover:bg-gray-800 hover:bg-white',
                'group rounded-md px-3 py-2 flex items-center text-sm font-medium ',
              )}
              aria-current={(pathname === item.href) ? 'page' : undefined}
            >
              <item.icon
                className="flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <Outlet />
      <div className="flex items-center pb-5">
        <span className="mr-2 text-xs font-black italic font-sans">Dark Mode</span>
        <ToggleTheme />
      </div>
    </div>
  );
}

// todo : appearance instead of just a dark mode toggle

export function AccountProfile() {
  return (
    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
      <div className="shadow sm:rounded-md sm:overflow-hidden">
        <div className="py-6 px-4 space-y-6 sm:p-6 dark:bg-darkBG2 rounded-xl">
          <div>
            <h2 className="font-display text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100">Account</h2>
          </div>
          <UpdateUserForm />
        </div>
        <hr className="my-6 border-t border-gray-100 dark:border-gray-900" />
        <div className="py-6 px-4 space-y-6 sm:p-6 dark:bg-darkBG2 rounded-xl">
          <div>
            <h2 className="font-display text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100">Profile</h2>
          </div>
          <UpdateProfileForm />
        </div>
        <hr className="my-6 border-t border-gray-100 dark:border-gray-900" />
        <div className="py-6 px-4 space-y-6 sm:p-6 dark:bg-darkBG2 rounded-xl">
          <AvatarUploadForm />
        </div>
      </div>
      <hr className="my-6 border-t border-gray-100 dark:border-gray-900" />
    </div>
  );
}

export function SocialProfile() {
  const initialSocialData = useLoaderData() as Awaited<
  ReturnType<ReturnType<typeof socialProfileLoader>>
  >;
  return (
    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
      <div className="shadow sm:rounded-md sm:overflow-hidden">
        <div className="py-6 px-4 space-y-6 sm:p-6 dark:bg-darkBG2 rounded-xl">
          <div>
            <h2 className="font-display text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100">Social Preferences</h2>
            <p className="mt-2 text-xs italic text-gray-600 dark:text-gray-400">
              We use your preferences in our ML algorithms to
              generate the best possible match every week.
            </p>
          </div>
          <SocialProfileForm initialSocialData={initialSocialData} />
        </div>
        <hr className="my-6 border-t border-gray-100 dark:border-gray-900" />
      </div>
    </div>
  );
}

export function Password() {
  return (
    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
      <div className="shadow sm:rounded-md sm:overflow-hidden">
        <div className="py-6 px-4 space-y-6 sm:p-6 dark:bg-darkBG2 rounded-xl">
          <div className="inline-flex">
            <EnvelopeIcon className="mr-2 w-6 h-6" />
            <h2 className="font-display text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100">
              Email
              {' '}
            </h2>
          </div>
          <ChangeEmailForm />
        </div>
        <hr className="my-6 border-t border-gray-100 dark:border-gray-900" />
        <div className="py-6 px-4 space-y-6 sm:p-6 dark:bg-darkBG2 rounded-xl">
          <div className="inline-flex">
            <KeyIcon className="mr-2 w-6 h-6" />
            <h2 className="font-display text-2xl leading-6 font-medium text-gray-900 dark:text-gray-100">
              Password
            </h2>
          </div>
          <PasswordResetForm />
        </div>
        <hr className="my-6 border-t border-gray-100 dark:border-gray-900" />
      </div>
    </div>
  );
}
