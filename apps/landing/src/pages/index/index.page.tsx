import React from 'react';
import { GraphTextureSVG } from '@devclad/ui';
import { Toaster } from 'react-hot-toast';
import Landing from '@/components/Landing';

// eslint-disable-next-line import/prefer-default-export
export function Page() {
  return (
    <div
      className="relative"
      style={{
        backgroundImage: `url(${GraphTextureSVG})`,
      }}
    >
      <div className="relative bg-gradient-to-b from-black via-black/75 to-black">
        <Toaster />
        <div
          className="absolute top-10 -left-2 h-48 w-48 rounded-full bg-sky-900/60
         opacity-50 mix-blend-difference blur-2xl filter"
        />
        <div
          className="absolute top-20 left-20 h-96 w-96 animate-blob rounded-full bg-gradient-to-br from-orange-900
          via-fuchsia-900/10 to-black opacity-50 mix-blend-difference blur-2xl filter"
        />
        <div className="relative z-10">
          <Landing />
        </div>
        <div
          className="blob absolute bottom-5 left-1/3 h-96 w-96 rounded-full bg-gradient-to-bl from-sky-900/90
         via-fuchsia-900/10 to-black opacity-80 mix-blend-difference blur-2xl filter"
        />
        <div className="absolute bottom-1/2 right-2 h-96 w-96 animate-blob rounded-full bg-sky-900/30 opacity-50 mix-blend-difference blur-2xl filter" />
        <div className="absolute bottom-1/2 right-2 h-96 w-96 animate-dropglow animate-blob rounded-full bg-gradient-to-tr from-sky-900/30 via-fuchsia-900/30 to-black opacity-50 mix-blend-difference blur-2xl filter" />
      </div>
    </div>
  );
}
