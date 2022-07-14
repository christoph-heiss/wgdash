import { useState, ReactNode, SyntheticEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiPost, classNames } from 'lib/utils';

interface BaseLayoutProps {
  userName?: string;
  children: ReactNode;
}

export default function BaseLayout({ userName, children }: BaseLayoutProps) {
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const logout = (e: SyntheticEvent) => {
    e.preventDefault();
    setLogoutLoading(true);

    apiPost('/api/logout')
      .then(() => router.push('/'));
  };

  return (
    <div className="max-w-screen-lg px-6 py-4 mx-auto lg:max-auto md:py-8">
      <header className="relative flex">
        <h3 className="flex-1 text-4xl text-neutral-800">
          <Link href="/">
            wgdash
          </Link>
        </h3>

        {userName && (
          <>
            <h4 className="flex items-center">
              Welcome,
              &nbsp;
              <span className="capitalize">
                {userName}
              </span>
            </h4>
            <h4 className="flex items-center ml-4">
              <button
                type="button"
                className={classNames('button ~neutral @low', { loading: logoutLoading })}
                onClick={logout}
              >
                Log out
              </button>
            </h4>
          </>
        )}
      </header>
      <hr className="sep h-16" />
      <main>
        {children}
      </main>
    </div>
  );
}

BaseLayout.defaultProps = {
  userName: undefined,
};
