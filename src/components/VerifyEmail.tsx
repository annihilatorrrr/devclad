import { CheckCircleIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import DevCladLogo from '../assets/devclad.svg';
import { verifyEmail } from '../services/auth.services';
import { Error } from '../utils/Feedback.utils';

export default function VerifyEmail(): JSX.Element {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const { key } = useParams() as { key: string };
  useEffect(() => {
    const verification = async () => verifyEmail(key).then((res:any) => {
      console.log(res);
      if (res.detail === 'ok') {
        setVerified(true);
        toast.success(
          'Email verified successfully!',
          { id: 'successful-email-verification' },
        );
      } else {
        setError(true);
        toast.error(
          'Invalid verification key.',
          { id: 'invalid-key-error' },
        );
      }
    }).catch(() => {
      setError(true);
      toast.custom(
        <Error error="Invalid verification key OR Email already verified." />,
        { id: 'verify-email-error', duration: Infinity },
      );
    });
    verification();
  }, []);
  return (
    <div>
      <div className="relative mt-5 sm:mt-10">
        <svg
          viewBox="0 0 1090 1090"
          aria-hidden="true"
          fill="none"
          preserveAspectRatio="none"
          width="1090"
          height="1090"
          className="absolute sm:-top-24 left-1/2 -z-11 h-[788px] -translate-x-1/2
        stroke-gray-300/30
        dark:stroke-fuchsia-800/30 sm:h-auto"
        >
          <circle cx="545" cy="545" r="544.5" />
          <circle cx="545" cy="545" r="512.5" />
          <circle cx="545" cy="545" r="480.5" />
          <circle cx="545" cy="545" r="448.5" />
          <circle cx="545" cy="545" r="416.5" />
          <circle cx="545" cy="545" r="384.5" />
          <circle cx="545" cy="545" r="352.5" />
        </svg>
      </div>
      <div className="backdrop-blur-0">
        <div className="sm:mx-auto sm:w-full sm:max-w-full">
          <img
            className="mx-auto h-32 w-auto"
            src={DevCladLogo}
            alt="DevClad"
          />
          <h1 className="text-center text-5xl font-black text-gray-900 dark:text-gray-100">DevClad</h1>
        </div>
        <h2 className="text-center text-2xl mt-5 font-bold text-gray-700 dark:text-gray-300">Verification</h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            className="font-medium text-orange-700 dark:text-fuchsia-300"
            to="/login"
          >
            Login
          </Link>
        </p>
        <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {
              (verified && !error) ? (
                <div className="text-center">
                  <Link to="/" className="w-full">
                    <span
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md
                    text-sm font-medium text-green-800 bg-green-50 hover:shadow-lg hover:shadow-green-300
                    focus:outline-none
                    focus:ring-2 focus:ring-offset-2 focus:ring-green-200"
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-2 font-bold text-base">
                          <span>
                            Email Verified successfully 🎉!
                          </span>
                          {' '}
                          <span>
                            Click to login.
                          </span>
                        </div>
                      </div>
                    </span>
                  </Link>

                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-center">Please wait while we verify your email.</p>
                </div>
              )
}
          </div>
        </div>
      </div>
    </div>
  );
}
