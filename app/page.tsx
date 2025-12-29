import Link from "next/link";
import { Button } from "antd";

export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: '100px auto', padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to LIMS</h1>
      <p>Laboratory Information Management System</p>
      <Link href="/login">
        <Button type="primary" size="large">
          Login
        </Button>
      </Link>
    </div>
  );
}
