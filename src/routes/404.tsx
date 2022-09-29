import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '@/lib/useDocumentTitle.lib';
import useAuth from '@/services/useAuth.services';
import AppShell from '@/components/AppShell';
import getsetIndexedDB from '@/lib/getsetIndexedDB.lib';
import { initialUserState, User } from '@/lib/InterfacesStates.lib';

export default function FourOFour(): JSX.Element {
  const { authed } = useAuth();
  useDocumentTitle('Oops! 404');
  const navigate = useNavigate();
  // USEref
  const userRef = React.useRef<User>(initialUserState);

  React.useEffect(() => {
    if (Object.values(userRef).every((v) => v === undefined)) {
      getsetIndexedDB('loggedInUser', 'get').then((localUser) => {
        if (localUser) {
          userRef.current = localUser;
        }
      });
    }
    if (!authed && userRef.current.pk === undefined) {
      navigate('/login');
    }
  }, [authed, userRef, navigate]);

  return (
    // todo: CHANGE THIS!!
    <div>
      <AppShell>
        <div className="mx-auto max-w-full  px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg">
            <h1 className="text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
              404
            </h1>
          </div>
        </div>
      </AppShell>
    </div>
  );
}
