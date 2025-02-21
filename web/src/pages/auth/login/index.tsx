import { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import * as api from '@/api/auth.ts';
import { existToken, setToken } from '@/lib/cookie.ts';
import { encrypt } from '@/lib/encrypt.ts';
import { Head } from '@/components/head.tsx';

import { Tips } from './tips.tsx';

export const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isLoading, setIsloading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (existToken()) {
      navigate('/', { replace: true });
    }
  }, []);

  useEffect(() => {
    if (msg) {
      setTimeout(() => setMsg(''), 3000);
    }
  }, [msg]);

  function login(values: any) {
    if (isLoading) return;
    setIsloading(true);

    const username = values.username;
    const password = encrypt(values.password);

    api
      .login(username, password)
      .then((rsp: any) => {
        if (rsp.code !== 0) {
          setMsg(rsp.code === -2 ? t('auth.invalidUser') : t('auth.error'));
          return;
        }

        setMsg('');
        setToken(rsp.data.token);

        navigate('/', { replace: true });
        window.location.reload();
      })
      .catch(() => {
        setMsg(t('auth.error'));
      })
      .finally(() => {
        setIsloading(false);
      });
  }

  return (
    <>
      <Head title={t('head.login')} />

      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <Form
          style={{ minWidth: 300, maxWidth: 500 }}
          initialValues={{ remember: true }}
          onFinish={login}
        >
          <h2 className="text-center text-xl font-semibold text-neutral-100">{t('auth.login')}</h2>

          <Form.Item
            name="username"
            rules={[{ required: true, message: t('auth.noEmptyUsername'), min: 1 }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t('auth.placeholderUsername')} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('auth.noEmptyPassword'), min: 1 }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder={t('auth.placeholderPassword')}
            />
          </Form.Item>

          <div className="text-red-500">{msg}</div>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={isLoading}>
              {t('auth.loginButtonText')}
            </Button>
          </Form.Item>

          <div className="flex justify-end pb-4 text-sm">
            <Tips />
          </div>
        </Form>
      </div>
    </>
  );
};
