import { useState, SyntheticEvent } from 'react';
import { useRouter } from 'next/router';
import BaseLayout from 'components/base-layout';
import { apiPost, classNames } from 'lib/utils';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [failedLogin, setFailedLogin] = useState(false);

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setFailedLogin(false);
    setLoading(true);

    const res = await apiPost('/api/login', { username, password });
    if (res.success) {
      router.push('/');
    } else {
      setFailedLogin(true);
    }

    setLoading(false);
  };

  const submitBtnClasses = classNames(
    'button button-xl min-w-full ~info @high',
    {
      loading,
    },
  );

  return (
    <BaseLayout>
      {failedLogin && (
        <div className="card ~warning @high font-bold max-w-xl xl:mx-auto mb-4">
          Incorrect username or password.
        </div>
      )}
      <form className="border rounded-lg max-w-xl xl:mx-auto">
        <section className="section ~neutral p-6">
          <label htmlFor="login-form-username" className="label">
            Username
            <input
              id="login-form-username"
              className="field mt-2 mb-4"
              type="text"
              placeholder="admin"
              value={username}
              onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
            />
          </label>

          <label htmlFor="login-form-password" className="label">
            Password
            <input
              id="login-form-password"
              className="field mt-2"
              type="password"
              placeholder="hunter2"
              minLength={8}
              value={password}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            />
          </label>
        </section>

        <section className="section p-4">
          <button className={submitBtnClasses} type="submit" onClick={submit}>
            Sign In
          </button>
        </section>
      </form>
    </BaseLayout>
  );
}
