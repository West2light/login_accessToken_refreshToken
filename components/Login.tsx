'use client';

import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useLogin } from '../hooks/useLogin';
import { setAccessToken } from '../utils/cookies';

export default function Login() {
  const router = useRouter();
  const { mutate: loginMutation, isPending } = useLogin();
  const [form] = Form.useForm();

  const onFinish = (values: { username: string; password: string }) => {
    console.log('onFinish called with:', values);
    
    loginMutation(values, {
      onSuccess: (data) => {
        console.log('Login success:', data);
        const token = data?.accessToken || data?.access_token || data?.token || data?.data?.accessToken;
        
        if (!token) {
          console.error('No token found in response');
          message.error('Không nhận được access token từ server!');
          return;
        }

        setAccessToken(token);
        message.success('Đăng nhập thành công!');
        
        setTimeout(() => {
          router.push('/default-value');
        }, 500);
      },
      onError: (error: any) => {
        console.log('Login error occurred:', error);
        
        let errorMsg = 'Đăng nhập thất bại!';
        
        if (error.response?.data) {
          const data = error.response.data;
          errorMsg = data.respText || 
                     data.detail?.response?.message || 
                     data.message || 
                     errorMsg;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        console.log('Showing error message:', errorMsg);
        message.error(errorMsg);
        
        form.setFieldsValue({ password: '' });
      },
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: '20px' }}>
      <h1>Đăng nhập</h1>
      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
        >
          <Input placeholder="Username" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}