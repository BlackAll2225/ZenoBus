import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Bus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gửi yêu cầu thất bại');

      setSuccess('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('Đã xảy ra lỗi không xác định.');
  }
}
 finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-green to-vibrant-red flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
  variant="outline"
  size="sm"
  className="mb-4 border-gray-300 text-green-700 hover:bg-green-100"
  onClick={() => navigate(-1)}
>
  <ArrowLeft className="h-4 w-4 mr-2" />
  Quay lại
</Button>

        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-elegant mb-4">
            <Bus className="w-8 h-8 text-primary-green" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Phương Trang</h1>
          <p className="text-white/80">Khôi phục mật khẩu</p>
        </div>

        <Card className="shadow-elegant border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Quên mật khẩu?</CardTitle>
            <CardDescription className="text-gray-600">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
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
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Địa chỉ email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhập email đã đăng ký"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-primary-green focus:ring-primary-green"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary-green hover:bg-primary-green-dark text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-primary-green hover:text-primary-green-dark font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Link>
            </div>

            <div className="text-center">
              <span className="text-gray-600">Chưa có tài khoản? </span>
              <Link 
                to="/register" 
                className="text-vibrant-red hover:text-vibrant-red-dark font-semibold transition-colors"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            © 2024 Phương Trang. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
