import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Mail, Phone, Bus } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side validation
  const validateForm = () => {
    const errors = [];
    
    if (!formData.fullName.trim()) {
      errors.push('Họ tên là bắt buộc');
    }
    
    if (!formData.email.trim()) {
      errors.push('Email là bắt buộc');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('Email không hợp lệ');
      }
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.push('Số điện thoại là bắt buộc');
    } else {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.push('Số điện thoại phải có 10-11 chữ số');
      }
    }
    
    if (!formData.password.trim()) {
      errors.push('Mật khẩu là bắt buộc');
    } else if (formData.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Handle field-specific errors
        if (data.data && data.data.fields) {
          const fieldErrors = data.data.fields.map((field: string) => {
            const fieldMap: { [key: string]: string } = {
              fullName: 'Họ tên',
              email: 'Email',
              phoneNumber: 'Số điện thoại',
              password: 'Mật khẩu'
            };
            return fieldMap[field] || field;
          }).join(', ');
          throw new Error(`Lỗi validation: ${fieldErrors}`);
        }
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      setSuccess('Đăng ký thành công! Chuyển hướng sau vài giây...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Lỗi không xác định.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vibrant-red to-vibrant-red-light flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="outline"
          size="sm"
          className="mb-4 border-gray-300 text-green-700 hover:bg-green-100"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-elegant mb-4">
            <Bus className="w-8 h-8 text-vibrant-red" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Phương Trang</h1>
          <p className="text-white/80">Đăng ký tài khoản mới</p>
        </div>

        <Card className="shadow-elegant border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Đăng ký</CardTitle>
            <CardDescription className="text-gray-600">
              Tạo tài khoản để đặt vé xe khách trực tuyến
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">Họ và tên *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Họ và tên đầy đủ"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10 h-12 border-gray-200 focus:border-primary-green focus:ring-primary-green"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email của bạn"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-12 border-gray-200 focus:border-primary-green focus:ring-primary-green"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Số điện thoại *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="0xxx xxx xxx"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="pl-10 h-12 border-gray-200 focus:border-primary-green focus:ring-primary-green"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Mật khẩu (ít nhất 6 ký tự)"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 h-12 border-gray-200 focus:border-primary-green focus:ring-primary-green"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-primary-green hover:bg-primary-green-dark text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-gray-600">Đã có tài khoản? </span>
              <Link 
                to="/login" 
                className="text-vibrant-red hover:text-vibrant-red-dark font-semibold transition-colors"
              >
                Đăng nhập ngay
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

export default Register;
