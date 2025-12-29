import Cookies from 'js-cookie';

export const setAccessToken = (token: string) => {
  Cookies.set('accessToken', token, { 
    expires: 1/96, // 15 phút
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: false, // js-cookie không thể set httpOnly, chỉ server mới có thể set
    
  });
};

export const getAccessToken = () => {
  return Cookies.get('accessToken');
};

export const removeAccessToken = () => {
  Cookies.remove('accessToken');
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};