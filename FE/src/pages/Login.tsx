import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Bus } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('username', data.data.user.fullName); // Save user's full name
      localStorage.setItem('userId', data.data.user.id.toString()); // Save user's ID
      setSuccess('Đăng nhập thành công!');
      setError('');

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Có lỗi xảy ra!');
      }
      setSuccess('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-green to-primary-green-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-elegant mb-4">
            <Bus className="w-8 h-8 text-primary-green" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Phương Trang</h1>
          <p className="text-white/80">Hệ thống đặt vé xe khách</p>
        </div>
<Button
    variant="outline"
    size="sm"
    className="mb-4 border-gray-300 text-green-700 hover:bg-green-100"
    onClick={() => navigate(-1)}
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Quay lại
  </Button>
        <Card className="shadow-elegant border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Đăng nhập</CardTitle>
            <CardDescription className="text-gray-600">
              Nhập thông tin để truy cập tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-vibrant-red bg-vibrant-red/5">
                <AlertDescription className="text-vibrant-red">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-primary-green bg-primary-green/5">
                <AlertDescription className="text-primary-green">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12 border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 h-12 border-gray-200"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-primary-green hover:bg-primary-green-dark text-white font-semibold rounded-lg shadow-md transition-all">
                Đăng nhập
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link to="/forgot-password" className="text-primary-green text-sm font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-gray-600">Chưa có tài khoản? </span>
              <Link to="/register" className="text-vibrant-red font-semibold">Đăng ký ngay</Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">© 2024 Phương Trang. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
