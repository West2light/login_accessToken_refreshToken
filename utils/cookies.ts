import Cookies from 'js-cookie';

export const setAccessToken = (token: string) => {
  Cookies.set('accessToken', token, { 
    expires: 1/96, // 15 phút
    secure: true, // Chỉ gửi cookie qua kết nối HTTPS
    sameSite: 'none', //Cho phép cookie cross-domain 
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