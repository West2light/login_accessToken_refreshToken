import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) return true;

    // exp tính bằng giây → convert sang ms
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch (e) {
    return true;
  }
};
export const willTokenExpireSoon = (token: string, thresholdInSeconds: number = 300): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < (currentTime + thresholdInSeconds);
  } catch (e) {
    return true;
  }
};